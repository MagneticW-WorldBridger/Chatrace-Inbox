#!/usr/bin/env node

// Test just the Woodstock database connection
import pg from 'pg';

console.log('🌲 TESTING WOODSTOCK DATABASE CONNECTION');
console.log('======================================');

async function testWoodstockConnection() {
    // Test with exact credentials from tech report
    const client = new pg.Client({
        host: 'ep-weathered-dream-adbza7xj-pooler.c-2.us-east-1.aws.neon.tech',
        database: 'neondb',
        user: 'neondb_owner', 
        password: 'npg_THMlQu6ZWmD4',
        ssl: { rejectUnauthorized: false },
        port: 5432
    });

    try {
        console.log('🔗 Attempting connection to Woodstock database...');
        console.log('   Host: ep-weathered-dream-adbza7xj-pooler.c-2.us-east-1.aws.neon.tech');
        console.log('   User: neondb_owner');
        console.log('   Database: neondb');
        
        await client.connect();
        console.log('✅ Connected successfully!');
        
        // Test basic query
        const result = await client.query('SELECT NOW() as current_time');
        console.log('✅ Test query successful');
        console.log(`   Current time: ${result.rows[0].current_time}`);
        
        // Check for conversations table
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name IN ('chatbot_conversations', 'chatbot_messages')
        `);
        
        console.log(`✅ Found ${tables.rows.length}/2 expected tables:`);
        tables.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });
        
        if (tables.rows.length === 2) {
            // Count conversations
            const conversations = await client.query('SELECT COUNT(*) as count FROM chatbot_conversations');
            const messages = await client.query('SELECT COUNT(*) as count FROM chatbot_messages');
            
            console.log(`✅ Data found:`);
            console.log(`   - ${conversations.rows[0].count} conversations`);
            console.log(`   - ${messages.rows[0].count} messages`);
            
            if (conversations.rows[0].count > 0) {
                console.log('\n🎉 WOODSTOCK DATABASE IS ACCESSIBLE AND HAS DATA!');
                return { success: true, conversations: conversations.rows[0].count };
            } else {
                console.log('\n⚠️  Database accessible but no conversation data');
                return { success: false, error: 'No conversation data' };
            }
        } else {
            console.log('\n❌ Missing expected tables');
            return { success: false, error: 'Missing tables' };
        }
        
    } catch (error) {
        console.error('\n❌ CONNECTION FAILED:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code}`);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n🚨 CONNECTION REFUSED - Possible causes:');
            console.error('   1. Network firewall blocking connection');
            console.error('   2. Database server down');  
            console.error('   3. Wrong host/port');
            console.error('   4. VPN/proxy needed');
        } else if (error.code === 'ENOTFOUND') {
            console.error('\n🚨 HOST NOT FOUND - DNS resolution failed');
        } else if (error.code === '28P01') {
            console.error('\n🚨 AUTHENTICATION FAILED - Wrong credentials'); 
        }
        
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

testWoodstockConnection()
    .then(result => {
        if (result.success) {
            console.log('\n🎯 RESULT: Woodstock database is accessible!');
            console.log('🚀 The unified endpoint should work now');
            process.exit(0);
        } else {
            console.log('\n💥 RESULT: Cannot access Woodstock database');
            console.log(`❌ Error: ${result.error}`);
            console.log('\n🔧 SOLUTIONS:');
            console.log('1. Check network connection');
            console.log('2. Try from different network/VPN');
            console.log('3. Verify credentials with Woodstock team');
            process.exit(1);
        }
    });

