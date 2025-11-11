const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Determinar qué base de datos usar
function getDatabase() {
  // Si estamos en producción y tenemos DATABASE_URL, usar PostgreSQL
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    console.log('🚀 Usando PostgreSQL (Railway)');
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    return {
      all: (sql, params = []) => {
        console.log('📊 PostgreSQL Query:', sql, params);
        return pool.query(sql, params).then(result => result.rows);
      },
      run: (sql, params = []) => {
        console.log('💾 PostgreSQL Execute:', sql, params);
        return pool.query(sql, params).then(result => ({ 
          lastID: result.rows[0]?.id,
          changes: result.rowCount 
        }));
      },
      get: (sql, params = []) => {
        console.log('🔍 PostgreSQL Get:', sql, params);
        return pool.query(sql, params).then(result => result.rows[0] || null);
      }
    };
  } else {
    // Usar SQLite local en desarrollo
    console.log('💻 Usando SQLite local');
    const dbPath = path.join(process.cwd(), 'investigaciones.db');
    const db = new sqlite3.Database(dbPath);
    
    // Crear tablas si no existen
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS investigaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        estado TEXT DEFAULT 'abierto',
        fecha_creacion DATETIME DEFAULT (datetime('now', 'localtime'))
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS comentarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        investigacion_id INTEGER,
        contenido TEXT,
        fecha_creacion DATETIME DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY(investigacion_id) REFERENCES investigaciones(id)
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS archivos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        investigacion_id INTEGER,
        nombre_archivo TEXT NOT NULL,
        contenido_base64 TEXT NOT NULL,
        tipo_archivo TEXT NOT NULL,
        tamano INTEGER NOT NULL,
        fecha_creacion DATETIME DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY(investigacion_id) REFERENCES investigaciones(id)
      )`);
    });
    
    return {
      all: (sql, params = []) => new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      run: (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      }),
      get: (sql, params = []) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      })
    };
  }
}

const db = getDatabase();

// Exportar funciones compatibles
const dbAll = (sql, params) => db.all(sql, params);
const dbRun = (sql, params) => db.run(sql, params);
const dbGet = (sql, params) => db.get(sql, params);

module.exports = { dbAll, dbRun, dbGet };