import React from 'react';
import { Clock, Calendar, BarChart2, FileText, ChevronDown, CheckCircle2 } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';

interface PropsBarra {
  vistaActual: string;
  cambiarVista: (vista: string) => void;
}

export const BarraLateralClockify: React.FC<PropsBarra> = ({ vistaActual, cambiarVista }) => {
  const { usuario } = usarHoras();

  const menu = [
    { id: 'cronometro', etiqueta: 'Rastreador de tiempo', icono: Clock },
    { id: 'calendario', etiqueta: 'Calendario', icono: Calendar },
    { id: 'reportes', etiqueta: 'Panel & Informes', icono: BarChart2 },
    { id: 'registro', etiqueta: 'Formulario de Horas', icono: FileText },
  ];

  return (
    <aside className="w-64 bg-[#1b2733] text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-[#131c25] select-none">
      {/* Brand Header estilo Clockify */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#283848]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#03a9f4] flex items-center justify-center shadow-md shadow-[#03a9f4]/30">
            <Clock className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <span className="font-bold text-lg text-white tracking-wide">
            clockify <span className="text-[10px] text-[#03a9f4] uppercase font-mono font-bold tracking-normal ml-1">UTEL</span>
          </span>
        </div>
      </div>

      {/* Espacio de Trabajo / Workspace Dropdown */}
      <div className="px-4 py-3 border-b border-[#283848]">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
          Espacio de Trabajo
        </div>
        <div className="flex items-center justify-between bg-[#131c25] px-3 py-1.5 rounded text-xs text-white cursor-pointer hover:bg-[#0f1720] transition">
          <span className="font-semibold truncate">Utel proyecto</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-grow py-3 px-2 space-y-0.5 text-sm">
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Analizar
        </div>
        {menu.map((item) => {
          const Icono = item.icono;
          const estaActivo = vistaActual === item.id;
          return (
            <button
              key={item.id}
              onClick={() => cambiarVista(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded font-medium text-xs transition cursor-pointer text-left ${
                estaActivo
                  ? 'bg-[#03a9f4] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-[#253443] hover:text-white'
              }`}
            >
              <Icono className={`w-4 h-4 ${estaActivo ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.etiqueta}</span>
            </button>
          );
        })}
      </nav>

      {/* Perfil del Usuario en la parte inferior */}
      <div className="p-3 border-t border-[#283848] bg-[#17222c] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={usuario.avatar}
            alt={usuario.nombre}
            className="w-8 h-8 rounded-full ring-1 ring-[#03a9f4] object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{usuario.nombre}</p>
            <div className="flex items-center gap-1 text-[11px] text-[#03a9f4]">
              <CheckCircle2 className="w-3 h-3 text-[#03a9f4]" />
              <span className="truncate">Persona 2</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
