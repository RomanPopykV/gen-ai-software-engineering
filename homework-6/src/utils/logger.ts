import { AuditLogEntry } from '../types';

/**
 * Masks a bank account identifier for safe logging.
 * E.g. "ACC-1001" → "ACC-****"
 */
export function maskAccount(account: string): string {
  const dashIdx = account.lastIndexOf('-');
  if (dashIdx !== -1) {
    return `${account.substring(0, dashIdx)}-****`;
  }
  if (account.length <= 4) return '****';
  return `${account.substring(0, 4)}****`;
}

/**
 * Writes a structured audit log entry to stdout as a JSON line.
 * Never includes plaintext account numbers or other PII.
 */
export function auditLog(entry: AuditLogEntry): void {
  process.stdout.write(JSON.stringify(entry) + '\n');
}
