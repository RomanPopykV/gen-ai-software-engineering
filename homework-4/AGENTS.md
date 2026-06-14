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
---

## Custom Agents for homework-4

This file registers custom agents for the Customer Support Ticket System project.

### Agents

**Bug Researcher** — Performs full codebase bug and security research, maps findings to bug folders, and writes structured research reports.

**Research Verifier** — Validates bug research claims against source code and produces verification quality output.

**Bug Planner** — Uses verification status and quality matrix rules to auto-pick bugs and write implementation plans.

**Bug Fixer** — Executes approved implementation plans, runs tests after each change step, and documents outcomes in fix summaries.

## Usage

When working on this project, you can invoke these custom agents:

- Use the **Bug Researcher** agent to analyze src/, correlate findings with context/bugs folders, and generate research reports
- Use the **Research Verifier** agent to validate research claims and produce verified-research outputs
- Use the **Bug Planner** agent to auto-pick bugs and generate implementation plans
- Use the **Bug Fixer** agent to apply implementation plans, run tests after each change, and write fix-summary outputs
