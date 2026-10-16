import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearMinutos } from '../utilidades/formateadores';

export const VistaCalendario: React.FC = () => {
  const { registros, proyectos } = usarHoras();
  const [modo, setModo] = useState<'semana' | 'mes'>('semana');

  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const hoy = new Date();
  const diaSemanaIndex = (hoy.getDay() + 6) % 7;
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
    <div className="space-y-4">
      {/* Barra de Controles superior estilo Clockify */}
      <div className="bg-white border border-[#dfe5eb] rounded-md px-4 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-[#dfe5eb] rounded">
            <button className="p-1.5 text-slate-500 hover:bg-[#f2f6f8] border-r border-[#dfe5eb] cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-[#f2f6f8] cursor-pointer">
              Hoy
            </button>
            <button className="p-1.5 text-slate-500 hover:bg-[#f2f6f8] border-l border-[#dfe5eb] cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-semibold text-slate-800">
            Esta Semana • Octubre 2026
          </span>
        </div>

        {/* Selector Semana / Mes */}
        <div className="flex border border-[#dfe5eb] rounded overflow-hidden text-xs">
          <button
            onClick={() => setModo('semana')}
            className={`px-3 py-1.5 font-semibold cursor-pointer ${
              modo === 'semana' ? 'bg-[#03a9f4] text-white' : 'bg-white text-slate-600 hover:bg-[#f2f6f8]'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setModo('mes')}
            className={`px-3 py-1.5 font-semibold cursor-pointer border-l border-[#dfe5eb] ${
              modo === 'mes' ? 'bg-[#03a9f4] text-white' : 'bg-white text-slate-600 hover:bg-[#f2f6f8]'
            }`}
          >
            Mes
          </button>
        </div>
      </div>

      {/* Calendario Semanal */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {dias.map((dia) => (
          <div
            key={dia.fechaIso}
            className={`bg-white border rounded-md min-h-[380px] flex flex-col shadow-sm ${
              dia.esHoy ? 'border-[#03a9f4] ring-1 ring-[#03a9f4]' : 'border-[#dfe5eb]'
            }`}
          >
            {/* Cabecera del día */}
            <div className={`p-2.5 border-b text-center ${dia.esHoy ? 'bg-[#e1f5fe]/50 border-[#03a9f4]/30' : 'bg-[#fafbfc] border-[#dfe5eb]'}`}>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{dia.nombre}</div>
              <div className={`text-lg font-bold ${dia.esHoy ? 'text-[#03a9f4]' : 'text-slate-800'}`}>
                {dia.numero}
              </div>
              <div className="text-[11px] font-mono text-slate-500 font-semibold mt-0.5">
                {dia.minutosTotales > 0 ? formatearMinutos(dia.minutosTotales) : '0h 0m'}
              </div>
            </div>

            {/* Registros dentro del día */}
            <div className="p-2 space-y-1.5 flex-1 overflow-y-auto">
              {dia.registros.map((reg) => {
                const proy = proyectos.find((p) => p.id === reg.proyectoId);
                return (
                  <div
                    key={reg.id}
                    className="p-2 rounded text-[11px] border shadow-xs transition hover:shadow-sm"
                    style={{
                      borderLeftColor: proy?.color || '#03a9f4',
                      borderLeftWidth: '3px',
                      backgroundColor: '#f8fafc',
                      borderColor: '#e2e8f0',
                    }}
                  >
                    <div className="flex items-center justify-between text-slate-700 font-semibold truncate">
                      <span>{proy?.codigo}</span>
                      <span className="font-mono text-[10px] text-slate-500">{formatearMinutos(reg.duracionMinutos)}</span>
                    </div>
                    <p className="text-slate-500 truncate text-[10px] mt-0.5">{reg.descripcion}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
