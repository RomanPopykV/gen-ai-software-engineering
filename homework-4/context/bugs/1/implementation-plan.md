# Implementation Plan — Bug #1: Confidence Score Can Exceed 1.0

## Decision Summary

- **Auto-pick**: YES
- **Rule applied**: PASS × EXCELLENT → AUTO: YES
- **Confidence**: High — research fully verified, fix is a single-line insertion

---

## Auto-pick Rule Applied

| Status | Quality   | Decision  |
| ------ | --------- | --------- |
| PASS   | EXCELLENT | AUTO: YES |

---

## Required Notes

None (no WEAK or PASS\* conditions).

---

## Planning Scope

**Target file**: `src/services/classifier.ts`  
**Target function**: `classifyTicket()`  
**Change type**: Add one line — clamp confidence to `[0.0, 1.0]`

---

## Step-by-Step Implementation

### Step 1 — Add upper clamp before rounding

**File**: `src/services/classifier.ts`

Locate this block:

```typescript
if (matchedCategory === Category.Other) {
  confidence = Math.min(confidence, 0.55);
  confidence = Math.max(confidence, 0.4);
}
confidence = Math.round(confidence * 100) / 100;
```

Change to:

```typescript
if (matchedCategory === Category.Other) {
  confidence = Math.min(confidence, 0.55);
  confidence = Math.max(confidence, 0.4);
}
confidence = Math.min(confidence, 1.0);
confidence = Math.round(confidence * 100) / 100;
```

### Step 2 — Run tests

```
npm test
```

Expected: all existing tests pass. If any test was asserting `confidence > 1.0`, it should now correctly fail and be updated.

---

## Validation Approach

- Run `npm test` after the change.
- Verify no regressions in classifier-related test suites.

---

## Exit Criteria

- `confidence` value is always in `[0.0, 1.0]` after fix
- `npm test` passes with no failures
- No other files need changing
