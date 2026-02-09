const { Pool } = require('pg');

let pool;

function getPool() {
  if (pool) return pool;
  const connectionString =
    process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('Missing DATABASE_URL_POOLED or DATABASE_URL environment variable.');
  }

  pool = new Pool({
    connectionString,
    max: 5,
    ssl: connectionString.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : undefined,
  });

  return pool;
}

async function query(text, params) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

module.exports = {
  query,
};
