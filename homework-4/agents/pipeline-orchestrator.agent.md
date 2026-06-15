---
model: "gpt-4-turbo"
fallback:
  - "claude-sonnet-4"
  - "gemini-2.5-pro"
---

# Pipeline Orchestrator Agent

**Purpose**: Orchestrate the complete bug research, verification, planning, fixing, and security review pipeline in correct sequence.

**Scope**: Runs the following agents in strict order:

1. Bug Researcher → analyzes codebase
2. Research Verifier → validates findings
3. Bug Planner → creates fix plans
4. Bug Fixer → implements fixes with tests
5. Unit Test Generator → generates FIRST-compliant tests
6. Security Verifier → reviews for vulnerabilities

## Usage

Invoke this agent to run the complete pipeline:

```
@Pipeline Orchestrator Run the complete bug fix pipeline
```

The agent will:

- Execute Bug Researcher and wait for output
- Pass research output to Research Verifier
- Pass verified bugs to Bug Planner
- Pass plans to Bug Fixer
- **In parallel** (after Bug Fixer):
  - Pass fixed code to Unit Test Generator
  - Pass fixed code to Security Verifier
- Produce final pipeline report with all stages

## Pipeline Workflow

```
User Request
    ↓
Bug Researcher (discover bugs)
    ↓
Research Verifier (validate research)
    ↓
Bug Planner (create plans)
    ↓
Bug Fixer (implement + test)
    ↓
    ├─→ Unit Test Generator (generate tests) ──┐
    │                                          ├─→ Final Report
    └─→ Security Verifier (security review) ──┘
```

**Note:** Unit Test Generator and Security Verifier run in parallel after Bug Fixer completes.

## Output

Produces comprehensive pipeline report including:

- Research findings with quality scores
- Verification status
- Implementation plans per bug
- Fix summaries with test results
- Test coverage reports
- Security vulnerability assessment
