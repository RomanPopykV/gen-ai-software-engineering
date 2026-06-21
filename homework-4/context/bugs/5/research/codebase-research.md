# Codebase Research — Bug #5

## Metadata

- **Folder**: `context/bugs/5/`
- **Matched to**: New discovery (no existing bug-context.md)
- **Researcher stage**: Stage 1 (Bug Researcher)
- **Date**: 2026-06-16
- **Source files read**: `src/routes/tickets.ts`

---

## Issue: Filter Query Parameters Cast to Enum Types Without Runtime Validation

### Category

Type Safety / Silent Filter Failure

### Severity

Medium

### File & Location

`src/routes/tickets.ts` — `GET /` handler

```typescript
const { category, priority, status, customer_id, assigned_to, limit } =
  req.query;
const filters: FilterOptions = {};
if (category) filters.category = category as Category; // ❌
if (priority) filters.priority = priority as Priority; // ❌
if (status) filters.status = status as Status; // ❌
```

### Root Cause

TypeScript's `as` type assertion is a compile-time-only cast. At runtime, `category as Category` is just `category` — a raw string. If a caller sends `?category=invalid_value`, the filter is set to the string `'invalid_value'`, which will never match any ticket. The endpoint silently returns an empty array instead of returning `400 Bad Request`.

No validation is performed to ensure the string is a member of the `Category`, `Priority`, or `Status` enums before it is passed to `getAllTickets()`.

### Verbatim Snippet (actual source)

```typescript
if (category) filters.category = category as Category;
if (priority) filters.priority = priority as Priority;
if (status) filters.status = status as Status;
```

### Impact

- Silent failure: clients that typo a filter value (`?status=Resolved` vs `?status=resolved`) receive empty results with no error feedback
- API contract is violated — the endpoint accepts invalid values without rejecting them
- Debugging is difficult because the server returns 200 with an empty array

### Expected Fix

Validate enum membership before applying the filter:

```typescript
const validCategories = Object.values(Category) as string[];
if (category) {
  if (!validCategories.includes(category as string)) {
    res.status(400).json({ error: `Invalid category: ${category}` });
    return;
  }
  filters.category = category as Category;
}
```

Or use a shared validation helper for all three filters.

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
