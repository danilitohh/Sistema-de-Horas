import React from 'react';
import { Clock, Calendar, BarChart3, PlusCircle, CheckCircle2 } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearSegundos } from '../utilidades/formateadores';

interface PropsBarra {
  vistaActual: string;
  cambiarVista: (vista: string) => void;
}

export const BarraNavegacion: React.FC<PropsBarra> = ({ vistaActual, cambiarVista }) => {
  const { usuario, cronometro } = usarHoras();

  const pestanas = [
    { id: 'registro', etiqueta: 'Registro Manual', icono: PlusCircle, tarea: 'T-07' },
    { id: 'cronometro', etiqueta: 'Cronómetro', icono: Clock, tarea: 'T-08' },
    { id: 'calendario', etiqueta: 'Calendario', icono: Calendar, tarea: 'T-09' },
    { id: 'reportes', etiqueta: 'Dashboard & Reportes', icono: BarChart3, tarea: 'T-10/12' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Nombre del Sistema */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">TEMPO</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  UTEL
                </span>
              </div>
              <p className="text-xs text-slate-400">Sistema de Control de Horas</p>
            </div>
          </div>

          {/* Menú de Navegación por Módulos */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            {pestanas.map((item) => {
              const Icono = item.icono;
              const estaActivo = vistaActual === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => cambiarVista(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    estaActivo
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icono className="w-4 h-4" />
                  <span>{item.etiqueta}</span>
                  {item.id === 'cronometro' && cronometro.estaActivo && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full animate-pulse font-mono font-bold">
                      {formatearSegundos(cronometro.segundosTranscurridos)}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Información del Usuario conectado */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-200">{usuario.nombre}</p>
              <div className="flex items-center justify-end gap-1 text-xs text-indigo-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Persona 2 (Frontend)</span>
              </div>
            </div>
            <img
              src={usuario.avatar}
              alt={usuario.nombre}
              className="w-9 h-9 rounded-full ring-2 ring-indigo-500/40 object-cover"
            />
          </div>
        </div>

        {/* Navegación móvil */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-800/60">
          {pestanas.map((item) => {
            const Icono = item.icono;
            const estaActivo = vistaActual === item.id;
            return (
              <button
                key={item.id}
                onClick={() => cambiarVista(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
                  estaActivo ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-800/40'
                }`}
              >
                <Icono className="w-3.5 h-3.5" />
                <span>{item.etiqueta}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
