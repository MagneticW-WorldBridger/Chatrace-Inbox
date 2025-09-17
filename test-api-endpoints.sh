#!/bin/bash

echo "🧪 ETAPA 2: API ENDPOINTS INTEGRATION TEST"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE_URL="http://localhost:3001"
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

# Start backend server if not running
if ! curl -s "$API_BASE_URL/health" > /dev/null; then
    echo "🚀 Starting backend server..."
    cd backend
    npm start > /dev/null 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait for server to start
    echo "⏳ Waiting for server to start..."
    for i in {1..30}; do
        if curl -s "$API_BASE_URL/health" > /dev/null; then
            echo "✅ Backend server started"
            break
        fi
        sleep 1
    done
fi

# Test API endpoints
run_test "Health endpoint responds" "curl -s $API_BASE_URL/health | grep -q 'ok'"

run_test "Auth endpoint works" "curl -s -X POST $API_BASE_URL/api/test-auth | grep -q 'OK'"

run_test "Conversations endpoint responds" "curl -s '$API_BASE_URL/api/inbox/conversations?limit=1' | grep -q 'data'"

run_test "Conversations returns array" "curl -s '$API_BASE_URL/api/inbox/conversations?limit=1' | jq -e '.data | type == \"array\"' > /dev/null"

# Test unified endpoints if they exist
if grep -q "unified-inbox-endpoints" backend/server.js; then
    echo -e "\n${YELLOW}UNIFIED ENDPOINTS DETECTED - TESTING...${NC}"
    
    run_test "Unified conversations include sources" "curl -s '$API_BASE_URL/api/inbox/conversations?platform=all' | jq -e '.sources' > /dev/null"
    
    run_test "Multiple sources in response" "curl -s '$API_BASE_URL/api/inbox/conversations?platform=all' | jq -e '.data[] | .source' > /dev/null"
else
    echo -e "\n${YELLOW}UNIFIED ENDPOINTS NOT YET ACTIVATED${NC}"
fi

# Create detailed API test
cat > detailed-api-test.js << 'EOF'
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001';

async function testDetailedAPI() {
    try {
        console.log('🧪 Testing detailed API functionality...');
        
        // Test auth
        const authResponse = await fetch(`${API_BASE_URL}/api/test-auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const authData = await authResponse.json();
        
        if (authData.status !== 'OK') {
            throw new Error('Auth failed');
        }
        console.log('✅ Authentication working');
        
        // Test conversations
        const conversationsResponse = await fetch(
            `${API_BASE_URL}/api/inbox/conversations?platform=webchat&limit=5`,
            {
                headers: {
                    'X-ACCESS-TOKEN': authData.token,
                    'X-BUSINESS-ID': process.env.BUSINESS_ID || ''
                }
            }
        );
        const conversationsData = await conversationsResponse.json();
        
        if (!conversationsData.data || !Array.isArray(conversationsData.data)) {
            throw new Error('Conversations data invalid');
        }
        
        console.log(`✅ Found ${conversationsData.data.length} conversations`);
        
        if (conversationsData.data.length > 0) {
            const testConversation = conversationsData.data[0];
            console.log(`✅ Sample conversation: ${testConversation.display_name} (${testConversation.conversation_id})`);
            
            // Test messages endpoint
            const messagesResponse = await fetch(
                `${API_BASE_URL}/api/inbox/conversations/${testConversation.conversation_id}/messages?limit=5`,
                {
                    headers: {
                        'X-ACCESS-TOKEN': authData.token,
                        'X-BUSINESS-ID': process.env.BUSINESS_ID || ''
                    }
                }
            );
            const messagesData = await messagesResponse.json();
            
            if (messagesData.data && Array.isArray(messagesData.data)) {
                console.log(`✅ Found ${messagesData.data.length} messages in conversation`);
            } else {
                console.log('⚠️  Messages endpoint returned no data (might be empty conversation)');
            }
        }
        
        console.log('🎉 Detailed API test completed successfully');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Detailed API test failed:', error.message);
        process.exit(1);
    }
}

testDetailedAPI();
EOF

echo -e "\n${YELLOW}Running detailed API functionality test...${NC}"
if node detailed-api-test.js; then
    echo -e "${GREEN}✅ PASSED:${NC} Detailed API functionality"
    ((passed_count++))
    ((test_count++))
else
    echo -e "${RED}❌ FAILED:${NC} Detailed API functionality"
    ((test_count++))
fi

# Cleanup
rm -f detailed-api-test.js
if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null
fi

echo -e "\n🏆 API ENDPOINTS TESTS COMPLETE"
echo "==============================="
echo -e "PASSED: ${GREEN}$passed_count${NC}/$test_count tests"

if [ $passed_count -eq $test_count ]; then
    echo -e "${GREEN}🎉 ALL API ENDPOINT TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${RED}💥 SOME TESTS FAILED - FIX BEFORE PROCEEDING${NC}"
    exit 1
fi

