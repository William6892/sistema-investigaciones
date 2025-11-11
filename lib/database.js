const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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

console.log('✅ Base de datos SQLite conectada en:', dbPath);

// Función helper para convertir callbacks a Promises
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

module.exports = { dbAll, dbRun, dbGet };