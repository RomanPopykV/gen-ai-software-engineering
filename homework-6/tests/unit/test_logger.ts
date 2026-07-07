import { maskAccount, auditLog } from '../../src/utils/logger';

describe('maskAccount', () => {
  test('masks account number after last dash', () => {
    expect(maskAccount('ACC-1001')).toBe('ACC-****');
  });

  test('masks longer prefix correctly', () => {
    expect(maskAccount('ACCOUNT-9999')).toBe('ACCOUNT-****');
  });

  test('masks short account without dash (≤4 chars)', () => {
    expect(maskAccount('1234')).toBe('****');
  });

  test('masks account without dash (>4 chars)', () => {
    expect(maskAccount('ABCDEF')).toBe('ABCD****');
  });
});

describe('auditLog', () => {
  test('writes a JSON line to stdout', () => {
    const spy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    auditLog({
      timestamp: '2026-03-16T10:00:00Z',
      agent: 'test_agent',
      transaction_id: 'TXN001',
      outcome: 'VALIDATED',
    });
    expect(spy).toHaveBeenCalledTimes(1);
    const written = spy.mock.calls[0][0] as string;
    const parsed = JSON.parse(written.trim());
    expect(parsed.agent).toBe('test_agent');
    expect(parsed.transaction_id).toBe('TXN001');
    expect(parsed.outcome).toBe('VALIDATED');
    spy.mockRestore();
  });
});
