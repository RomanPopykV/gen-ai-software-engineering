---
agents:
  - name: "Specification Writer"
    description: "Generates the full technical specification for the transaction processing pipeline following the project template"
    path: ".github/commands/write-spec.md"
  - name: "Transaction Validator"
    description: "Validates required fields, amount precision, and ISO 4217 currency codes for each incoming transaction"
    path: "agents/transaction-validator.ts"
  - name: "Fraud Detector"
    description: "Scores transactions for risk based on amount thresholds, timing patterns, and cross-border indicators"
    path: "agents/fraud-detector.ts"
  - name: "Reporting Agent"
    description: "Aggregates processed transaction results and writes a pipeline summary report to shared/results/"
    path: "agents/reporting-agent.ts"
---

# AGENTS.md — AI-Powered Banking Transaction Pipeline

This file governs how AI coding agents (GitHub Copilot, Claude Code, Cursor, etc.) should
understand and operate within this codebase. Read it before making any change.
All rules here are binding unless explicitly overridden by the user in the current session.

---

## 1. Project Overview

This project is an **AI-powered multi-agent banking transaction processing pipeline** built in
TypeScript / Node.js. It processes raw transaction records through a sequence of cooperating
agents, each responsible for a distinct stage of validation, risk analysis, and reporting.

- **Language**: TypeScript 5 (Node.js 22 LTS)
- **Testing**: Jest with ts-jest; coverage threshold ≥ 80% (blocks push if unmet)
- **Input**: `sample-transactions.json` — raw transaction records
- **Output**: `shared/results/` — processed results + pipeline summary report
- **Communication**: File-based JSON messages through `shared/input/`, `shared/processing/`, `shared/output/`, `shared/results/`

---

## 2. Domain Rules (Banking / Financial)

These rules are non-negotiable and must be respected in all generated code:

- **Monetary values**: always use `Decimal` (via `decimal.js` or equivalent) — never native `number` or `float` for amounts
- **Currency codes**: ISO 4217 only (USD, EUR, GBP, JPY, etc.) — reject any unknown code
- **Transaction IDs**: treat as opaque strings; never modify or truncate
- **PII**: account numbers (`source_account`, `destination_account`) and names are sensitive — never log in plaintext; mask or omit in all log output
- **Timestamps**: ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`) in all logs and messages
- **Audit trail**: every agent must log `{ timestamp, agent, transaction_id, outcome }` for each processed message

---

## 3. Agent Descriptions

### Agent 1 — Specification Writer

- **Role**: Meta-agent. Produces the `specification.md` document when invoked via the `/write-spec` slash command.
- **Skill file**: `.github/commands/write-spec.md`
- **Output**: `specification.md` covering High-Level Objective, Mid-Level Objectives, Implementation Notes, Context, and Low-Level Tasks.

### Agent 2 — Transaction Validator

- **Role**: First stage of the processing pipeline. Reads from `shared/input/`, validates each transaction, and writes to `shared/processing/`.
- **Validates**:
  - All required fields present: `transaction_id`, `timestamp`, `source_account`, `destination_account`, `amount`, `currency`, `transaction_type`
  - `amount` is a positive numeric string parseable as Decimal
  - `currency` is a valid ISO 4217 code
  - `timestamp` is a valid ISO 8601 datetime
- **On failure**: writes a rejected message to `shared/results/` with a `reason` field
- **On success**: writes a validated message to `shared/processing/` for the Fraud Detector

### Agent 3 — Fraud Detector

- **Role**: Second stage. Reads validated transactions from `shared/processing/`, scores risk, and writes to `shared/output/`.
- **Risk scoring rules**:
  - Transactions above $10,000 → flagged as `high_value`, risk score +40
  - Cross-border transactions (source country ≠ destination country, or `metadata.country` not `US`) → risk score +30
  - Unusual timing (outside 06:00–22:00 UTC) → risk score +20
  - `wire_transfer` type → risk score +10
- **Thresholds**: score ≥ 60 → status `FLAGGED_FOR_REVIEW`; score < 60 → status `APPROVED`
- **Output**: writes result message to `shared/output/` including `risk_score` and `status`

### Agent 4 — Reporting Agent

- **Role**: Final stage. Reads all processed messages from `shared/output/`, aggregates statistics, and writes the pipeline summary to `shared/results/`.
- **Report includes**:
  - Total transactions processed
  - Count and list of approved, flagged, and rejected transactions
  - Total approved amount (sum, by currency)
  - Pipeline run timestamp and duration
- **Output file**: `shared/results/pipeline-summary.json`

---

## 4. File-Based Communication Protocol

Agents communicate via JSON files in `shared/` subdirectories:

```
shared/
├── input/       ← raw transactions dropped here to start the pipeline
├── processing/  ← Validator writes here; Fraud Detector reads from here
├── output/      ← Fraud Detector writes here; Reporting Agent reads from here
└── results/     ← final outcomes (approved, rejected, summary report)
```

### Standard message format

```json
{
  "message_id": "<uuid-v4>",
  "timestamp": "2026-03-16T10:00:00Z",
  "source_agent": "transaction_validator",
  "target_agent": "fraud_detector",
  "message_type": "transaction",
  "data": {
    "transaction_id": "TXN001",
    "amount": "1500.00",
    "currency": "USD",
    "status": "validated"
  }
}
```

---

## 5. Code Conventions

- All source files in `src/agents/` (one file per agent)
- Shared types in `src/types/`
- Shared utilities (file I/O, logging, Decimal helpers) in `src/utils/`
- Tests mirror the source tree under `tests/`
- No `any` types — use explicit TypeScript interfaces
- All agent functions must be pure and independently testable
- Use `async/await`; no raw Promise chains

---

## 6. Testing Requirements

- Framework: **Jest** with `ts-jest`
- Minimum coverage: **80%** (enforced via pre-push hook — push is blocked if unmet)
- Each agent must have its own unit test file
- Tests must cover: happy path, validation failures, edge cases (zero amount, unknown currency, boundary risk scores)

---

## 7. What NOT to Do

- Never use `float` or `number` for monetary amounts
- Never log raw account numbers or personal data
- Never skip the audit log entry for any processed transaction
- Never write directly to `shared/results/` from Validator or Fraud Detector (only Reporting Agent writes there, except for rejected transactions from Validator)
- Never hardcode currency lists — use a validated ISO 4217 set
