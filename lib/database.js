const { Pool } = require('pg');

// Configurar PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_WOknPUr39ldg@ep-quiet-pond-a4ah8pjw-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: true
});

// Funciones simples
const dbAll = (sql, params = []) => {
  return pool.query(sql, params).then(result => result.rows);
};

const dbRun = (sql, params = []) => {
  return pool.query(sql, params).then(result => ({ 
    lastID: result.rows[0]?.id,
    changes: result.rowCount 
  }));
};

const dbGet = (sql, params = []) => {
  return pool.query(sql, params).then(result => result.rows[0] || null);
};

module.exports = { dbAll, dbRun, dbGet };