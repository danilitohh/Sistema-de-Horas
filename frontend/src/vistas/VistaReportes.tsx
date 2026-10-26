import React, { useState, useMemo } from 'react';
import {
  Download,
  Clock,
  DollarSign,
  PieChart,
  FolderKanban,
  Filter,
  Search,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import {
  formatearMinutos,
  obtenerLimitesRango,
} from '../utilidades/formateadores';
import type { TipoRangoFecha } from '../utilidades/formateadores';

export const VistaReportes: React.FC = () => {
  const { registros, proyectos, usuario } = usarHoras();

  // Estados de los filtros combinables
  const [rangoFecha, setRangoFecha] = useState<TipoRangoFecha>('este_mes');
  const [fechaInicioPersonalizada, setFechaInicioPersonalizada] = useState('');
  const [fechaFinPersonalizada, setFechaFinPersonalizada] = useState('');
  const [filtroProyecto, setFiltroProyecto] = useState('todos');
  const [filtroFacturable, setFiltroFacturable] = useState<'todos' | 'facturable' | 'no_facturable'>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setRangoFecha('todo');
    setFechaInicioPersonalizada('');
    setFechaFinPersonalizada('');
    setFiltroProyecto('todos');
    setFiltroFacturable('todos');
    setBusqueda('');
  };

  const hayFiltrosActivos =
    rangoFecha !== 'todo' ||
    filtroProyecto !== 'todos' ||
    filtroFacturable !== 'todos' ||
    busqueda.trim() !== '';

  // Filtrado combinable
  const registrosFiltrados = useMemo(() => {
    let limites = { inicio: '', fin: '' };
    if (rangoFecha === 'personalizado') {
      limites = { inicio: fechaInicioPersonalizada, fin: fechaFinPersonalizada };
    } else {
      limites = obtenerLimitesRango(rangoFecha);
    }

    return registros.filter((reg) => {
      // 1. Filtro de fecha
      if (limites.inicio && reg.fecha < limites.inicio) return false;
      if (limites.fin && reg.fecha > limites.fin) return false;

      // 2. Filtro de proyecto
      if (filtroProyecto !== 'todos' && reg.proyectoId !== filtroProyecto) return false;

      // 3. Filtro facturable
      if (filtroFacturable === 'facturable' && !reg.esFacturable) return false;
      if (filtroFacturable === 'no_facturable' && reg.esFacturable) return false;

      // 4. Búsqueda por descripción
      if (busqueda.trim() && !reg.descripcion.toLowerCase().includes(busqueda.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [registros, rangoFecha, fechaInicioPersonalizada, fechaFinPersonalizada, filtroProyecto, filtroFacturable, busqueda]);

  // Métricas reactivas a los filtros
  const totalMinutos = registrosFiltrados.reduce((acc, curr) => acc + curr.duracionMinutos, 0);
  const totalFacturable = registrosFiltrados
    .filter((r) => r.esFacturable)
    .reduce((acc, curr) => acc + curr.duracionMinutos, 0);
  const totalNoFacturable = totalMinutos - totalFacturable;
  const porcentajeFacturable = totalMinutos > 0 ? Math.round((totalFacturable / totalMinutos) * 100) : 0;

  // Distribución de horas de los proyectos según registros filtrados
  const horasPorProyecto = proyectos.map((p) => {
    const minutos = registrosFiltrados
      .filter((r) => r.proyectoId === p.id)
      .reduce((acc, curr) => acc + curr.duracionMinutos, 0);
    return {
      ...p,
      minutos,
      porcentaje: totalMinutos > 0 ? Math.round((minutos / totalMinutos) * 100) : 0,
    };
  });

  // Exportador CSV filtrado
  const exportarCSV = () => {
    const encabezados = ['ID Registro', 'Fecha', 'Colaborador', 'Código', 'Proyecto', 'Duración (Mins)', 'Horas Decimal', 'Facturable', 'Descripción'];
    const filas = registrosFiltrados.map((r) => {
      const proy = proyectos.find((p) => p.id === r.proyectoId);
      return [
        `"${r.id}"`,
        `"${r.fecha}"`,
        `"${usuario.nombre}"`,
        `"${proy?.codigo || ''}"`,
        `"${proy?.nombre || ''}"`,
        r.duracionMinutos,
        (r.duracionMinutos / 60).toFixed(2),
        r.esFacturable ? '"SÍ"' : '"NO"',
        `"${r.descripcion.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvBlob = new Blob([[encabezados.join(','), ...filas].join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(csvBlob);
    enlace.download = `Reporte_UTEL_${new Date().toISOString().split('T')[0]}.csv`;
    enlace.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Cabecera con Título y Exportador */}
      <div className="app-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Informes & Resumen de Horas</h2>
          <p className="text-xs text-slate-500 mt-0.5">Control de rentabilidad, métricas y filtros combinables</p>
        </div>

        <button onClick={exportarCSV} className="btn-primary">
          <Download className="w-4 h-4" />
          <span>Exportar CSV ({registrosFiltrados.length})</span>
        </button>
      </div>

      {/* 2. Barra de Filtros Combinables (Tarea 11: RF-36 a RF-40) */}
      <div className="app-card p-5 space-y-4">
        {/* Atajos de Rango Rápido */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#22C55E]" />
              Periodo:
            </span>
            {(
              [
                { id: 'todo', label: 'Todo' },
                { id: 'hoy', label: 'Hoy' },
                { id: 'esta_semana', label: 'Esta Semana' },
                { id: 'semana_pasada', label: 'Semana Pasada' },
                { id: 'este_mes', label: 'Este Mes' },
                { id: 'mes_pasado', label: 'Mes Pasado' },
                { id: 'personalizado', label: 'Personalizado' },
              ] as const
            ).map((item) => {
              const activo = rangoFecha === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setRangoFecha(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activo
                      ? 'bg-[#22C55E] text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Botón Reset de filtros */}
          {hayFiltrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        {/* Inputs de rango personalizado (si aplica) */}
        {rangoFecha === 'personalizado' && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600">Desde:</span>
            <input
              type="date"
              value={fechaInicioPersonalizada}
              onChange={(e) => setFechaInicioPersonalizada(e.target.value)}
              className="form-input max-w-[180px]"
            />
            <span className="text-xs font-semibold text-slate-600">Hasta:</span>
            <input
              type="date"
              value={fechaFinPersonalizada}
              onChange={(e) => setFechaFinPersonalizada(e.target.value)}
              className="form-input max-w-[180px]"
            />
          </div>
        )}

        {/* Controles de Proyecto, Facturable y Búsqueda */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Selector de Proyecto */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filtroProyecto}
              onChange={(e) => setFiltroProyecto(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer w-full"
            >
              <option value="todos">Todos los proyectos</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector Facturable */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filtroFacturable}
              onChange={(e) => setFiltroFacturable(e.target.value as any)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer w-full"
            >
              <option value="todos">Facturación: Todos</option>
              <option value="facturable">Solo facturables</option>
              <option value="no_facturable">No facturables</option>
            </select>
          </div>

          {/* Búsqueda por texto */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por descripción..."
              className="form-input pl-9"
            />
          </div>
        </div>
      </div>

      {/* 3. Tarjetas KPI reactivas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="app-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Tiempo Filtrado</span>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">{formatearMinutos(totalMinutos)}</p>
          <p className="text-xs text-slate-400 mt-1">{(totalMinutos / 60).toFixed(1)} horas en total</p>
        </div>

        <div className="app-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Facturable</span>
            <DollarSign className="w-4 h-4 text-[#22C55E]" />
          </div>
          <p className="text-2xl font-extrabold text-[#22C55E] font-mono">{formatearMinutos(totalFacturable)}</p>
          <p className="text-xs text-[#22C55E] font-medium mt-1">{porcentajeFacturable}% facturable</p>
        </div>

        <div className="app-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">No Facturable</span>
            <PieChart className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-700 font-mono">{formatearMinutos(totalNoFacturable)}</p>
          <p className="text-xs text-slate-400 mt-1">{100 - porcentajeFacturable}% actividades internas</p>
        </div>

        <div className="app-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Registros</span>
            <FolderKanban className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">{registrosFiltrados.length}</p>
          <p className="text-xs text-slate-400 mt-1">entradas coincidentes</p>
        </div>
      </div>

      {/* 4. Distribución por Proyecto y Detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Distribución */}
        <div className="lg:col-span-5 app-card p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Distribución por Proyecto</h3>
          {totalMinutos === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No hay horas en este periodo para graficar</p>
          ) : (
            <div className="space-y-4">
              {horasPorProyecto
                .filter((p) => p.minutos > 0)
                .map((p) => (
                  <div key={p.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="font-semibold text-slate-800">{p.nombre}</span>
                      </div>
                      <span className="font-mono text-slate-500">
                        {p.porcentaje}% ({formatearMinutos(p.minutos)})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${p.porcentaje}%`, backgroundColor: p.color }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Detalle de Entradas */}
        <div className="lg:col-span-7 app-card overflow-hidden">
          <div className="app-card-header">
            <h3 className="text-sm font-bold text-slate-800">Detalle de Entradas</h3>
            <span className="text-xs text-slate-400 font-mono">{registrosFiltrados.length} registradas</span>
          </div>

          {registrosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No hay registros que coincidan con los filtros seleccionados.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {registrosFiltrados.map((reg) => {
                const proy = proyectos.find((p) => p.id === reg.proyectoId);
                return (
                  <div
                    key={reg.id}
                    className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate">{reg.descripcion}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {proy && (
                          <span className="text-[10px] font-semibold" style={{ color: proy.color }}>
                            {proy.nombre}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">{reg.fecha}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {reg.esFacturable && (
                        <span className="font-bold text-[#22C55E] bg-emerald-50 px-2 py-0.5 rounded-md">$</span>
                      )}
                      <span className="font-mono font-bold text-slate-800">{formatearMinutos(reg.duracionMinutos)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
