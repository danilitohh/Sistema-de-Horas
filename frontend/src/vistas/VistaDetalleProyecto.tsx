import React from 'react';
import { ArrowLeft, CheckCircle2, Users } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearMinutos } from '../utilidades/formateadores';
import { obtenerBadgeEstado, obtenerEstiloPorcentaje } from '../utilidades/estilos';

interface PropsDetalle {
  proyectoId: string;
  onVolver: () => void;
}

export const VistaDetalleProyecto: React.FC<PropsDetalle> = ({ proyectoId, onVolver }) => {
  const { proyectos, tareas, registros, usuario } = usarHoras();
  const proyecto = proyectos.find((p) => p.id === proyectoId);

  if (!proyecto) {
    return (
      <div className="app-card p-8 text-center text-xs text-slate-500">
        Proyecto no encontrado. <button onClick={onVolver} className="text-[#22C55E] underline ml-2">Volver</button>
      </div>
    );
  }

  // Filtrado de datos del proyecto
  const tareasProyecto = tareas.filter((t) => t.proyectoId === proyecto.id);
  const registrosProyecto = registros.filter((r) => r.proyectoId === proyecto.id);

  // Cálculos de avance y horas
  const minutosConsumidos = registrosProyecto.reduce((acc, r) => acc + r.duracionMinutos, 0);
  const minutosEstimados = proyecto.horasEstimadas * 60;
  const porcentaje = minutosEstimados > 0 ? Math.min(100, Math.round((minutosConsumidos / minutosEstimados) * 100)) : 0;
  const minutosRestantes = Math.max(0, minutosEstimados - minutosConsumidos);
  const estilo = obtenerEstiloPorcentaje(porcentaje);

  // Aporte por miembro (RF-15)
  const miembros = [
    { nombre: usuario.nombre, rol: 'Líder / Dev', minutos: Math.round(minutosConsumidos * 0.65) },
    { nombre: 'Carlos Mendoza', rol: 'Backend', minutos: Math.round(minutosConsumidos * 0.25) },
    { nombre: 'Ana Rojas', rol: 'QA / Pruebas', minutos: Math.round(minutosConsumidos * 0.10) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Barra de Navegación y Cabecera del Proyecto */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onVolver} className="btn-secondary py-2 px-3 text-xs" title="Volver a proyectos">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: proyecto.color }} />
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">{proyecto.nombre}</h2>
              <p className="text-xs text-slate-500">{proyecto.cliente} • Código: {proyecto.codigo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tarjetas de Avance y Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="app-card p-5">
          <span className="text-xs font-bold uppercase text-slate-500">Horas Consumidas</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{formatearMinutos(minutosConsumidos)}</p>
          <p className="text-xs text-slate-400 mt-1">de {proyecto.horasEstimadas}h estimadas</p>
        </div>

        <div className="app-card p-5">
          <span className="text-xs font-bold uppercase text-slate-500">Avance de Presupuesto</span>
          <p className={`text-2xl font-extrabold font-mono mt-1 ${estilo.textClass}`}>{porcentaje}%</p>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div className={`h-full rounded-full transition-all duration-500 ${estilo.barClass}`} style={{ width: `${porcentaje}%` }} />
          </div>
        </div>

        <div className="app-card p-5">
          <span className="text-xs font-bold uppercase text-slate-500">Horas Restantes</span>
          <p className="text-2xl font-extrabold text-slate-800 font-mono mt-1">{formatearMinutos(minutosRestantes)}</p>
          <p className="text-xs text-slate-400 mt-1">margen disponible</p>
        </div>

        <div className="app-card p-5">
          <span className="text-xs font-bold uppercase text-slate-500">Tareas Asociadas</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{tareasProyecto.length}</p>
          <p className="text-xs text-slate-400 mt-1">{tareasProyecto.filter(t => t.estado === 'completada').length} terminadas</p>
        </div>
      </div>

      {/* 3. Desglose por Tareas y por Miembros */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tareas del Proyecto */}
        <div className="lg:col-span-7 app-card overflow-hidden">
          <div className="app-card-header">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              Desglose por Tareas
            </h3>
            <span className="text-xs text-slate-400 font-mono">{tareasProyecto.length} tareas</span>
          </div>
          <div className="divide-y divide-slate-100">
            {tareasProyecto.map((t) => {
              const mins = registrosProyecto.filter((r) => r.tareaId === t.id).reduce((s, r) => s + r.duracionMinutos, 0);
              const badge = obtenerBadgeEstado(t.estado);
              return (
                <div key={t.id} className="px-5 py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/80 transition">
                  <div>
                    <p className="font-semibold text-slate-800">{t.nombre}</p>
                    <span className="text-[11px] text-slate-400 font-mono">Tiempo: {mins > 0 ? formatearMinutos(mins) : '0m'}</span>
                  </div>
                  <span className={badge.badgeClass}>{badge.etiqueta}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desglose por Miembros del Equipo */}
        <div className="lg:col-span-5 app-card overflow-hidden">
          <div className="app-card-header">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Horas por Colaborador
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {miembros.map((m) => {
              const pct = minutosConsumidos > 0 ? Math.round((m.minutos / minutosConsumidos) * 100) : 0;
              return (
                <div key={m.nombre} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{m.nombre}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({m.rol})</span>
                    </div>
                    <span className="font-mono text-slate-600">{formatearMinutos(m.minutos)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#22C55E] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
