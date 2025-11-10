const pool = require('../../lib/database');

export default async function handler(req, res) {
  const { id, investigacion_id } = req.query;

  if (req.method === 'POST') {
    const { investigacion_id, contenido } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO comentarios (investigacion_id, contenido) VALUES ($1, $2) RETURNING *',
        [investigacion_id, contenido]
      );
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        'SELECT * FROM comentarios WHERE investigacion_id = $1 ORDER BY fecha_creacion DESC',
        [investigacion_id]
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM comentarios WHERE id = $1', [id]);
      res.json({ message: 'Comentario eliminado', id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PUT') {
    const { contenido } = req.body;
    try {
      const result = await pool.query(
        'UPDATE comentarios SET contenido = $1 WHERE id = $2 RETURNING *',
        [contenido, id]
      );
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}