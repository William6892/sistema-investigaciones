const { Pool } = require('pg');

async function initDatabase() {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_WOknPUr39ldg@ep-quiet-pond-a4ah8pjw-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: true
  });

  try {
    console.log('🔄 Creando tablas en Neon...');

    // Tabla investigaciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS investigaciones (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        estado TEXT DEFAULT 'abierto',
        fecha_creacion TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabla investigaciones creada');

    // Tabla comentarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        investigacion_id INTEGER REFERENCES investigaciones(id),
        contenido TEXT,
        fecha_creacion TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabla comentarios creada');

    // Tabla archivos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS archivos (
        id SERIAL PRIMARY KEY,
        investigacion_id INTEGER REFERENCES investigaciones(id),
        nombre_archivo TEXT NOT NULL,
        contenido_base64 TEXT NOT NULL,
        tipo_archivo TEXT NOT NULL,
        tamano INTEGER NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabla archivos creada');

    // Datos de ejemplo
    const result = await pool.query('SELECT COUNT(*) as count FROM investigaciones');
    if (parseInt(result.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO investigaciones (titulo, descripcion, estado) 
        VALUES ('Investigación de Ejemplo', 'Sistema funcionando con PostgreSQL', 'abierto')
      `);
      console.log('✅ Datos de ejemplo insertados');
    }

    console.log('🎉 Base de datos configurada correctamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

initDatabase();