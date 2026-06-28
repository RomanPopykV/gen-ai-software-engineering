# Codebase Research — Bug #2

## Metadata

- **Folder**: `context/bugs/2/`
- **Matched to**: Bug #2 — Incorrect Failed Count in Import Response
- **Researcher stage**: Stage 1 (Bug Researcher)
- **Date**: 2026-06-16
- **Source files read**: `src/services/import-service.ts`

---

## Issue: `failed` Count Diverges from Actual Error Array Length

### Category

Data Accuracy Bug

### Severity

Medium

### File & Location

`src/services/import-service.ts` — `importTickets()` return statement

```typescript
// Lines ~68–76
return {
  total: records.length,
  successful,
  failed: records.length - successful, // ❌
  errors: importErrors,
  created_ids,
};
```

### Root Cause

`failed` is computed as `records.length - successful`. But `importErrors` accumulates errors from **two separate phases**:

1. Structure validation (`validationErrors` from `validateCSVStructure` / `validateJSONStructure` / `validateXMLStructure`)
2. Ticket creation validation (additional `ValidationError` thrown during `createTicket`)

A single record can contribute to `importErrors` only once, but the count `records.length - successful` is always mathematically equal to the number of unsuccessful records, so it **does** match `importErrors.length` in the current code flow.

However the semantic contract is misleading: `failed` should equal `errors.length` to be truthful. If the two ever diverge (e.g., a future code path that adds a record to errors multiple times or skips adding to errors), the count will silently lie.

Additionally, `importErrors.sort()` reorders entries but the `failed` count is computed before sorting, so the computation is stable — but the fix should still express intent clearly.

### Verbatim Snippet (actual source)

```typescript
importErrors.sort((a, b) => a.recordIndex - b.recordIndex);

return {
  total: records.length,
  successful,
  failed: records.length - successful,
  errors: importErrors,
  created_ids,
};
```

### Impact

- API clients that compare `failed` with `errors.length` may encounter disagreements in edge cases
- Any future code modification that adds phantom errors or skips error entries will silently return wrong `failed` counts
- The semantic meaning of `failed` is "how many entries in `errors`", not "total minus successful"

### Expected Fix

Change `failed: records.length - successful` to `failed: importErrors.length`.

---

## Statistics

| Metric             | Value |
| ------------------ | ----- |
| Total issues found | 1     |
| Critical           | 0     |
| High               | 0     |
| Medium             | 1     |
| Low                | 0     |
| Files analyzed     | 1     |
