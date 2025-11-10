import { useState } from 'react';

export default function EditarInvestigacion({ investigacion, onGuardar, onCancelar }) {
  const [titulo, setTitulo] = useState(investigacion.titulo);
  const [descripcion, setDescripcion] = useState(investigacion.descripcion || '');
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    setGuardando(true);
    try {
      await fetch(`/api/investigaciones?id=${investigacion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion })
      });
      
      onGuardar({ ...investigacion, titulo, descripcion });
    } catch (error) {
      console.error('Error actualizando investigación:', error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">✏️ Editar Investigación</h2>
          <p className="text-gray-600 text-sm mt-1">Modifica el título y descripción de la investigación</p>
        </div>

        <form onSubmit={handleGuardar} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {titulo.length}/100 caracteres
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows="4"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {descripcion.length}/500 caracteres
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={guardando || !titulo.trim()}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition duration-200"
            >
              {guardando ? '💾 Guardando...' : '💾 Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={onCancelar}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition duration-200"
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}