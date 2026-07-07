---
mode: agent
description: "Validates all transactions in sample-transactions.json without running the full pipeline."
---

Validate all transactions in `sample-transactions.json` without running the full pipeline.

Steps:

1. Read all records from `homework-6/sample-transactions.json`.
2. For each transaction, check the following rules (do not write any files — dry-run only):
   - All required fields are present and non-empty: `transaction_id`, `timestamp`, `source_account`, `destination_account`, `amount`, `currency`, `transaction_type`.
   - `amount` is a positive numeric value (greater than zero).
   - `currency` is a valid ISO 4217 code (e.g. USD, EUR, GBP, JPY).
   - `timestamp` is a valid ISO 8601 datetime string.
3. Report the results:
   - Total transaction count
   - Valid count
   - Invalid count
4. Show a Markdown table with columns: `transaction_id` | `valid` | `reason` (empty if valid).
