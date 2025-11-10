import { useState, useEffect } from 'react';

export default function Comentarios({ investigacionId, isCerrado }) {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');

  const cargarComentarios = async () => {
    const response = await fetch(`/api/comentarios?investigacion_id=${investigacionId}`);
    const data = await response.json();
    setComentarios(data);
  };

  const agregarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    await fetch('/api/comentarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        investigacion_id: investigacionId,
        contenido: nuevoComentario
      })
    });

    setNuevoComentario('');
    cargarComentarios();
  };

  const eliminarComentario = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return;

    await fetch(`/api/comentarios?id=${id}`, {
      method: 'DELETE',
    });
    cargarComentarios();
  };

  const iniciarEdicion = (comentario) => {
    setEditandoId(comentario.id);
    setTextoEditado(comentario.contenido);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setTextoEditado('');
  };

  const guardarEdicion = async (id) => {
    if (!textoEditado.trim()) return;

    await fetch(`/api/comentarios?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contenido: textoEditado
      })
    });

    setEditandoId(null);
    setTextoEditado('');
    cargarComentarios();
  };

  useEffect(() => {
    if (mostrarComentarios) {
      cargarComentarios();
    }
  }, [mostrarComentarios]);

  return (
    <div className="mt-4">
      <button
        onClick={() => setMostrarComentarios(!mostrarComentarios)}
        className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded-xl text-sm transition duration-200 w-full border border-blue-200 font-medium"
      >
        💬 Comentarios ({comentarios.length})
      </button>

      {mostrarComentarios && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
          {/* Lista de comentarios */}
          <div className="mb-4 max-h-60 overflow-y-auto">
            {comentarios.length === 0 ? (
              <p className="text-gray-500 text-center">No hay comentarios aún</p>
            ) : (
              comentarios.map((comentario) => (
                <div key={comentario.id} className="mb-3 p-3 bg-white rounded border border-gray-200">
                  {editandoId === comentario.id ? (
                    // Modo edición
                    <div className="space-y-2">
                      <textarea
                        value={textoEditado}
                        onChange={(e) => setTextoEditado(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => guardarEdicion(comentario.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          💾 Guardar
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Modo visualización
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-800 flex-1">{comentario.contenido}</p>
                        {!isCerrado && (
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => iniciarEdicion(comentario)}
                              className="text-blue-500 hover:text-blue-700 text-sm p-1"
                              title="Editar comentario"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => eliminarComentario(comentario.id)}
                              className="text-red-500 hover:text-red-700 text-sm p-1"
                              title="Eliminar comentario"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comentario.fecha_creacion).toLocaleString('es-CO')}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Formulario para nuevo comentario */}
          {!isCerrado && (
            <form onSubmit={agregarComentario} className="flex gap-2">
              <input
                type="text"
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Enviar
              </button>
            </form>
          )}

          {isCerrado && (
            <p className="text-red-500 text-sm text-center">⚠️ Investigación cerrada - No se pueden agregar comentarios</p>
          )}
        </div>
      )}
    </div>
  );
}