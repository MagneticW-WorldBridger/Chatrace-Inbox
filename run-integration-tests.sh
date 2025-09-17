#!/bin/bash

echo "🚀 UNIFIED INBOX INTEGRATION - FULL TEST SUITE"
echo "=============================================="
echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting comprehensive integration tests"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

total_tests=0
total_passed=0
stage_results=()

# Function to run test stage
run_stage() {
    local stage_name="$1"
    local stage_script="$2"
    
    echo -e "\n${BLUE}=====================================${NC}"
    echo -e "${BLUE}STAGE: $stage_name${NC}"
    echo -e "${BLUE}=====================================${NC}"
    
    if [ -f "$stage_script" ]; then
        chmod +x "$stage_script"
        if ./"$stage_script"; then
            echo -e "\n${GREEN}🎉 STAGE PASSED: $stage_name${NC}"
            stage_results+=("$stage_name: PASSED")
            return 0
        else
            echo -e "\n${RED}💥 STAGE FAILED: $stage_name${NC}"
            stage_results+=("$stage_name: FAILED")
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  STAGE SCRIPT NOT FOUND: $stage_script${NC}"
        stage_results+=("$stage_name: SKIPPED")
        return 1
    fi
}

# Pre-flight checks
echo -e "\n${YELLOW}🔍 PRE-FLIGHT CHECKS${NC}"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ Environment file found"
else
    echo "❌ .env file missing!"
    exit 1
fi

# Check if backend dependencies are installed
if [ -f "backend/node_modules/package.json" ] || [ -f "node_modules/package.json" ]; then
    echo "✅ Node modules found"
else
    echo "📦 Installing dependencies..."
    cd backend && npm install && cd .. || npm install
fi

echo -e "\n${BLUE}🧪 EXECUTING TEST STAGES IN ORDER${NC}"

# Stage 1: Database Bridge Tests
run_stage "Database Bridge Connection" "test-database-bridge.sh"
stage1_result=$?

# Stage 2: API Endpoints Tests  
run_stage "API Endpoints Integration" "test-api-endpoints.sh"
stage2_result=$?

# Stage 3: Create and run unified system test
echo -e "\n${BLUE}=====================================${NC}"
echo -e "${BLUE}STAGE: Unified System Validation${NC}"
echo -e "${BLUE}=====================================${NC}"

cat > test-unified-system.js << 'EOF'
import { DatabaseBridgeIntegration } from './database-bridge-integration.js';

async function testUnifiedSystem() {
    try {
        console.log('🔄 Testing unified system integration...');
        
        // Test if unified endpoints exist
        const fs = await import('fs');
        const unifiedEndpointsExists = fs.existsSync('./unified-inbox-endpoints.js');
        const databaseBridgeExists = fs.existsSync('./database-bridge-integration.js');
        
        console.log(`✅ Unified endpoints file: ${unifiedEndpointsExists ? 'EXISTS' : 'MISSING'}`);
        console.log(`✅ Database bridge file: ${databaseBridgeExists ? 'EXISTS' : 'MISSING'}`);
        
        if (unifiedEndpointsExists && databaseBridgeExists) {
            console.log('🎯 All unified system components present');
            
            // Test database bridge initialization
            const bridge = new DatabaseBridgeIntegration();
            console.log('✅ Database bridge class can be instantiated');
            
            console.log('🎉 Unified system validation PASSED');
        } else {
            throw new Error('Missing unified system components');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Unified system test failed:', error.message);
        process.exit(1);
    }
}

testUnifiedSystem();
EOF

echo -e "\n${YELLOW}Running unified system validation...${NC}"
if node test-unified-system.js; then
    echo -e "${GREEN}✅ PASSED:${NC} Unified system validation"
    stage_results+=("Unified System Validation: PASSED")
    stage3_result=0
else
    echo -e "${RED}❌ FAILED:${NC} Unified system validation"
    stage_results+=("Unified System Validation: FAILED")
    stage3_result=1
fi

# Cleanup
rm -f test-unified-system.js

# Calculate results
passed_stages=$(echo "${stage_results[@]}" | grep -o "PASSED" | wc -l)
total_stages=${#stage_results[@]}

echo -e "\n${BLUE}📊 INTEGRATION TEST RESULTS${NC}"
echo "=============================================="
echo "Test execution completed: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

for result in "${stage_results[@]}"; do
    if [[ $result == *"PASSED"* ]]; then
        echo -e "${GREEN}✅ $result${NC}"
    elif [[ $result == *"FAILED"* ]]; then
        echo -e "${RED}❌ $result${NC}"
    else
        echo -e "${YELLOW}⚠️  $result${NC}"
    fi
done

echo ""
echo -e "OVERALL RESULT: ${GREEN}$passed_stages${NC}/$total_stages stages passed"

if [ $passed_stages -eq $total_stages ]; then
    echo -e "\n${GREEN}🎉🎉🎉 ALL INTEGRATION TESTS PASSED! 🎉🎉🎉${NC}"
    echo -e "${GREEN}✅ SYSTEM READY FOR UNIFIED INBOX ACTIVATION${NC}"
    exit 0
else
    echo -e "\n${RED}💥 INTEGRATION TESTS INCOMPLETE${NC}"
    echo -e "${RED}❌ FIX FAILING STAGES BEFORE PROCEEDING${NC}"
    exit 1
fi

