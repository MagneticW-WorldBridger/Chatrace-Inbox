#!/usr/bin/env node

// 🚨 REAL DEBUG TEST - Let's see what's actually failing
// This will test each step of the unified endpoint manually

import { DatabaseBridgeIntegration } from './database-bridge-integration.js';

console.log('🚨 DEBUGGING UNIFIED ENDPOINT - STEP BY STEP');
console.log('=============================================');

async function debugUnifiedEndpoint() {
    console.log('\n🔍 STEP 1: Testing Database Bridge Initialization');
    console.log('================================================');
    
    let bridge = null;
    try {
        bridge = new DatabaseBridgeIntegration();
        console.log('✅ DatabaseBridgeIntegration class created');
        
        console.log('📡 Attempting to initialize database connections...');
        await bridge.initialize();
        console.log('✅ Database bridge initialized successfully!');
        
    } catch (error) {
        console.error('❌ Database bridge initialization FAILED:');
        console.error('   Error:', error.message);
        console.error('   Stack:', error.stack);
        return { step1: false, error: error.message };
    }
    
    console.log('\n🔍 STEP 2: Testing Woodstock Database Connection');
    console.log('===============================================');
    
    try {
        console.log('📊 Checking if Woodstock database has conversations...');
        const woodstockConversations = await bridge.woodstockDb.query(`
            SELECT 
                conversation_id,
                user_identifier,
                platform_type,
                last_message_at,
                is_active
            FROM chatbot_conversations 
            WHERE is_active = true
            ORDER BY last_message_at DESC
            LIMIT 5
        `);
        
        const count = woodstockConversations.rows.length;
        console.log(`✅ Found ${count} active Woodstock conversations`);
        
        if (count > 0) {
            console.log('📝 Sample Woodstock conversation:');
            const sample = woodstockConversations.rows[0];
            console.log(`   ID: ${sample.conversation_id}`);
            console.log(`   User: ${sample.user_identifier}`);
            console.log(`   Platform: ${sample.platform_type}`);
            console.log(`   Last message: ${sample.last_message_at}`);
        } else {
            console.log('⚠️  No active conversations found in Woodstock database');
            return { step1: true, step2: false, error: 'No Woodstock conversations' };
        }
        
    } catch (error) {
        console.error('❌ Woodstock database query FAILED:');
        console.error('   Error:', error.message);
        return { step1: true, step2: false, error: error.message };
    }
    
    console.log('\n🔍 STEP 3: Testing Unified Table Creation');
    console.log('========================================');
    
    try {
        console.log('🗃️ Checking unified_conversations table...');
        const unifiedCheck = await bridge.mainDb.query(`
            SELECT COUNT(*) as count 
            FROM unified_conversations
        `);
        
        const unifiedCount = unifiedCheck.rows[0].count;
        console.log(`✅ Unified table exists with ${unifiedCount} conversations`);
        
        if (unifiedCount === 0) {
            console.log('⚠️  Unified table is empty - need to run sync!');
        }
        
    } catch (error) {
        console.error('❌ Unified table check FAILED:');
        console.error('   Error:', error.message);
        return { step1: true, step2: true, step3: false, error: error.message };
    }
    
    console.log('\n🔍 STEP 4: Testing Sync Process');
    console.log('==============================');
    
    try {
        console.log('🔄 Running Woodstock conversations sync...');
        await bridge.syncWoodstockConversations();
        console.log('✅ Woodstock sync completed');
        
        // Check unified table again
        const afterSync = await bridge.mainDb.query(`
            SELECT COUNT(*) as count 
            FROM unified_conversations 
            WHERE source = 'woodstock'
        `);
        
        const syncedCount = afterSync.rows[0].count;
        console.log(`✅ After sync: ${syncedCount} Woodstock conversations in unified table`);
        
        if (syncedCount > 0) {
            console.log('📝 Sample unified conversation:');
            const sampleUnified = await bridge.mainDb.query(`
                SELECT * FROM unified_conversations 
                WHERE source = 'woodstock' 
                LIMIT 1
            `);
            
            const sample = sampleUnified.rows[0];
            console.log(`   ID: ${sample.conversation_id}`);
            console.log(`   Name: ${sample.customer_name}`);
            console.log(`   Source: ${sample.source}`);
            console.log(`   Last message: ${sample.last_message_content}`);
        }
        
    } catch (error) {
        console.error('❌ Sync process FAILED:');
        console.error('   Error:', error.message);
        console.error('   Stack:', error.stack);
        return { step1: true, step2: true, step3: true, step4: false, error: error.message };
    }
    
    console.log('\n🔍 STEP 5: Testing getUnifiedConversations Function');
    console.log('=================================================');
    
    try {
        console.log('📊 Testing bridge.getUnifiedConversations...');
        const unifiedConversations = await bridge.getUnifiedConversations(null, 10, 0);
        console.log(`✅ getUnifiedConversations returned ${unifiedConversations.length} conversations`);
        
        if (unifiedConversations.length > 0) {
            const woodstockConvos = unifiedConversations.filter(c => c._platform.toLowerCase() === 'woodstock');
            console.log(`🌲 ${woodstockConvos.length} Woodstock conversations found`);
            
            if (woodstockConvos.length > 0) {
                console.log('📝 Sample Woodstock conversation from getUnifiedConversations:');
                const sample = woodstockConvos[0];
                console.log(`   Display Name: ${sample.display_name}`);
                console.log(`   Conversation ID: ${sample.conversation_id}`);
                console.log(`   Platform: ${sample._platform}`);
                console.log(`   Last Message: ${sample.last_message_content}`);
            }
        }
        
    } catch (error) {
        console.error('❌ getUnifiedConversations FAILED:');
        console.error('   Error:', error.message);
        return { step1: true, step2: true, step3: true, step4: true, step5: false, error: error.message };
    }
    
    // Cleanup
    try {
        await bridge.woodstockDb.end();
        await bridge.mainDb.end();
        console.log('\n🧹 Database connections closed');
    } catch (e) {
        console.log('⚠️  Cleanup warning:', e.message);
    }
    
    console.log('\n🎉 ALL STEPS COMPLETED SUCCESSFULLY!');
    console.log('🌲 Woodstock conversations should now appear in unified endpoint');
    
    return { 
        step1: true, 
        step2: true, 
        step3: true, 
        step4: true, 
        step5: true, 
        success: true 
    };
}

debugUnifiedEndpoint()
    .then((result) => {
        console.log('\n🏆 DEBUG RESULTS SUMMARY:');
        console.log('========================');
        console.log(`Step 1 (DB Bridge Init): ${result.step1 ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Step 2 (Woodstock Query): ${result.step2 ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Step 3 (Unified Tables): ${result.step3 ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Step 4 (Sync Process): ${result.step4 ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Step 5 (Get Unified): ${result.step5 ? '✅ PASSED' : '❌ FAILED'}`);
        
        if (result.success) {
            console.log('\n🎉 ALL DIAGNOSTIC TESTS PASSED!');
            console.log('🚀 Restart backend server and test unified endpoint again!');
        } else {
            console.log('\n💥 DIAGNOSTIC FOUND THE ISSUE!');
            console.log(`❌ Failure: ${result.error}`);
        }
        
        process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
        console.error('\n💥 DIAGNOSTIC SCRIPT FAILED:');
        console.error(error.message);
        console.error(error.stack);
        process.exit(1);
    });

