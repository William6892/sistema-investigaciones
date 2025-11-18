import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Comentarios from '../components/Comentarios';
import SubirArchivo from '../components/SubirArchivo';
import EditarInvestigacion from '../components/EditarInvestigacion';

export default function Home() {
  const [investigaciones, setInvestigaciones] = useState([]);
  const [editandoInvestigacion, setEditandoInvestigacion] = useState(null);

  const cargarInvestigaciones = async () => {
    const response = await fetch('/api/investigaciones');
    const data = await response.json();
    setInvestigaciones(data);
  };

  useEffect(() => {
    cargarInvestigaciones();
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    await fetch('/api/investigaciones', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado: nuevoEstado })
    });
    cargarInvestigaciones();
  };

  // COLORES PASTEL - Versión mejorada
  const getColorEstado = (estado) => {
    switch(estado) {
      case 'abierto': return 'bg-green-100 border-green-200 text-green-800';
      case 'seguimiento': return 'bg-amber-100 border-amber-200 text-amber-800';
      case 'cerrado': return 'bg-rose-100 border-rose-200 text-rose-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getColorBorde = (estado) => {
    switch(estado) {
      case 'abierto': return 'border-l-green-300';
      case 'seguimiento': return 'border-l-amber-300';
      case 'cerrado': return 'border-l-rose-300';
      default: return 'border-l-gray-300';
    }
  };

  const getTextoEstado = (estado) => {
    switch(estado) {
      case 'abierto': return '🟢 ABIERTO';
      case 'seguimiento': return '🟡 SEGUIMIENTO';
      case 'cerrado': return '🔴 CERRADO';
      default: return estado;
    }
  };

  const getColorIcono = (estado) => {
    switch(estado) {
      case 'abierto': return 'text-green-500';
      case 'seguimiento': return 'text-amber-500';
      case 'cerrado': return 'text-rose-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Sistema de Investigaciones</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet"/>
      </Head>

      {/* Modal de Edición */}
      {editandoInvestigacion && (
        <EditarInvestigacion
          investigacion={editandoInvestigacion}
          onGuardar={(investigacionActualizada) => {
            // Actualizar la lista
            setInvestigaciones(prev => 
              prev.map(inv => 
                inv.id === investigacionActualizada.id ? investigacionActualizada : inv
              )
            );
            setEditandoInvestigacion(null);
          }}
          onCancelar={() => setEditandoInvestigacion(null)}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">🔍  inspecciones de funcionamiento y mantenimiento.</h1>
          <p className="text-gray-600 mt-1">Sistema de seguimiento tipo semáforo</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Botón Nueva Investigación */}
        <div className="mb-8">
          <Link href="/nueva-investigacion">
            <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center transform hover:scale-105">
              <span className="text-xl mr-2">+</span>
              Nueva Investigación
            </button>
          </Link>
        </div>

        {/* Grid de Investigaciones */}
        {investigaciones.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border">
            <div className="text-gray-300 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay investigaciones</h3>
            <p className="text-gray-500">Crea tu primera investigación haciendo clic en el botón de arriba</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {investigaciones.map((inv) => (
              <div key={inv.id} className={`bg-white rounded-2xl shadow-sm border ${getColorBorde(inv.estado)} border-l-4 transition-all duration-300 hover:shadow-md`}>
                <div className="p-6">
                  {/* Header con semáforo y botón editar */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getColorIcono(inv.estado)}`}></div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getColorEstado(inv.estado)} border`}>
                        {getTextoEstado(inv.estado)}
                      </span>
                    </div>
                    
                    {/* Botón Editar - Solo si no está cerrado */}
                    {inv.estado !== 'cerrado' && (
                      <button
                        onClick={() => setEditandoInvestigacion(inv)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded transition duration-200"
                        title="Editar investigación"
                      >
                        ✏️
                      </button>
                    )}
                  </div>

                  {/* Contenido */}
                  <h2 className="text-lg font-bold text-gray-800 mb-2">{inv.titulo}</h2>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{inv.descripcion || 'Sin descripción'}</p>

                  {/* Estadísticas */}
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span className="bg-gray-50 px-2 py-1 rounded">💬 {inv.num_comentarios || 0}</span>
                    <span className="bg-gray-50 px-2 py-1 rounded">📎 {inv.num_archivos || 0}</span>
                  </div>

                  {/* Fecha */}
                  <div className="text-xs text-gray-400 mb-4">
                    Creado: {new Date(inv.fecha_creacion).toLocaleDateString('es-ES')}
                  </div>

                  {/* Selector de Estado */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cambiar estado:</label>
                    <select 
                      value={inv.estado}
                      onChange={(e) => cambiarEstado(inv.id, e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                      disabled={inv.estado === 'cerrado'}
                    >
                      <option value="abierto">🟢 Abierto</option>
                      <option value="seguimiento">🟡 Seguimiento</option>
                      <option value="cerrado">🔴 Cerrado</option>
                    </select>
                    {inv.estado === 'cerrado' && (
                      <p className="text-xs text-rose-500 mt-2 text-center bg-rose-50 py-1 rounded">⚠️ Investigación cerrada</p>
                    )}
                  </div>

                  {/* Comentarios y Archivos */}
                  <div className="mt-4 space-y-3">
                    <Comentarios 
                      investigacionId={inv.id} 
                      isCerrado={inv.estado === 'cerrado'} 
                    />
                    <SubirArchivo 
                      investigacionId={inv.id} 
                      isCerrado={inv.estado === 'cerrado'} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}