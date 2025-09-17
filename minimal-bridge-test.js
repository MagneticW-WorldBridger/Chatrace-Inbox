#!/usr/bin/env node

// Minimal version of DatabaseBridgeIntegration to isolate the issue
import pg from 'pg';
import { config } from 'dotenv';

config();

console.log('🔬 MINIMAL BRIDGE TEST');
console.log('=====================');

class MinimalBridge {
    constructor() {
        this.woodstockDb = null;
        this.mainDb = null;
    }
    
    async initialize() {
        console.log('🔗 Creating Woodstock client...');
        this.woodstockDb = new pg.Client({
            host: 'ep-weathered-dream-adbza7xj-pooler.c-2.us-east-1.aws.neon.tech',
            database: 'neondb',
            user: 'neondb_owner',
            password: 'npg_THMlQu6ZWmD4',
            ssl: { rejectUnauthorized: false }
        });
        console.log('✅ Woodstock client created');
        
        console.log('🔗 Creating main DB client...');
        this.mainDb = new pg.Client({
            connectionString: process.env.DATABASE_URL
        });
        console.log('✅ Main DB client created');
        
        console.log('🔗 Connecting to databases...');
        try {
            await Promise.all([
                this.woodstockDb.connect(),
                this.mainDb.connect()
            ]);
            console.log('✅ Both databases connected');
        } catch (error) {
            console.error('❌ Connection failed:', error.message);
            console.error('❌ Error code:', error.code);
            throw error;
        }
        
        console.log('✅ Database connections established');
    }
    
    async testQueries() {
        console.log('🧪 Testing Woodstock query...');
        const woodstockResult = await this.woodstockDb.query('SELECT COUNT(*) as count FROM chatbot_conversations');
        console.log(`✅ Woodstock: ${woodstockResult.rows[0].count} conversations`);
        
        console.log('🧪 Testing main DB query...');
        const mainResult = await this.mainDb.query('SELECT 1 as test');
        console.log(`✅ Main DB: Query returned ${mainResult.rows[0].test}`);
    }
    
    async cleanup() {
        await this.woodstockDb?.end();
        await this.mainDb?.end();
        console.log('🧹 Connections closed');
    }
}

async function testMinimalBridge() {
    const bridge = new MinimalBridge();
    
    try {
        await bridge.initialize();
        await bridge.testQueries();
        await bridge.cleanup();
        
        console.log('\n🎉 MINIMAL BRIDGE TEST PASSED!');
        console.log('✅ The issue is NOT in basic bridge structure');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ MINIMAL BRIDGE TEST FAILED:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code}`);
        
        await bridge.cleanup();
        return false;
    }
}

testMinimalBridge()
    .then(success => {
        if (success) {
            console.log('\n🔍 NEXT: Check what\'s different in DatabaseBridgeIntegration class');
        } else {
            console.log('\n🚨 FOUND THE ISSUE: Basic bridge structure failing');
        }
        process.exit(success ? 0 : 1);
    });

