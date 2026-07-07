import { promises as fs } from 'fs';
import path from 'path';
import { RawTransaction } from './types';
import { ensureDirectories, clearDirectory, DIRS, writeJson } from './utils/fileio';
import { runValidator } from './agents/transaction-validator';
import { runFraudDetector } from './agents/fraud-detector';
import { generateReport } from './agents/reporting-agent';

async function loadTransactions(): Promise<RawTransaction[]> {
  const filePath = path.resolve(process.cwd(), 'sample-transactions.json');
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as RawTransaction[];
}

async function seedInput(transactions: RawTransaction[]): Promise<void> {
  for (const tx of transactions) {
    await writeJson(path.join(DIRS.input, `${tx.transaction_id}.json`), tx);
  }
}

async function clearShared(): Promise<void> {
  for (const dir of Object.values(DIRS)) {
    await clearDirectory(dir);
  }
}

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  AI-Powered Banking Transaction Pipeline  ║');
  console.log('╚══════════════════════════════════════════╝\n');

  console.log('► Setting up shared directories...');
  await ensureDirectories();
  await clearShared();

  console.log('► Loading transactions from sample-transactions.json...');
  const transactions = await loadTransactions();
  console.log(`  Loaded ${transactions.length} transactions.\n`);

  console.log('► Seeding shared/input/...');
  await seedInput(transactions);

  console.log('\n[Agent 1] Transaction Validator');
  await runValidator();

  console.log('\n[Agent 2] Fraud Detector');
  await runFraudDetector();

  console.log('\n[Agent 3] Reporting Agent');
  const summary = await generateReport();

  console.log('\n══════════════ Pipeline Summary ══════════════');
  console.log(`  Total transactions:     ${summary.total}`);
  console.log(`  Approved:               ${summary.approved}`);
  console.log(`  Flagged for review:     ${summary.flagged_for_review}`);
  console.log(`  Rejected:               ${summary.rejected}`);

  if (Object.keys(summary.by_currency).length > 0) {
    console.log('\n  By Currency:');
    for (const [currency, entry] of Object.entries(summary.by_currency)) {
      console.log(
        `    ${currency}: ${entry.count} transaction(s), total ${entry.total_amount}`,
      );
    }
  }

  console.log('\n  Results written to shared/results/');
  console.log('═══════════════════════════════════════════════\n');
}

main().catch((err: unknown) => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
