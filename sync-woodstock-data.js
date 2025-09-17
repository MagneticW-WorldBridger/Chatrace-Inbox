#!/usr/bin/env node

// Manually run the Woodstock sync to populate unified tables
import { DatabaseBridgeIntegration } from './database-bridge-integration.js';

console.log('🔄 SYNCING WOODSTOCK DATA TO UNIFIED INBOX');
console.log('=========================================');

async function syncWoodstockData() {
    const bridge = new DatabaseBridgeIntegration();
    
    try {
        console.log('1️⃣ Initializing database bridge...');
        await bridge.initialize();
        console.log('✅ Database bridge initialized');
        
        console.log('\n2️⃣ Running Woodstock conversations sync...');
        await bridge.syncWoodstockConversations();
        console.log('✅ Woodstock conversations sync completed');
        
        console.log('\n3️⃣ Checking unified tables after sync...');
        const conversations = await bridge.mainDb.query('SELECT COUNT(*) as count FROM unified_conversations WHERE source = \'woodstock\'');
        const messages = await bridge.mainDb.query('SELECT COUNT(*) as count FROM unified_messages WHERE source = \'woodstock\'');
        
        console.log(`✅ Synced data:`);
        console.log(`   - ${conversations.rows[0].count} Woodstock conversations`);
        console.log(`   - ${messages.rows[0].count} Woodstock messages`);
        
        if (conversations.rows[0].count > 0) {
            console.log('\n4️⃣ Sample synced conversation:');
            const sample = await bridge.mainDb.query(`
                SELECT * FROM unified_conversations 
                WHERE source = 'woodstock' 
                ORDER BY updated_at DESC 
                LIMIT 1
            `);
            
            if (sample.rows.length > 0) {
                const conv = sample.rows[0];
                console.log(`   ID: ${conv.conversation_id}`);
                console.log(`   Customer: ${conv.customer_name}`);
                console.log(`   Phone: ${conv.customer_phone}`);
                console.log(`   Last message: ${conv.last_message_content?.substring(0, 50)}...`);
                console.log(`   Updated: ${conv.updated_at}`);
            }
        }
        
        console.log('\n5️⃣ Testing getUnifiedConversations function...');
        const unifiedResults = await bridge.getUnifiedConversations(null, 5, 0);
        console.log(`✅ getUnifiedConversations returned ${unifiedResults.length} conversations`);
        
        const woodstockConvs = unifiedResults.filter(c => c.conversation_id.startsWith('woodstock_'));
        console.log(`🌲 ${woodstockConvs.length} Woodstock conversations in results`);
        
        if (woodstockConvs.length > 0) {
            console.log('\n📝 Sample unified conversation format:');
            const sample = woodstockConvs[0];
            console.log(`   Display Name: ${sample.display_name}`);
            console.log(`   Conversation ID: ${sample.conversation_id}`);
            console.log(`   Platform: ${sample._platform}`);
            console.log(`   Last Message: ${sample.last_message_content}`);
            console.log(`   Avatar URL: ${sample.avatar_url}`);
        }
        
        // Cleanup
        await bridge.woodstockDb.end();
        await bridge.mainDb.end();
        
        console.log('\n🎉 SYNC COMPLETED SUCCESSFULLY!');
        console.log('🚀 Unified endpoint should now return Woodstock conversations');
        
        return { success: true, woodstockConversations: conversations.rows[0].count };
        
    } catch (error) {
        console.error('\n❌ SYNC FAILED:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
        
        try {
            await bridge.woodstockDb?.end();
            await bridge.mainDb?.end();
        } catch (e) {
            console.log('⚠️  Cleanup warning:', e.message);
        }
        
        return { success: false, error: error.message };
    }
}

syncWoodstockData()
    .then(result => {
        if (result.success) {
            console.log('\n🏆 SYNC RESULT: SUCCESS!');
            console.log(`✅ ${result.woodstockConversations} Woodstock conversations ready`);
            console.log('\n🧪 NEXT STEP: Test the unified endpoint:');
            console.log('   curl "http://localhost:3001/api/inbox/conversations?platform=all"');
            process.exit(0);
        } else {
            console.log('\n💥 SYNC RESULT: FAILED');
            console.log(`❌ Error: ${result.error}`);
            process.exit(1);
        }
    });

