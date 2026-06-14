---
agents:
  - name: "Bug Researcher"
    description: "Analyzes TypeScript/Node.js codebase and produces structured research reports"
    path: "agents/bug-researcher.agent.md"
  - name: "Research Verifier"
    description: "Fact-checks bug research and assigns quality for downstream planning"
    path: "agents/research-verifier.agent.md"
  - name: "Bug Planner"
    description: "Applies auto-pick rules and generates implementation plans per bug"
    path: "agents/bug-planner.agent.md"
  - name: "Bug Fixer"
    description: "Executes implementation plans, runs tests after each change, and writes fix summaries"
    path: "agents/bug-fixer.agent.md"
  - name: "Unit Test Generator"
    description: "Generates and runs FIRST-compliant unit tests for changed code and writes test reports"
    path: "agents/unit-test-generator.agent.md"
  - name: "Security Vulnerabilities Verifier"
    description: "Reviews changed code for security risks and writes severity-ranked security reports"
    path: "agents/security-verifier.agent.md"
skills:
  - name: "Research Quality Measurement"
    description: "Defines measurable quality levels and discrepancy severity for bug research verification"
    path: "skills/research-quality-measurement.md"
  - name: "Unit Tests FIRST"
    description: "Defines FIRST principles (Fast, Independent, Repeatable, Self-validating, Timely) for test design"
    path: "skills/unit-tests-FIRST.md"
---

## Custom Agents for homework-4

This file registers custom agents for the Customer Support Ticket System project.

### Agents

**Bug Researcher** — Performs full codebase bug and security research, maps findings to bug folders, and writes structured research reports.

**Research Verifier** — Validates bug research claims against source code and produces verification quality output.

**Bug Planner** — Uses verification status and quality matrix rules to auto-pick bugs and write implementation plans.

**Bug Fixer** — Executes approved implementation plans, runs tests after each change step, and documents outcomes in fix summaries.

**Unit Test Generator** — Generates and runs tests for changed code only using FIRST principles, then writes test-report outputs.

**Security Vulnerabilities Verifier** — Reviews modified code for security weaknesses and outputs severity-ranked security reports with remediation guidance.

### Skills

**Research Quality Measurement** — Rubric and scoring guidance used by Research Verifier to assign report quality levels and classify discrepancies.

**Unit Tests FIRST** — Practical FIRST checklist used by Unit Test Generator to design and assess changed-code tests.

## Usage

When working on this project, you can invoke these custom agents:

- Use the **Bug Researcher** agent to analyze src/, correlate findings with context/bugs folders, and generate research reports
- Use the **Research Verifier** agent to validate research claims and produce verified-research outputs
- Use the **Bug Planner** agent to auto-pick bugs and generate implementation plans
- Use the **Bug Fixer** agent to apply implementation plans, run tests after each change, and write fix-summary outputs
- Use the **Unit Test Generator** agent to generate/run FIRST-compliant tests for changed code and write test-report outputs
- Use the **Security Vulnerabilities Verifier** agent to review changed files for vulnerabilities and produce security-report outputs

Available skills in this project:

- `skills/research-quality-measurement.md` (primarily used by **Research Verifier**)
- `skills/unit-tests-FIRST.md` (primarily used by **Unit Test Generator**)
