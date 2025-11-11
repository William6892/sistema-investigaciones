const { dbAll, dbRun, dbGet } = require('../../lib/database');

export default async function handler(req, res) {
  // 🔥 CORS HEADERS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id, investigacion_id } = req.query;

  try {
    if (req.method === 'POST') {
      const { investigacion_id, contenido } = req.body;
      
      const result = await dbRun(
        'INSERT INTO comentarios (investigacion_id, contenido) VALUES ($1, $2)',
        [investigacion_id, contenido]
      );
      
      // Obtener el comentario creado
      const comentarioCreado = await dbGet(
        'SELECT * FROM comentarios WHERE id = $1',
        [result.lastID]
      );
      
      res.json(comentarioCreado);
    }

    else if (req.method === 'GET') {
      const comentarios = await dbAll(
        'SELECT * FROM comentarios WHERE investigacion_id = $1 ORDER BY fecha_creacion DESC',
        [investigacion_id]
      );
      
      res.json(comentarios);
    }

    else if (req.method === 'DELETE') {
      await dbRun('DELETE FROM comentarios WHERE id = $1', [id]);
      res.json({ message: 'Comentario eliminado', id });
    }

    else if (req.method === 'PUT') {
      const { contenido } = req.body;
      
      await dbRun(
        'UPDATE comentarios SET contenido = $1 WHERE id = $2',
        [contenido, id]
      );
      
      // Obtener el comentario actualizado
      const comentarioActualizado = await dbGet(
        'SELECT * FROM comentarios WHERE id = $1',
        [id]
      );
      
      res.json(comentarioActualizado);
    }

    else {
      res.status(405).json({ error: 'Método no permitido' });
    }
    
  } catch (error) {
    console.error('Error en API comentarios:', error);
    res.status(500).json({ error: error.message });
  }
}