/* eslint-disable @typescript-eslint/no-require-imports */
const { dbAll, dbRun, dbGet } = require('../../lib/database');

export default async function handler(req, res) {
  // 🔥 CORS HEADERS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      // Obtener todas las investigaciones
      const investigaciones = await dbAll(`
        SELECT i.*, 
          COUNT(DISTINCT c.id) as num_comentarios,
          COUNT(DISTINCT a.id) as num_archivos
        FROM investigaciones i
        LEFT JOIN comentarios c ON i.id = c.investigacion_id
        LEFT JOIN archivos a ON i.id = a.investigacion_id
        GROUP BY i.id
        ORDER BY i.fecha_creacion DESC
      `);
      
      res.json(investigaciones);
    }

    else if (req.method === 'POST') {
      // Crear nueva investigación
      const { titulo, descripcion } = req.body;
      
      const result = await dbRun(
        'INSERT INTO investigaciones (titulo, descripcion) VALUES ($1, $2)',
        [titulo, descripcion]
      );
      
      // Obtener la investigación creada
      const investigacionCreada = await dbGet(
        'SELECT * FROM investigaciones WHERE id = $1',
        [result.lastID]
      );
      
      res.json(investigacionCreada);
    }

    else if (req.method === 'PUT') {
      // Si viene id en query, es para editar título/descripción
      if (id) {
        const { titulo, descripcion } = req.body;
        
        // Verificar que la investigación no esté cerrada
        const investigacion = await dbGet(
          'SELECT estado FROM investigaciones WHERE id = $1', 
          [id]
        );
        
        if (!investigacion) {
          return res.status(404).json({ error: 'Investigación no encontrada' });
        }
        
        if (investigacion.estado === 'cerrado') {
          return res.status(400).json({ error: 'No se puede editar una investigación cerrada' });
        }
        
        // Actualizar título y descripción
        await dbRun(
          'UPDATE investigaciones SET titulo = $1, descripcion = $2 WHERE id = $3',
          [titulo, descripcion, id]
        );
        
        // Obtener la investigación actualizada
        const investigacionActualizada = await dbGet(
          'SELECT * FROM investigaciones WHERE id = $1',
          [id]
        );
        
        res.json(investigacionActualizada);
      } 
      // Si no viene id en query, es para cambiar estado
      else {
        const { id, estado } = req.body;
        await dbRun(
          'UPDATE investigaciones SET estado = $1 WHERE id = $2',
          [estado, id]
        );
        
        res.json({ message: 'Estado actualizado', id, estado });
      }
    }

    else {
      res.status(405).json({ error: 'Método no permitido' });
    }
    
  } catch (error) {
    console.error('Error en API investigaciones:', error);
    res.status(500).json({ error: error.message });
  }
}