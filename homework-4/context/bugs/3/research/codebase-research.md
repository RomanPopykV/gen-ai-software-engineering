# Codebase Research — Bug #3

## Metadata

- **Folder**: `context/bugs/3/`
- **Matched to**: Bug #3 — Unimplemented Limit Parameter Silently Ignored
- **Researcher stage**: Stage 1 (Bug Researcher)
- **Date**: 2026-06-16
- **Source files read**: `src/routes/tickets.ts`

---

## Issue: `limit` Query Parameter Is Destructured But Never Applied

### Category

Unimplemented Feature / Silent Failure

### Severity

Low–Medium

### File & Location

`src/routes/tickets.ts` — `GET /` handler

```typescript
router.get("/", (req: Request, res: Response): void => {
  const { category, priority, status, customer_id, assigned_to, limit } =
    req.query;
  const filters: FilterOptions = {};
  if (category) filters.category = category as Category;
  if (priority) filters.priority = priority as Priority;
  if (status) filters.status = status as Status;
  if (customer_id) filters.customer_id = customer_id as string;
  if (assigned_to) filters.assigned_to = assigned_to as string;
  let tickets = getAllTickets(
    Object.keys(filters).length > 0 ? filters : undefined,
  );
  res.json(tickets); // ❌ limit is never applied to `tickets`
});
```

### Root Cause

`limit` is extracted from `req.query` but never used. The full result set is always returned regardless of the `limit` value. This is dead code from an incomplete feature implementation.

### Impact

- Clients passing `?limit=10` receive the full dataset — unexpected, breaking behavior
- No pagination is possible; large datasets are always returned in full
- API surface implies a feature that does not exist, violating the principle of least surprise

### Expected Fix

Apply `limit` after fetching:

```typescript
if (limit) tickets = tickets.slice(0, parseInt(limit as string, 10));
```

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
