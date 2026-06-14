# Unit Tests FIRST Skill

## Purpose

This skill defines how to design and evaluate unit tests using FIRST:

- **F**ast
- **I**ndependent
- **R**epeatable
- **S**elf-validating
- **T**imely

## FIRST Criteria

### Fast

- Tests should run quickly with minimal setup.
- Use small in-memory fixtures and avoid heavy I/O.
- Prefer direct service calls or focused API calls over large end-to-end flows.

Measurable checks:

- New tests complete within the normal local Jest run budget.
- No unnecessary loops, sleeps, or oversized fixtures.

### Independent

- Each test must be runnable in any order.
- Reset shared state before each test (`clearStore()` when ticket store is involved).
- Do not rely on side effects from other tests.

Measurable checks:

- Every test sets up its own prerequisites.
- Shared in-memory stores are reset in `beforeEach`.

### Repeatable

- Results must be deterministic across runs and environments.
- Avoid timing-sensitive assertions and random-dependent outcomes.
- Use stable inputs and explicit expected values.

Measurable checks:

- Test assertions do not depend on wall-clock timing.
- No flaky assertions against unstable ordering unless ordering is part of behavior.

### Self-validating

- Tests must automatically evaluate pass/fail via assertions.
- Assertions should be specific and behavior-focused.
- Avoid manual inspection steps in unit tests.

Measurable checks:

- Every scenario has explicit `expect(...)` assertions.
- Assertions validate changed behavior directly.

### Timely

- Tests should be added for code changes as part of the same change cycle.
- Cover bug fixes and behavior deltas immediately.
- Keep tests scoped to changed code only.

Measurable checks:

- Each changed file/function has corresponding test coverage updates.
- No unrelated test expansions outside the changed scope.

## Application Checklist

Before finalizing generated tests, confirm:

- [ ] Fast: tests use minimal fixtures and execute quickly
- [ ] Independent: no cross-test coupling
- [ ] Repeatable: deterministic outcomes
- [ ] Self-validating: explicit, automated assertions
- [ ] Timely: tests target changed code paths only

## Reporting Requirement

When writing `test-report.md`, include a short FIRST assessment and any observed tradeoffs.
