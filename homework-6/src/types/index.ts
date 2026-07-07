export interface RawTransaction {
  transaction_id: string;
  timestamp: string;
  source_account: string;
  destination_account: string;
  amount: string;
  currency: string;
  transaction_type: string;
  description?: string;
  metadata?: {
    channel?: string;
    country?: string;
  };
}

export interface TransactionData extends RawTransaction {
  status?: string;
  reason?: string;
  risk_score?: number;
}

export interface PipelineMessage {
  message_id: string;
  timestamp: string;
  source_stage: string;
  target_stage: string;
  message_type: string;
  data: TransactionData;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  transaction: RawTransaction;
}

export interface FraudResult {
  transaction_id: string;
  risk_score: number;
  status: 'APPROVED' | 'FLAGGED_FOR_REVIEW';
}

export interface ByCurrencyEntry {
  count: number;
  total_amount: string;
}

export interface PipelineSummary {
  generated_at: string;
  total: number;
  approved: number;
  flagged_for_review: number;
  rejected: number;
  by_currency: Record<string, ByCurrencyEntry>;
}

export interface AuditLogEntry {
  timestamp: string;
  agent: string;
  transaction_id: string;
  outcome: string;
}
