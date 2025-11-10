const db = require('../../lib/database');

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { investigacion_id, contenido } = req.body;
    
    db.run(
      'INSERT INTO comentarios (investigacion_id, contenido) VALUES (?, ?)',
      [investigacion_id, contenido],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ 
          id: this.lastID, 
          investigacion_id, 
          contenido,
          fecha_creacion: new Date().toISOString()
        });
      }
    );
  }

  if (req.method === 'GET') {
    const { investigacion_id } = req.query;
    
    db.all(
      'SELECT * FROM comentarios WHERE investigacion_id = ? ORDER BY fecha_creacion DESC',
      [investigacion_id],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      }
    );
  }

  // NUEVO: Método para eliminar comentario
  if (req.method === 'DELETE') {
    const { id } = req.query;
    
    db.run(
      'DELETE FROM comentarios WHERE id = ?',
      [id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Comentario eliminado', id });
      }
    );
  }

  // NUEVO: Método para editar comentario
  if (req.method === 'PUT') {
    const { id } = req.query;
    const { contenido } = req.body;
    
    db.run(
      'UPDATE comentarios SET contenido = ? WHERE id = ?',
      [contenido, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Comentario actualizado', id, contenido });
      }
    );
  }
}