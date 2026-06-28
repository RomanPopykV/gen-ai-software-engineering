# Agent Pipeline Orchestration

## Overview

The agent pipeline provides an automated workflow for discovering, verifying, planning, fixing, and testing bugs in the Customer Support Ticket System. The first 4 agents run sequentially, while the Unit Test Generator and Security Verifier run in parallel after Bug Fixer completes.

```
Bug Researcher
    ↓
Research Verifier
    ↓
Bug Planner
    ↓
Bug Fixer
    ↓
    ├─ Unit Test Generator (parallel)
    └─ Security Verifier (parallel)
```

---

## Quick Start

### Option 1: VS Code Copilot Chat (Recommended)

Open VS Code and invoke the Pipeline Orchestrator agent in Copilot Chat:

```
@Pipeline Orchestrator Run the complete bug fix pipeline
```

The orchestrator will:

1. Invoke Bug Researcher through Bug Fixer sequentially
2. Monitor outputs and dependencies
3. Pass context between stages
4. Launch Unit Test Generator and Security Verifier in parallel after Bug Fixer
5. Wait for both parallel stages to complete
6. Provide real-time status updates
7. Generate final pipeline report

**Advantages:**

- Most integrated experience
- Full context awareness
- Interactive feedback
- Real-time debugging

---

### Option 2: npm Scripts

Run from the terminal:

```bash
# Run entire pipeline
npm run pipeline

# Run individual stages
npm run pipeline:researcher
npm run pipeline:verifier
npm run pipeline:planner
npm run pipeline:fixer
npm run pipeline:test-gen
npm run pipeline:security
```

**Advantages:**

- Simple one-command execution
- Easy integration with CI/CD
- Cross-platform compatible
- Scriptable

---

### Option 3: PowerShell (Windows)

```powershell
# Run entire pipeline
.\pipeline.ps1

# Run single stage
.\pipeline.ps1 -Stage researcher
.\pipeline.ps1 -Stage verifier
.\pipeline.ps1 -Stage planner
.\pipeline.ps1 -Stage fixer
.\pipeline.ps1 -Stage test-gen
.\pipeline.ps1 -Stage security

# Show available stages
.\pipeline.ps1 -List

# Show help
.\pipeline.ps1 -Help
```

**Advantages:**

- Native Windows experience
- Colored output
- Interactive prompts
- Full stage listing

---

### Option 4: Bash (macOS/Linux)

```bash
# Run entire pipeline
./pipeline.sh

# Run single stage
./pipeline.sh --stage researcher
./pipeline.sh --stage verifier
./pipeline.sh --stage planner
./pipeline.sh --stage fixer
./pipeline.sh --stage test-gen
./pipeline.sh --stage security

# Show available stages
./pipeline.sh --list

# Show help
./pipeline.sh --help
```

**Advantages:**

- Unix-native experience
- Scriptable
- CI/CD integration
- Portable

---

## Pipeline Stages

### 1. Bug Researcher

**Agent:** `@Bug Researcher`

Analyzes the entire TypeScript/Node.js codebase to identify:

- Potential bugs and issues
- Code quality problems
- Performance bottlenecks
- Code smell patterns

**Output:** `context/bugs/research.md`

**What to do:**

- Review the research report
- Check if findings match your codebase
- Note any false positives

---

### 2. Research Verifier

**Agent:** `@Research Verifier`

Validates the Bug Researcher's findings by:

- Fact-checking against actual code
- Assigning quality levels to reports
- Identifying discrepancies
- Ranking bug importance

**Output:** `context/bugs/verified-research.md`

**Requires:** `context/bugs/research.md`

**What to do:**

- Review verification status
- Check quality assignments
- Validate bug importance rankings

---

### 3. Bug Planner

**Agent:** `@Bug Planner`

Creates detailed implementation plans by:

- Applying auto-pick rules
- Determining fix priority
- Creating step-by-step plans
- Identifying potential risks

**Output:** `context/bugs/implementation-plans.md`

**Requires:** `context/bugs/verified-research.md`

**What to do:**

- Review planned fixes
- Check step sequencing
- Validate risk assessments
- Adjust priorities if needed

---

### 4. Bug Fixer

**Agent:** `@Bug Fixer`

Implements fixes by:

- Applying code changes
- Running tests after each change
- Validating fixes work
- Writing detailed summaries

**Output:** `context/bugs/fix-summary.md`

**Requires:** `context/bugs/implementation-plans.md`

**What to do:**

- Monitor test results
- Review code changes
- Validate functionality
- Check for regressions

---

### 5. Unit Test Generator

**Agent:** `@Unit Test Generator`

**Execution:** Runs in parallel with Security Verifier after Bug Fixer completes.

Creates tests by:

- Generating FIRST-compliant unit tests
- Testing changed code only
- Running and validating tests
- Producing test reports

**Output:** `context/bugs/test-report.md`

**Requires:** `context/bugs/fix-summary.md`

**What to do:**

- Review test coverage
- Check test quality
- Validate FIRST principles adherence
- Run `npm test` to verify

---

### 6. Security Verifier

**Agent:** `@Security Vulnerabilities Verifier`

**Execution:** Runs in parallel with Unit Test Generator after Bug Fixer completes.

Reviews code for security by:

- Identifying vulnerabilities
- Assessing severity levels
- Providing remediation guidance
- Ranking security issues

**Output:** `context/bugs/security-report.md`

**Requires:** `context/bugs/fix-summary.md`

**What to do:**

- Review identified vulnerabilities
- Check remediation guidance
- Validate severity rankings
- Plan security fixes

---

## Pipeline Output Files

All outputs are stored in `context/bugs/`:

| Stage               | Output File               | Type     | Size       |
| ------------------- | ------------------------- | -------- | ---------- |
| Bug Researcher      | `research.md`             | Markdown | ~5-50 KB   |
| Research Verifier   | `verified-research.md`    | Markdown | ~3-30 KB   |
| Bug Planner         | `implementation-plans.md` | Markdown | ~4-40 KB   |
| Bug Fixer           | `fix-summary.md`          | Markdown | ~10-100 KB |
| Unit Test Generator | `test-report.md`          | Markdown | ~5-50 KB   |
| Security Verifier   | `security-report.md`      | Markdown | ~3-30 KB   |

---

## Advanced Usage

### Run Pipeline with Custom Parameters

Via VS Code Copilot Chat:

```
@Pipeline Orchestrator Run pipeline focusing on performance issues

@Pipeline Orchestrator Run pipeline for routes/ directory only

@Pipeline Orchestrator Run pipeline and create detailed reports
```

### Conditional Stage Execution

Run only specific stages:

```bash
# Windows
.\pipeline.ps1 -Stage fixer
.\pipeline.ps1 -Stage test-gen

# Unix
./pipeline.sh --stage fixer
./pipeline.sh --stage test-gen
```

### Parallel Stage Review

Review outputs before moving to next stage:

```bash
# After researcher completes
code context/bugs/research.md

# Review, then continue to verifier
npm run pipeline:verifier
```

### Integration with CI/CD

```yaml
# GitHub Actions example
- name: Run Agent Pipeline
  run: npm run pipeline

- name: Upload Results
  uses: actions/upload-artifact@v2
  with:
    name: pipeline-reports
    path: context/bugs/
```

---

## Troubleshooting

### Stage Fails or Gets Stuck

1. **Check dependencies:**

   ```bash
   ls -la context/bugs/  # Verify previous outputs exist
   ```

2. **Review agent status:**
   - In VS Code, check Copilot Chat for errors
   - Look at agent messages for failure reasons

3. **Run stage manually:**

   ```bash
   npm run pipeline:verifier  # Run specific stage
   ```

4. **Check input files:**
   - Verify previous stage output exists
   - Check file isn't corrupted or empty

### Pipeline Takes Too Long

- Reduce scope: Run individual stages
- Check agent model settings
- Verify no network issues
- Review agent prompts for inefficiencies

### Outputs Are Missing or Incomplete

- Verify `context/bugs/` directory exists
- Check agent completed execution
- Review agent error messages
- Re-run the failed stage

### Different Results Between Runs

- Agent models are non-deterministic
- Some variation in outputs is normal
- Use `npm test` to verify functionality
- Focus on consistency, not exact matches

---

## Best Practices

### 1. Review Outputs Between Stages

```bash
# After each stage, review the output
cat context/bugs/research.md
# Then continue to next stage
```

### 2. Run Full Pipeline Before Deployment

```bash
npm run pipeline
npm test
npm run build
```

### 3. Archive Results

```bash
# Create timestamped backup
cp -r context/bugs context/bugs-$(date +%Y%m%d-%H%M%S)
```

### 4. Verify Code After Fixes

```bash
npm run build    # Check compilation
npm test         # Run full test suite
npm run lint     # Check code style
```

### 5. Track Changes

```bash
git diff src/  # See what was changed
git log --oneline -10  # Review commits
```

---

## Performance Notes

| Stage               | Typical Duration | Dependencies           | Notes                                        |
| ------------------- | ---------------- | ---------------------- | -------------------------------------------- |
| Bug Researcher      | 2-5 min          | None                   | Sequential                                   |
| Research Verifier   | 1-3 min          | Research               | Sequential                                   |
| Bug Planner         | 1-2 min          | Verified Research      | Sequential                                   |
| Bug Fixer           | 3-10 min         | Plans (includes tests) | Sequential                                   |
| Unit Test Generator | 2-5 min          | Fix Summary            | **Parallel**                                 |
| Security Verifier   | 1-3 min          | Fix Summary            | **Parallel**                                 |
| **Total**           | **10-26 min**    | -                      | 5 serial (2-21 min) + 2 parallel (max 5 min) |

**Note:** Unit Test Generator and Security Verifier run simultaneously after Bug Fixer, reducing overall pipeline time compared to pure sequential execution.

---

## Next Steps After Pipeline Completes

1. **Review all outputs:**

   ```bash
   ls -lah context/bugs/
   ```

2. **Run tests:**

   ```bash
   npm test
   npm run test:coverage
   ```

3. **Build application:**

   ```bash
   npm run build
   ```

4. **Start server:**

   ```bash
   npm start
   ```

5. **Test endpoints:**

   ```bash
   # In demo/ folder
   ./run.bat  # Windows
   ./sample-requests.sh  # Unix
   ```

6. **Review changes:**
   ```bash
   git status
   git diff src/
   ```

---

## Customization

### Modify Pipeline Stages

Edit `agents/pipeline-orchestrator.agent.md` to:

- Change stage order
- Add new stages
- Remove stages
- Modify stage parameters

### Customize Agent Behavior

Edit individual agent files in `agents/`:

- `bug-researcher.agent.md`
- `research-verifier.agent.md`
- `bug-planner.agent.md`
- `bug-fixer.agent.md`
- `unit-test-generator.agent.md`
- `security-verifier.agent.md`

### Adjust Script Behavior

Modify shell scripts:

- `pipeline.ps1` (PowerShell)
- `pipeline.sh` (Bash)
- `pipeline.js` (Node.js)

---

## Additional Resources

- **Agents:** See `AGENTS.md`
- **Architecture:** See `ARCHITECTURE.md`
- **Testing:** See `TESTING_GUIDE.md`
- **API Reference:** See `API_REFERENCE.md`
