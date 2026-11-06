import React, { useMemo } from 'react';
import { ArrowRight, CalendarDays, Clock3, FolderKanban, ListChecks } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearMinutos } from '../utilidades/formateadores';

interface Props {
  onIrCalendario: () => void;
}

const fechaLocalIso = (fecha: Date) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

export const VistaDashboardUsuario: React.FC<Props> = ({ onIrCalendario }) => {
  const { usuario, registros, proyectos } = usarHoras();

  const estadisticas = useMemo(() => {
    const hoy = new Date();
    const hoyIso = fechaLocalIso(hoy);
    const inicioSemana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    inicioSemana.setDate(inicioSemana.getDate() - ((inicioSemana.getDay() + 6) % 7));
    const inicioSemanaIso = fechaLocalIso(inicioSemana);
    const mes = hoyIso.slice(0, 7);
    const minutosHoy = registros.filter((r) => r.fecha === hoyIso).reduce((s, r) => s + r.duracionMinutos, 0);
    const minutosSemana = registros.filter((r) => r.fecha >= inicioSemanaIso && r.fecha <= hoyIso).reduce((s, r) => s + r.duracionMinutos, 0);
    const minutosMes = registros.filter((r) => r.fecha.startsWith(mes)).reduce((s, r) => s + r.duracionMinutos, 0);
    const proyectosUsados = new Set(registros.filter((r) => r.fecha.startsWith(mes)).map((r) => r.proyectoId)).size;
    return { minutosHoy, minutosSemana, minutosMes, proyectosUsados };
  }, [registros]);

  const tarjetas = [
    { etiqueta: 'Registrado hoy', valor: formatearMinutos(estadisticas.minutosHoy), icono: Clock3, tono: 'text-emerald-700 bg-emerald-50' },
    { etiqueta: 'Esta semana', valor: formatearMinutos(estadisticas.minutosSemana), icono: CalendarDays, tono: 'text-blue-700 bg-blue-50' },
    { etiqueta: 'Este mes', valor: formatearMinutos(estadisticas.minutosMes), icono: ListChecks, tono: 'text-violet-700 bg-violet-50' },
    { etiqueta: 'Proyectos con horas este mes', valor: String(estadisticas.proyectosUsados), icono: FolderKanban, tono: 'text-amber-700 bg-amber-50' },
  ];

  const recientes = [...registros]
    .sort((a, b) => `${b.fecha} ${b.horaInicio || ''}`.localeCompare(`${a.fecha} ${a.horaInicio || ''}`))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="app-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Tu resumen personal</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Hola, {usuario.nombre.split(' ')[0]}</h2>
          <p className="mt-1 text-sm text-slate-500">Aquí puedes revisar el tiempo que has registrado.</p>
        </div>
        <button onClick={onIrCalendario} className="btn-primary shrink-0">
          <CalendarDays className="h-4 w-4" />
          <span>Abrir Mi Calendario</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Estadísticas de horas">
        {tarjetas.map((tarjeta) => {
          const Icono = tarjeta.icono;
          return (
            <article key={tarjeta.etiqueta} className="app-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{tarjeta.etiqueta}</p>
                  <p className="mt-3 text-2xl font-extrabold text-slate-900">{tarjeta.valor}</p>
                </div>
                <span className={`rounded-xl p-2.5 ${tarjeta.tono}`}><Icono className="h-5 w-5" /></span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="app-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-bold text-slate-800">Registros recientes</h3>
            <p className="mt-0.5 text-xs text-slate-500">Tus últimas actividades registradas</p>
          </div>
          <button onClick={onIrCalendario} className="text-xs font-bold text-emerald-700 hover:text-emerald-800">Ver calendario</button>
        </div>
        {recientes.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">Todavía no tienes horas registradas. Usa el botón “+” de un día en Mi Calendario para empezar.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recientes.map((registro) => {
              const proyecto = proyectos.find((p) => p.id === registro.proyectoId);
              return (
                <div key={registro.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: proyecto?.color || '#22C55E' }} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{registro.descripcion}</p>
                      <p className="truncate text-xs text-slate-500">{proyecto?.nombre || 'Proyecto'} · {registro.fecha}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-slate-700">{formatearMinutos(registro.duracionMinutos)}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
