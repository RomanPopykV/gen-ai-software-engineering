# How to Run — AI-Powered Banking Transaction Processing Pipeline

## Prerequisites

- **Node.js** 22 LTS or later
- **npm** 10 or later

---

## 1. Install dependencies

```bash
cd homework-6
npm install
```

---

## 2. Run the pipeline

Processes all transactions from `sample-transactions.json` through the three pipeline stages (Validator → Fraud Detector → Reporting Agent) and writes results to `shared/results/`.

```bash
npm run pipeline
```

Expected output:

```
╔══════════════════════════════════════════╗
║  AI-Powered Banking Transaction Pipeline  ║
╚══════════════════════════════════════════╝

► Setting up shared directories...
► Loading transactions from sample-transactions.json...
  Loaded 8 transactions.
...
══════════════ Pipeline Summary ══════════════
  Total transactions:     8
  Approved:               6
  Flagged for review:     0
  Rejected:               2
  Results written to shared/results/
═══════════════════════════════════════════════
```

Results land in:

```
shared/
├── input/          ← seeded by orchestrator
├── processing/     ← validated transactions
├── output/         ← fraud-scored transactions
└── results/
    ├── TXN006-rejected.json
    ├── TXN007-rejected.json
    ├── TXN001.json  ← approved/flagged
    ├── ...
    └── pipeline-summary.json
```

---

## 3. Run the web dashboard (front-end)

Starts a local web server at **http://localhost:3000** with a dashboard that shows pipeline results and lets you trigger a new pipeline run from the browser.

```bash
npm run frontend
```

Then open your browser at: [http://localhost:3000](http://localhost:3000)

The dashboard shows:

- Summary cards: Total / Approved / Flagged / Rejected counts
- Per-currency transaction totals
- Full transaction table with status, risk score, and rejection reasons
- **"Run Pipeline"** button to re-run the pipeline and refresh results

---

## 4. Run tests

```bash
npm test
```

With coverage report:

```bash
npm run test:coverage
```

Coverage threshold is set at **80%** across branches, functions, lines, and statements. A Husky pre-push hook enforces this — pushes are blocked if coverage falls below 80%.

---

## 5. Type check

```bash
npm run lint
```

---

## Project structure

```
homework-6/
├── sample-transactions.json      ← pipeline input
├── src/
│   ├── orchestrator.ts           ← entry point: runs the full pipeline
│   ├── types/index.ts            ← shared TypeScript interfaces
│   ├── utils/
│   │   ├── fileio.ts             ← async fs/promises helpers
│   │   ├── logger.ts             ← structured audit logger
│   │   └── iso4217.ts            ← ISO 4217 currency code set
│   ├── agents/
│   │   ├── transaction-validator.ts
│   │   ├── fraud-detector.ts
│   │   └── reporting-agent.ts
│   └── frontend/
│       └── server.ts             ← web dashboard (http://localhost:3000)
├── tests/                        ← Jest unit + integration tests
├── shared/                       ← created at runtime (gitignored)
├── mcp.json                      ← MCP server config (context7)
└── research-notes.md             ← context7 query log
```
