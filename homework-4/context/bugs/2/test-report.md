# Test Report — Bug #2: Incorrect Failed Count in Import Response

## 0. Coverage Decision

Coverage required

Rationale: The fix changes failed-count semantics to derive from importErrors length directly, so tests should assert this contract explicitly.

## 1. Test Files Generated/Updated

- File path: tests/test_import_json.ts
- Changed test cases:
  - Updated: JSON with one invalid record reports error for that record only
  - Added assertion: result.failed equals result.errors.length
- Mapped changed source file(s): src/services/import-service.ts (importTickets)
- Why this file was selected: Existing import-service behavior for JSON is already covered here; this is the most direct existing test location.

## 2. FIRST Compliance

- Fast: Small in-memory JSON payload with two records.
- Independent: Store reset in beforeEach.
- Repeatable: Deterministic payload and expected counts.
- Self-validating: Explicit count assertions, including failed-to-errors-length contract.
- Timely: Assertion is scoped to the changed failed-count behavior.
- Tradeoffs/residual risk: JSON path validated here; CSV/XML paths are not re-expanded for this specific contract in this change.

## 3. Test Execution Results

- Command executed: npm test -- tests/test_categorization.ts tests/test_import_json.ts tests/test_ticket_api.ts
- Status: PASS
- Key summary:
  - Test Suites: 3 passed, 3 total
  - Tests: 45 passed, 45 total
  - Runtime: 4.734 s
  - Included evidence: tests/test_import_json.ts passed with updated assertion.

## 4. References

- context/bugs/2/fix-summary.md
- src/services/import-service.ts
- skills/unit-tests-FIRST.md
- tests/test_import_json.ts
