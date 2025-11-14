const { dbAll, dbRun, dbGet } = require('../../lib/database');

export default async function handler(req, res) {
  // 🔥 CORS HEADERS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id, investigacion_id } = req.query;

  console.log('🔍 API Archivos - Método:', req.method, 'Query:', req.query);

  try {
    if (req.method === 'GET') {
      // ✅ ENDPOINT DE DESCARGA INDIVIDUAL
      if (id) {
        console.log('📥 Solicitando descarga del archivo ID:', id);
        
        const archivo = await dbGet(
          'SELECT * FROM archivos WHERE id = $1',
          [id]
        );
        
        if (!archivo) {
          return res.status(404).json({ error: 'Archivo no encontrado' });
        }
        
        if (!archivo.contenido_base64) {
          return res.status(404).json({ error: 'Contenido del archivo no disponible' });
        }
        
        // Extraer el base64 puro (sin el prefijo data:...)
        const base64Data = archivo.contenido_base64.replace(/^data:[^;]+;base64,/, '');
        const fileBuffer = Buffer.from(base64Data, 'base64');
        
        // Configurar headers para descarga
        res.setHeader('Content-Type', archivo.tipo_archivo);
        res.setHeader('Content-Disposition', `attachment; filename="${archivo.nombre_archivo}"`);
        res.setHeader('Content-Length', fileBuffer.length);
        
        console.log('✅ Enviando archivo para descarga:', archivo.nombre_archivo);
        return res.send(fileBuffer);
      }
      
      // ✅ ENDPOINT DE LISTADO (sin contenido_base64)
      if (!investigacion_id) {
        return res.status(400).json({ error: 'Falta investigacion_id' });
      }

      const archivos = await dbAll(
        'SELECT id, investigacion_id, nombre_archivo, tipo_archivo, tamano, fecha_creacion FROM archivos WHERE investigacion_id = $1 ORDER BY fecha_creacion DESC',
        [investigacion_id]
      );
      
      console.log('✅ Archivos encontrados:', archivos.length);
      res.json(archivos);
    }

    else if (req.method === 'POST') {
      const { investigacion_id, nombre_archivo, contenido_base64, tipo_archivo, tamano } = req.body;
      
      console.log('💾 Guardando archivo:', {
        nombre: nombre_archivo,
        tipo: tipo_archivo,
        tamaño: tamano,
        tamaño_base64: contenido_base64?.length || 0
      });

      // Validaciones
      if (!investigacion_id || !nombre_archivo || !contenido_base64) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      // Verificar tamaño del base64 (5MB + overhead)
      if (contenido_base64.length > 7 * 1024 * 1024) {
        return res.status(413).json({ error: 'Archivo demasiado grande después de codificación' });
      }

      // ✅ CORREGIDO: Usar RETURNING para obtener el registro insertado
      const archivoInsertado = await dbGet(
        `INSERT INTO archivos (investigacion_id, nombre_archivo, tipo_archivo, contenido_base64, tamano) 
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, investigacion_id, nombre_archivo, tipo_archivo, tamano, fecha_creacion`,
        [investigacion_id, nombre_archivo, tipo_archivo, contenido_base64, tamano]
      );
      
      console.log('✅ Archivo guardado con ID:', archivoInsertado.id);
      
      res.status(201).json(archivoInsertado);
    }

    else if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'Falta ID del archivo' });
      }

      await dbRun('DELETE FROM archivos WHERE id = $1', [id]);
      console.log('🗑️ Archivo eliminado:', id);
      
      res.json({ message: 'Archivo eliminado', id });
    }

    else {
      res.status(405).json({ error: 'Método no permitido' });
    }
    
  } catch (error) {
    console.error('💥 Error en API archivos:', error);
    res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
}