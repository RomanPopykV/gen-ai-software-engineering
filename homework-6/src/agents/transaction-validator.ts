import { v4 as uuidv4 } from 'uuid';
import Decimal from 'decimal.js';
import path from 'path';
import { RawTransaction, PipelineMessage, ValidationResult } from '../types';
import { ISO4217_CODES } from '../utils/iso4217';
import { auditLog } from '../utils/logger';
import { DIRS, readJsonFiles, writeJson } from '../utils/fileio';

type RequiredStringField =
  | 'transaction_id'
  | 'timestamp'
  | 'source_account'
  | 'destination_account'
  | 'amount'
  | 'currency'
  | 'transaction_type';

const REQUIRED_FIELDS: RequiredStringField[] = [
  'transaction_id',
  'timestamp',
  'source_account',
  'destination_account',
  'amount',
  'currency',
  'transaction_type',
];

export function validateTransaction(raw: RawTransaction): ValidationResult {
  // Check all required string fields are present and non-empty
  for (const field of REQUIRED_FIELDS) {
    const value = raw[field];
    if (value === undefined || value === null || value.trim() === '') {
      return {
        valid: false,
        reason: `Missing required field: ${field}`,
        transaction: raw,
      };
    }
  }

  // Validate amount: must be parseable as a positive Decimal
  let amount: Decimal;
  try {
    amount = new Decimal(raw.amount);
  } catch {
    return {
      valid: false,
      reason: `Invalid amount format: ${raw.amount}`,
      transaction: raw,
    };
  }
  if (amount.isNaN() || amount.lte(0)) {
    return {
      valid: false,
      reason: `Amount must be a positive number, got: ${raw.amount}`,
      transaction: raw,
    };
  }

  // Validate currency: must be a known ISO 4217 code
  if (!ISO4217_CODES.has(raw.currency.toUpperCase())) {
    return {
      valid: false,
      reason: `Unknown ISO 4217 currency code: ${raw.currency}`,
      transaction: raw,
    };
  }

  // Validate timestamp: must be a valid ISO 8601 datetime
  if (isNaN(Date.parse(raw.timestamp))) {
    return {
      valid: false,
      reason: `Invalid ISO 8601 timestamp: ${raw.timestamp}`,
      transaction: raw,
    };
  }

  return { valid: true, transaction: raw };
}

export async function runValidator(): Promise<void> {
  const messages = await readJsonFiles<RawTransaction>(DIRS.input);

  for (const { data: raw } of messages) {
    const result = validateTransaction(raw);
    const now = new Date().toISOString();

    if (!result.valid) {
      const rejected: PipelineMessage = {
        message_id: uuidv4(),
        timestamp: now,
        source_stage: 'validator',
        target_stage: 'results',
        message_type: 'rejected',
        data: { ...raw, reason: result.reason },
      };
      await writeJson(
        path.join(DIRS.results, `${raw.transaction_id}-rejected.json`),
        rejected,
      );
      auditLog({
        timestamp: now,
        agent: 'transaction_validator',
        transaction_id: raw.transaction_id,
        outcome: `REJECTED: ${result.reason}`,
      });
    } else {
      const validated: PipelineMessage = {
        message_id: uuidv4(),
        timestamp: now,
        source_stage: 'validator',
        target_stage: 'fraud_detector',
        message_type: 'transaction',
        data: { ...raw, status: 'validated' },
      };
      await writeJson(
        path.join(DIRS.processing, `${raw.transaction_id}.json`),
        validated,
      );
      auditLog({
        timestamp: now,
        agent: 'transaction_validator',
        transaction_id: raw.transaction_id,
        outcome: 'VALIDATED',
      });
    }
  }
}
