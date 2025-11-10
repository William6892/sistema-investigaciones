import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function NuevaInvestigacion() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    
    try {
      const response = await fetch('/api/investigaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion })
      });

      if (response.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error creando investigación:', error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Head>
        <title>Nueva Investigación</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">🔍</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Nueva Investigación
              </h1>
              <p className="text-blue-600/70 mt-1">Crear nuevo caso de seguimiento</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Botón Volver */}
        <div className="mb-6">
          <Link href="/">
            <button className="bg-white/80 backdrop-blur-sm hover:bg-white text-blue-600 font-medium py-2 px-4 rounded-xl shadow-sm transition-all duration-300 flex items-center space-x-2 border border-blue-200 hover:shadow-md">
              <span>←</span>
              <span>Volver al Inicio</span>
            </button>
          </Link>
        </div>

        {/* Formulario */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Título */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Título de la Investigación</span>
                </span>
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Análisis de ventas Q4 2024"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 shadow-inner transition-all duration-200"
                required
                maxLength={100}
              />
              <div className="text-xs text-slate-500 mt-2 text-right">
                {titulo.length}/100 caracteres
              </div>
            </div>

            {/* Campo Descripción */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  <span>Descripción</span>
                </span>
                <span className="text-slate-500 text-sm font-normal block mt-1">
                  Detalles adicionales sobre la investigación (opcional)
                </span>
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows="6"
                placeholder="Describe el propósito, contexto y objetivos de esta investigación..."
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 shadow-inner transition-all duration-200 resize-vertical"
                maxLength={500}
              />
              <div className="text-xs text-slate-500 mt-2 text-right">
                {descripcion.length}/500 caracteres
              </div>
            </div>

            {/* Botón de Enviar */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={enviando || !titulo.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center space-x-2"
              >
                {enviando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">+</span>
                    <span>Crear Investigación</span>
                    <span className="text-blue-100">✨</span>
                  </>
                )}
              </button>
              
              {!titulo.trim() && (
                <p className="text-rose-500 text-sm text-center mt-3 bg-rose-50 py-2 rounded-lg border border-rose-200">
                  ⚠️ El título es obligatorio para crear la investigación
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50/80 backdrop-blur-sm rounded-2xl border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
            <span>💡</span>
            <span>Consejos para una buena investigación</span>
          </h3>
          <ul className="text-blue-700/80 text-sm space-y-2">
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span>Usa títulos claros y descriptivos</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span>Incluye fechas relevantes en la descripción</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span>Puedes cambiar el estado (Abierto/Seguimiento/Cerrado) después</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span>Agrega comentarios y archivos según avance la investigación</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}