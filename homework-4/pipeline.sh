#!/bin/bash
# Agent Pipeline Orchestrator (Bash)
# 
# Usage:
#   ./pipeline.sh                    # Run full pipeline
#   ./pipeline.sh --stage researcher # Run single stage
#   ./pipeline.sh --help             # Show help

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Pipeline stages
declare -a STAGES=(
    "bug-researcher:Bug Researcher:Analyzes codebase and produces bug research"
    "research-verifier:Research Verifier:Validates bug research and assigns quality"
    "bug-planner:Bug Planner:Creates implementation plans"
    "bug-fixer:Bug Fixer:Implements fixes and runs tests"
    "unit-test-generator:Unit Test Generator:Generates FIRST-compliant tests"
    "security-verifier:Security Verifier:Reviews code for vulnerabilities"
)

show_help() {
    cat << 'EOF'
Agent Pipeline Orchestrator
===========================

This script runs the complete bug research, verification, planning, fixing, and
security review pipeline in VS Code.

USAGE:
  ./pipeline.sh [OPTIONS]

OPTIONS:
  --stage <name>    Run single pipeline stage (researcher, verifier, etc.)
  --help            Show this help message
  --list            List all available stages

EXAMPLES:
  ./pipeline.sh                    # Run all stages in sequence
  ./pipeline.sh --stage researcher # Run only Bug Researcher
  ./pipeline.sh --list             # Show available stages

STAGES:
EOF
    
    for stage in "${STAGES[@]}"; do
        IFS=':' read -r name display desc <<< "$stage"
        printf "  %-25s %s\n" "$name" "$desc"
    done
}

list_stages() {
    echo "Available Pipeline Stages:"
    echo ""
    for i in "${!STAGES[@]}"; do
        IFS=':' read -r name display desc <<< "${STAGES[$i]}"
        echo "  $((i+1)). $display ($name)"
        echo "     $desc"
        echo ""
    done
}

run_stage() {
    local stage=$1
    local found=0
    
    for s in "${STAGES[@]}"; do
        IFS=':' read -r name display desc <<< "$s"
        if [ "$name" = "$stage" ]; then
            found=1
            echo -e "${BLUE}Running: $display${NC}"
            echo -e "${BLUE}$desc${NC}\n"
            
            # Open VS Code with agent command
            echo -e "${YELLOW}📝 In VS Code, open Copilot Chat and run:${NC}"
            echo -e "${GREEN}@$display${NC}"
            echo ""
            read -p "Press Enter after agent completes..."
            
            echo -e "${GREEN}✅ $display completed${NC}\n"
            break
        fi
    done
    
    if [ $found -eq 0 ]; then
        echo -e "${RED}❌ Unknown stage: $stage${NC}"
        echo "Available stages: $(printf "%s " "${STAGES[@]}" | cut -d':' -f1)"
        exit 1
    fi
}

run_pipeline() {
    echo -e "${BLUE}${'='.repeat(70)}${NC}"
    echo -e "${BLUE}🔄 Customer Support Ticket System - Agent Pipeline Orchestrator${NC}"
    echo -e "${BLUE}${'='.repeat(70)}${NC}\n"
    
    echo "Running pipeline (5 sequential + 2 parallel stages):\n"
    
    echo "Sequential Stages:"
    for i in 0 1 2 3; do
        IFS=':' read -r name display desc <<< "${STAGES[$i]}"
        echo "  $((i+1)). $display"
    done
    
    echo ""
    echo "Parallel Stages (after Bug Fixer):"
    for i in 4 5; do
        IFS=':' read -r name display desc <<< "${STAGES[$i]}"
        if [ $i -eq 4 ]; then
            echo "  ├─ $display"
        else
            echo "  └─ $display"
        fi
    done
    echo ""
    
    local start_time=$(date +%s)
    
    # Run first 4 stages sequentially
    for i in 0 1 2 3; do
        IFS=':' read -r name display desc <<< "${STAGES[$i]}"
        echo -e "\n${BLUE}Stage $((i+1))/5: $display${NC}"
        echo -e "${YELLOW}📝 In VS Code, open Copilot Chat and run:${NC}"
        echo -e "${GREEN}@$display${NC}"
        echo ""
        
        read -p "Press Enter after agent completes (or Ctrl+C to cancel)..."
    done
    
    # Run last 2 stages in parallel
    echo -e "\n${BLUE}${'='.repeat(70)}${NC}"
    echo -e "${BLUE}⚡ Running final 2 stages in PARALLEL${NC}"
    echo -e "${BLUE}${'='.repeat(70)}${NC}\n"
    
    echo -e "${YELLOW}📝 Both agents will run simultaneously:${NC}"
    IFS=':' read -r name display desc <<< "${STAGES[4]}"
    echo "   Stage 6: @$display"
    IFS=':' read -r name display desc <<< "${STAGES[5]}"
    echo "   Stage 7: @$display"
    echo ""
    
    read -p "Press Enter after both agents complete..."
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo -e "\n${BLUE}${'='.repeat(70)}${NC}"
    echo -e "${GREEN}✨ Pipeline Complete!${NC}"
    echo -e "${BLUE}${'='.repeat(70)}${NC}\n"
    
    echo "📊 Results Summary:"
    echo ""
    for i in "${!STAGES[@]}"; do
        IFS=':' read -r name display desc <<< "${STAGES[$i]}"
        echo "  $((i+1)). $display"
    done
    
    echo ""
    echo -e "${YELLOW}⏱️  Total time: ${duration}s${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo "   - Review outputs in context/bugs/ folder"
    echo "   - Check test reports: npm test"
    echo "   - Run server: npm start"
    echo ""
}

# Main
if [ $# -eq 0 ]; then
    run_pipeline
elif [ "$1" = "--help" ]; then
    show_help
elif [ "$1" = "--list" ]; then
    list_stages
elif [ "$1" = "--stage" ]; then
    if [ -z "$2" ]; then
        echo "Error: --stage requires a stage name"
        echo "Available stages: $(printf "%s " "${STAGES[@]}" | cut -d':' -f1)"
        exit 1
    fi
    run_stage "$2"
else
    echo "Unknown option: $1"
    echo "Use --help for usage information"
    exit 1
fi
