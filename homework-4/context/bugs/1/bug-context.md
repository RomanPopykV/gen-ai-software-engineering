# Bug #1: Confidence Score Can Exceed 1.0

## Location

File: `src/services/classifier.ts` (lines 100-107)

## Severity

Medium - Logic error in classification confidence calculation

## Description

The `classifyTicket()` function calculates a confidence score that can exceed 1.0 (100%) or produce invalid values due to incorrect calculation order.

## Root Cause

The confidence calculation was modified to increase multipliers (0.25 for keywords, 0.1 for priority), but the final capping logic changed from `Math.min(confidence, 0.95)` to missing the cap entirely. When multiple keywords are matched:

- Base: 0.5
- Category keywords (4 keywords × 0.25): +1.0
- Priority keywords (present): +0.1
- **Total: 1.6** ❌

This violates the semantic meaning of "confidence" which should be between 0.0 and 1.0.

## Current Buggy Code

```typescript
let confidence = 0.5 + categoryKeywordsFound.length * 0.25;
if (priorityKeywordsFound.length > 0) confidence += 0.1;
if (matchedCategory === Category.Other) {
  confidence = Math.min(confidence, 0.55);
  confidence = Math.max(confidence, 0.4);
}
// Missing: Math.min(confidence, 1.0) should be applied here
confidence = Math.round(confidence * 100) / 100;
```

## Impact

- Tickets with high keyword matches get confidence scores > 1.0
- Inconsistent with probability semantics (0.0–1.0 range)
- May cause issues in downstream systems expecting valid probabilities
- Unit tests comparing confidence values will fail

## Expected Fix

Add `confidence = Math.min(confidence, 1.0);` before the rounding step, or adjust multipliers to prevent exceeding 1.0.

## How to Test

1. Create a ticket with subject and description containing 4+ category keywords AND a priority keyword
2. Call `classifyTicket()` and check the returned confidence value
3. Expected: confidence ≤ 1.0
4. Actual: confidence can be > 1.0
