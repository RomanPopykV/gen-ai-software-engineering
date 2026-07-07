# AI-Powered Banking Transaction Processing Pipeline

> Created by **Roman Popyk**

## Overview

This project is a multi-agent TypeScript pipeline that processes raw banking transactions through three sequential stages: validation, fraud detection, and reporting. Each stage is implemented as an independent agent that reads JSON messages from a shared directory, processes them, and writes results to the next directory in the chain. The system is designed around a file-based messaging protocol so stages remain fully decoupled and can be extended or replaced independently.

The pipeline ingests transactions from `sample-transactions.json`, validates them against required fields and ISO 4217 currency codes, scores each valid transaction for fraud risk, and produces a consolidated summary report. A web dashboard lets users trigger pipeline runs and inspect results in the browser. A custom MCP server exposes pipeline results to AI agents, and a Husky pre-push hook enforces ≥80% test coverage on every push.

---

## Pipeline Stage Responsibilities

- **Transaction Validator** — checks all required fields are present, rejects non-positive amounts and unknown ISO 4217 currency codes, and routes valid transactions to the fraud detector
- **Fraud Detector** — scores each transaction on four risk factors (high value, cross-border, off-hours, wire transfer) and marks it `APPROVED` or `FLAGGED_FOR_REVIEW` based on a composite risk score
- **Reporting Agent** — reads all approved and flagged transactions from `shared/output/` and rejected records from `shared/results/`, then writes a consolidated `pipeline-summary.json` with counts and per-currency totals

---

## Architecture

```
sample-transactions.json
         │
         ▼
  ┌─────────────┐
  │ Orchestrator │  seeds shared/input/, runs stages in sequence
  └──────┬──────┘
         │
         ▼
  ┌──────────────────────┐
  │ Transaction Validator │  shared/input/ → shared/processing/ (valid)
  │                      │                → shared/results/    (rejected)
  └──────────┬───────────┘
             │ valid transactions
             ▼
  ┌──────────────────┐
  │  Fraud Detector  │  shared/processing/ → shared/output/ (approved/flagged)
  └────────┬─────────┘
           │ all outcomes
           ▼
  ┌──────────────────┐
  │ Reporting Agent  │  shared/output/ + shared/results/ → pipeline-summary.json
  └──────────────────┘
           │
           ▼
  shared/results/
  ├── TXN001.json          (approved/flagged — written by fraud detector)
  ├── TXN006-rejected.json (rejected — written by validator)
  └── pipeline-summary.json
```

File-based message format between stages:

```json
{
  "message_id": "uuid4",
  "timestamp": "2026-03-16T10:00:00Z",
  "source_stage": "validator",
  "target_stage": "fraud_detector",
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

## Tech Stack

| Layer              | Technology                     | Purpose                                       |
| ------------------ | ------------------------------ | --------------------------------------------- |
| Language           | TypeScript 5                   | Type-safe pipeline implementation             |
| Runtime            | Node.js 22 LTS                 | Execution environment                         |
| Decimal arithmetic | decimal.js ^10.4.3             | Precise monetary amounts (no float)           |
| ID generation      | uuid ^9.0.0                    | Unique `message_id` per pipeline message      |
| Test framework     | Jest ^29.7.0 + ts-jest ^29.1.5 | Unit tests with 100% coverage                 |
| Dev runner         | tsx ^4.7.2                     | Run TypeScript directly without compile step  |
| Git hooks          | Husky ^9                       | Pre-push coverage gate (blocks push if < 80%) |
| MCP SDK            | @modelcontextprotocol/sdk      | Custom `pipeline-status` MCP server           |
| Web dashboard      | Node.js `http` module          | Built-in, no external web framework           |

---

## Quick Start

```bash
cd homework-6
npm install

# Run the pipeline
npm run pipeline

# Open the web dashboard
npm run frontend
# → http://localhost:3000

# Run tests with coverage
npm run test:coverage

# Start the custom MCP server
npm run mcp
```

See [HOWTORUN.md](HOWTORUN.md) for detailed instructions covering all commands, the MCP Inspector, and the coverage gate hook.

---

## MCP Integration

Two MCP servers are configured in [`mcp.json`](mcp.json):

- **context7** — used during development to look up `decimal.js` monetary arithmetic and Node.js `fs/promises` patterns (see [`research-notes.md`](research-notes.md))
- **pipeline-status** (`mcp/server.ts`) — custom server exposing:
  - Tool `get_transaction_status(transaction_id)` — returns status and details for a single transaction
  - Tool `list_pipeline_results()` — returns the full pipeline summary
  - Resource `pipeline://summary` — latest `pipeline-summary.json` as text

---

## Project Structure

```
homework-6/
├── sample-transactions.json      ← pipeline input (8 sample transactions)
├── specification.md              ← full technical specification (Task 1)
├── research-notes.md             ← context7 query log (Task 4)
├── mcp.json                      ← MCP server config
├── src/
│   ├── orchestrator.ts           ← entry point: seeds input, runs all stages
│   ├── types/index.ts            ← shared TypeScript interfaces
│   ├── utils/
│   │   ├── fileio.ts             ← async fs/promises helpers + DIRS constant
│   │   ├── logger.ts             ← structured audit logger + account masking
│   │   └── iso4217.ts            ← ISO 4217 currency code set (150+ codes)
│   ├── agents/
│   │   ├── transaction-validator.ts
│   │   ├── fraud-detector.ts
│   │   └── reporting-agent.ts
│   └── frontend/
│       └── server.ts             ← web dashboard (http://localhost:3000)
├── mcp/
│   └── server.ts                 ← custom pipeline-status MCP server
├── tests/
│   └── unit/                     ← 68 tests, 100% coverage
├── .husky/
│   └── pre-push                  ← coverage gate hook (blocks push if < 80%)
└── shared/                       ← created at runtime, gitignored
    ├── input/
    ├── processing/
    ├── output/
    └── results/
```
