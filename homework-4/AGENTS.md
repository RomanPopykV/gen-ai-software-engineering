---
agents:
  - name: "Pipeline Orchestrator"
    description: "Runs the complete bug research, verification, planning, fixing, and security review pipeline in sequence"
    path: "agents/pipeline-orchestrator.agent.md"
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

**Pipeline Orchestrator** — **AUTOMATED COORDINATOR** (recommended entry point). Automatically orchestrates the complete agent pipeline: Bug Researcher → Research Verifier → Bug Planner → Bug Fixer → {Unit Test Generator + Security Verifier in parallel}. Handles all dependencies, monitors outputs, and produces a final comprehensive report. Invoke once in VS Code Copilot Chat and it runs all stages automatically.

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

### ⚡ AUTOMATED: Running the Complete Pipeline

The easiest and most reliable way to run **all agents automatically** is to invoke the **Pipeline Orchestrator** in VS Code Copilot Chat:

```
@Pipeline Orchestrator
```

Or with more detail:

```
@Pipeline Orchestrator Run the complete pipeline automatically
```

The agent will then:

- Automatically invoke Bug Researcher and wait for output
- Validate research files exist, then proceed to Research Verifier
- Continue through all stages in dependency order
- Run Unit Test Generator and Security Verifier in parallel
- Produce a final comprehensive pipeline report

**Advantages:**

- Fully automated (no manual step-by-step)
- Handles all dependencies automatically
- Monitors outputs and validates progress
- Runs in a single VS Code chat session
- Provides clear error messages if anything fails

---

### Manual Alternatives: Running the Pipeline Locally

If you prefer to manually run stages from the terminal:

**Option 1: npm scripts (guided workflow)**

```bash
npm run pipeline              # Guided pipeline with prompts
npm run pipeline:researcher   # Run single stage
npm run pipeline:verifier
npm run pipeline:planner
npm run pipeline:fixer
npm run pipeline:test-gen
npm run pipeline:security
```

**Option 2: PowerShell (Windows)**

```powershell
.\pipeline.ps1                  # Guided pipeline
.\pipeline.ps1 -Stage researcher # Single stage
.\pipeline.ps1 -List            # Show all stages
```

**Option 3: Bash (Unix/Linux)**

```bash
./pipeline.sh                     # Guided pipeline
./pipeline.sh --stage researcher # Single stage
./pipeline.sh --list             # Show all stages
```

**Note:** These options provide a guided workflow where you manually run each agent in VS Code, then return to the terminal to resume. For fully automatic execution, use **@Pipeline Orchestrator** instead.

### Running Individual Agents

When working on this project, you can also invoke individual agents directly:

- Use the **Bug Researcher** agent to analyze src/, correlate findings with context/bugs folders, and generate research reports
- Use the **Research Verifier** agent to validate research claims and produce verified-research outputs
- Use the **Bug Planner** agent to auto-pick bugs and generate implementation plans
- Use the **Bug Fixer** agent to apply implementation plans, run tests after each change, and write fix-summary outputs
- Use the **Unit Test Generator** agent to generate/run FIRST-compliant tests for changed code and write test-report outputs
- Use the **Security Vulnerabilities Verifier** agent to review changed files for vulnerabilities and produce security-report outputs

### Pipeline Output

All pipeline outputs are stored in `context/bugs/`:

- `research.md` — Bug research findings
- `verified-research.md` — Verified and quality-assessed research
- `implementation-plans.md` — Detailed fix plans
- `fix-summary.md` — Summary of implemented fixes
- `test-report.md` — Test generation and validation report
- `security-report.md` — Security vulnerability assessment

See [PIPELINE.md](PIPELINE.md) for detailed pipeline documentation.

Available skills in this project:

- `skills/research-quality-measurement.md` (primarily used by **Research Verifier**)
- `skills/unit-tests-FIRST.md` (primarily used by **Unit Test Generator**)
