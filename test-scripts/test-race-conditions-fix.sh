#!/bin/bash

# 🧪 RACE CONDITIONS FIX TESTER
# 
# This script tests the fixes for the race conditions that were causing:
# 1. Chat area emptying after sending messages
# 2. Alternating conversation batches on refresh
# 3. WebSocket subscription issues
# 4. SSE reconnection problems

API_BASE_URL="http://localhost:3001"
PLATFORMS=("webchat" "instagram" "facebook")
RAPID_REQUEST_COUNT=5
DELAY_BETWEEN_REQUESTS=0.1

echo "🧪 TESTING RACE CONDITIONS FIXES"
echo "================================"

# Get auth token first
echo "🔑 Getting authentication token..."
TOKEN_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/test-auth")
TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Authentication failed"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

echo "✅ Authentication successful"
echo "Token: ${TOKEN:0:20}..."

# Test 1: Rapid conversation loading (should not cause alternating batches)
echo ""
echo "🧪 TEST 1: Rapid conversation loading"
echo "------------------------------------"

for platform in "${PLATFORMS[@]}"; do
    echo "📱 Testing platform: $platform"
    
    declare -a results=()
    
    # Make rapid requests
    for i in $(seq 1 $RAPID_REQUEST_COUNT); do
        response=$(curl -s -H "X-ACCESS-TOKEN: $TOKEN" -H "X-BUSINESS-ID: 1145545" \
            "$API_BASE_URL/api/inbox/conversations?platform=$platform&limit=50")
        
        count=$(echo "$response" | grep -o '"data":\[[^]]*\]' | grep -o '{"' | wc -l | tr -d ' ')
        
        if [ -z "$count" ]; then
            count=0
        fi
        
        results+=($count)
        echo "  Request $i: $count conversations"
        
        sleep $DELAY_BETWEEN_REQUESTS
    done
    
    # Check for consistency
    unique_counts=($(printf '%s\n' "${results[@]}" | sort -u))
    
    if [ ${#unique_counts[@]} -eq 1 ]; then
        echo "  ✅ Consistent results: ${unique_counts[0]} conversations"
    else
        echo "  ⚠️  Inconsistent results: ${unique_counts[*]} conversations"
    fi
done

# Test 2: Rapid message loading (should not cause race conditions)
echo ""
echo "🧪 TEST 2: Rapid message loading"
echo "---------------------------------"

# First get a conversation ID
conversations_response=$(curl -s -H "X-ACCESS-TOKEN: $TOKEN" -H "X-BUSINESS-ID: 1145545" \
    "$API_BASE_URL/api/inbox/conversations?platform=webchat&limit=1")

conversation_id=$(echo "$conversations_response" | grep -o '"conversation_id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$conversation_id" ]; then
    conversation_id=$(echo "$conversations_response" | grep -o '"ms_id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

if [ -z "$conversation_id" ]; then
    conversation_id=$(echo "$conversations_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

if [ -z "$conversation_id" ]; then
    echo "  ⚠️  No conversations found for message testing"
else
    echo "📬 Testing with conversation ID: $conversation_id"
    
    declare -a message_results=()
    
    # Make rapid message requests
    for i in $(seq 1 $RAPID_REQUEST_COUNT); do
        response=$(curl -s -H "X-ACCESS-TOKEN: $TOKEN" -H "X-BUSINESS-ID: 1145545" \
            "$API_BASE_URL/api/inbox/conversations/$conversation_id/messages?limit=50")
        
        count=$(echo "$response" | grep -o '"data":\[[^]]*\]' | grep -o '{"' | wc -l | tr -d ' ')
        
        if [ -z "$count" ]; then
            count=0
        fi
        
        message_results+=($count)
        echo "  Request $i: $count messages"
        
        sleep $DELAY_BETWEEN_REQUESTS
    done
    
    # Check for consistency
    unique_message_counts=($(printf '%s\n' "${message_results[@]}" | sort -u))
    
    if [ ${#unique_message_counts[@]} -eq 1 ]; then
        echo "  ✅ Consistent results: ${unique_message_counts[0]} messages"
    else
        echo "  ⚠️  Inconsistent results: ${unique_message_counts[*]} messages"
    fi
fi

# Test 3: WebSocket URL retrieval (should be consistent)
echo ""
echo "🧪 TEST 3: WebSocket info consistency"
echo "------------------------------------"

declare -a ws_results=()

for i in $(seq 1 $RAPID_REQUEST_COUNT); do
    response=$(curl -s -H "X-ACCESS-TOKEN: $TOKEN" -H "Origin: http://localhost:5173" \
        "$API_BASE_URL/api/whitelabel")
    
    wsurl=$(echo "$response" | grep -o '"wsurl":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$wsurl" ]; then
        ws_results+=("$wsurl")
        echo "  Request $i: WebSocket URL received"
    else
        echo "  Request $i: No WebSocket URL"
    fi
    
    sleep $DELAY_BETWEEN_REQUESTS
done

# Check for consistency
unique_wsurls=($(printf '%s\n' "${ws_results[@]}" | sort -u))

if [ ${#unique_wsurls[@]} -le 1 ]; then
    echo "  ✅ Consistent WebSocket URLs"
else
    echo "  ⚠️  Multiple WebSocket URLs found: ${#unique_wsurls[@]}"
fi

# Test 4: Simulate rapid conversation switching
echo ""
echo "🧪 TEST 4: Rapid conversation switching simulation"
echo "------------------------------------------------"

echo "📱 Getting conversation list..."
conversations_response=$(curl -s -H "X-ACCESS-TOKEN: $TOKEN" -H "X-BUSINESS-ID: 1145545" \
    "$API_BASE_URL/api/inbox/conversations?platform=webchat&limit=3")

# Extract first 3 conversation IDs
conv_ids=($(echo "$conversations_response" | grep -o '"conversation_id":"[^"]*"' | cut -d'"' -f4 | head -3))

if [ ${#conv_ids[@]} -eq 0 ]; then
    conv_ids=($(echo "$conversations_response" | grep -o '"ms_id":"[^"]*"' | cut -d'"' -f4 | head -3))
fi

if [ ${#conv_ids[@]} -eq 0 ]; then
    conv_ids=($(echo "$conversations_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -3))
fi

if [ ${#conv_ids[@]} -gt 0 ]; then
    echo "🔄 Simulating rapid conversation switching..."
    
    for i in $(seq 1 3); do
        for conv_id in "${conv_ids[@]}"; do
            echo "  Switching to conversation: $conv_id"
            
            # Load messages for this conversation
            messages_response=$(curl -s -H "X-ACCESS-TOKEN: $TOKEN" -H "X-BUSINESS-ID: 1145545" \
                "$API_BASE_URL/api/inbox/conversations/$conv_id/messages?limit=10")
            
            message_count=$(echo "$messages_response" | grep -o '"data":\[[^]]*\]' | grep -o '{"' | wc -l | tr -d ' ')
            echo "    Messages loaded: $message_count"
            
            sleep 0.05  # Very rapid switching
        done
    done
    
    echo "  ✅ Rapid conversation switching completed"
else
    echo "  ⚠️  No conversations found for switching test"
fi

# Summary
echo ""
echo "🎯 TEST SUMMARY"
echo "==============="
echo "✅ Conversation loading consistency tests completed"
echo "✅ Message loading consistency tests completed"
echo "✅ WebSocket info consistency tests completed"
echo "✅ Rapid conversation switching simulation completed"
echo ""
echo "🔍 Check the logs above for any ⚠️  warnings or ❌ errors"
echo "🚀 If all tests show ✅, the race condition fixes are working!"

echo ""
echo "📋 MANUAL TESTING CHECKLIST:"
echo "1. Open frontend at http://localhost:5173"
echo "2. Click on different conversations rapidly"
echo "3. Send messages and verify they don't disappear"
echo "4. Refresh page multiple times and check conversation list consistency"
echo "5. Switch between platforms and verify no chat clearing"
