# Verified Research — Bug #1

## Verification Summary

- **Overall**: PASS
- **Research Quality**: EXCELLENT
- **Total claims checked**: 4
- **Verified claims**: 4
- **Discrepancies**: 0
- **Explanation**: All file references, line content, and root cause analysis verified directly against `src/services/classifier.ts`. The confidence overflow bug is real and reproducible by inspection.

---

## Verified Claims

### Claim 1 — File reference and function location

- **Claim**: Issue exists in `src/services/classifier.ts` inside `classifyTicket()`
- **Status**: ✅ VERIFIED
- **Evidence**: File exists. `classifyTicket` is exported at the correct location. Function signature: `export function classifyTicket(ticket: Ticket): ClassificationResult`

### Claim 2 — Verbatim code snippet

- **Claim**: Confidence is calculated as `0.5 + categoryKeywordsFound.length * 0.25`
- **Status**: ✅ VERIFIED
- **Evidence** (exact source match):
  ```typescript
  let confidence = 0.5 + categoryKeywordsFound.length * 0.25;
  if (priorityKeywordsFound.length > 0) confidence += 0.1;
  if (matchedCategory === Category.Other) {
    confidence = Math.min(confidence, 0.55);
    confidence = Math.max(confidence, 0.4);
  }
  confidence = Math.round(confidence * 100) / 100;
  ```

### Claim 3 — Root cause: no upper cap outside `Category.Other` branch

- **Claim**: When `matchedCategory !== Category.Other`, confidence is not capped at 1.0
- **Status**: ✅ VERIFIED
- **Evidence**: Inspected control flow. The `Math.min(confidence, 0.55)` guard is inside `if (matchedCategory === Category.Other)`. No corresponding `Math.min(confidence, 1.0)` exists outside that branch. With 3+ keywords matched, `0.5 + 3 × 0.25 = 1.25` — confirmed overflow.

### Claim 4 — Impact: downstream consumers receive values > 1.0

- **Claim**: `ClassificationResult.confidence` can exceed 1.0
- **Status**: ✅ VERIFIED
- **Evidence**: `ClassificationResult` interface in `src/models/ticket.ts` declares `confidence: number` with no range constraint. No clamping exists downstream in `logDecision` or in any route handler.

---

## Discrepancies Found

None.

---

## Research Quality Assessment

- **File:line accuracy**: 100% — correct file, correct function
- **Snippet exact-match rate**: 100% — verbatim match confirmed
- **Major discrepancies**: 0
- **Root cause support**: Strong — arithmetic demonstrated by inspection
- **Evidence completeness**: 100%
- **Quality level**: EXCELLENT (≥95% across all dimensions)

---

## References

- `src/services/classifier.ts` — `classifyTicket()` function
- `src/models/ticket.ts` — `ClassificationResult` interface
