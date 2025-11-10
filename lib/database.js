// SOLO para probar - reemplaza TODO el contenido con:
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'investigaciones.db');
const db = new sqlite3.Database(dbPath);

// Crear tablas SQLite
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
});

console.log('✅ Conectado a SQLite temporal');
module.exports = db;