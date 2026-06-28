# Bug #2: Incorrect Failed Count in Import Response

## Location

File: `src/services/import-service.ts` (lines 60-68)

## Severity

Medium - Data accuracy bug affecting API response

## Description

The `importTickets()` function returns an incorrect `failed` count in the response. The calculation does not properly account for validation errors, leading to a mismatch between the `failed` count and the actual error entries.

## Root Cause

The failed count is calculated as:

```typescript
failed: records.length - successful;
```

However, this is misleading because:

1. When a record fails **structure validation** (caught by `validateCSVStructure`, etc.), it's added to `validationErrors`
2. The record is **skipped** (not processed by `createTicket()`)
3. When a record fails **ticket creation validation**, it's **also added** to `importErrors`
4. The failed count is simply the total minus successful, which doesn't match the actual error entries

Example:

- Total records: 10
- Successful creations: 8
- Failed count returned: 2 ✗ (10 - 8 = 2)
- But actual errors in `errors[]`: Could be 2, 3, or more depending on validation vs creation errors

## Current Buggy Code

```typescript
return {
  total: records.length,
  successful,
  failed: records.length - successful, // ❌ Incorrect calculation
  errors: importErrors,
  created_ids,
};
```

## Impact

- API consumer receives inconsistent metadata (failed count vs error array length)
- Makes it hard to debug import failures programmatically
- Response validation tests may fail
- Leads to confusion about how many records actually failed

## Expected Fix

```typescript
return {
  total: records.length,
  successful,
  failed: importErrors.length, // ✓ Matches actual error count
  errors: importErrors,
  created_ids,
};
```

## How to Test

1. Create a CSV file with 10 records where 3 have invalid structures and 2 more fail during ticket creation
2. Call `importTickets(content, 'csv')`
3. Check the response:
   - Expected: `failed: 5`, `errors.length: 5`
   - Actual: `failed: 2`, `errors.length: 5` ❌
