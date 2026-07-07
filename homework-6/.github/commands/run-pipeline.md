---
mode: agent
description: "Runs the multi-agent banking transaction processing pipeline end-to-end and reports results."
---

Run the transaction processing pipeline end-to-end.

Steps:

1. Check that `sample-transactions.json` exists in the `homework-6/` directory. If it does not exist, stop and report the error.
2. Clear all files from `shared/input/`, `shared/processing/`, `shared/output/`, and `shared/results/` (but keep the directories).
3. Run the pipeline: `npm run pipeline` (from the `homework-6/` directory).
4. Read `shared/results/pipeline-summary.json` and display a summary table:
   - Total transactions
   - Approved count
   - Flagged for review count
   - Rejected count
   - Breakdown by currency (count + total amount)
5. List all rejected transactions (files ending in `-rejected.json` in `shared/results/`) and report the `transaction_id` and `reason` for each rejection.
