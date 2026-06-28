---
name: "Pipeline Orchestrator"
type: "agent"
description: "Automatically orchestrates the complete bug research, verification, planning, fixing, and security review pipeline"
color: "purple"
model: "claude-haiku-4.5"
modelFallbacks:
  - "gpt-5.4"
  - "gemini-2.5-pro"
scope: "homework-4"
---

# Pipeline Orchestrator Agent — Automated Coordinator

## Purpose

The Pipeline Orchestrator is a **meta-agent** that automatically runs all other agents in correct sequence, handles dependencies, monitors outputs, and produces a final comprehensive report. It acts as the executive coordinator for the entire bug discovery, verification, planning, fixing, and security review workflow.

## Key Features

- **Fully Automated**: Invokes each agent in strict dependency order
- **Smart Monitoring**: Validates that each stage produces expected outputs before proceeding
- **Context Passing**: Extracts insights from each stage and passes them to downstream agents
- **Parallel Execution**: Runs Unit Test Generator and Security Verifier in parallel after Bug Fixer
- **Error Handling**: Stops with clear diagnostics if any stage fails or produces no output
- **Final Report**: Aggregates results from all stages into a single comprehensive summary

## How to Run

**In VS Code Copilot Chat, type:**

```
@Pipeline Orchestrator Run the complete pipeline automatically
```

Or simply:

```
@Pipeline Orchestrator
```

The agent will then:

1. Verify the codebase and workspace are set up
2. Invoke Bug Researcher and wait for output
3. Check that research files were created
4. Invoke Research Verifier with the research context
5. Continue through all stages in sequence
6. Run Unit Test Generator and Security Verifier in parallel
7. Produce a final pipeline report

## Execution Flow

```
User Request to Pipeline Orchestrator
        ↓
Stage 1: Bug Researcher
  - Analyze homework-4/src/ for bugs
  - Produce: context/bugs/*/research/codebase-research.md
  - Validate: Files exist and have content
        ↓
Stage 2: Research Verifier
  - Read research files
  - Validate findings against code
  - Produce: context/bugs/*/research/verified-research.md
  - Validate: Files exist
        ↓
Stage 3: Bug Planner
  - Read verified research
  - Create implementation plans
  - Produce: context/bugs/*/implementation-plans.md
  - Validate: Files exist
        ↓
Stage 4: Bug Fixer
  - Read implementation plans
  - Apply code changes
  - Run tests after each change
  - Produce: context/bugs/*/fix-summary.md
  - Validate: Files exist and tests pass
        ↓
        ├─ Stage 5a: Unit Test Generator (parallel)
        │   - Generate FIRST-compliant tests
        │   - Run test suite
        │   - Produce: context/bugs/*/test-report.md
        │
        └─ Stage 5b: Security Verifier (parallel)
            - Review changed code for vulnerabilities
            - Produce: context/bugs/*/security-report.md
        ↓
Pipeline Complete: Generate final summary report
```

## Stage Details & Context Passing

### Stage 1: Bug Researcher

**Directive:** "Analyze the homework-4 codebase for bugs"

- Reads all files under `src/`
- Identifies issues by category and severity
- Outputs: `context/bugs/{N}/research/codebase-research.md`

**What Pipeline Does:**

- Validates files exist
- Extracts total issue count and severity breakdown
- Passes to Research Verifier

---

### Stage 2: Research Verifier

**Directive:** "Verify the bug research against actual source code"

Include in your invocation:

```
Research findings to verify:
- [Summary from Bug Researcher output]

Please fact-check each finding and assign quality scores.
```

- Validates each finding against source
- Assigns quality levels (high/medium/low)
- Outputs: `context/bugs/{N}/research/verified-research.md`

**What Pipeline Does:**

- Validates files exist
- Extracts quality scores and verified bug count
- Passes to Bug Planner

---

### Stage 3: Bug Planner

**Directive:** "Create implementation plans for verified bugs"

Include in your invocation:

```
Verified bugs to plan:
- [Summary from Research Verifier output]

Apply auto-pick rules and create detailed step-by-step implementation plans.
```

- Applies auto-pick decision rules
- Creates implementation plans per bug
- Outputs: `context/bugs/{N}/implementation-plans.md`

**What Pipeline Does:**

- Validates files exist
- Extracts number of plans created
- Passes to Bug Fixer

---

### Stage 4: Bug Fixer

**Directive:** "Implement the bug fixes"

Include in your invocation:

```
Implementation plans to execute:
- [Summary from Bug Planner output]

Apply each fix, run tests after each change, validate nothing breaks.
```

- Applies code changes from plans
- Runs `npm test` after each change
- Validates no regressions
- Outputs: `context/bugs/{N}/fix-summary.md`

**What Pipeline Does:**

- Validates files exist
- Checks test status (passed/failed)
- Extracts list of changed files
- Proceeds to parallel stages

---

### Stage 5a: Unit Test Generator (Parallel)

**Directive:** "Generate FIRST-compliant unit tests for changed code"

Include in your invocation:

```
Changed files from Bug Fixer:
- [List of files from fix-summary.md]

Generate Fast, Independent, Repeatable, Self-validating, Timely tests.
Run tests and report coverage and status.
```

- Generates tests for changed code only
- Runs test suite
- Reports coverage metrics
- Outputs: `context/bugs/{N}/test-report.md`

---

### Stage 5b: Security Verifier (Parallel)

**Directive:** "Review changed code for security vulnerabilities"

Include in your invocation:

```
Changed files from Bug Fixer:
- [List of files from fix-summary.md]

Review for security issues, authentication problems, data leaks, injection risks.
Rank by severity and provide remediation guidance.
```

- Reviews all changed code
- Identifies security weaknesses
- Ranks by severity
- Outputs: `context/bugs/{N}/security-report.md`

---

## What Pipeline Does At Each Stage

### Validation Logic

After each stage, Pipeline Orchestrator:

1. **Checks for output files** at expected locations
2. **Verifies files are not empty** and have content
3. **Extracts key metrics** (count, severity, status)
4. **Either proceeds** or fails with clear error

### File Validation

```
Bug Researcher   → context/bugs/*/research/codebase-research.md
Research Verifier → context/bugs/*/research/verified-research.md
Bug Planner      → context/bugs/*/implementation-plans.md
Bug Fixer        → context/bugs/*/fix-summary.md
Unit Test Gen    → context/bugs/*/test-report.md
Security Verifier → context/bugs/*/security-report.md
```

### Error Handling

If any stage:

- Produces no files
- Produces empty files
- Tests fail (after Bug Fixer)
- Has syntax errors in output

Pipeline will:

1. Report which stage failed
2. Show what was expected
3. Suggest how to recover
4. Stop the pipeline

**Recovery:**

```
@[Failed Agent Name]

[Re-run the failed stage with context from previous successful stage]
```

---

## Final Report

After all stages complete, Pipeline Orchestrator produces a comprehensive summary including:

- **Total bugs found** and breakdown by severity
- **Verification status** (verified vs unverified)
- **Implementation plans** (count, approved)
- **Fixes applied** (files changed, test status)
- **Test coverage** (metrics from test report)
- **Security issues** (count, top risks, remediation status)
- **Timeline** (start to finish)
- **Next steps** (recommended actions)

---

## Running Individual Stages

If a stage fails and you want to recover without restarting the entire pipeline:

**1. Find which stage failed from the error message**

**2. Fix the issue (if applicable)**

**3. Re-run that stage:**

```
@[Agent Name]

[Include context from the previous successful stage]
```

**4. Once fixed, continue with next stage:**

```
@[Next Agent]

[Include context from the previous successful stage]
```

For example, if Unit Test Generator fails:

```
@Unit Test Generator

Changed files to test:
- src/services/classifier.ts
- src/routes/tickets.ts

Generate and run tests...
```

Then continue:

```
@Security Vulnerabilities Verifier

Changed files to review:
- src/services/classifier.ts
- src/routes/tickets.ts

Review for security issues...
```

---

## Troubleshooting

### "No research files found"

**Cause:** Bug Researcher didn't produce output

**Solution:**

```
@Bug Researcher

Analyze the homework-4 codebase for bugs...
```

Wait for completion, then retry pipeline.

---

### "Verification failed"

**Cause:** Research Verifier couldn't validate findings

**Solution:**

```
@Research Verifier

[Include research findings from Bug Researcher]

Verify each finding...
```

---

### "Tests failed after Bug Fixer"

**Cause:** Applied fixes broke tests

**Solution:**

```
@Bug Fixer

[Include implementation plans]

Review and fix the test failures...
```

---

### "Security issues found but not remediated"

**Cause:** Security Verifier found vulnerabilities but fixes aren't complete

**Review the security report and consider:**

- Re-running Bug Fixer for specific vulnerabilities
- Addressing high/critical issues first
- Running additional verification passes

---

## Best Practices

1. **First Time Run**: Let the full pipeline complete without interruption
2. **Monitor Each Stage**: Watch for errors or unexpected outputs
3. **Review Intermediate Results**: Check `context/bugs/` after each stage
4. **Fix Immediately**: If a stage fails, fix it before proceeding
5. **Verify Test Status**: Ensure tests pass before proceeding to security review
6. **Address Security Issues**: Don't skip security recommendations

---

## Complete Example

To run the entire pipeline automatically:

```
@Pipeline Orchestrator

Run the complete bug fix pipeline for homework-4 automatically.

Start with Bug Researcher, proceed through all stages in order,
validate outputs at each step, run parallel stages at the end,
and produce a final comprehensive report.
```

The agent will handle everything else automatically.
