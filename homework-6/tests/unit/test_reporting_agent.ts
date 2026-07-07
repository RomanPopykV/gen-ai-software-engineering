import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { generateReport } from '../../src/agents/reporting-agent';
import { PipelineMessage } from '../../src/types';

// Override DIRS to use temp directories so tests are isolated from shared/
jest.mock('../../src/utils/fileio', () => {
  const actual = jest.requireActual<typeof import('../../src/utils/fileio')>('../../src/utils/fileio');
  return {
    ...actual,
    get DIRS() {
      return (global as Record<string, unknown>).__TEST_DIRS__ as typeof actual.DIRS;
    },
  };
});

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hw6-report-test-'));
  const dirs = {
    input: path.join(tmpDir, 'input'),
    processing: path.join(tmpDir, 'processing'),
    output: path.join(tmpDir, 'output'),
    results: path.join(tmpDir, 'results'),
  };
  for (const d of Object.values(dirs)) {
    await fs.mkdir(d, { recursive: true });
  }
  (global as Record<string, unknown>).__TEST_DIRS__ = dirs;
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

function outputMsg(txId: string, currency: string, amount: string, status: 'APPROVED' | 'FLAGGED_FOR_REVIEW'): PipelineMessage {
  return {
    message_id: `msg-${txId}`,
    timestamp: '2026-03-16T10:00:00Z',
    source_stage: 'fraud_detector',
    target_stage: 'reporting',
    message_type: 'transaction',
    data: {
      transaction_id: txId,
      timestamp: '2026-03-16T10:00:00Z',
      source_account: 'ACC-0001',
      destination_account: 'ACC-0002',
      amount,
      currency,
      transaction_type: 'transfer',
      status,
    },
  };
}

function rejectedMsg(txId: string, reason: string): PipelineMessage {
  return {
    message_id: `msg-${txId}`,
    timestamp: '2026-03-16T10:00:00Z',
    source_stage: 'validator',
    target_stage: 'results',
    message_type: 'rejected',
    data: {
      transaction_id: txId,
      timestamp: '2026-03-16T10:00:00Z',
      source_account: 'ACC-0001',
      destination_account: 'ACC-0002',
      amount: '100.00',
      currency: 'USD',
      transaction_type: 'transfer',
      reason,
    },
  };
}

async function writeOutput(txId: string, msg: PipelineMessage): Promise<void> {
  const dirs = (global as Record<string, unknown>).__TEST_DIRS__ as { output: string };
  await fs.writeFile(path.join(dirs.output, `${txId}.json`), JSON.stringify(msg));
}

async function writeRejected(txId: string, msg: PipelineMessage): Promise<void> {
  const dirs = (global as Record<string, unknown>).__TEST_DIRS__ as { results: string };
  await fs.writeFile(path.join(dirs.results, `${txId}-rejected.json`), JSON.stringify(msg));
}

describe('generateReport', () => {
  test('returns zeros when no files exist', async () => {
    const summary = await generateReport();
    expect(summary.total).toBe(0);
    expect(summary.approved).toBe(0);
    expect(summary.flagged_for_review).toBe(0);
    expect(summary.rejected).toBe(0);
    expect(summary.by_currency).toEqual({});
  });

  test('counts approved transactions correctly', async () => {
    await writeOutput('TXN001', outputMsg('TXN001', 'USD', '1500.00', 'APPROVED'));
    await writeOutput('TXN002', outputMsg('TXN002', 'USD', '500.00', 'APPROVED'));
    const summary = await generateReport();
    expect(summary.approved).toBe(2);
    expect(summary.flagged_for_review).toBe(0);
    expect(summary.rejected).toBe(0);
    expect(summary.total).toBe(2);
  });

  test('counts flagged transactions correctly', async () => {
    await writeOutput('TXN001', outputMsg('TXN001', 'USD', '25000.00', 'FLAGGED_FOR_REVIEW'));
    const summary = await generateReport();
    expect(summary.flagged_for_review).toBe(1);
    expect(summary.approved).toBe(0);
  });

  test('counts rejected transactions correctly', async () => {
    await writeRejected('TXN006', rejectedMsg('TXN006', 'Unknown ISO 4217 currency code: XYZ'));
    const summary = await generateReport();
    expect(summary.rejected).toBe(1);
    expect(summary.total).toBe(1);
  });

  test('aggregates by_currency totals correctly', async () => {
    await writeOutput('TXN001', outputMsg('TXN001', 'USD', '1500.00', 'APPROVED'));
    await writeOutput('TXN002', outputMsg('TXN002', 'USD', '500.00', 'APPROVED'));
    await writeOutput('TXN003', outputMsg('TXN003', 'EUR', '200.00', 'APPROVED'));
    const summary = await generateReport();
    expect(summary.by_currency['USD'].count).toBe(2);
    expect(summary.by_currency['USD'].total_amount).toBe('2000.00');
    expect(summary.by_currency['EUR'].count).toBe(1);
    expect(summary.by_currency['EUR'].total_amount).toBe('200.00');
  });

  test('writes pipeline-summary.json to results dir', async () => {
    await generateReport();
    const dirs = (global as Record<string, unknown>).__TEST_DIRS__ as { results: string };
    const file = path.join(dirs.results, 'pipeline-summary.json');
    const stat = await fs.stat(file);
    expect(stat.isFile()).toBe(true);
  });

  test('summary includes a generated_at ISO timestamp', async () => {
    const summary = await generateReport();
    expect(() => new Date(summary.generated_at)).not.toThrow();
    expect(isNaN(Date.parse(summary.generated_at))).toBe(false);
  });

  test('handles mixed approved, flagged and rejected', async () => {
    await writeOutput('TXN001', outputMsg('TXN001', 'USD', '1500.00', 'APPROVED'));
    await writeOutput('TXN002', outputMsg('TXN002', 'USD', '25000.00', 'FLAGGED_FOR_REVIEW'));
    await writeRejected('TXN006', rejectedMsg('TXN006', 'Unknown currency'));
    const summary = await generateReport();
    expect(summary.total).toBe(3);
    expect(summary.approved).toBe(1);
    expect(summary.flagged_for_review).toBe(1);
    expect(summary.rejected).toBe(1);
  });
});
