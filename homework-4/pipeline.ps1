# Agent Pipeline Orchestrator (PowerShell)
#
# Usage:
#   .\pipeline.ps1                    # Run full pipeline
#   .\pipeline.ps1 -Stage researcher  # Run single stage
#   .\pipeline.ps1 -Help              # Show help

param(
    [Parameter(Position=0)]
    [ValidateSet('researcher', 'verifier', 'planner', 'fixer', 'test-gen', 'security', IgnoreCase=$true)]
    [string]$Stage,
    
    [switch]$Help,
    [switch]$List
)

# Color helper
$colors = @{
    Green = "Green"
    Blue = "Cyan"
    Yellow = "Yellow"
    Red = "Red"
}

$ScriptPath = Split-Path -Parent $MyInvocation.MyCommandPath

# Pipeline stages definition
$stages = @(
    @{
        Name = "researcher"
        Display = "Bug Researcher"
        Desc = "Analyzes codebase and produces bug research"
        AgentName = "Bug Researcher"
    },
    @{
        Name = "verifier"
        Display = "Research Verifier"
        Desc = "Validates bug research and assigns quality"
        AgentName = "Research Verifier"
    },
    @{
        Name = "planner"
        Display = "Bug Planner"
        Desc = "Creates implementation plans"
        AgentName = "Bug Planner"
    },
    @{
        Name = "fixer"
        Display = "Bug Fixer"
        Desc = "Implements fixes and runs tests"
        AgentName = "Bug Fixer"
    },
    @{
        Name = "test-gen"
        Display = "Unit Test Generator"
        Desc = "Generates FIRST-compliant tests"
        AgentName = "Unit Test Generator"
    },
    @{
        Name = "security"
        Display = "Security Verifier"
        Desc = "Reviews code for vulnerabilities"
        AgentName = "Security Vulnerabilities Verifier"
    }
)

function Show-Help {
    @"
Agent Pipeline Orchestrator
===========================

This script runs the complete bug research, verification, planning, fixing, and
security review pipeline in VS Code.

USAGE:
  .\pipeline.ps1 [OPTIONS]

OPTIONS:
  -Stage <name>     Run single pipeline stage (researcher, verifier, planner, etc.)
  -Help             Show this help message
  -List             List all available stages

EXAMPLES:
  .\pipeline.ps1                    # Run all stages in sequence
  .\pipeline.ps1 -Stage researcher # Run only Bug Researcher
  .\pipeline.ps1 -List             # Show available stages

STAGES:
"@

    $stages | ForEach-Object {
        Write-Host "  $($_.Name)" -ForegroundColor Green
        Write-Host "    Display: $($_.Display)" -ForegroundColor Gray
        Write-Host "    $($_.Desc)" -ForegroundColor Gray
        Write-Host ""
    }
}

function Show-Stages {
    Write-Host "`nAvailable Pipeline Stages:`n" -ForegroundColor Cyan
    
    for ($i = 0; $i -lt $stages.Count; $i++) {
        $stage = $stages[$i]
        Write-Host "  $($i+1). $($stage.Display) ($($stage.Name))" -ForegroundColor Yellow
        Write-Host "     $($stage.Desc)" -ForegroundColor Gray
        Write-Host ""
    }
}

function Invoke-Stage {
    param([string]$StageName)
    
    $stage = $stages | Where-Object { $_.Name -eq $StageName }
    
    if (-not $stage) {
        Write-Host "❌ Unknown stage: $StageName" -ForegroundColor Red
        Write-Host "Available: $($stages.Name -join ', ')" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n" + ("="*70) -ForegroundColor Cyan
    Write-Host "⚙️  Running: $($stage.Display)" -ForegroundColor Cyan
    Write-Host "📝 $($stage.Desc)" -ForegroundColor Cyan
    Write-Host ("="*70) + "`n" -ForegroundColor Cyan
    
    Write-Host "📝 In VS Code, open Copilot Chat and run:" -ForegroundColor Yellow
    Write-Host "@$($stage.AgentName)" -ForegroundColor Green
    Write-Host ""
    
    Read-Host "Press Enter after agent completes"
    
    Write-Host "✅ $($stage.Display) completed`n" -ForegroundColor Green
}

function Invoke-Pipeline {
    Write-Host "`n" -ForegroundColor Cyan
    Write-Host ("="*70) -ForegroundColor Cyan
    Write-Host "🔄 Customer Support Ticket System - Agent Pipeline Orchestrator" -ForegroundColor Cyan
    Write-Host ("="*70) -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "🚀 Running full pipeline (5 sequential + 2 parallel stages):`n" -ForegroundColor Cyan
    
    Write-Host "Sequential Stages:" -ForegroundColor Yellow
    for ($i = 0; $i -lt 4; $i++) {
        Write-Host "  $($i+1). $($stages[$i].Display)" -ForegroundColor Gray
    }
    
    Write-Host "`nParallel Stages (after Bug Fixer):" -ForegroundColor Yellow
    Write-Host "  ├─ $($stages[4].Display)" -ForegroundColor Gray
    Write-Host "  └─ $($stages[5].Display)" -ForegroundColor Gray
    
    $startTime = Get-Date
    Write-Host ""
    
    # Run first 4 stages sequentially
    for ($i = 0; $i -lt 4; $i++) {
        $stage = $stages[$i]
        Write-Host "`nStage $($i+1)/5: $($stage.Display)" -ForegroundColor Cyan
        Write-Host "📝 In VS Code, open Copilot Chat and run:" -ForegroundColor Yellow
        Write-Host "@$($stage.AgentName)" -ForegroundColor Green
        Write-Host ""
        
        Read-Host "Press Enter after agent completes (or Ctrl+C to cancel)"
    }
    
    # Run last 2 stages in parallel
    Write-Host "`n" + ("="*70) -ForegroundColor Cyan
    Write-Host "⚡ Running final 2 stages in PARALLEL" -ForegroundColor Cyan
    Write-Host ("="*70) + "`n" -ForegroundColor Cyan
    
    Write-Host "📝 Both agents will run simultaneously:" -ForegroundColor Yellow
    Write-Host "   Stage 6: @$($stages[4].AgentName)" -ForegroundColor Green
    Write-Host "   Stage 7: @$($stages[5].AgentName)" -ForegroundColor Green
    Write-Host ""
    
    Read-Host "Press Enter after both agents complete"
    
    $endTime = Get-Date
    $duration = [math]::Round(($endTime - $startTime).TotalSeconds, 1)
    
    Write-Host "`n" + ("="*70) -ForegroundColor Cyan
    Write-Host "✨ Pipeline Complete!" -ForegroundColor Green
    Write-Host ("="*70) + "`n" -ForegroundColor Cyan
    
    Write-Host "📊 Results Summary:`n" -ForegroundColor Yellow
    for ($i = 0; $i -lt $stages.Count; $i++) {
        Write-Host "  $($i+1). $($stages[$i].Display)" -ForegroundColor Gray
    }
    
    Write-Host "`n⏱️  Total time: $duration seconds" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "   - Review outputs in context/bugs/ folder"
    Write-Host "   - Check test reports: npm test"
    Write-Host "   - Run server: npm start`n"
}

# Main execution
if ($Help) {
    Show-Help
}
elseif ($List) {
    Show-Stages
}
elseif ($Stage) {
    Invoke-Stage $Stage
}
else {
    Invoke-Pipeline
}
