---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  section {
    font-family: 'Segoe UI', Arial, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    padding: 54px 72px;
    font-size: 28px;
  }
  h1 {
    color: #38bdf8;
    font-size: 2.15em;
    margin: 0 0 24px;
  }
  h2 {
    color: #38bdf8;
    font-size: 1.55em;
    margin: 0 0 28px;
  }
  p, li {
    line-height: 1.35;
  }
  ul {
    padding-left: 34px;
  }
  strong {
    color: #38bdf8;
  }
  code {
    background: #1e293b;
    color: #e2e8f0;
    padding: 2px 6px;
    border-radius: 4px;
  }
  pre {
    background: #1e293b;
    color: #e2e8f0;
    border: 1px solid #334155;
    border-left: 6px solid #0ea5e9;
    border-radius: 8px;
    padding: 16px 20px;
    font-size: 0.72em;
    line-height: 1.25;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82em;
  }
  th {
    background: #1e293b;
    color: #94a3b8;
    padding: 10px 12px;
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.78em;
  }
  td {
    background: #0f172a;
    color: #e2e8f0;
    padding: 9px 12px;
    border-bottom: 1px solid #334155;
  }
  tr:nth-child(even) td {
    background: #1e293b;
    color: #e2e8f0;
  }
  .title {
    background: #0f172a;
  }
  .title h1 {
    font-size: 2.35em;
  }
  .subtitle {
    color: #94a3b8;
    font-size: 1.05em;
  }
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 36px;
    align-items: start;
  }
  .card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 20px 24px;
  }
  .metric {
    font-size: 2em;
    color: #38bdf8;
    font-weight: 700;
  }
  footer {
    color: #475569;
    font-size: 0.65em;
  }
---

<!-- _class: title -->
<!-- _paginate: false -->

# AI-Powered Banking Transaction Processing Pipeline

<p class="subtitle">HW6 Final Capstone · Roman Popyk · July 2026</p>

---

## Project Goal

Build a working transaction processing pipeline powered by AI workflow agents.

The system validates raw banking transactions, scores valid transactions for fraud risk, and generates a final processing summary.

**Main deliverables:** pipeline code, tests, coverage gate, MCP integration, front-end dashboard, and documentation.

---

## High-Level Architecture

```text
sample-transactions.json
        |
        v
   Orchestrator
        |
        v
 shared/input
        |
        v
 Transaction Validator
        |
        v
 shared/processing
        |
        v
 Fraud Detector
        |
        v
 shared/output
        |
        v
 Reporting Agent ---> shared/results/pipeline-summary.json
```

---

## File-Based Pipeline Protocol

Each stage communicates through JSON files instead of direct function calls.

**Why this design works:**

- Stages are decoupled and easy to replace
- Each stage has clear input and output folders
- Failed transactions can be written immediately to results
- The protocol is transparent and easy to debug

```text
shared/input -> shared/processing -> shared/output -> shared/results
```

---

## Stage 1: Transaction Validator

The validator protects the rest of the pipeline from bad data.

**Checks:**

- Required fields are present
- Amount is positive and parsed with `decimal.js`
- Currency exists in the ISO 4217 code set
- Timestamp is valid ISO 8601

**Output:** valid transactions move forward; invalid transactions are rejected with a reason.

---

## Stage 2: Fraud Detector

The fraud detector assigns a numeric risk score to each validated transaction.

| Risk factor                | Score |
| -------------------------- | ----: |
| Amount greater than 10,000 |   +40 |
| Cross-border transaction   |   +30 |
| Off-hours transaction      |   +20 |
| Wire transfer              |   +10 |

Transactions with score **60 or higher** are marked `FLAGGED_FOR_REVIEW`.

---

## Stage 3: Reporting Agent

The reporting agent creates the final pipeline summary.

**Reads:**

- Approved and flagged transactions from `shared/output`
- Rejected transactions from `shared/results`

**Writes:**

- Total transaction count
- Approved, flagged, and rejected counts
- Per-currency counts and amount totals

---

## Workflow Agents Used

| Agent | Responsibility                | Deliverable                    |
| ----- | ----------------------------- | ------------------------------ |
| Spec  | Define behavior before coding | `specification.md`             |
| Code  | Build the pipeline            | TypeScript stages + dashboard  |
| Tests | Verify behavior               | Jest tests + coverage hook     |
| Docs  | Explain the system            | README, HOWTORUN, presentation |

---

## Demo Results

Running `npm run pipeline` processes 8 sample transactions.

<div class="two-col">
<div class="card">
<div class="metric">8</div>
Total transactions
</div>
<div class="card">
<div class="metric">6</div>
Approved transactions
</div>
<div class="card">
<div class="metric">0</div>
Flagged for review
</div>
<div class="card">
<div class="metric">2</div>
Rejected transactions
</div>
</div>

---

## Rejection Examples

Two sample records are rejected by the validator.

| Transaction | Reason                                |
| ----------- | ------------------------------------- |
| `TXN006`    | Unknown ISO 4217 currency code: `XYZ` |
| `TXN007`    | Amount must be positive: `-100.00`    |

Rejected records are written to `shared/results` with a machine-readable `reason` field.

---

## Front-End Dashboard

The project includes a simple web dashboard running at `http://localhost:3000`.

**Dashboard features:**

- Run the pipeline from the browser
- View total, approved, flagged, and rejected counts
- Inspect per-currency totals
- Review transaction status, risk score, and rejection reason

Run it with:

```bash
npm run frontend
```

---

## MCP Integration

Two MCP servers are configured in `mcp.json`.

| Server            | Purpose                                                   |
| ----------------- | --------------------------------------------------------- |
| `context7`        | Look up current docs for libraries and framework patterns |
| `pipeline-status` | Query live pipeline results from an MCP client            |

The custom server is implemented in `mcp/server.ts`.

---

## Custom MCP Server

The `pipeline-status` server exposes two tools and one resource.

| Type     | Name                                     |
| -------- | ---------------------------------------- |
| Tool     | `get_transaction_status(transaction_id)` |
| Tool     | `list_pipeline_results()`                |
| Resource | `pipeline://summary`                     |

This lets AI tools query pipeline state without manually opening result files.

---

## Quality Gate

A Husky `pre-push` hook runs the coverage check before every push.

```text
git push
   -> .husky/pre-push
   -> npm run test:coverage
   -> block push if coverage is below 80%
```

Coverage thresholds are set in `jest.config.js` for branches, functions, lines, and statements.

---

## Test Coverage

The test suite contains **68 tests** across validators, runners, utilities, logging, fraud logic, and reporting.

<div class="two-col">
<div class="card">
<div class="metric">100%</div>
Statements, branches, functions, and lines
</div>
<div class="card">
<div class="metric">7</div>
Unit test files
</div>
</div>

Tests isolate file I/O with temporary or mocked directories where needed.

---

## Lessons Learned

- Monetary values must use decimal arithmetic, not native floating point
- File-based protocols make multi-stage pipelines easier to inspect and debug
- Automated hooks prevent quality regressions before code reaches the remote branch
- MCP servers are a practical way to expose project state to AI coding tools
- AI agents speed up implementation, but tests and manual review still matter

---

<!-- _paginate: false -->

# Thank You

**Roman Popyk** · HW6 Final Capstone

```bash
npm install
npm run pipeline
npm run frontend
npm run test:coverage
npm run mcp
```
