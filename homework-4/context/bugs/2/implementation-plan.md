# Implementation Plan — Bug #2: Incorrect Failed Count in Import Response

## Decision Summary

- **Auto-pick**: YES
- **Rule applied**: PASS × GOOD → AUTO: YES
- **Confidence**: High — fix is a single-field change in the return statement

---

## Auto-pick Rule Applied

| Status | Quality | Decision  |
| ------ | ------- | --------- |
| PASS   | GOOD    | AUTO: YES |

---

## Required Notes

- PASS × GOOD: Bug Planner notes minor discrepancy D1 from Research Verifier (severity characterization). Plan accounts for this: the fix is semantic clarity, not fixing an active data divergence in current code.

---

## Planning Scope

**Target file**: `src/services/import-service.ts`  
**Target function**: `importTickets()`  
**Change type**: Change one field in the return statement

---

## Step-by-Step Implementation

### Step 1 — Replace `failed` calculation in return statement

**File**: `src/services/import-service.ts`

Locate this return:

```typescript
return {
  total: records.length,
  successful,
  failed: records.length - successful,
  errors: importErrors,
  created_ids,
};
```

Change to:

```typescript
return {
  total: records.length,
  successful,
  failed: importErrors.length,
  errors: importErrors,
  created_ids,
};
```

### Step 2 — Run tests

```
npm test
```

Expected: all existing tests pass. Any test asserting `failed === records.length - successful` that differs from `importErrors.length` should be reviewed.

---

## Validation Approach

- Run `npm test` after the change.
- Verify import-related test suites pass.

---

## Exit Criteria

- `failed` equals `importErrors.length` in all return paths
- `npm test` passes with no failures
