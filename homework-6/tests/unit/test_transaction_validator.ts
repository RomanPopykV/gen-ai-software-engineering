import { validateTransaction } from '../../src/agents/transaction-validator';
import { RawTransaction } from '../../src/types';

const base: RawTransaction = {
  transaction_id: 'TXN001',
  timestamp: '2026-03-16T09:00:00Z',
  source_account: 'ACC-1001',
  destination_account: 'ACC-2001',
  amount: '1500.00',
  currency: 'USD',
  transaction_type: 'transfer',
  description: 'Test payment',
  metadata: { channel: 'online', country: 'US' },
};

describe('validateTransaction', () => {
  test('returns valid for a well-formed transaction', () => {
    const result = validateTransaction(base);
    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  test.each([
    'transaction_id',
    'timestamp',
    'source_account',
    'destination_account',
    'amount',
    'currency',
    'transaction_type',
  ] as (keyof RawTransaction)[])('rejects when %s is missing', (field) => {
    const tx = { ...base, [field]: '' };
    const result = validateTransaction(tx);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain(field);
  });

  test('rejects a negative amount', () => {
    const result = validateTransaction({ ...base, amount: '-100.00' });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('positive');
  });

  test('rejects zero amount', () => {
    const result = validateTransaction({ ...base, amount: '0' });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('positive');
  });

  test('rejects a non-numeric amount', () => {
    const result = validateTransaction({ ...base, amount: 'abc' });
    expect(result.valid).toBe(false);
  });

  test('rejects an unknown currency code', () => {
    const result = validateTransaction({ ...base, currency: 'XYZ' });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('XYZ');
  });

  test('accepts a valid non-USD currency (EUR)', () => {
    const result = validateTransaction({ ...base, currency: 'EUR' });
    expect(result.valid).toBe(true);
  });

  test('currency check is case-insensitive', () => {
    const result = validateTransaction({ ...base, currency: 'usd' });
    expect(result.valid).toBe(true);
  });

  test('rejects an invalid ISO 8601 timestamp', () => {
    const result = validateTransaction({ ...base, timestamp: 'not-a-date' });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('timestamp');
  });

  test('accepts a valid large amount', () => {
    const result = validateTransaction({ ...base, amount: '75000.00' });
    expect(result.valid).toBe(true);
  });
});
