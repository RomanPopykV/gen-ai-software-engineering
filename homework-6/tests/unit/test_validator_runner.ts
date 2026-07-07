import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { RawTransaction, PipelineMessage } from '../../src/types';

jest.mock('../../src/utils/fileio', () => {
  const actual = jest.requireActual<typeof import('../../src/utils/fileio')>(
    '../../src/utils/fileio',
  );
  return {
    ...actual,
    get DIRS() {
      return (global as Record<string, unknown>).__VALIDATOR_TEST_DIRS__ as typeof actual.DIRS;
    },
  };
});

// Import after mock is set up
import { runValidator } from '../../src/agents/transaction-validator';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hw6-validator-runner-'));
  const dirs = {
    input: path.join(tmpDir, 'input'),
    processing: path.join(tmpDir, 'processing'),
    output: path.join(tmpDir, 'output'),
    results: path.join(tmpDir, 'results'),
  };
  for (const d of Object.values(dirs)) {
    await fs.mkdir(d, { recursive: true });
  }
  (global as Record<string, unknown>).__VALIDATOR_TEST_DIRS__ = dirs;
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

function dirs() {
  return (global as Record<string, unknown>).__VALIDATOR_TEST_DIRS__ as {
    input: string; processing: string; output: string; results: string;
  };
}

async function seedInput(tx: RawTransaction): Promise<void> {
  await fs.writeFile(
    path.join(dirs().input, `${tx.transaction_id}.json`),
    JSON.stringify(tx),
  );
}

const validTx: RawTransaction = {
  transaction_id: 'TXN001',
  timestamp: '2026-03-16T09:00:00Z',
  source_account: 'ACC-1001',
  destination_account: 'ACC-2001',
  amount: '1500.00',
  currency: 'USD',
  transaction_type: 'transfer',
};

describe('runValidator()', () => {
  test('writes valid transaction to processing dir', async () => {
    await seedInput(validTx);
    await runValidator();
    const files = await fs.readdir(dirs().processing);
    expect(files).toContain('TXN001.json');
  });

  test('processed file has correct source_stage and target_stage', async () => {
    await seedInput(validTx);
    await runValidator();
    const raw = await fs.readFile(path.join(dirs().processing, 'TXN001.json'), 'utf-8');
    const msg: PipelineMessage = JSON.parse(raw);
    expect(msg.source_stage).toBe('validator');
    expect(msg.target_stage).toBe('fraud_detector');
    expect(msg.data.status).toBe('validated');
  });

  test('writes rejected transaction to results dir with -rejected suffix', async () => {
    await seedInput({ ...validTx, transaction_id: 'TXN006', currency: 'XYZ' });
    await runValidator();
    const files = await fs.readdir(dirs().results);
    expect(files).toContain('TXN006-rejected.json');
  });

  test('rejected file contains a reason field', async () => {
    await seedInput({ ...validTx, transaction_id: 'TXN007', amount: '-100.00' });
    await runValidator();
    const raw = await fs.readFile(path.join(dirs().results, 'TXN007-rejected.json'), 'utf-8');
    const msg: PipelineMessage = JSON.parse(raw);
    expect(msg.data.reason).toBeTruthy();
    expect(msg.message_type).toBe('rejected');
  });

  test('handles multiple transactions in one run', async () => {
    await seedInput(validTx);
    await seedInput({ ...validTx, transaction_id: 'TXN002', amount: '25000.00' });
    await seedInput({ ...validTx, transaction_id: 'TXN006', currency: 'XYZ' });
    await runValidator();
    const processing = await fs.readdir(dirs().processing);
    const results = await fs.readdir(dirs().results);
    expect(processing).toHaveLength(2);
    expect(results.filter((f) => f.endsWith('-rejected.json'))).toHaveLength(1);
  });

  test('handles empty input directory gracefully', async () => {
    await expect(runValidator()).resolves.not.toThrow();
  });
});
