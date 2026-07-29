const { Pool } = require('@neondatabase/serverless');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

async function initTable() {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS logins (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        code TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  } finally {
    client.release();
  }
}

module.exports = { getPool, initTable };
