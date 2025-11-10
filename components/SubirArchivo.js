import { useState } from 'react';

export default function SubirArchivo({ investigacionId, isCerrado }) {
  const [mostrarSubida, setMostrarSubida] = useState(false);
  const [archivos, setArchivos] = useState([]);
  const [subiendo, setSubiendo] = useState(false);

  const cargarArchivos = async () => {
    const response = await fetch(`/api/archivos?investigacion_id=${investigacionId}`);
    const data = await response.json();
    setArchivos(data);
  };

  const subirArchivo = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    setSubiendo(true);
    try {
      const response = await fetch('/api/archivos', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        e.target.reset();
        cargarArchivos();
      }
    } catch (error) {
      console.error('Error subiendo archivo:', error);
    }
    setSubiendo(false);
  };

  const eliminarArchivo = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return;

    await fetch(`/api/archivos?id=${id}`, {
      method: 'DELETE',
    });
    cargarArchivos();
  };

  return (
    <div className="mt-4">
      <button
  onClick={() => {
    setMostrarSubida(!mostrarSubida);
    if (!mostrarSubida) cargarArchivos();
  }}
  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 py-2 px-4 rounded-xl text-sm transition duration-200 w-full border border-emerald-200 font-medium"
>
        📎 Archivos ({archivos.length})
      </button>

      {mostrarSubida && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
          {/* Lista de archivos */}
          <div className="mb-4 max-h-60 overflow-y-auto">
            {archivos.length === 0 ? (
              <p className="text-gray-500 text-center">No hay archivos aún</p>
            ) : (
              archivos.map((archivo) => (
                <div key={archivo.id} className="mb-2 p-2 bg-white rounded border flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{archivo.nombre_archivo}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(archivo.fecha_creacion).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={archivo.ruta} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      👁️
                    </a>
                    {!isCerrado && (
                      <button
                        onClick={() => eliminarArchivo(archivo.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Formulario para subir archivos */}
          {!isCerrado && (
            <form onSubmit={subirArchivo} className="flex flex-col gap-2">
              <input
                type="file"
                name="archivo"
                className="border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              <input type="hidden" name="investigacion_id" value={investigacionId} />
              <button
                type="submit"
                disabled={subiendo}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg"
              >
                {subiendo ? 'Subiendo...' : '📤 Subir Archivo'}
              </button>
            </form>
          )}

          {isCerrado && (
            <p className="text-red-500 text-sm text-center">⚠️ Investigación cerrada - No se pueden subir archivos</p>
          )}
        </div>
      )}
    </div>
  );
}