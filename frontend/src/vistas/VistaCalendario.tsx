import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearMinutos } from '../utilidades/formateadores';

export const VistaCalendario: React.FC = () => {
  const { registros, proyectos } = usarHoras();
  const [modo, setModo] = useState<'semana' | 'mes'>('semana');

  // Generamos los días de la semana actual
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  // Fechas simuladas para la semana actual
  const hoy = new Date();
  const diaSemanaIndex = (hoy.getDay() + 6) % 7; // 0 = Lunes
  const primerDiaSemana = new Date(hoy);
  primerDiaSemana.setDate(hoy.getDate() - diaSemanaIndex);

  const dias = diasSemana.map((nombre, i) => {
    const fecha = new Date(primerDiaSemana);
    fecha.setDate(primerDiaSemana.getDate() + i);
    const fechaIso = fecha.toISOString().split('T')[0];
    const registrosDelDia = registros.filter((r) => r.fecha === fechaIso);
    const minutosTotales = registrosDelDia.reduce((sum, r) => sum + r.duracionMinutos, 0);

    return {
      nombre,
      numero: fecha.getDate(),
      fechaIso,
      esHoy: fechaIso === hoy.toISOString().split('T')[0],
      registros: registrosDelDia,
      minutosTotales,
    };
  });

  return (
    <div className="space-y-6">
      {/* Barra Superior del Calendario */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Vista de Calendario Semanal</h2>
            <p className="text-xs text-slate-400">Tarea 09 • Visualización de bloques de horas (RF-31-RF-35)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de modo */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setModo('semana')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                modo === 'semana' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setModo('mes')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                modo === 'mes' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mes
            </button>
          </div>

          {/* Navegación fechas */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 text-slate-200">Esta Semana</span>
            <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Rejilla de la Semana */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {dias.map((dia) => (
          <div
            key={dia.fechaIso}
            className={`bg-slate-900 border rounded-2xl p-4 flex flex-col min-h-[360px] transition ${
              dia.esHoy ? 'border-indigo-500/60 shadow-lg shadow-indigo-500/10' : 'border-slate-800'
            }`}
          >
            {/* Encabezado del día */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">{dia.nombre}</span>
                <div
                  className={`text-xl font-extrabold ${
                    dia.esHoy ? 'text-indigo-400' : 'text-slate-200'
                  }`}
                >
                  {dia.numero}
                </div>
              </div>
              {dia.minutosTotales > 0 && (
                <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                  {formatearMinutos(dia.minutosTotales)}
                </span>
              )}
            </div>

            {/* Bloques de horas registrados en este día */}
            <div className="mt-3 space-y-2 flex-grow overflow-y-auto">
              {dia.registros.map((reg) => {
                const proy = proyectos.find((p) => p.id === reg.proyectoId);
                return (
                  <div
                    key={reg.id}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition space-y-1"
                    style={{ borderLeftColor: proy?.color || '#6366f1', borderLeftWidth: '3px' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 truncate">
                        {proy?.codigo}
                      </span>
                      <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                        {formatearMinutos(reg.duracionMinutos)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{reg.descripcion}</p>
                  </div>
                );
              })}

              {dia.registros.length === 0 && (
                <div className="h-full flex items-center justify-center text-center p-4">
                  <span className="text-xs text-slate-400">Sin horas registradas</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
