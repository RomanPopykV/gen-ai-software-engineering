# Codebase Research — Bug #1

## Metadata

- **Folder**: `context/bugs/1/`
- **Matched to**: Bug #1 — Confidence Score Can Exceed 1.0
- **Researcher stage**: Stage 1 (Bug Researcher)
- **Date**: 2026-06-16
- **Source files read**: `src/services/classifier.ts`

---

## Issue: Confidence Score Not Capped at 1.0

### Category

Logic Error / Calculation Bug

### Severity

Medium

### File & Location

`src/services/classifier.ts` — `classifyTicket()` function

```typescript
// Lines ~109–115
let confidence = 0.5 + categoryKeywordsFound.length * 0.25;
if (priorityKeywordsFound.length > 0) confidence += 0.1;
if (matchedCategory === Category.Other) {
  confidence = Math.min(confidence, 0.55);
  confidence = Math.max(confidence, 0.4);
}
confidence = Math.round(confidence * 100) / 100;
```

### Root Cause

The `Other` branch caps confidence at `0.55`, but when `matchedCategory !== Category.Other`, no upper cap is applied. A ticket with 3 category keywords matched yields:

```
0.5 + 3 × 0.25 = 1.25  (no cap)
+ 0.1 priority boost = 1.35
→ confidence = 1.35  ❌ exceeds [0.0, 1.0]
```

### Impact

- `ClassificationResult.confidence` exceeds the `[0.0, 1.0]` semantic range
- Downstream consumers treating confidence as a probability receive invalid data
- Unit tests asserting `confidence <= 1.0` will fail

### Expected Fix

Insert `confidence = Math.min(confidence, 1.0);` before the rounding step.

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
