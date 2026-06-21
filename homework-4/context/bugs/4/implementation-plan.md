# Implementation Plan — Bug #4: Unauthenticated Environment Variable Disclosure Endpoint

## Decision Summary

- **Auto-pick**: YES
- **Rule applied**: PASS × EXCELLENT → AUTO: YES
- **Confidence**: High — fix is removing the endpoint entirely

---

## Auto-pick Rule Applied

| Status | Quality   | Decision  |
| ------ | --------- | --------- |
| PASS   | EXCELLENT | AUTO: YES |

---

## Required Notes

None. This is a High-severity security issue. Immediate removal is the correct approach.

---

## Planning Scope

**Target file**: `src/app.ts`  
**Change type**: Remove the `/debug/env` route handler entirely

---

## Step-by-Step Implementation

### Step 1 — Remove the `/debug/env` endpoint

**File**: `src/app.ts`

Remove these lines:

```typescript
app.get("/debug/env", (req: Request, res: Response) => {
  res.json({
    env: process.env,
    headers: req.headers,
    requestId: (req as any).requestId,
  });
});
```

No replacement is needed. If dev-environment diagnostics are needed in future, they should be gated behind `config.isDevelopment` and restricted to specific safe fields only.

### Step 2 — Run tests

```
npm test
```

Expected: all existing tests pass. Any test asserting `/debug/env` returns 200 should be updated to expect 404.

---

## Validation Approach

- Run `npm test` after the change.
- Confirm `GET /debug/env` now returns 404.

---

## Exit Criteria

- `/debug/env` route no longer exists
- `process.env` is no longer exposed over HTTP
- `npm test` passes with no failures
