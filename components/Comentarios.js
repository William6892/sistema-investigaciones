import { useState, useEffect } from 'react';

export default function Comentarios({ investigacionId, isCerrado }) {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editandoTexto, setEditandoTexto] = useState('');
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Función SEGURA para obtener comentarios
  const cargarComentarios = async () => {
    try {
      setCargando(true);
      console.log('🔄 Cargando comentarios para investigación:', investigacionId);
      
      // ✅ CORREGIDO: usar investigacion_id en lugar de investigacionId
      const response = await fetch(`/api/comentarios?investigacion_id=${investigacionId}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Comentarios recibidos:', data);
      
      // FORZAR que siempre sea un array
      if (Array.isArray(data)) {
        setComentarios(data);
      } else {
        console.warn('⚠️ Comentarios no es array, forzando array vacío');
        setComentarios([]);
      }
    } catch (error) {
      console.error('💥 Error cargando comentarios:', error);
      // En caso de error, array vacío seguro
      setComentarios([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (mostrarComentarios && investigacionId) {
      cargarComentarios();
    }
  }, [mostrarComentarios, investigacionId]);

  // ✅ CORREGIDO: usar investigacion_id en el POST también
  const agregarComentario = async () => {
    if (!nuevoComentario.trim()) return;
    
    console.log('🔄 Intentando agregar comentario...');
    console.log('investigacionId:', investigacionId);
    console.log('contenido:', nuevoComentario);
    
    try {
      const response = await fetch('/api/comentarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investigacion_id: investigacionId, // ✅ CORREGIDO
          contenido: nuevoComentario
        })
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Comentario agregado:', data);
      
      setNuevoComentario('');
      cargarComentarios();
    } catch (error) {
      console.error('💥 Error agregando comentario:', error);
      alert('Error al agregar comentario: ' + error.message);
    }
  };

  // ✅✅✅ CORRECCIÓN PRINCIPAL: actualizarComentario corregida
  const actualizarComentario = async (id) => {
    try {
      console.log('🔄 Actualizando comentario ID:', id);
      console.log('Nuevo contenido:', editandoTexto);
      
      // ✅ CORREGIDO: id como query parameter en la URL
      const response = await fetch(`/api/comentarios?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenido: editandoTexto  // Solo enviar el contenido, el id va en la URL
        })
      });
      
      console.log('📡 Response status actualizar:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Comentario actualizado:', data);
      
      setEditandoId(null);
      setEditandoTexto('');
      cargarComentarios();
    } catch (error) {
      console.error('💥 Error actualizando comentario:', error);
      alert('Error al actualizar comentario: ' + error.message);
    }
  };

  const eliminarComentario = async (id) => {
    try {
      // ✅ CORREGIDO: usar query parameter en DELETE
      const response = await fetch(`/api/comentarios?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      cargarComentarios();
    } catch (error) {
      console.error('Error eliminando comentario:', error);
      alert('Error al eliminar comentario: ' + error.message);
    }
  };

  // Función SEGURA para renderizar comentarios
  const renderComentarios = () => {
    // Verificación EXTREMA de seguridad
    let comentariosSeguros = [];
    
    if (Array.isArray(comentarios)) {
      comentariosSeguros = comentarios;
    } else if (comentarios && typeof comentarios === 'object') {
      // Si es objeto, convertirlo a array
      comentariosSeguros = Object.values(comentarios);
    } else {
      // Cualquier otro caso, array vacío
      comentariosSeguros = [];
    }
    
    console.log('🔍 Comentarios a renderizar:', comentariosSeguros);

    if (comentariosSeguros.length === 0) {
      return (
        <p className="text-gray-500 text-center text-sm py-4">No hay comentarios aún</p>
      );
    }

    return comentariosSeguros.map((comentario) => (
      <div key={comentario.id} className="mb-3 p-3 bg-white rounded border border-gray-200">
        {editandoId === comentario.id ? (
          // Modo edición
          <div className="space-y-2">
            <textarea
              value={editandoTexto}
              onChange={(e) => setEditandoTexto(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              rows="3"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => actualizarComentario(comentario.id)}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setEditandoId(null);
                  setEditandoTexto('');
                }}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          // Modo visualización
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-gray-800 text-sm">{comentario.contenido}</p>
              <p className="text-gray-400 text-xs mt-1">
                {comentario.fecha_creacion ? new Date(comentario.fecha_creacion).toLocaleDateString('es-ES') : 'Fecha no disponible'}
              </p>
            </div>
            {!isCerrado && (
              <div className="flex space-x-1 ml-2">
                <button
                  onClick={() => {
                    setEditandoId(comentario.id);
                    setEditandoTexto(comentario.contenido);
                  }}
                  className="text-blue-500 hover:text-blue-700 text-xs"
                >
                  ✏️
                </button>
                <button
                  onClick={() => eliminarComentario(comentario.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="border-t pt-4">
      <button
        onClick={() => setMostrarComentarios(!mostrarComentarios)}
        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
      >
        <span>💬 Comentarios ({Array.isArray(comentarios) ? comentarios.length : 0})</span>
        <span className={`transform transition-transform duration-200 ${mostrarComentarios ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {mostrarComentarios && (
        <div className="mt-3 space-y-3">
          {/* Estado de carga */}
          {cargando && (
            <p className="text-center text-gray-500 text-sm">Cargando comentarios...</p>
          )}

          {/* Input para nuevo comentario */}
          {!isCerrado && !cargando && (
            <div className="flex space-x-2">
              <input
                type="text"
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                onKeyPress={(e) => e.key === 'Enter' && agregarComentario()}
              />
              <button
                onClick={agregarComentario}
                disabled={!nuevoComentario.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Agregar
              </button>
            </div>
          )}

          {/* Lista de comentarios */}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {!cargando && renderComentarios()}
          </div>
        </div>
      )}
    </div>
  );
}