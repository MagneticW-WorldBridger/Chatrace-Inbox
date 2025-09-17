#!/usr/bin/env node

// Debug which database connection is failing in the bridge
import pg from 'pg';
import { config } from 'dotenv';

config();

console.log('🔍 DEBUGGING DATABASE BRIDGE CONNECTIONS');
console.log('======================================');

async function debugBridgeConnections() {
    console.log('\n1️⃣ Testing Woodstock connection independently...');
    const woodstockDb = new pg.Client({
        host: 'ep-weathered-dream-adbza7xj-pooler.c-2.us-east-1.aws.neon.tech',
        database: 'neondb',
        user: 'neondb_owner',
        password: 'npg_THMlQu6ZWmD4',
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        await woodstockDb.connect();
        console.log('✅ Woodstock database connected');
        await woodstockDb.query('SELECT 1');
        console.log('✅ Woodstock database query works');
        await woodstockDb.end();
        console.log('✅ Woodstock database disconnected');
    } catch (error) {
        console.error('❌ Woodstock database failed:', error.message);
        return false;
    }
    
    console.log('\n2️⃣ Testing main database connection independently...');
    const mainDb = new pg.Client({
        connectionString: process.env.DATABASE_URL
    });
    
    try {
        await mainDb.connect();
        console.log('✅ Main database connected');
        await mainDb.query('SELECT 1');
        console.log('✅ Main database query works');
        await mainDb.end();
        console.log('✅ Main database disconnected');
    } catch (error) {
        console.error('❌ Main database failed:', error.message);
        return false;
    }
    
    console.log('\n3️⃣ Testing both connections simultaneously (like bridge does)...');
    const woodstockDb2 = new pg.Client({
        host: 'ep-weathered-dream-adbza7xj-pooler.c-2.us-east-1.aws.neon.tech',
        database: 'neondb',
        user: 'neondb_owner',
        password: 'npg_THMlQu6ZWmD4',
        ssl: { rejectUnauthorized: false }
    });
    
    const mainDb2 = new pg.Client({
        connectionString: process.env.DATABASE_URL
    });
    
    try {
        console.log('🔗 Connecting to both databases with Promise.all...');
        await Promise.all([
            woodstockDb2.connect(),
            mainDb2.connect()
        ]);
        console.log('✅ Both databases connected simultaneously');
        
        console.log('🧪 Testing queries on both...');
        await Promise.all([
            woodstockDb2.query('SELECT COUNT(*) as count FROM chatbot_conversations LIMIT 1'),
            mainDb2.query('SELECT 1')
        ]);
        console.log('✅ Both database queries work');
        
        await woodstockDb2.end();
        await mainDb2.end();
        console.log('✅ Both databases disconnected');
        
        return true;
        
    } catch (error) {
        console.error('❌ Simultaneous connection failed:', error.message);
        console.error('❌ Error code:', error.code);
        
        try {
            await woodstockDb2.end();
            await mainDb2.end();
        } catch (e) {
            console.log('⚠️  Cleanup error:', e.message);
        }
        
        return false;
    }
}

debugBridgeConnections()
    .then(success => {
        if (success) {
            console.log('\n🎉 ALL CONNECTION TESTS PASSED!');
            console.log('✅ Database bridge should work');
        } else {
            console.log('\n💥 CONNECTION TEST FAILED!');
            console.log('❌ Database bridge has connection issues');
        }
        process.exit(success ? 0 : 1);
    });

