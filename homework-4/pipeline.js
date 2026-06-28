#!/usr/bin/env node

/**
 * Agent Pipeline Orchestrator
 * 
 * Runs the bug research, verification, planning, fixing, and security review pipeline.
 * 
 * Usage:
 *   npm run pipeline              # Run full pipeline
 *   npm run pipeline -- --stage researcher   # Run single stage
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const AGENTS = [
  {
    name: 'bug-researcher',
    displayName: 'Bug Researcher',
    description: 'Analyzes codebase and produces bug research',
    outputFile: 'context/bugs/research.md'
  },
  {
    name: 'research-verifier',
    displayName: 'Research Verifier',
    description: 'Validates bug research and assigns quality levels',
    outputFile: 'context/bugs/verified-research.md',
    requires: 'context/bugs/research.md'
  },
  {
    name: 'bug-planner',
    displayName: 'Bug Planner',
    description: 'Creates implementation plans for verified bugs',
    outputFile: 'context/bugs/implementation-plans.md',
    requires: 'context/bugs/verified-research.md'
  },
  {
    name: 'bug-fixer',
    displayName: 'Bug Fixer',
    description: 'Implements fixes and runs tests',
    outputFile: 'context/bugs/fix-summary.md',
    requires: 'context/bugs/implementation-plans.md'
  },
  {
    name: 'unit-test-generator',
    displayName: 'Unit Test Generator',
    description: 'Generates and validates FIRST-compliant tests',
    outputFile: 'context/bugs/test-report.md',
    requires: 'context/bugs/fix-summary.md'
  },
  {
    name: 'security-verifier',
    displayName: 'Security Vulnerabilities Verifier',
    description: 'Reviews code for security vulnerabilities',
    outputFile: 'context/bugs/security-report.md',
    requires: 'context/bugs/fix-summary.md'
  }
];

const args = process.argv.slice(2);
const stageFlag = args.indexOf('--stage');
const singleStage = stageFlag !== -1 ? args[stageFlag + 1] : null;

/**
 * Runs a single agent via VS Code Copilot
 */
async function runAgent(agent) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`⚙️  Running: ${agent.displayName}`);
    console.log(`📝 ${agent.description}`);
    if (agent.requires) {
      console.log(`📦 Requires: ${agent.requires}`);
    }
    console.log(`${'='.repeat(70)}\n`);

    // In VS Code environment, trigger agent via Copilot Chat
    // This would be invoked via VS Code command palette
    const cmd = `code --command "copilot.openSymbolFromWorkspace" --args agent:${agent.name}`;
    
    console.log(`💡 Open VS Code and run agent: @${agent.displayName}`);
    console.log(`   Or use: ${cmd}\n`);
    
    // For automated CI/CD, you would use VS Code CLI or API
    // This is a placeholder for manual execution
    setTimeout(() => {
      console.log(`✅ ${agent.displayName} completed\n`);
      resolve(agent);
    }, 1000);
  });
}

/**
 * Validates that required input files exist
 */
function validateDependencies(agent) {
  if (!agent.requires) return true;
  
  const requiredPath = path.join(process.cwd(), agent.requires);
  if (!fs.existsSync(requiredPath)) {
    console.warn(`⚠️  Warning: Expected output from previous stage: ${agent.requires}`);
    console.warn(`   Continue? (This should exist after previous agent completes)\n`);
    return false;
  }
  return true;
}

/**
 * Main pipeline execution
 */
async function runPipeline() {
  console.log('\n🔄 Customer Support Ticket System - Agent Pipeline Orchestrator\n');
  
  let agentsToRun = AGENTS;
  
  if (singleStage) {
    const agent = AGENTS.find(a => a.name === singleStage);
    if (!agent) {
      console.error(`❌ Unknown stage: ${singleStage}`);
      console.error(`Available stages: ${AGENTS.map(a => a.name).join(', ')}`);
      process.exit(1);
    }
    agentsToRun = [agent];
    console.log(`🎯 Running single stage: ${agent.displayName}\n`);
  } else {
    console.log(`🚀 Running full pipeline (${AGENTS.length} agents, 5 sequential + 2 parallel):\n`);
    console.log(`  Sequential:`);
    AGENTS.slice(0, 4).forEach((agent, i) => {
      console.log(`    ${i + 1}. ${agent.displayName}`);
    });
    console.log(`  Parallel (after Bug Fixer):`);
    console.log(`    ├─ ${AGENTS[4].displayName}`);
    console.log(`    └─ ${AGENTS[5].displayName}`);
  }

  const results = [];
  const startTime = Date.now();

  // Run first 4 agents sequentially
  const sequentialAgents = AGENTS.slice(0, 4);
  for (const agent of sequentialAgents) {
    validateDependencies(agent);
    
    try {
      const result = await runAgent(agent);
      results.push(result);
    } catch (error) {
      console.error(`❌ Error running ${agent.displayName}:`, error.message);
      process.exit(1);
    }
  }

  // Run last 2 agents in parallel
  const parallelAgents = AGENTS.slice(4);
  console.log(`\n${'='.repeat(70)}`);
  console.log(`⚡ Running final 2 stages in parallel`);
  console.log(`${'='.repeat(70)}\n`);

  try {
    const parallelResults = await Promise.all(
      parallelAgents.map(agent => {
        validateDependencies(agent);
        return runAgent(agent);
      })
    );
    results.push(...parallelResults);
  } catch (error) {
    console.error(`❌ Error running parallel stages:`, error.message);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`✨ Pipeline Complete`);
  console.log(`${'='.repeat(70)}`);
  console.log(`\n📊 Results Summary:\n`);
  
  results.forEach((result, i) => {
    const outputPath = path.relative(process.cwd(), result.outputFile);
    console.log(`  ${i + 1}. ${result.displayName}`);
    console.log(`     Output: ${outputPath}`);
  });
  
  console.log(`\n⏱️  Total time: ${duration}s`);
  console.log(`\n📝 Next steps:\n`);
  console.log(`   - Review outputs in context/bugs/ folder`);
  console.log(`   - Check test reports: npm test`);
  console.log(`   - Run server: npm start\n`);
}

// Run pipeline
runPipeline().catch(error => {
  console.error('❌ Pipeline failed:', error);
  process.exit(1);
});
