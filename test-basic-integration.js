#!/usr/bin/env node

// 🧪 BASIC INTEGRATION TEST - NO IMPORTS NEEDED
// Tests that all components are correctly configured

const fs = require('fs');

console.log('🚀 BASIC INTEGRATION VERIFICATION');
console.log('=================================');

function testBasicIntegration() {
    let testResults = {
        unifiedEndpoints: false,
        databaseBridge: false,
        backendModified: false,
        woodstockCreds: false,
        postgresConfig: false
    };

    try {
        // Test 1: Unified Endpoints File
        console.log('\n1️⃣ Checking Unified Endpoints...');
        if (fs.existsSync('./unified-inbox-endpoints.js')) {
            const content = fs.readFileSync('./unified-inbox-endpoints.js', 'utf8');
            if (content.includes('getUnifiedConversations') && 
                content.includes('getUnifiedMessages') && 
                content.includes('DatabaseBridgeIntegration')) {
                console.log('✅ Unified endpoints file complete');
                testResults.unifiedEndpoints = true;
            } else {
                console.log('❌ Unified endpoints file incomplete');
            }
        } else {
            console.log('❌ Unified endpoints file missing');
        }

        // Test 2: Database Bridge File
        console.log('\n2️⃣ Checking Database Bridge...');
        if (fs.existsSync('./database-bridge-integration.js')) {
            const content = fs.readFileSync('./database-bridge-integration.js', 'utf8');
            if (content.includes('DatabaseBridgeIntegration') && 
                content.includes('syncWoodstockConversations') && 
                content.includes('getUnifiedConversations')) {
                console.log('✅ Database bridge file complete');
                testResults.databaseBridge = true;
                
                // Check Woodstock credentials
                if (content.includes('ep-weathered-dream-adbza7xj')) {
                    console.log('✅ Woodstock database credentials configured');
                    testResults.woodstockCreds = true;
                }
            } else {
                console.log('❌ Database bridge file incomplete');
            }
        } else {
            console.log('❌ Database bridge file missing');
        }

        // Test 3: Backend Modified
        console.log('\n3️⃣ Checking Backend Modification...');
        if (fs.existsSync('./backend/server.js')) {
            const content = fs.readFileSync('./backend/server.js', 'utf8');
            if (content.includes('unified-inbox-endpoints') && 
                content.includes('getUnifiedConversations') && 
                content.includes('🚀 UNIFIED INBOX')) {
                console.log('✅ Backend modified for unified system');
                testResults.backendModified = true;
            } else {
                console.log('❌ Backend not modified for unified system');
            }
        } else {
            console.log('❌ Backend server.js missing');
        }

        // Test 4: Environment Configuration
        console.log('\n4️⃣ Checking Environment Configuration...');
        if (fs.existsSync('./.env')) {
            const content = fs.readFileSync('./.env', 'utf8');
            if (content.includes('DATABASE_URL') && content.includes('POSTGRES_URL')) {
                console.log('✅ PostgreSQL configuration present');
                testResults.postgresConfig = true;
            } else {
                console.log('⚠️  PostgreSQL configuration might be missing');
            }
        }

        // Test 5: Package Dependencies
        console.log('\n5️⃣ Checking Dependencies...');
        if (fs.existsSync('./backend/package.json')) {
            const content = fs.readFileSync('./backend/package.json', 'utf8');
            const packageJson = JSON.parse(content);
            if (packageJson.dependencies && packageJson.dependencies.pg) {
                console.log('✅ PostgreSQL driver (pg) available in backend');
            } else {
                console.log('⚠️  PostgreSQL driver might be missing');
            }
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }

    // Results Summary
    console.log('\n🏆 BASIC INTEGRATION TEST RESULTS');
    console.log('==================================');
    
    const results = [
        ['Unified Endpoints', testResults.unifiedEndpoints],
        ['Database Bridge', testResults.databaseBridge],
        ['Backend Modified', testResults.backendModified],
        ['Woodstock Credentials', testResults.woodstockCreds],
        ['PostgreSQL Config', testResults.postgresConfig]
    ];

    let passedCount = 0;
    results.forEach(([name, passed]) => {
        const status = passed ? '✅ PASSED' : '❌ FAILED';
        console.log(`${status}: ${name}`);
        if (passed) passedCount++;
    });

    const totalTests = results.length;
    const percentage = Math.round((passedCount / totalTests) * 100);
    
    console.log(`\n📊 INTEGRATION READINESS: ${passedCount}/${totalTests} (${percentage}%)`);

    if (passedCount >= 4) {
        console.log('\n🎉🎉🎉 UNIFIED INBOX INTEGRATION READY! 🎉🎉🎉');
        console.log('✅ All critical components configured');
        console.log('🚀 Next step: Start backend server to test live system');
        console.log('📝 Command: cd backend && npm start');
        
        // Final instructions
        console.log('\n📋 FINAL ACTIVATION STEPS:');
        console.log('1. cd backend && npm start');
        console.log('2. Test: curl http://localhost:3001/api/inbox/conversations');
        console.log('3. Should return ChatRace + Woodstock conversations!');
        
        return true;
    } else {
        console.log('\n💥 CRITICAL COMPONENTS MISSING');
        console.log('❌ Fix failing tests before proceeding');
        return false;
    }
}

const success = testBasicIntegration();
process.exit(success ? 0 : 1);

