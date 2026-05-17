const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectionString = process.env.POSTGREE_CONNECTION_STRING || process.env.DATABASE_URL || process.env.DATABASE_URL_CONNECTION || process.env.DATABASE_URL_CONNECTION_STRING;

const poolConfig = { 
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
  statement_timeout: 30000, // 30 seconds
};

if (connectionString && (
  connectionString.includes('sslmode=require') || 
  connectionString.includes('neon') || 
  (connectionString.includes('ssl=') || connectionString.includes('sslmode='))
)) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
