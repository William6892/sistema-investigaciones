import { useState, useEffect, useRef } from 'react';

export default function SubirArchivo({ investigacionId, isCerrado }) {
  const [archivos, setArchivos] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [mostrarArchivos, setMostrarArchivos] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const fileInputRef = useRef(null);

  // Configuración de límites
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB en bytes
  const CHUNK_SIZE = 512 * 1024; // 512KB por chunk

  const tiposPermitidos = {
    'image/jpeg': '🖼️',
    'image/png': '🖼️',
    'image/gif': '🖼️',
    'image/webp': '🖼️',
    'application/pdf': '📕',
    'application/msword': '📄',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📄',
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'text/plain': '📝',
    'application/zip': '📦',
    'application/x-rar-compressed': '📦'
  };

  const cargarArchivos = async () => {
    try {
      const response = await fetch(`/api/archivos?investigacion_id=${investigacionId}`);
      
      if (response.ok) {
        const data = await response.json();
        setArchivos(data);
      } else {
        console.error('Error cargando archivos:', response.status);
        setArchivos([]);
      }
    } catch (error) {
      console.error('Error cargando archivos:', error);
      setArchivos([]);
    }
  };

  useEffect(() => {
    if (mostrarArchivos) {
      cargarArchivos();
    }
  }, [mostrarArchivos]);

  const validarArchivo = (file) => {
    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      setMensaje(`❌ Archivo demasiado grande (${formatearTamaño(file.size)}). Máximo permitido: 5MB`);
      return false;
    }

    // Validar tipo
    if (!tiposPermitidos[file.type]) {
      setMensaje('❌ Tipo de archivo no permitido. Use: imágenes, PDF, Word, Excel, texto, archivos comprimidos');
      return false;
    }

    return true;
  };

  const subirArchivoCompleto = async (file, base64) => {
    const response = await fetch('/api/archivos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        investigacion_id: investigacionId,
        nombre_archivo: file.name,
        tipo_archivo: file.type,
        contenido_base64: base64,
        tamano: file.size
      })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  };

  const subirArchivoPorChunks = async (file) => {
    // Implementación básica de subida por chunks
    // En una implementación real, necesitarías un backend que soporte upload por chunks
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result;
          const response = await subirArchivoCompleto(file, base64);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsDataURL(file);
    });
  };

  const manejarSubida = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validaciones
    if (!validarArchivo(file)) {
      event.target.value = '';
      return;
    }

    setSubiendo(true);
    setMensaje(`⏳ Subiendo ${file.name}...`);

    try {
      console.log('📤 Subiendo archivo:', file.name, 'Tamaño:', formatearTamaño(file.size));

      // Para archivos mayores a 2MB, usar método por chunks
      if (file.size > 2 * 1024 * 1024) {
        await subirArchivoPorChunks(file);
      } else {
        // Para archivos pequeños, usar método directo
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          await subirArchivoCompleto(file, e.target.result);
        };
        
        reader.readAsDataURL(file);
      }

      setMensaje(`✅ ${file.name} subido exitosamente!`);
      await cargarArchivos();
      
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      
      if (error.message.includes('413') || error.message.includes('Payload')) {
        setMensaje('❌ Archivo demasiado grande para el servidor');
      } else if (error.message.includes('Failed to fetch')) {
        setMensaje('❌ Error de conexión. Verifique su internet e intente nuevamente.');
      } else if (error.message.includes('network') || error.message.includes('Network')) {
        setMensaje('❌ Error de red. Intente con un archivo más pequeño o más tarde.');
      } else {
        setMensaje(`❌ Error: ${error.message}`);
      }
    } finally {
      setSubiendo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

const descargarArchivo = async (archivo) => {
  try {
    console.log('📥 Descargando archivo:', archivo.nombre_archivo);
    
    // ✅ Usar el nuevo endpoint de descarga
    const response = await fetch(`/api/archivos?id=${archivo.id}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    // Convertir respuesta a blob
    const blob = await response.blob();
    
    // Crear URL temporal y descargar
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = archivo.nombre_archivo;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Liberar memoria
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Descarga exitosa:', archivo.nombre_archivo);
    
  } catch (error) {
    console.error('💥 Error descargando archivo:', error);
    setMensaje('❌ Error descargando archivo: ' + error.message);
  }
};

  const eliminarArchivo = async (id) => {
    if (!confirm('¿Eliminar archivo permanentemente?')) return;
    
    try {
      const response = await fetch(`/api/archivos?id=${id}`, { 
        method: 'DELETE' 
      });
      
      if (response.ok) {
        setMensaje('🗑️ Archivo eliminado');
        await cargarArchivos();
      } else {
        throw new Error('Error en servidor');
      }
    } catch (error) {
      setMensaje('❌ Error eliminando archivo');
    }
  };

  const getIconoArchivo = (nombreArchivo, tipoArchivo) => {
    const extension = nombreArchivo.split('.').pop().toLowerCase();
    
    // Primero intentar por tipo MIME
    if (tiposPermitidos[tipoArchivo]) {
      return tiposPermitidos[tipoArchivo];
    }
    
    // Fallback por extensión
    const iconosPorExtension = {
      'pdf': '📕',
      'doc': '📄', 'docx': '📄',
      'xls': '📊', 'xlsx': '📊',
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'webp': '🖼️',
      'txt': '📝',
      'zip': '📦', 'rar': '📦'
    };
    
    return iconosPorExtension[extension] || '📎';
  };

  const formatearTamaño = (bytes) => {
    if (!bytes) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const formatearFecha = (fechaString) => {
    return new Date(fechaString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAcceptString = () => {
    const extensions = [];
    Object.keys(tiposPermitidos).forEach(tipo => {
      if (tipo.startsWith('image/')) {
        extensions.push('.jpg', '.jpeg', '.png', '.gif', '.webp');
      } else if (tipo.includes('pdf')) {
        extensions.push('.pdf');
      } else if (tipo.includes('word')) {
        extensions.push('.doc', '.docx');
      } else if (tipo.includes('excel') || tipo.includes('sheet')) {
        extensions.push('.xls', '.xlsx');
      } else if (tipo.includes('text')) {
        extensions.push('.txt');
      } else if (tipo.includes('zip')) {
        extensions.push('.zip', '.rar');
      }
    });
    
    return [...new Set(extensions)].join(',');
  };

  return (
    <div className="border-t pt-4">
      <button
        onClick={() => setMostrarArchivos(!mostrarArchivos)}
        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
      >
        <span>📎 Archivos ({archivos.length})</span>
        <span className={`transform transition-transform ${mostrarArchivos ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {mostrarArchivos && (
        <div className="mt-3 space-y-3">
          {mensaje && (
            <div className={`p-3 rounded text-sm ${
              mensaje.includes('✅') ? 'bg-green-100 text-green-800 border border-green-200' : 
              mensaje.includes('🗑️') ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
              mensaje.includes('⏳') ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
              'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {mensaje}
            </div>
          )}

          {!isCerrado && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subir nuevo archivo:
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={manejarSubida}
                disabled={subiendo}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                accept={getAcceptString()}
              />
              {subiendo && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-blue-600 text-sm mt-1 text-center">
                    ⏳ Subiendo archivo...
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-600 mt-2">
                📁 Formatos: PDF, Word, Excel, imágenes (JPEG, PNG, GIF, WebP), texto, archivos comprimidos
                <br />
                💾 Tamaño máximo: 5MB
              </p>
            </div>
          )}

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {archivos.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 text-sm">📭 No hay archivos subidos</p>
                <p className="text-gray-400 text-xs mt-1">
                  {!isCerrado ? 'Selecciona un archivo para comenzar' : 'Investigación cerrada'}
                </p>
              </div>
            ) : (
              archivos.map(archivo => (
                <div key={archivo.id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-lg flex-shrink-0">
                      {getIconoArchivo(archivo.nombre_archivo, archivo.tipo_archivo)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate" title={archivo.nombre_archivo}>
                        {archivo.nombre_archivo}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                        <span>{formatearTamaño(archivo.tamano)}</span>
                        <span>•</span>
                        <span>Subido: {formatearFecha(archivo.fecha_creacion)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-3 flex-shrink-0">
                    <button
                      onClick={() => descargarArchivo(archivo)}
                      className="text-green-600 hover:text-green-800 p-1 rounded transition-colors hover:bg-green-50"
                      title="Descargar archivo"
                      disabled={subiendo}
                    >
                      ⬇️
                    </button>
                    {!isCerrado && (
                      <button
                        onClick={() => eliminarArchivo(archivo.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors hover:bg-red-50"
                        title="Eliminar archivo"
                        disabled={subiendo}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}