#!/usr/bin/env node

// WORKING Database Bridge - Based on successful tests
import pg from 'pg';
import { config } from 'dotenv';

config();

class WorkingDatabaseBridge {
    constructor() {
        this.woodstockDb = null;
        this.mainDb = null;
    }
    
    async initialize() {
        console.log('🔗 Initializing working database bridge...');
        
        this.woodstockDb = new pg.Client({
            host: 'ep-weathered-dream-adbza7xj-pooler.c-2.us-east-1.aws.neon.tech',
            database: 'neondb',
            user: 'neondb_owner',
            password: 'npg_THMlQu6ZWmD4',
            ssl: { rejectUnauthorized: false }
        });
        
        this.mainDb = new pg.Client({
            connectionString: process.env.DATABASE_URL
        });
        
        await Promise.all([
            this.woodstockDb.connect(),
            this.mainDb.connect()
        ]);
        
        console.log('✅ Database connections established');
        
        // Create unified tables
        await this.createUnifiedTables();
    }
    
    async createUnifiedTables() {
        await this.mainDb.query(`
          CREATE TABLE IF NOT EXISTS unified_conversations (
            id SERIAL PRIMARY KEY,
            conversation_id TEXT UNIQUE NOT NULL,
            source TEXT NOT NULL,
            customer_name TEXT,
            customer_phone TEXT,
            customer_email TEXT,
            last_message_content TEXT,
            last_message_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            metadata JSONB DEFAULT '{}'
          );
          
          CREATE TABLE IF NOT EXISTS unified_messages (
            id SERIAL PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            message_content TEXT NOT NULL,
            message_role TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL,
            source TEXT NOT NULL,
            function_data JSONB DEFAULT '{}'
          );
          
          CREATE INDEX IF NOT EXISTS idx_unified_conversations_source ON unified_conversations(source);
          CREATE INDEX IF NOT EXISTS idx_unified_conversations_updated ON unified_conversations(updated_at);
          CREATE INDEX IF NOT EXISTS idx_unified_messages_conversation ON unified_messages(conversation_id);
        `);
        
        console.log('✅ Unified tables created/verified');
    }
    
    async syncWoodstockConversations() {
        console.log('🌲 Syncing Woodstock conversations...');
        
        // Get recent conversations from Woodstock
        const conversations = await this.woodstockDb.query(`
            SELECT 
                conversation_id,
                user_identifier,
                platform_type,
                conversation_started_at,
                last_message_at,
                is_active
            FROM chatbot_conversations 
            WHERE is_active = true
            AND last_message_at > NOW() - INTERVAL '30 days'
            ORDER BY last_message_at DESC
            LIMIT 50
        `);
        
        console.log(`📊 Found ${conversations.rows.length} Woodstock conversations`);
        
        for (const conv of conversations.rows) {
            // Get last message for this conversation
            const lastMessage = await this.woodstockDb.query(`
                SELECT message_content, message_role
                FROM chatbot_messages 
                WHERE conversation_id = $1
                ORDER BY message_created_at DESC
                LIMIT 1
            `, [conv.conversation_id]);
            
            const lastMessageContent = lastMessage.rows.length > 0 ? 
                lastMessage.rows[0].message_content : 'No messages';
            
            // Upsert into unified table
            await this.mainDb.query(`
                INSERT INTO unified_conversations (
                    conversation_id, source, customer_name, customer_phone, customer_email,
                    last_message_content, last_message_at, updated_at, metadata
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (conversation_id) DO UPDATE SET
                    customer_name = EXCLUDED.customer_name,
                    last_message_content = EXCLUDED.last_message_content,
                    last_message_at = EXCLUDED.last_message_at,
                    updated_at = EXCLUDED.updated_at,
                    metadata = EXCLUDED.metadata
            `, [
                `woodstock_${conv.conversation_id}`,
                'woodstock',
                `AI Customer ${conv.user_identifier}`,
                conv.user_identifier.includes('@') ? '' : conv.user_identifier, // phone if not email
                conv.user_identifier.includes('@') ? conv.user_identifier : '', // email if contains @
                lastMessageContent,
                conv.last_message_at,
                new Date(),
                JSON.stringify({
                    original_id: conv.conversation_id,
                    platform_type: conv.platform_type,
                    started_at: conv.conversation_started_at
                })
            ]);
            
            // Sync recent messages
            await this.syncConversationMessages(conv.conversation_id);
        }
        
        console.log(`✅ Synced ${conversations.rows.length} Woodstock conversations`);
    }
    
    async syncConversationMessages(conversationId) {
        // Get recent messages
        const messages = await this.woodstockDb.query(`
            SELECT 
                message_content,
                message_role,
                message_created_at,
                executed_function_name,
                function_input_parameters,
                function_output_result
            FROM chatbot_messages 
            WHERE conversation_id = $1
            AND message_created_at > NOW() - INTERVAL '7 days'
            ORDER BY message_created_at ASC
            LIMIT 20
        `, [conversationId]);
        
        const unifiedConversationId = `woodstock_${conversationId}`;
        
        // Clear existing messages for this conversation
        await this.mainDb.query(`
            DELETE FROM unified_messages WHERE conversation_id = $1
        `, [unifiedConversationId]);
        
        // Insert messages
        for (const message of messages.rows) {
            const functionData = {};
            if (message.executed_function_name) {
                functionData.function_name = message.executed_function_name;
                functionData.input_parameters = message.function_input_parameters;
                functionData.output_result = message.function_output_result;
            }
            
            await this.mainDb.query(`
                INSERT INTO unified_messages (
                    conversation_id, message_content, message_role, created_at, source, function_data
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                unifiedConversationId,
                message.message_content,
                message.message_role,
                message.message_created_at,
                'woodstock',
                JSON.stringify(functionData)
            ]);
        }
    }
    
    async getUnifiedConversations(platform = null, limit = 50, offset = 0) {
        let query = `
            SELECT 
                conversation_id,
                source,
                customer_name,
                customer_phone,
                customer_email,
                last_message_content,
                last_message_at,
                created_at,
                metadata
            FROM unified_conversations
        `;
        
        const params = [];
        
        if (platform && platform !== 'all') {
            // Map platform to correct source values
            if (platform === 'webchat') {
                // Webchat should show ALL webchat-based conversations: Woodstock, ChatRace, AND Rural King SMS
                console.log('🔍 WEBCHAT FILTER: Including woodstock, chatrace, vapi_rural');
                query += ` WHERE source IN ('woodstock', 'chatrace', 'vapi_rural')`;
            } else {
                console.log(`🔍 OTHER PLATFORM FILTER: ${platform} → source = ${platform}`);
                query += ` WHERE source = $${params.length + 1}`;
                params.push(platform);
            }
        } else {
            console.log('🔍 NO PLATFORM FILTER: Getting all conversations');
        }
        
        query += ` ORDER BY last_message_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
        
        const result = await this.mainDb.query(query, params);
        
        // Transform to inbox format
        return result.rows.map(row => ({
            conversation_id: row.conversation_id,
            display_name: `🌲 ${row.customer_name || 'Woodstock Customer'}`,
            username: row.customer_name || 'Woodstock Customer',
            user_identifier: row.conversation_id,
            avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(row.conversation_id)}`,
            last_message_at: row.last_message_at,
            last_message_content: row.last_message_content,
            _platform: 'Woodstock',
            hash: '',
            channel: '9',
            source: 'woodstock',
            metadata: row.metadata
        }));
    }
    
    async getUnifiedMessages(conversationId, limit = 50) {
        const query = `
            SELECT 
                message_content,
                message_role,
                created_at,
                function_data
            FROM unified_messages
            WHERE conversation_id = $1
            ORDER BY created_at ASC
            LIMIT $2
        `;
        
        const result = await this.mainDb.query(query, [conversationId, limit]);
        
        return result.rows.map(row => ({
            id: Date.now().toString() + Math.random(),
            message_content: row.message_content,
            message_role: row.message_role,
            message_created_at: row.created_at,
            function_data: row.function_data || {},
            // Ensure VAPI call metadata is preserved
            function_execution_status: 'read',
            source: conversationId.startsWith('vapi_') ? 'vapi' : 
                   conversationId.startsWith('woodstock_') ? 'woodstock' : 'unified'
        }));
    }

    async runSync() {
        // Compatibility method for unified-inbox-endpoints.js
        console.log('🔄 Starting unified conversation sync...');
        await this.syncWoodstockConversations();
        console.log('✅ Unified sync completed');
    }

    async cleanup() {
        await this.woodstockDb?.end();
        await this.mainDb?.end();
        console.log('🧹 Database connections closed');
    }
}

async function runWorkingSync() {
    const bridge = new WorkingDatabaseBridge();
    
    try {
        await bridge.initialize();
        await bridge.syncWoodstockConversations();
        
        // Test the unified conversations
        const unifiedConvs = await bridge.getUnifiedConversations(null, 5, 0);
        console.log(`\n🎉 SUCCESS! ${unifiedConvs.length} unified conversations ready:`);
        
        unifiedConvs.forEach((conv, i) => {
            console.log(`   ${i + 1}. ${conv.display_name} (${conv.conversation_id})`);
            console.log(`      Last: ${conv.last_message_content?.substring(0, 50)}...`);
        });
        
        await bridge.cleanup();
        
        console.log('\n🚀 WORKING SYNC COMPLETED!');
        console.log('✅ Unified endpoint should now return Woodstock conversations');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ WORKING SYNC FAILED:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
        
        await bridge.cleanup();
        return false;
    }
}

// Export the class for use in other modules
export { WorkingDatabaseBridge };

// Only run sync if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🚀 RUNNING WORKING DATABASE SYNC');
    console.log('===============================');

    runWorkingSync()
        .then(success => {
            process.exit(success ? 0 : 1);
        });
}

