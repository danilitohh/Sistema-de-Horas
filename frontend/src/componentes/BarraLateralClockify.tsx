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
    <aside className="w-64 bg-[#1C2D1A] text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-[#142213] select-none">
      {/* Encabezado con el nombre de la app: clockUtel */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#2a4027]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#06B706] flex items-center justify-center shadow-md shadow-[#06B706]/30">
            <Clock className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <span className="font-bold text-lg text-white tracking-wide">
            clock<span className="text-[#9FE770]">Utel</span>
          </span>
        </div>
      </div>

      {/* Espacio de Trabajo / Workspace Dropdown */}
      <div className="px-4 py-3 border-b border-[#2a4027]">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[#9FE770] mb-1">
          Espacio de Trabajo
        </div>
        <div className="flex items-center justify-between bg-[#142213] px-3 py-1.5 rounded text-xs text-white cursor-pointer hover:bg-[#182917] transition border border-[#2a4027]">
          <span className="font-semibold truncate">Utel proyecto</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#9FE770] shrink-0" />
        </div>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-grow py-3 px-2 space-y-1 text-sm">
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
                  ? 'bg-[#06B706] text-white shadow-sm font-bold'
                  : 'text-slate-300 hover:bg-[#273e24] hover:text-white'
              }`}
            >
              <Icono className={`w-4 h-4 ${estaActivo ? 'text-white' : 'text-[#9FE770]'}`} />
              <span>{item.etiqueta}</span>
            </button>
          );
        })}
      </nav>

      {/* Perfil del Usuario en la parte inferior */}
      <div className="p-3 border-t border-[#2a4027] bg-[#142213] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={usuario.avatar}
            alt={usuario.nombre}
            className="w-8 h-8 rounded-full ring-1 ring-[#06B706] object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{usuario.nombre}</p>
            <div className="flex items-center gap-1 text-[11px] text-[#9FE770]">
              <CheckCircle2 className="w-3 h-3 text-[#06B706]" />
              <span className="truncate">Persona 2</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
