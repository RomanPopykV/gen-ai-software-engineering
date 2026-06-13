# Bug #3: Unimplemented Limit Parameter Silently Ignored

## Location

File: `src/routes/tickets.ts` (lines 45-57)

## Severity

Low–Medium - Silent feature failure / incomplete API specification

## Description

The `GET /tickets` endpoint accepts a `limit` query parameter but does not apply it. This creates a silent failure where the API behaves differently than documented or expected, potentially returning large result sets when the client expects pagination.

## Root Cause

The query parameter `limit` is extracted but never used:

```typescript
const { category, priority, status, customer_id, assigned_to, limit } = req.query;
// ... filter logic ...
let tickets = getAllTickets(...);
// ❌ limit is extracted but never applied
res.json(tickets);
```

The parameter is in the code but serves no purpose, likely from incomplete refactoring or a feature that was planned but not finished.

## Current Buggy Code

```typescript
router.get("/", (req: Request, res: Response): void => {
  const { category, priority, status, customer_id, assigned_to, limit } =
    req.query;
  const filters: FilterOptions = {};
  // ... filter setup ...
  let tickets = getAllTickets(
    Object.keys(filters).length > 0 ? filters : undefined,
  );
  // Should apply: if (limit) tickets = tickets.slice(0, parseInt(limit as string));
  res.json(tickets);
});
```

## Impact

- **API Inconsistency**: Endpoint accepts but ignores a documented query parameter
- **Performance Risk**: Large datasets are always returned in full, no pagination
- **Client Issues**: Clients relying on limit parameter will receive unexpected full datasets
- **Hidden Feature**: Developers may assume pagination works when it doesn't
- **Testing Gaps**: Tests that expect pagination to work will fail silently

## Example Scenario

```bash
# Client expects only 10 tickets
GET /tickets?limit=10&status=new

# Server returns ALL tickets with status=new (e.g., 500 tickets)
```

## Expected Fix

```typescript
let tickets = getAllTickets(
  Object.keys(filters).length > 0 ? filters : undefined,
);
if (limit) {
  const limitNum = parseInt(limit as string);
  if (!isNaN(limitNum) && limitNum > 0) {
    tickets = tickets.slice(0, limitNum);
  }
}
res.json(tickets);
```

## How to Test

1. Create 15 tickets via POST /tickets
2. Call `GET /tickets?limit=5`
3. Expected: Response contains 5 tickets
4. Actual: Response contains all 15 tickets ❌

## Related

- Should also implement `offset` parameter for proper pagination
- Consider adding response wrapper with metadata: `{ tickets: [...], total: N, limit: 5, offset: 0 }`
