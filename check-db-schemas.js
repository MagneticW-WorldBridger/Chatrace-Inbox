import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

console.log('🔍 CHECKING DATABASE SCHEMAS FOR OAUTH TOKENS');
console.log('='.repeat(70));

async function checkSchemas() {
  try {
    // Ver todas las tablas
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const tables = await pool.query(tablesQuery);
    console.log('\n📋 ALL TABLES:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Ver estructura de authorized_users
    console.log('\n🔍 AUTHORIZED_USERS TABLE SCHEMA:');
    const authUsersSchema = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'authorized_users'
      ORDER BY ordinal_position;
    `);
    
    if (authUsersSchema.rows.length > 0) {
      authUsersSchema.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } else {
      console.log('   ❌ Table not found');
    }
    
    // Buscar tablas con "token" en el nombre
    console.log('\n🔐 TABLES WITH "TOKEN" IN NAME:');
    const tokenTables = tables.rows.filter(r => r.table_name.includes('token'));
    if (tokenTables.length > 0) {
      tokenTables.forEach(row => console.log(`   ✓ ${row.table_name}`));
    } else {
      console.log('   ❌ No tables found with "token" in name');
    }
    
    // Buscar tablas con "oauth" en el nombre
    console.log('\n🔐 TABLES WITH "OAUTH" IN NAME:');
    const oauthTables = tables.rows.filter(r => r.table_name.includes('oauth'));
    if (oauthTables.length > 0) {
      oauthTables.forEach(row => console.log(`   ✓ ${row.table_name}`));
    } else {
      console.log('   ❌ No tables found with "oauth" in name');
    }
    
    // Buscar columnas con "token" en cualquier tabla
    console.log('\n🔍 COLUMNS WITH "TOKEN" OR "REFRESH":');
    const tokenColumns = await pool.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND (column_name LIKE '%token%' OR column_name LIKE '%refresh%')
      ORDER BY table_name, column_name;
    `);
    
    if (tokenColumns.rows.length > 0) {
      tokenColumns.rows.forEach(col => {
        console.log(`   ${col.table_name}.${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('   ❌ No columns found with "token" or "refresh"');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('💡 RECOMMENDATION:');
    console.log('   Need to create a table to store OAuth tokens:');
    console.log('   - google_oauth_tokens');
    console.log('   - with columns: user_email, access_token, refresh_token, etc.');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchemas();
