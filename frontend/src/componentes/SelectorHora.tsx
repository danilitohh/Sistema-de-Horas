import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Clock3 } from 'lucide-react';

interface PropsSelectorHora {
  etiqueta: string;
  valor: string;
  alCambiar: (valor: string) => void;
}

const dosDigitos = (numero: number) => String(numero).padStart(2, '0');

export const SelectorHora: React.FC<PropsSelectorHora> = ({ etiqueta, valor, alCambiar }) => {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const horaSeleccionadaRef = useRef<HTMLButtonElement>(null);
  const minutoSeleccionadoRef = useRef<HTMLButtonElement>(null);
  const [hora24, minutoTexto] = (valor || '09:00').split(':');
  const horaActual24 = Number(hora24) || 0;
  const minutoActual = Number(minutoTexto) || 0;
  const esPM = horaActual24 >= 12;
  const hora12Actual = horaActual24 % 12 || 12;

  useEffect(() => {
    if (!abierto) return;
    const alHacerClick = (evento: PointerEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const alPresionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('pointerdown', alHacerClick);
    document.addEventListener('keydown', alPresionarTecla);
    return () => {
      document.removeEventListener('pointerdown', alHacerClick);
      document.removeEventListener('keydown', alPresionarTecla);
    };
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    horaSeleccionadaRef.current?.scrollIntoView({ block: 'center' });
    minutoSeleccionadoRef.current?.scrollIntoView({ block: 'center' });
  }, [abierto, hora12Actual, minutoActual]);

  const actualizar = (hora12: number, minuto: number, pm: boolean) => {
    const hora24Nueva = (hora12 % 12) + (pm ? 12 : 0);
    alCambiar(`${dosDigitos(hora24Nueva)}:${dosDigitos(minuto)}`);
  };

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((actual) => !actual)}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-label={`${etiqueta}: ${dosDigitos(hora12Actual)}:${dosDigitos(minutoActual)} ${esPM ? 'PM' : 'AM'}`}
        className={`form-input flex h-[42px] items-center justify-between gap-2 text-left font-mono text-sm ${abierto ? 'border-[#22C55E] bg-white ring-2 ring-[#22C55E]/15' : 'hover:border-slate-300'}`}
      >
        <span className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold tracking-wide text-slate-700">{dosDigitos(hora12Actual)}:{dosDigitos(minutoActual)}</span>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">{esPM ? 'PM' : 'AM'}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div role="dialog" aria-label={`Seleccionar ${etiqueta.toLowerCase()}`} className={`absolute bottom-full ${etiqueta === 'Fin' ? 'right-0' : 'left-0'} z-40 mb-2 w-[260px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10`}>
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selecciona la hora</span>
            <span className="text-xs font-bold text-slate-700">{dosDigitos(hora12Actual)}:{dosDigitos(minutoActual)} {esPM ? 'PM' : 'AM'}</span>
          </div>
          <div className="grid grid-cols-[1fr_1fr_64px] gap-2">
            <div>
              <p className="mb-1 px-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Hora</p>
              <div className="h-36 overflow-y-auto rounded-xl bg-slate-50 p-1">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((hora) => (
                  <button ref={hora === hora12Actual ? horaSeleccionadaRef : undefined} key={hora} type="button" onClick={() => actualizar(hora, minutoActual, esPM)} aria-pressed={hora === hora12Actual}
                    className={`mb-0.5 w-full rounded-lg px-2 py-1.5 text-sm font-semibold transition ${hora === hora12Actual ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-emerald-700'}`}>
                    {dosDigitos(hora)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 px-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Minutos</p>
              <div className="h-36 overflow-y-auto rounded-xl bg-slate-50 p-1">
                {Array.from({ length: 60 }, (_, minuto) => minuto).map((minuto) => (
                  <button ref={minuto === minutoActual ? minutoSeleccionadoRef : undefined} key={minuto} type="button" onClick={() => actualizar(hora12Actual, minuto, esPM)} aria-pressed={minuto === minutoActual}
                    className={`mb-0.5 w-full rounded-lg px-2 py-1.5 text-sm font-semibold transition ${minuto === minutoActual ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-emerald-700'}`}>
                    {dosDigitos(minuto)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 px-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Periodo</p>
              <div className="space-y-1 rounded-xl bg-slate-50 p-1">
                {(['AM', 'PM'] as const).map((periodo) => {
                  const seleccionado = (periodo === 'PM') === esPM;
                  return (
                    <button key={periodo} type="button" onClick={() => actualizar(hora12Actual, minutoActual, periodo === 'PM')} aria-pressed={seleccionado}
                      className={`w-full rounded-lg px-2 py-2 text-xs font-bold transition ${seleccionado ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-emerald-700'}`}>
                      {periodo}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <button type="button" onClick={() => setAbierto(false)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 text-xs font-bold text-white transition hover:bg-slate-700">
            <Check className="h-3.5 w-3.5" /> Listo
          </button>
        </div>
      )}
    </div>
  );
};
