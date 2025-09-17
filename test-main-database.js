#!/usr/bin/env node

import pg from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

console.log('🗄️ TESTING MAIN INBOX DATABASE CONNECTION');
console.log('========================================');

async function testMainDatabase() {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL not found in environment');
        return { success: false, error: 'Missing DATABASE_URL' };
    }
    
    console.log('📍 DATABASE_URL found (partial):', databaseUrl.substring(0, 50) + '...');
    
    const client = new pg.Client({
        connectionString: databaseUrl
    });

    try {
        console.log('🔗 Attempting connection to main database...');
        await client.connect();
        console.log('✅ Connected successfully!');
        
        // Test basic query
        const result = await client.query('SELECT NOW() as current_time');
        console.log('✅ Test query successful');
        console.log(`   Current time: ${result.rows[0].current_time}`);
        
        // Try to create unified tables (this is what the database bridge does)
        console.log('🏗️ Testing unified table creation...');
        
        await client.query(`
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
          )
        `);
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS unified_messages (
            id SERIAL PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            message_content TEXT NOT NULL,
            message_role TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL,
            source TEXT NOT NULL,
            function_data JSONB DEFAULT '{}'
          )
        `);
        
        console.log('✅ Unified tables created/verified');
        
        // Check if tables exist and count records
        const conversationsCount = await client.query('SELECT COUNT(*) as count FROM unified_conversations');
        const messagesCount = await client.query('SELECT COUNT(*) as count FROM unified_messages');
        
        console.log('📊 Current unified data:');
        console.log(`   - ${conversationsCount.rows[0].count} unified conversations`);
        console.log(`   - ${messagesCount.rows[0].count} unified messages`);
        
        return { 
            success: true, 
            conversations: conversationsCount.rows[0].count,
            messages: messagesCount.rows[0].count 
        };
        
    } catch (error) {
        console.error('\n❌ MAIN DATABASE FAILED:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code}`);
        
        return { success: false, error: error.message };
        
    } finally {
        try {
            await client.end();
            console.log('🔒 Connection closed');
        } catch (e) {
            console.log('⚠️  Cleanup warning:', e.message);
        }
    }
}

testMainDatabase()
    .then(result => {
        if (result.success) {
            console.log('\n🎯 RESULT: Main database is accessible!');
            console.log('✅ Unified tables ready');
            console.log('🚀 Database bridge should work now');
            process.exit(0);
        } else {
            console.log('\n💥 RESULT: Main database connection failed');
            console.log(`❌ Error: ${result.error}`);
            process.exit(1);
        }
    });

