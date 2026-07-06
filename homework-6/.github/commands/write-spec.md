---
mode: agent
description: "Generates a complete technical specification (specification.md) for the AI-powered banking transaction processing pipeline, following the project template."
---

You are Agent 1 — Specification Writer for the AI-Powered Banking Transaction Processing Pipeline project.

Your task is to generate a complete `specification.md` file in the `homework-6/` directory. Follow the template structure exactly as defined below. Do not skip any section.

---

## Project Context

- **Project**: AI-powered multi-agent banking transaction processing pipeline
- **Language**: TypeScript 5 / Node.js 22 LTS
- **Input**: `homework-6/sample-transactions.json` — raw transaction records with fields: `transaction_id`, `timestamp`, `source_account`, `destination_account`, `amount`, `currency`, `transaction_type`, `description`, `metadata` (channel, country)
- **Output**: `shared/results/` — processed results + `pipeline-summary.json`
- **Agents in the pipeline**:
  1. Transaction Validator — validates fields, amount, ISO 4217 currency
  2. Fraud Detector — scores risk by amount, timing, cross-border patterns
  3. Reporting Agent — aggregates results, writes pipeline summary
- **Communication**: file-based JSON messages via `shared/input/`, `shared/processing/`, `shared/output/`, `shared/results/`
- **Testing**: Jest + ts-jest, coverage threshold ≥ 80%, enforced by pre-push hook

---

## Template to Follow

Generate the file `homework-6/specification.md` with exactly these 5 sections:

---

### 1. High-Level Objective

One sentence describing what the pipeline does end-to-end (input → processing stages → output).

---

### 2. Mid-Level Objectives (4–5 items)

Concrete, testable requirements. Each must be specific enough to verify in a test. Examples of the style (do not copy verbatim — generate appropriate ones for this project):

- Transactions with missing required fields are rejected and written to `shared/results/` with a `reason` field
- Transactions above $10,000 are flagged for fraud review with a numeric risk score
- All agent operations are logged with ISO 8601 timestamps, agent name, transaction ID, and outcome
- The pipeline summary report includes total counts of approved, flagged, and rejected transactions

---

### 3. Implementation Notes

Include all of the following constraints:

- **Monetary values**: use `Decimal` (via `decimal.js`) — never native `number` or `float` for amounts
- **Currency codes**: ISO 4217 only (USD, EUR, GBP, JPY, etc.) — reject unknown codes
- **Logging**: audit trail per transaction with `{ timestamp, agent, transaction_id, outcome }` — no plaintext PII
- **PII**: `source_account` and `destination_account` must be masked in all log output
- **Timestamps**: ISO 8601 format in all messages and logs
- **TypeScript**: no `any` types; explicit interfaces for all message shapes
- **File I/O**: all shared directory reads/writes use async `fs/promises`

---

### 4. Context

#### Beginning context

- `homework-6/sample-transactions.json` — raw transaction records (input)
- Empty `shared/` directory structure to be created: `input/`, `processing/`, `output/`, `results/`
- `package.json` and `tsconfig.json` to be initialized

#### Ending context

- `src/agents/transaction-validator.ts` — validator agent
- `src/agents/fraud-detector.ts` — fraud detector agent
- `src/agents/reporting-agent.ts` — reporting agent
- `src/utils/` — shared utilities (file I/O, logging, Decimal helpers, ISO 4217 validation)
- `src/types/` — shared TypeScript interfaces for messages and transaction data
- `tests/` — Jest unit tests for each agent (coverage ≥ 80%)
- `shared/results/pipeline-summary.json` — final pipeline output
- `.husky/pre-push` — hook that blocks push if coverage is below 80%

---

### 5. Low-Level Tasks

Generate one entry per agent using exactly this format:

```
Task: [Agent Name]
Prompt: "[Exact prompt to give GitHub Copilot or Claude to implement this agent]"
File to CREATE: src/agents/[filename].ts
Function to CREATE: [functionName](input: [InputType]): Promise<[OutputType]>
Details: [Specific logic the agent must implement — validations, rules, thresholds, outputs]
```

Produce entries for:

1. **Transaction Validator** — validate all required fields, amount as positive Decimal, ISO 4217 currency, ISO 8601 timestamp; reject invalid transactions to `shared/results/` with `reason`; pass valid ones to `shared/processing/`
2. **Fraud Detector** — read from `shared/processing/`; apply risk scoring rules (high-value >$10k: +40, cross-border: +30, unusual hours <6 or >22 UTC: +20, wire_transfer: +10); score ≥ 60 → `FLAGGED_FOR_REVIEW`, else `APPROVED`; write to `shared/output/`
3. **Reporting Agent** — read all messages from `shared/output/`; aggregate counts and totals by currency; write `pipeline-summary.json` to `shared/results/`

---

## Output Instructions

- Create the file at: `homework-6/specification.md`
- Start the file with this header:
  ```
  > Ingest the information from this file, implement the Low-Level Tasks, and generate the code that will satisfy the High and Mid-Level Objectives.
  ```
- Use clear Markdown headings (`##` for each section)
- Do not include any placeholder text — all sections must be fully filled in based on the project context above
- After creating the file, confirm with: "specification.md created successfully in homework-6/"
