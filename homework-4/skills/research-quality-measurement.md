# Research Quality Measurement Skill

## Purpose

This skill defines a measurable rubric for evaluating the quality and reliability of bug research reports.

## Evaluation Dimensions

Evaluate each report across these dimensions:

- File and line reference accuracy
- Verbatim snippet accuracy
- Issue description correctness
- Root cause analysis adequacy
- Evidence completeness and traceability
- Usefulness for downstream Bug Planner decisions

## Scoring Method

Use claim-based scoring:

1. Count total claims checked.
2. Mark each as `verified` or `discrepant`.
3. Compute verification rate: verified / total.
4. Apply quality level criteria below.

## Quality Levels

### Excellent

- Meaning: Highly reliable research with strong traceability and minimal correction needed.
- Measurable criteria:
  - File:line accuracy >= 95%
  - Snippet exact-match rate >= 95%
  - No major discrepancies (no wrong file, no materially wrong snippet)
  - Root cause and impact are supported by evidence for nearly all issues
  - Evidence completeness >= 95%
- Assign when: The report can be used directly by Bug Planner with negligible risk.

### Good

- Meaning: Mostly reliable research with minor issues that do not block planning.
- Measurable criteria:
  - File:line accuracy >= 85%
  - Snippet exact-match rate >= 80%
  - At most one major discrepancy
  - Root cause and impact are mostly supported
  - Evidence completeness >= 80%
- Assign when: Bug Planner can proceed, but should account for noted minor corrections.

### Weak

- Meaning: Partially reliable research; notable corrections required before planning.
- Measurable criteria:
  - File:line accuracy >= 60%
  - Snippet exact-match rate >= 50%
  - Multiple discrepancies, including at least one major discrepancy, or frequent unsupported conclusions
  - Evidence completeness >= 60%
- Assign when: Bug Planner should only use verified portions and ignore discrepant parts.

### Invalid

- Meaning: Unreliable research not suitable for planning.
- Measurable criteria:
  - File:line accuracy < 60% or snippet exact-match rate < 50%
  - Multiple major discrepancies (wrong files/lines/snippets) across issues
  - Claims are largely unsupported or stale
  - Evidence completeness < 60%
- Assign when: Report must be re-researched before Bug Planner usage.

## Discrepancy Severity

Classify each discrepancy as:

- Critical: Breaks trust in issue validity (wrong file, fabricated snippet, false claim of exploitability)
- Major: Material mismatch affecting diagnosis (wrong lines, non-verbatim snippet, unsupported root cause)
- Minor: Small inconsistency that does not change core issue validity

## Verifier Decision Rules

- Always preserve verified claims even if report quality is weak.
- Never paraphrase when checking snippet accuracy; compare against source verbatim.
- Mark unverifiable historical/process statements (for example, "never removed before commit") as unsupported unless evidence exists in inspected artifacts.
- If mixed quality, isolate valid findings and clearly list discrepancies for downstream planning.
