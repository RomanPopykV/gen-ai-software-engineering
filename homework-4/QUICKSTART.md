# Quick Start — Automated Pipeline Orchestration

## ⚡ Run Everything Automatically

Want to discover, verify, fix, and test all bugs automatically? Just do this:

### In VS Code Copilot Chat

1. **Open VS Code**
2. **Open Copilot Chat** (Ctrl+L or Cmd+L)
3. **Type and run:**
   ```
   @Pipeline Orchestrator
   ```
4. **Done** — The agent will automatically orchestrate all other agents in sequence

## That's It! ✨

The Pipeline Orchestrator will:

✅ Run Bug Researcher → analyze codebase for bugs  
✅ Run Research Verifier → validate findings  
✅ Run Bug Planner → create implementation plans  
✅ Run Bug Fixer → apply fixes and run tests  
✅ Run Unit Test Generator & Security Verifier in parallel  
✅ Generate final comprehensive report

All automatically, in the correct order, with dependency validation.

---

## What Happens Step-by-Step

The agent will:

1. **Invoke Bug Researcher**
   - Analyzes `src/` for bugs, vulnerabilities, patterns
   - Creates: `context/bugs/{N}/research/codebase-research.md`

2. **Invoke Research Verifier**
   - Validates each finding against actual code
   - Assigns quality scores
   - Creates: `context/bugs/{N}/research/verified-research.md`

3. **Invoke Bug Planner**
   - Decides which bugs to fix (auto-pick rules)
   - Creates step-by-step plans
   - Creates: `context/bugs/{N}/implementation-plans.md`

4. **Invoke Bug Fixer**
   - Applies code changes
   - Runs `npm test` after each change
   - Validates no regressions
   - Creates: `context/bugs/{N}/fix-summary.md`

5. **Run in Parallel** (after Bug Fixer):
   - **Unit Test Generator**: Generate FIRST-compliant tests
   - **Security Verifier**: Review for vulnerabilities

6. **Final Report**
   - Aggregates results from all stages
   - Shows metrics, timelines, next steps

---

## Monitor Progress

While the agent runs, you'll see:

- ✅ **Stage starting** — Which agent is running
- 📝 **Output being created** — Files being written
- ✅ **Validation passing** — Dependencies validated, proceeding
- ❌ **Issues found** — Clear error messages if something fails

All output files go to:

```
context/bugs/
├── 1/
│   ├── bug-context.md
│   ├── research/
│   │   ├── codebase-research.md
│   │   └── verified-research.md
│   ├── implementation-plans.md
│   ├── fix-summary.md
│   ├── test-report.md
│   └── security-report.md
├── 2/
├── 3/
└── ...
```

---

## If Something Fails

The agent will tell you exactly what went wrong and suggest a fix.

**Common issues:**

1. **"No research files found"**  
   → Bug Researcher didn't produce output → Re-run manually: `@Bug Researcher`

2. **"Tests failed after Bug Fixer"**  
   → Applied fixes broke tests → Fix the issue: `@Bug Fixer` and review test failures

3. **"Verification blocked"**  
   → Previous stage didn't produce output → Check `context/bugs/` for files

---

## After Pipeline Completes

Review outputs:

```bash
# See all findings
cat context/bugs/*/research/*.md

# See all plans and fixes
cat context/bugs/*/*.md

# Run tests locally
npm test

# Start the server
npm start
```

---

## Alternative: Manual Step-by-Step

If you want more control, use the guided workflow:

```bash
npm run pipeline
```

This will:

- Show which agent to run
- Wait for you to run it in VS Code
- Validate output
- Proceed to next stage

Use this if:

- You want to review each stage before proceeding
- You want to fix issues between stages
- You're testing or debugging

---

## Individual Agents

Want to run just one agent? Invoke directly in Copilot Chat:

```
@Bug Researcher
@Research Verifier
@Bug Planner
@Bug Fixer
@Unit Test Generator
@Security Vulnerabilities Verifier
```

---

## Questions?

See detailed documentation:

- [AGENTS.md](AGENTS.md) — Agent descriptions and usage
- [PIPELINE.md](PIPELINE.md) — Detailed pipeline architecture
- [agents/pipeline-orchestrator.agent.md](agents/pipeline-orchestrator.agent.md) — How the orchestrator works
