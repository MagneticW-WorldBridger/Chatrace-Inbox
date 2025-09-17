#!/usr/bin/env node

// Test if the createUnifiedTables method is causing the issue
import pg from 'pg';
import { config } from 'dotenv';

config();

console.log('🗃️ TESTING UNIFIED TABLES CREATION');
console.log('=================================');

async function testTableCreation() {
    const mainDb = new pg.Client({
        connectionString: process.env.DATABASE_URL
    });
    
    try {
        await mainDb.connect();
        console.log('✅ Connected to main database');
        
        console.log('🏗️ Creating unified_conversations table...');
        await mainDb.query(`
          CREATE TABLE IF NOT EXISTS unified_conversations (
            id SERIAL PRIMARY KEY,
            conversation_id TEXT UNIQUE NOT NULL,
            source TEXT NOT NULL, -- 'woodstock', 'vapi', 'chatrace'
            customer_name TEXT,
            customer_phone TEXT,
            customer_email TEXT,
            last_message_content TEXT,
            last_message_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            metadata JSONB DEFAULT '{}'
          );
        `);
        console.log('✅ unified_conversations table created');
        
        console.log('🏗️ Creating unified_messages table...');
        await mainDb.query(`
          CREATE TABLE IF NOT EXISTS unified_messages (
            id SERIAL PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            message_content TEXT NOT NULL,
            message_role TEXT NOT NULL, -- 'user', 'assistant'
            created_at TIMESTAMP NOT NULL,
            source TEXT NOT NULL,
            function_data JSONB DEFAULT '{}',
            FOREIGN KEY (conversation_id) REFERENCES unified_conversations(conversation_id)
          );
        `);
        console.log('✅ unified_messages table created');
        
        console.log('🏗️ Creating indexes...');
        await mainDb.query(`
          CREATE INDEX IF NOT EXISTS idx_unified_conversations_source ON unified_conversations(source);
          CREATE INDEX IF NOT EXISTS idx_unified_conversations_updated ON unified_conversations(updated_at);
          CREATE INDEX IF NOT EXISTS idx_unified_messages_conversation ON unified_messages(conversation_id);
        `);
        console.log('✅ Indexes created');
        
        console.log('🧪 Testing table access...');
        const result = await mainDb.query('SELECT COUNT(*) as count FROM unified_conversations');
        console.log(`✅ Table access works: ${result.rows[0].count} conversations`);
        
        await mainDb.end();
        
        console.log('\n🎉 TABLE CREATION TEST PASSED!');
        return true;
        
    } catch (error) {
        console.error('\n❌ TABLE CREATION FAILED:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code}`);
        
        await mainDb.end();
        return false;
    }
}

testTableCreation()
    .then(success => {
        if (success) {
            console.log('✅ Table creation is not the issue');
            console.log('🔍 The problem must be elsewhere in DatabaseBridgeIntegration');
        } else {
            console.log('🚨 FOUND THE ISSUE: Table creation failing');
        }
        process.exit(success ? 0 : 1);
    });

