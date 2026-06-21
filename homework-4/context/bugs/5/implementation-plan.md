# Implementation Plan — Bug #5: Filter Parameters Cast Without Enum Validation

## Decision Summary

- **Auto-pick**: YES
- **Rule applied**: PASS × EXCELLENT → AUTO: YES
- **Confidence**: High — fix adds runtime enum membership checks before casting

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
**Change type**: Add enum validation before each filter cast; return 400 on invalid value

---

## Step-by-Step Implementation

### Step 1 — Add enum validation for category, priority, status filters

**File**: `src/routes/tickets.ts`

Locate:

```typescript
const filters: FilterOptions = {};
if (category) filters.category = category as Category;
if (priority) filters.priority = priority as Priority;
if (status) filters.status = status as Status;
if (customer_id) filters.customer_id = customer_id as string;
if (assigned_to) filters.assigned_to = assigned_to as string;
```

Change to:

```typescript
const filters: FilterOptions = {};
if (category) {
  if (!(Object.values(Category) as string[]).includes(category as string)) {
    res
      .status(400)
      .json({
        error: `Invalid category: ${category}`,
        details: [],
        requestId: (req as any).requestId,
      });
    return;
  }
  filters.category = category as Category;
}
if (priority) {
  if (!(Object.values(Priority) as string[]).includes(priority as string)) {
    res
      .status(400)
      .json({
        error: `Invalid priority: ${priority}`,
        details: [],
        requestId: (req as any).requestId,
      });
    return;
  }
  filters.priority = priority as Category;
}
if (status) {
  if (!(Object.values(Status) as string[]).includes(status as string)) {
    res
      .status(400)
      .json({
        error: `Invalid status: ${status}`,
        details: [],
        requestId: (req as any).requestId,
      });
    return;
  }
  filters.status = status as Status;
}
if (customer_id) filters.customer_id = customer_id as string;
if (assigned_to) filters.assigned_to = assigned_to as string;
```

### Step 2 — Run tests

```
npm test
```

Expected: all existing tests pass.

---

## Validation Approach

- Run `npm test` after the change.
- Confirm `GET /tickets?category=invalid` returns 400.
- Confirm valid enum values still filter correctly.

---

## Exit Criteria

- Invalid `category`, `priority`, or `status` query params return `400`
- Valid enum values continue to work as before
- `npm test` passes with no failures
