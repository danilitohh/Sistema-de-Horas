import React, { useState } from 'react';
import { Plus, Search, Filter, ListChecks, Calendar, MoreHorizontal, CheckCircle2, Circle, Loader2, AlertTriangle } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearMinutos } from '../utilidades/formateadores';

type FiltroEstado = 'todos' | 'por_hacer' | 'en_progreso' | 'completada';
type FiltroPrioridad = 'todos' | 'alta' | 'media' | 'baja';

const configEstado = {
  por_hacer: { label: 'Por Hacer', badge: 'badge-status badge-pending', Icono: Circle },
  en_progreso: { label: 'En Progreso', badge: 'badge-status badge-in-progress', Icono: Loader2 },
  completada: { label: 'Completada', badge: 'badge-status badge-completed', Icono: CheckCircle2 },
};

const configPrioridad = {
  alta: { label: 'Alta', badge: 'badge-status badge-high-priority', Icono: AlertTriangle },
  media: { label: 'Media', badge: 'badge-status badge-in-progress', Icono: Circle },
  baja: { label: 'Baja', badge: 'badge-status badge-completed', Icono: CheckCircle2 },
};

export const VistaTareas: React.FC = () => {
  const { tareas, proyectos, registros } = usarHoras();
  const [buscar, setBuscar] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<FiltroPrioridad>('todos');

  // Preparar tareas enriquecidas
  const prioridades: Array<'alta' | 'media' | 'baja'> = ['alta', 'media', 'baja'];
  const tagsList = ['Frontend', 'Backend', 'UI/UX', 'Testing', 'DevOps'];

  const tareasDisplay = tareas.map((t, i) => {
    const proy = proyectos.find((p) => p.id === t.proyectoId);
    const mins = registros.filter((r) => r.tareaId === t.id).reduce((sum, r) => sum + r.duracionMinutos, 0);
    return {
      id: t.id,
      nombre: t.nombre,
      proyectoNombre: proy?.nombre || 'General',
      proyectoColor: proy?.color || '#22C55E',
      estado: t.estado as 'por_hacer' | 'en_progreso' | 'completada',
      prioridad: prioridades[i % 3],
      fechaLimite: new Date(Date.now() + (i + 1) * 86400000 * 3).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      asignado: ['Sofia V.', 'Carlos M.', 'Ana R.', 'Diego L.'][i % 4],
      minutos: mins,
      tags: [tagsList[i % tagsList.length]],
    };
  });

  const filtradas = tareasDisplay.filter((t) => {
    if (filtroEstado !== 'todos' && t.estado !== filtroEstado) return false;
    if (filtroPrioridad !== 'todos' && t.prioridad !== filtroPrioridad) return false;
    if (buscar && !t.nombre.toLowerCase().includes(buscar.toLowerCase())) return false;
    return true;
  });

  const conteo = {
    todos: tareasDisplay.length,
    por_hacer: tareasDisplay.filter((t) => t.estado === 'por_hacer').length,
    en_progreso: tareasDisplay.filter((t) => t.estado === 'en_progreso').length,
    completada: tareasDisplay.filter((t) => t.estado === 'completada').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Cabecera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-[#22C55E]" />
            Gestión de Tareas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Seguimiento de entregables y actividades del equipo</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {/* 2. Pestañas de Estado y Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Pestañas rápidas */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {(['todos', 'por_hacer', 'en_progreso', 'completada'] as const).map((estado) => {
            const activo = filtroEstado === estado;
            const labels = { todos: 'Todas', por_hacer: 'Por Hacer', en_progreso: 'En Progreso', completada: 'Completadas' };
            return (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activo ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{labels[estado]}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activo ? 'bg-slate-100 text-slate-800' : 'bg-slate-200 text-slate-600'}`}>
                  {conteo[estado]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buscador y filtro prioridad */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Buscar tareas..."
              className="form-input pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value as FiltroPrioridad)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="todos">Prioridad: Todas</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Tabla de Tareas */}
      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="text-left px-5 py-3.5">Tarea</th>
                <th className="text-left px-4 py-3.5">Proyecto</th>
                <th className="text-left px-4 py-3.5">Estado</th>
                <th className="text-left px-4 py-3.5">Prioridad</th>
                <th className="text-left px-4 py-3.5">Entrega</th>
                <th className="text-left px-4 py-3.5">Asignado</th>
                <th className="text-right px-4 py-3.5">Tiempo</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtradas.map((tarea) => {
                const est = configEstado[tarea.estado] || configEstado.por_hacer;
                const prio = configPrioridad[tarea.prioridad];
                const EstIcon = est.Icono;

                return (
                  <tr key={tarea.id} className="hover:bg-slate-50/80 transition group">
                    <td className="px-5 py-3.5 font-semibold text-slate-800 group-hover:text-[#22C55E] transition-colors">
                      {tarea.nombre}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tarea.proyectoColor }} />
                        <span className="text-slate-600 font-medium">{tarea.proyectoNombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={est.badge}>
                        <EstIcon className="w-3 h-3" />
                        {est.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={prio.badge}>{prio.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {tarea.fechaLimite}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {tarea.asignado}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800">
                      {tarea.minutos > 0 ? formatearMinutos(tarea.minutos) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Resumen al pie */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <span>{filtradas.length} tareas mostradas</span>
          <span>
            Total invertido:{' '}
            <strong className="text-slate-800 font-mono">
              {formatearMinutos(filtradas.reduce((sum, t) => sum + t.minutos, 0))}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
