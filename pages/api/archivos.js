const db = require('../../lib/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method === 'POST') {
    upload.single('archivo')(req, res, function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error subiendo archivo: ' + err.message });
      }

      const { investigacion_id } = req.body;
      const archivo = req.file;

      if (!archivo) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
      }

      db.run(
        'INSERT INTO archivos (investigacion_id, nombre_archivo, ruta) VALUES (?, ?, ?)',
        [investigacion_id, archivo.originalname, `/uploads/${archivo.filename}`],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ 
            id: this.lastID, 
            investigacion_id, 
            nombre_archivo: archivo.originalname,
            ruta: `/uploads/${archivo.filename}`,
            fecha_creacion: new Date().toISOString()
          });
        }
      );
    });
  }

  if (req.method === 'GET') {
    const { investigacion_id } = req.query;
    
    db.all(
      'SELECT * FROM archivos WHERE investigacion_id = ? ORDER BY fecha_creacion DESC',
      [investigacion_id],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      }
    );
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    
    db.get('SELECT * FROM archivos WHERE id = ?', [id], (err, archivo) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (archivo && archivo.ruta) {
        const filePath = path.join(process.cwd(), 'public', archivo.ruta);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      db.run('DELETE FROM archivos WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Archivo eliminado', id });
      });
    });
  }
}