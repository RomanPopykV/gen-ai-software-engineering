import { v4 as uuidv4 } from 'uuid';
import Decimal from 'decimal.js';
import path from 'path';
import { PipelineMessage, FraudResult } from '../types';
import { auditLog } from '../utils/logger';
import { DIRS, readJsonFiles, writeJson } from '../utils/fileio';

const HIGH_VALUE_THRESHOLD = new Decimal('10000');

const SCORE = {
  HIGH_VALUE: 40,
  CROSS_BORDER: 30,
  UNUSUAL_HOUR: 20,
  WIRE_TRANSFER: 10,
} as const;

const FLAGGED_THRESHOLD = 60;

export function computeRiskScore(message: PipelineMessage): number {
  let score = 0;
  const { data } = message;

  // +40 if amount > 10,000 (face value, any currency)
  try {
    const amount = new Decimal(data.amount);
    if (amount.gt(HIGH_VALUE_THRESHOLD)) {
      score += SCORE.HIGH_VALUE;
    }
  } catch {
    // Malformed amount should not reach fraud detector, but be defensive
  }

  // +30 if cross-border (metadata.country !== 'US')
  if (data.metadata?.country && data.metadata.country !== 'US') {
    score += SCORE.CROSS_BORDER;
  }

  // +20 if unusual timing: UTC hour < 6 or > 22
  const utcHour = new Date(data.timestamp).getUTCHours();
  if (utcHour < 6 || utcHour > 22) {
    score += SCORE.UNUSUAL_HOUR;
  }

  // +10 if wire transfer
  if (data.transaction_type === 'wire_transfer') {
    score += SCORE.WIRE_TRANSFER;
  }

  return score;
}

export function detectFraud(message: PipelineMessage): FraudResult {
  const riskScore = computeRiskScore(message);
  const status: FraudResult['status'] =
    riskScore >= FLAGGED_THRESHOLD ? 'FLAGGED_FOR_REVIEW' : 'APPROVED';
  return {
    transaction_id: message.data.transaction_id,
    risk_score: riskScore,
    status,
  };
}

export async function runFraudDetector(): Promise<void> {
  const messages = await readJsonFiles<PipelineMessage>(DIRS.processing);

  for (const { data: message } of messages) {
    const result = detectFraud(message);
    const now = new Date().toISOString();

    const outputMessage: PipelineMessage = {
      message_id: uuidv4(),
      timestamp: now,
      source_stage: 'fraud_detector',
      target_stage: 'reporting',
      message_type: 'transaction',
      data: {
        ...message.data,
        status: result.status,
        risk_score: result.risk_score,
      },
    };

    await writeJson(
      path.join(DIRS.output, `${result.transaction_id}.json`),
      outputMessage,
    );
    auditLog({
      timestamp: now,
      agent: 'fraud_detector',
      transaction_id: result.transaction_id,
      outcome: `${result.status} (risk_score: ${result.risk_score})`,
    });
  }
}
