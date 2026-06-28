# Implementation Plan — Bug #3: Limit Parameter Silently Ignored

## Decision Summary

- **Auto-pick**: YES
- **Rule applied**: PASS × EXCELLENT → AUTO: YES
- **Confidence**: High — fix is a single guard + slice after the existing fetch

---

## Auto-pick Rule Applied

| Status | Quality   | Decision  |
| ------ | --------- | --------- |
| PASS   | EXCELLENT | AUTO: YES |

---

## Required Notes

None.

---

## Planning Scope

**Target file**: `src/routes/tickets.ts`  
**Target handler**: `GET /` — `router.get('/', ...)`  
**Change type**: Add limit application after `getAllTickets()` call

---

## Step-by-Step Implementation

### Step 1 — Apply limit slice after fetching tickets

**File**: `src/routes/tickets.ts`

Locate:

```typescript
let tickets = getAllTickets(
  Object.keys(filters).length > 0 ? filters : undefined,
);
res.json(tickets);
```

Change to:

```typescript
let tickets = getAllTickets(
  Object.keys(filters).length > 0 ? filters : undefined,
);
if (limit) {
  const limitNum = parseInt(limit as string, 10);
  if (!isNaN(limitNum) && limitNum > 0) {
    tickets = tickets.slice(0, limitNum);
  }
}
res.json(tickets);
```

### Step 2 — Run tests

```
npm test
```

Expected: all existing tests pass.

---

## Validation Approach

- Run `npm test` after the change.
- Verify ticket route tests pass, including any that use the `limit` query param.

---

## Exit Criteria

- `GET /tickets?limit=N` returns at most N tickets
- Invalid or missing `limit` values are silently ignored (no 400 returned for this)
- `npm test` passes with no failures
