> Ingest the information from this file, implement the Low-Level Tasks, and generate the code that will satisfy the High and Mid-Level Objectives.

# AI-Powered Banking Transaction Processing Pipeline — Specification

## 1. High-Level Objective

Build a multi-agent TypeScript pipeline that reads raw banking transactions from `sample-transactions.json`, routes each record through a Transaction Validator, a Fraud Detector, and a Reporting Agent via file-based JSON messaging, and produces per-transaction outcomes plus a consolidated pipeline summary in `shared/results/`.

---

## 2. Mid-Level Objectives

- Transactions with any missing required field (`transaction_id`, `timestamp`, `source_account`, `destination_account`, `amount`, `currency`, `transaction_type`) are rejected and written to `shared/results/` with a `reason` field explaining which field failed.
- Transactions with an unknown ISO 4217 currency code or a non-positive amount are rejected with a `reason` field before reaching the Fraud Detector.
- Transactions above $10,000 (USD equivalent) are flagged for fraud review and assigned a numeric `risk_score`; a score ≥ 60 results in status `FLAGGED_FOR_REVIEW`, while a score < 60 results in status `APPROVED`.
- All agent operations produce an audit log entry containing `{ timestamp, agent, transaction_id, outcome }` in ISO 8601 format, with account numbers masked in all log output.
- The pipeline summary report (`shared/results/pipeline-summary.json`) includes total counts of approved, flagged, and rejected transactions, grouped by currency.

---

## 3. Implementation Notes

- **Monetary values**: use `Decimal` (via `decimal.js`) for all amount parsing and comparisons — never native `number` or `float`.
- **Currency codes**: ISO 4217 only (USD, EUR, GBP, JPY, etc.) — any unknown code causes immediate rejection.
- **Logging**: audit trail per transaction with `{ timestamp, agent, transaction_id, outcome }` — no plaintext PII; mask `source_account` and `destination_account` in all log output (e.g. `ACC-****`).
- **Timestamps**: ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`) in all messages and logs.
- **TypeScript**: no `any` types; explicit interfaces defined in `src/types/` for all message shapes and transaction data.
- **File I/O**: all shared directory reads/writes use async `fs/promises`; agents poll or scan their designated directory on each invocation.
- **Error handling**: unrecoverable I/O errors are logged and the agent exits with a non-zero code; individual transaction errors do not halt the pipeline.
- **Testing**: Jest with `ts-jest`; coverage threshold ≥ 80% enforced by a Husky `pre-push` hook.

---

## 4. Context

### Beginning context

- `homework-6/sample-transactions.json` — raw transaction records with fields: `transaction_id`, `timestamp`, `source_account`, `destination_account`, `amount`, `currency`, `transaction_type`, `description`, `metadata` (`channel`, `country`).
- No `shared/` directory exists yet — the pipeline must create `shared/input/`, `shared/processing/`, `shared/output/`, and `shared/results/` on first run.
- No `package.json`, `tsconfig.json`, or agent source files exist yet.

### Ending context

- `src/agents/transaction-validator.ts` — validator agent module.
- `src/agents/fraud-detector.ts` — fraud detector agent module.
- `src/agents/reporting-agent.ts` — reporting agent module.
- `src/utils/` — shared utilities: file I/O helpers, structured logger, Decimal helpers, ISO 4217 currency list.
- `src/types/` — shared TypeScript interfaces for `RawTransaction`, `PipelineMessage`, `ValidationResult`, `FraudResult`, and `PipelineSummary`.
- `src/integrator.ts` — orchestrator that seeds `shared/input/`, runs agents in sequence, and monitors `shared/results/`.
- `tests/` — Jest unit tests for each agent and one integration test for the full pipeline (coverage ≥ 80%).
- `shared/results/pipeline-summary.json` — final aggregated pipeline output.
- `.husky/pre-push` — hook that runs `jest --coverage` and blocks the push if overall coverage falls below 80%.

---

## 5. Low-Level Tasks

```
Task: Transaction Validator
Prompt: "Implement a TypeScript module at src/agents/transaction-validator.ts that reads every JSON message file from shared/input/, validates each transaction against the required-field list, checks that amount is a positive Decimal value, verifies the currency is a valid ISO 4217 code, and confirms the timestamp is a valid ISO 8601 datetime. Write rejected transactions to shared/results/ with a 'reason' field. Write valid transactions to shared/processing/ as PipelineMessage objects. Log each outcome as { timestamp, agent: 'transaction_validator', transaction_id, outcome } with account numbers masked."
File to CREATE: src/agents/transaction-validator.ts
Function to CREATE: validateTransaction(raw: RawTransaction): Promise<ValidationResult>
Details:
  - Required fields: transaction_id, timestamp, source_account, destination_account, amount, currency, transaction_type.
  - Use decimal.js Decimal to parse amount; reject if NaN or ≤ 0.
  - Validate currency against a hard-coded ISO 4217 set (exported from src/utils/iso4217.ts).
  - Validate timestamp with Date.parse(); reject if NaN.
  - On rejection: write { message_id, timestamp, source_agent: 'transaction_validator', target_agent: 'results', message_type: 'rejected', data: { ...transaction, reason } } to shared/results/<transaction_id>-rejected.json.
  - On success: write { message_id, timestamp, source_agent: 'transaction_validator', target_agent: 'fraud_detector', message_type: 'transaction', data: { ...transaction, status: 'validated' } } to shared/processing/<transaction_id>.json.
```

```
Task: Fraud Detector
Prompt: "Implement a TypeScript module at src/agents/fraud-detector.ts that reads every JSON message file from shared/processing/, computes a numeric risk_score for each transaction using the scoring rules below, sets status to FLAGGED_FOR_REVIEW when score >= 60 or APPROVED when score < 60, and writes the result to shared/output/. Log each outcome as { timestamp, agent: 'fraud_detector', transaction_id, outcome } with account numbers masked."
File to CREATE: src/agents/fraud-detector.ts
Function to CREATE: detectFraud(message: PipelineMessage): Promise<FraudResult>
Details:
  - Scoring rules (additive):
      +40 if amount > 10000 USD (use Decimal comparison; treat other currencies as >10000 by face value for MVP).
      +30 if metadata.country is not 'US' (cross-border indicator).
      +20 if the transaction hour (UTC) is < 6 or > 22 (unusual timing).
      +10 if transaction_type is 'wire_transfer'.
  - score >= 60 → status: 'FLAGGED_FOR_REVIEW'.
  - score < 60  → status: 'APPROVED'.
  - Output message written to shared/output/<transaction_id>.json includes risk_score, status, and all original transaction fields.
```

```
Task: Reporting Agent
Prompt: "Implement a TypeScript module at src/agents/reporting-agent.ts that reads all message files from shared/output/ and shared/results/ (to include rejected transactions), aggregates counts of approved, flagged, and rejected transactions, groups totals by currency using Decimal summation, and writes a pipeline-summary.json to shared/results/. Log completion with { timestamp, agent: 'reporting_agent', outcome: 'summary_written' }."
File to CREATE: src/agents/reporting-agent.ts
Function to CREATE: generateReport(): Promise<PipelineSummary>
Details:
  - Read all *.json files from shared/output/ (approved/flagged) and shared/results/*-rejected.json.
  - Count totals: approved, flagged_for_review, rejected, total.
  - For each currency, sum approved amounts using Decimal; include in summary.
  - Write shared/results/pipeline-summary.json with structure:
    { generated_at, total, approved, flagged_for_review, rejected, by_currency: { [currency]: { count, total_amount } } }.
  - Do not include account numbers in the summary output.
```
