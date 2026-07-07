import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { PipelineMessage } from '../../src/types';

jest.mock('../../src/utils/fileio', () => {
  const actual = jest.requireActual<typeof import('../../src/utils/fileio')>(
    '../../src/utils/fileio',
  );
  return {
    ...actual,
    get DIRS() {
      return (global as Record<string, unknown>).__FRAUD_TEST_DIRS__ as typeof actual.DIRS;
    },
  };
});

import { runFraudDetector } from '../../src/agents/fraud-detector';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hw6-fraud-runner-'));
  const dirs = {
    input: path.join(tmpDir, 'input'),
    processing: path.join(tmpDir, 'processing'),
    output: path.join(tmpDir, 'output'),
    results: path.join(tmpDir, 'results'),
  };
  for (const d of Object.values(dirs)) {
    await fs.mkdir(d, { recursive: true });
  }
  (global as Record<string, unknown>).__FRAUD_TEST_DIRS__ = dirs;
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

function dirs() {
  return (global as Record<string, unknown>).__FRAUD_TEST_DIRS__ as {
    input: string; processing: string; output: string; results: string;
  };
}

function makeProcessingMsg(
  txId: string,
  amount: string,
  country = 'US',
  txType = 'transfer',
  timestamp = '2026-03-16T10:00:00Z',
): PipelineMessage {
  return {
    message_id: `msg-${txId}`,
    timestamp,
    source_stage: 'validator',
    target_stage: 'fraud_detector',
    message_type: 'transaction',
    data: {
      transaction_id: txId,
      timestamp,
      source_account: 'ACC-0001',
      destination_account: 'ACC-0002',
      amount,
      currency: 'USD',
      transaction_type: txType,
      status: 'validated',
      metadata: { channel: 'online', country },
    },
  };
}

async function seedProcessing(msg: PipelineMessage): Promise<void> {
  await fs.writeFile(
    path.join(dirs().processing, `${msg.data.transaction_id}.json`),
    JSON.stringify(msg),
  );
}

describe('runFraudDetector()', () => {
  test('writes output file for each processed transaction', async () => {
    await seedProcessing(makeProcessingMsg('TXN001', '1500.00'));
    await runFraudDetector();
    const files = await fs.readdir(dirs().output);
    expect(files).toContain('TXN001.json');
  });

  test('output message contains risk_score and status', async () => {
    await seedProcessing(makeProcessingMsg('TXN001', '1500.00'));
    await runFraudDetector();
    const raw = await fs.readFile(path.join(dirs().output, 'TXN001.json'), 'utf-8');
    const msg: PipelineMessage = JSON.parse(raw);
    expect(typeof msg.data.risk_score).toBe('number');
    expect(['APPROVED', 'FLAGGED_FOR_REVIEW']).toContain(msg.data.status);
  });

  test('low-risk transaction is APPROVED', async () => {
    await seedProcessing(makeProcessingMsg('TXN001', '500.00'));
    await runFraudDetector();
    const raw = await fs.readFile(path.join(dirs().output, 'TXN001.json'), 'utf-8');
    const msg: PipelineMessage = JSON.parse(raw);
    expect(msg.data.status).toBe('APPROVED');
    expect(msg.data.risk_score).toBe(0);
  });

  test('high-risk transaction is FLAGGED_FOR_REVIEW', async () => {
    // +40 high-value, +30 cross-border = 70 → FLAGGED
    await seedProcessing(makeProcessingMsg('TXN005', '75000.00', 'DE'));
    await runFraudDetector();
    const raw = await fs.readFile(path.join(dirs().output, 'TXN005.json'), 'utf-8');
    const msg: PipelineMessage = JSON.parse(raw);
    expect(msg.data.status).toBe('FLAGGED_FOR_REVIEW');
    expect(msg.data.risk_score).toBeGreaterThanOrEqual(60);
  });

  test('output message has correct source_stage and target_stage', async () => {
    await seedProcessing(makeProcessingMsg('TXN001', '500.00'));
    await runFraudDetector();
    const raw = await fs.readFile(path.join(dirs().output, 'TXN001.json'), 'utf-8');
    const msg: PipelineMessage = JSON.parse(raw);
    expect(msg.source_stage).toBe('fraud_detector');
    expect(msg.target_stage).toBe('reporting');
  });

  test('handles empty processing directory gracefully', async () => {
    await expect(runFraudDetector()).resolves.not.toThrow();
  });

  test('processes multiple transactions in one run', async () => {
    await seedProcessing(makeProcessingMsg('TXN001', '500.00'));
    await seedProcessing(makeProcessingMsg('TXN002', '25000.00'));
    await runFraudDetector();
    const files = await fs.readdir(dirs().output);
    expect(files).toHaveLength(2);
  });
});
