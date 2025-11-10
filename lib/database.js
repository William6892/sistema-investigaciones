const { Pool } = require('pg');

// Configuración para desarrollo y producción
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://usuario:password@localhost/investigaciones',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Crear tablas si no existen
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS investigaciones (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        estado TEXT DEFAULT 'abierto',
        fecha_creacion TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        investigacion_id INTEGER REFERENCES investigaciones(id) ON DELETE CASCADE,
        contenido TEXT,
        fecha_creacion TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS archivos (
        id SERIAL PRIMARY KEY,
        investigacion_id INTEGER REFERENCES investigaciones(id) ON DELETE CASCADE,
        nombre_archivo TEXT,
        ruta TEXT,
        fecha_creacion TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Tablas de PostgreSQL listas');
  } catch (error) {
    console.error('Error inicializando BD:', error);
  }
}

initDB();

module.exports = pool;