#!/bin/bash

echo "🧪 ETAPA 1: DATABASE BRIDGE CONNECTION TEST"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
passed_count=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${YELLOW}TEST $((++test_count)):${NC} $test_name"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED:${NC} $test_name"
        ((passed_count++))
        return 0
    else
        echo -e "${RED}❌ FAILED:${NC} $test_name"
        return 1
    fi
}

# Create test script for database bridge
cat > test-db-bridge.js << 'EOF'
import { DatabaseBridgeIntegration } from './database-bridge-integration.js';
import pg from 'pg';

async function testDatabaseBridge() {
    const bridge = new DatabaseBridgeIntegration();
    
    console.log('🔗 Testing Woodstock database connection...');
    
    try {
        await bridge.initialize();
        console.log('✅ Database bridge initialized successfully');
        
        // Test Woodstock connection
        const conversations = await bridge.woodstockDb.query(`
            SELECT COUNT(*) as count FROM chatbot_conversations LIMIT 1
        `);
        console.log(`✅ Woodstock DB: ${conversations.rows[0].count} conversations found`);
        
        // Test main DB connection  
        await bridge.mainDb.query('SELECT 1');
        console.log('✅ Main database connection working');
        
        // Test unified table creation
        const tables = await bridge.mainDb.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_name IN ('unified_conversations', 'unified_messages')
        `);
        console.log(`✅ Unified tables: ${tables.rows.length}/2 created`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Database bridge test failed:', error.message);
        process.exit(1);
    }
}

testDatabaseBridge();
EOF

# Run the tests
run_test "Node.js availability" "node --version"
run_test "Database bridge file exists" "test -f database-bridge-integration.js"
run_test "Package.json has pg dependency" "grep -q '\"pg\":' backend/package.json"
run_test "Environment variables set" "test -n '$DATABASE_URL' && test -n '$POSTGRES_URL'"

echo -e "\n${YELLOW}Running database connectivity test...${NC}"
if node test-db-bridge.js; then
    echo -e "${GREEN}✅ PASSED:${NC} Database bridge connectivity"
    ((passed_count++))
    ((test_count++))
else
    echo -e "${RED}❌ FAILED:${NC} Database bridge connectivity"
    ((test_count++))
fi

# Cleanup
rm -f test-db-bridge.js

echo -e "\n🏆 DATABASE BRIDGE TESTS COMPLETE"
echo "=================================="
echo -e "PASSED: ${GREEN}$passed_count${NC}/$test_count tests"

if [ $passed_count -eq $test_count ]; then
    echo -e "${GREEN}🎉 ALL DATABASE BRIDGE TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${RED}💥 SOME TESTS FAILED - FIX BEFORE PROCEEDING${NC}"
    exit 1
fi

