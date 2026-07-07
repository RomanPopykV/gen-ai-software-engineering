# Research Notes — Context7 Queries (Task 2 / Task 4)

These queries were made via the **context7 MCP server** while building the transaction processing pipeline. Context7 was used to retrieve up-to-date library documentation and code patterns.

---

## Query 1: decimal.js — monetary arithmetic in Node.js/TypeScript

- **Search**: `decimal.js monetary arithmetic TypeScript`
- **Context7 library ID**: `/mikemcl/decimal.js`
- **What I looked up**: How to instantiate `Decimal` from a string, compare values, and sum across transactions without floating-point drift.
- **Key insight applied**:
  - Always construct `Decimal` from a `string`, never a `number` literal, to avoid float imprecision before the Decimal constructor even runs.
  - Use `Decimal.gt()`, `Decimal.lte()` for threshold comparisons rather than converting back to `number`.
  - Use `Decimal.plus()` for accumulation in the Reporting Agent; call `.toFixed(2)` only at serialization time.
- **Code pattern used**:
  ```typescript
  import Decimal from 'decimal.js';
  const amount = new Decimal(raw.amount);          // always from string
  if (amount.gt(new Decimal('10000'))) { ... }     // comparison
  total = total.plus(amount);                       // accumulation
  summary.total_amount = total.toFixed(2);          // serialize
  ```

---

## Query 2: Node.js fs/promises — async file I/O patterns

- **Search**: `Node.js fs/promises readdir readFile writeFile TypeScript`
- **Context7 library ID**: `/nodejs/node` (Node.js built-in docs)
- **What I looked up**: The correct async API for reading all `.json` files in a directory, and how to handle the case where a directory does not yet exist.
- **Key insight applied**:
  - `fs.readdir()` throws `ENOENT` if the directory doesn't exist — wrap in `try/catch` and return `[]` to make agents resilient on first run.
  - `fs.mkdir(dir, { recursive: true })` is idempotent — safe to call every pipeline run.
  - `fs.writeFile()` with `'utf-8'` encoding is the correct async replacement for `fs.writeFileSync`.
- **Code pattern used**:

  ```typescript
  import { promises as fs } from "fs";

  async function readJsonFiles(dir: string) {
    let files: string[];
    try {
      files = await fs.readdir(dir);
    } catch {
      return []; // directory does not exist yet — safe to ignore
    }
    return files.filter((f) => f.endsWith(".json"));
  }
  ```
