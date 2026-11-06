import React from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  FolderKanban,
  ArrowUpRight,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearMinutos } from '../utilidades/formateadores';
import { obtenerEstiloPorcentaje, obtenerBadgeEstado } from '../utilidades/estilos';

export const VistaDashboard: React.FC = () => {
  const { registros, proyectos, tareas, usuario } = usarHoras();

  // Métricas globales
  const totalMinutos = registros.reduce((acc, r) => acc + r.duracionMinutos, 0);
  const totalHoras = Math.floor(totalMinutos / 60);
  const totalMins = totalMinutos % 60;
  const tareasCompletadas = tareas.filter((t) => t.estado === 'completada').length;
  const tareasEnProgreso = tareas.filter((t) => t.estado === 'en_progreso').length;
  const tareasPendientes = tareas.filter((t) => t.estado === 'por_hacer').length;
  const totalTareas = tareas.length || 1;

  // Segmentos del gráfico Donut
  const donutSegments = [
    { label: 'Completadas', value: tareasCompletadas, color: '#22C55E' },
    { label: 'En Progreso', value: tareasEnProgreso, color: '#FBBF24' },
    { label: 'Pendientes', value: tareasPendientes, color: '#EF4444' },
  ];
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  // Tarjetas KPI
  const statsCards = [
    { label: 'Proyectos Activos', value: proyectos.length, icon: FolderKanban, trend: '+2 este mes', bg: 'bg-purple-100 text-purple-600' },
    { label: 'Tareas Totales', value: tareas.length, icon: CheckCircle2, trend: `${tareasCompletadas} listas`, bg: 'bg-emerald-100 text-emerald-600' },
    { label: 'Horas Registradas', value: `${totalHoras}h ${totalMins}m`, icon: Clock, trend: formatearMinutos(totalMinutos), bg: 'bg-blue-100 text-blue-600' },
    { label: 'Miembros Equipo', value: 8, icon: Users, trend: '3 activos', bg: 'bg-amber-100 text-amber-600' },
  ];

  // Agenda y presupuestos
  const agendaTareas = [
    { name: 'Diseño de Dashboard', user: 'Sofia V.', time: '09:00 - 11:30', status: 'completada' },
    { name: 'Revisión de código', user: 'Carlos M.', time: '10:00 - 12:00', status: 'en_progreso' },
    { name: 'Sprint Planning', user: 'Equipo Dev', time: '14:00 - 15:30', status: 'por_hacer' },
    { name: 'Testing QA', user: 'Ana R.', time: '15:00 - 17:00', status: 'en_progreso' },
  ];

  const presupuestos = [
    { name: 'Sistema de Horas UTEL', budget: '$12,000', spent: '$5,040', percent: 42 },
    { name: 'Portal de Alumnos', budget: '$8,000', spent: '$6,500', percent: 81 },
    { name: 'Pasarela de Pagos', budget: '$4,000', spent: '$1,800', percent: 45 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Saludo Superior */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">
            ¡Hola, {usuario.nombre.split(' ')[0]}! 👋
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Resumen de productividad y proyectos</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Calendar className="w-4 h-4 text-[#22C55E]" />
          <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      {/* 2. Tarjetas de Estadísticas (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icono = card.icon;
          return (
            <div key={card.label} className="app-card app-card-hover p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.bg}`}>
                  <Icono className="w-5.5 h-5.5" />
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#22C55E]">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{card.trend}</span>
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-800">{card.value}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* 3. Rejilla Principal: Proyectos y Gráfico Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista de Proyectos */}
        <div className="lg:col-span-7 app-card overflow-hidden">
          <div className="app-card-header">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-[#22C55E]" />
              <h3 className="text-sm font-bold text-slate-800">Proyectos Activos</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">{proyectos.length} en curso</span>
          </div>
          <div className="p-5 space-y-4">
            {proyectos.map((proy) => {
              const percent = proy.horasEstimadas > 0 ? Math.round((proy.horasConsumidas / proy.horasEstimadas) * 100) : 0;
              const tareasProyecto = tareas.filter((t) => t.proyectoId === proy.id);
              return (
                <div key={proy.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: proy.color }} />
                      <span className="text-sm font-bold text-slate-800">{proy.nombre}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: proy.color }} />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 font-mono">
                    <span>{proy.horasConsumidas}h de {proy.horasEstimadas}h</span>
                    <span>{tareasProyecto.length} tareas</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico Donut de Tareas */}
        <div className="lg:col-span-5 app-card overflow-hidden">
          <div className="app-card-header">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-[#22C55E]" />
              Distribución de Tareas
            </h3>
          </div>
          <div className="p-5 flex flex-col items-center">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
                {donutSegments.map((seg) => {
                  const dashLength = (seg.value / totalTareas) * circumference;
                  const offset = cumulativeOffset;
                  cumulativeOffset += dashLength;
                  return (
                    <circle
                      key={seg.label}
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="18"
                      strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                      strokeDashoffset={-offset}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-slate-800">{totalHoras}h</span>
                <span className="text-xs font-bold text-slate-500">{totalMins}m</span>
              </div>
            </div>

            {/* Leyenda */}
            <div className="flex items-center gap-5 mt-5">
              {donutSegments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="text-slate-500">{seg.label}:</span>
                  <span className="font-bold text-slate-800">{seg.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Agenda y Presupuesto de Horas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agenda */}
        <div className="app-card overflow-hidden">
          <div className="app-card-header">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#22C55E]" />
              Agenda del Día
            </h3>
            <span className="badge-status badge-completed">Hoy</span>
          </div>
          <div className="divide-y divide-slate-100">
            {agendaTareas.map((item, i) => {
              const badge = obtenerBadgeEstado(item.status);
              return (
                <div key={i} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{item.user} • {item.time}</p>
                  </div>
                  <span className={badge.badgeClass}>{badge.etiqueta}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Consumo de Presupuesto */}
        <div className="app-card overflow-hidden">
          <div className="app-card-header">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Consumo de Presupuesto
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {presupuestos.map((item, i) => {
              const estilo = obtenerEstiloPorcentaje(item.percent);
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="text-slate-500 font-mono">{item.spent} / {item.budget}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${estilo.barClass}`} style={{ width: `${item.percent}%` }} />
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-bold ${estilo.textClass}`}>{item.percent}% consumido</span>
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
