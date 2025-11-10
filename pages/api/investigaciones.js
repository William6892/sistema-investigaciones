const pool = require('../../lib/database');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT i.*, 
          COUNT(DISTINCT c.id) as num_comentarios,
          COUNT(DISTINCT a.id) as num_archivos
        FROM investigaciones i
        LEFT JOIN comentarios c ON i.id = c.investigacion_id
        LEFT JOIN archivos a ON i.id = a.investigacion_id
        GROUP BY i.id
        ORDER BY i.fecha_creacion DESC
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { titulo, descripcion } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO investigaciones (titulo, descripcion) VALUES ($1, $2) RETURNING *',
        [titulo, descripcion]
      );
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    
    if (id) {
      // Editar título/descripción
      const { titulo, descripcion } = req.body;
      try {
        // Verificar si está cerrada
        const invResult = await pool.query(
          'SELECT estado FROM investigaciones WHERE id = $1',
          [id]
        );
        
        if (invResult.rows.length === 0) {
          return res.status(404).json({ error: 'Investigación no encontrada' });
        }
        
        if (invResult.rows[0].estado === 'cerrado') {
          return res.status(400).json({ error: 'No se puede editar una investigación cerrada' });
        }
        
        // Actualizar
        const result = await pool.query(
          'UPDATE investigaciones SET titulo = $1, descripcion = $2 WHERE id = $3 RETURNING *',
          [titulo, descripcion, id]
        );
        res.json(result.rows[0]);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      // Cambiar estado (compatibilidad)
      const { id, estado } = req.body;
      try {
        await pool.query(
          'UPDATE investigaciones SET estado = $1 WHERE id = $2',
          [estado, id]
        );
        res.json({ message: 'Estado actualizado' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  }
}