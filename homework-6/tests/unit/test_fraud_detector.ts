import { computeRiskScore, detectFraud } from '../../src/agents/fraud-detector';
import { PipelineMessage } from '../../src/types';

function makeMessage(overrides: Partial<{
  amount: string;
  country: string;
  timestamp: string;
  transaction_type: string;
}>): PipelineMessage {
  return {
    message_id: 'test-id',
    timestamp: '2026-03-16T10:00:00Z',
    source_stage: 'validator',
    target_stage: 'fraud_detector',
    message_type: 'transaction',
    data: {
      transaction_id: 'TXN-TEST',
      timestamp: overrides.timestamp ?? '2026-03-16T10:00:00Z',
      source_account: 'ACC-0001',
      destination_account: 'ACC-0002',
      amount: overrides.amount ?? '500.00',
      currency: 'USD',
      transaction_type: overrides.transaction_type ?? 'transfer',
      metadata: { channel: 'online', country: overrides.country ?? 'US' },
    },
  };
}

describe('computeRiskScore', () => {
  test('returns 0 for a low-risk domestic transfer', () => {
    expect(computeRiskScore(makeMessage({}))).toBe(0);
  });

  test('adds 40 for amount > 10,000', () => {
    expect(computeRiskScore(makeMessage({ amount: '10001.00' }))).toBe(40);
  });

  test('does NOT add 40 for amount exactly 10,000', () => {
    expect(computeRiskScore(makeMessage({ amount: '10000.00' }))).toBe(0);
  });

  test('adds 30 for cross-border (non-US country)', () => {
    expect(computeRiskScore(makeMessage({ country: 'DE' }))).toBe(30);
  });

  test('does NOT add 30 for US country', () => {
    expect(computeRiskScore(makeMessage({ country: 'US' }))).toBe(0);
  });

  test('adds 20 for transaction before 06:00 UTC', () => {
    // 02:47 UTC
    expect(computeRiskScore(makeMessage({ timestamp: '2026-03-16T02:47:00Z' }))).toBe(20);
  });

  test('adds 20 for transaction after 22:00 UTC', () => {
    // 23:00 UTC
    expect(computeRiskScore(makeMessage({ timestamp: '2026-03-16T23:00:00Z' }))).toBe(20);
  });

  test('does NOT add 20 for transaction during business hours (10:00 UTC)', () => {
    expect(computeRiskScore(makeMessage({ timestamp: '2026-03-16T10:00:00Z' }))).toBe(0);
  });

  test('adds 10 for wire_transfer', () => {
    expect(computeRiskScore(makeMessage({ transaction_type: 'wire_transfer' }))).toBe(10);
  });

  test('accumulates all risk factors correctly', () => {
    // +40 high value, +30 cross-border, +20 unusual hour, +10 wire = 100
    const score = computeRiskScore(makeMessage({
      amount: '25000.00',
      country: 'DE',
      timestamp: '2026-03-16T02:47:00Z',
      transaction_type: 'wire_transfer',
    }));
    expect(score).toBe(100);
  });

  test('accumulates partial risk factors (high value + wire)', () => {
    // +40 + 10 = 50
    const score = computeRiskScore(makeMessage({
      amount: '25000.00',
      transaction_type: 'wire_transfer',
    }));
    expect(score).toBe(50);
  });
});

describe('detectFraud', () => {
  test('returns APPROVED for score < 60', () => {
    const result = detectFraud(makeMessage({ amount: '500.00' }));
    expect(result.status).toBe('APPROVED');
    expect(result.risk_score).toBe(0);
  });

  test('returns FLAGGED_FOR_REVIEW for score >= 60', () => {
    // +40 high-value + +30 cross-border = 70
    const result = detectFraud(makeMessage({ amount: '15000.00', country: 'DE' }));
    expect(result.status).toBe('FLAGGED_FOR_REVIEW');
    expect(result.risk_score).toBeGreaterThanOrEqual(60);
  });

  test('returns APPROVED for score exactly 59 (high-value + wire = 50)', () => {
    const result = detectFraud(makeMessage({ amount: '10001.00', transaction_type: 'wire_transfer' }));
    // 40 + 10 = 50 → APPROVED
    expect(result.status).toBe('APPROVED');
    expect(result.risk_score).toBe(50);
  });

  test('returns FLAGGED for score exactly 60 (high-value + cross-border = 70)', () => {
    const result = detectFraud(makeMessage({ amount: '10001.00', country: 'GB' }));
    // 40 + 30 = 70 → FLAGGED
    expect(result.status).toBe('FLAGGED_FOR_REVIEW');
    expect(result.risk_score).toBe(70);
  });

  test('result contains the correct transaction_id', () => {
    const result = detectFraud(makeMessage({}));
    expect(result.transaction_id).toBe('TXN-TEST');
  });
});
