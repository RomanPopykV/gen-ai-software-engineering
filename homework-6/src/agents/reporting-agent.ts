import Decimal from 'decimal.js';
import path from 'path';
import { PipelineMessage, PipelineSummary, ByCurrencyEntry } from '../types';
import { auditLog } from '../utils/logger';
import { DIRS, readJsonFiles, writeJson } from '../utils/fileio';

export async function generateReport(): Promise<PipelineSummary> {
  // Read fraud-scored transactions from shared/output/
  const outputEntries = await readJsonFiles<PipelineMessage>(DIRS.output);

  // Read rejected transactions from shared/results/ (filename ends with -rejected.json)
  const resultEntries = await readJsonFiles<PipelineMessage>(DIRS.results);
  const rejectedEntries = resultEntries.filter((m) =>
    m.file.endsWith('-rejected.json'),
  );

  let approved = 0;
  let flaggedForReview = 0;
  const byCurrencyAccum: Record<string, { count: number; totalAmount: Decimal }> = {};

  for (const { data: message } of outputEntries) {
    const currency = message.data.currency.toUpperCase();
    const amount = new Decimal(message.data.amount);

    if (!byCurrencyAccum[currency]) {
      byCurrencyAccum[currency] = { count: 0, totalAmount: new Decimal(0) };
    }
    byCurrencyAccum[currency].count += 1;
    byCurrencyAccum[currency].totalAmount =
      byCurrencyAccum[currency].totalAmount.plus(amount);

    if (message.data.status === 'FLAGGED_FOR_REVIEW') {
      flaggedForReview += 1;
    } else {
      approved += 1;
    }
  }

  const rejected = rejectedEntries.length;
  const total = approved + flaggedForReview + rejected;

  const by_currency: Record<string, ByCurrencyEntry> = {};
  for (const [currency, { count, totalAmount }] of Object.entries(byCurrencyAccum)) {
    by_currency[currency] = {
      count,
      total_amount: totalAmount.toFixed(2),
    };
  }

  const summary: PipelineSummary = {
    generated_at: new Date().toISOString(),
    total,
    approved,
    flagged_for_review: flaggedForReview,
    rejected,
    by_currency,
  };

  await writeJson(path.join(DIRS.results, 'pipeline-summary.json'), summary);

  const now = new Date().toISOString();
  auditLog({
    timestamp: now,
    agent: 'reporting_agent',
    transaction_id: 'N/A',
    outcome: `summary_written (total: ${total}, approved: ${approved}, flagged: ${flaggedForReview}, rejected: ${rejected})`,
  });

  return summary;
}
