import React, { useState } from 'react';
import { Play, Pause, Square, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearSegundos } from '../utilidades/formateadores';

export const VistaCronometro: React.FC = () => {
  const { proyectos, tareas, cronometro, iniciarCronometro, pausarCronometro, detenerYGuardarCronometro } = usarHoras();

  const [proyectoId, setProyectoId] = useState(cronometro.proyectoId || proyectos[0]?.id || '');
  const [tareaId, setTareaId] = useState(cronometro.tareaId || tareas[0]?.id || '');
  const [descripcion, setDescripcion] = useState(cronometro.descripcion || '');
  const [mensajeGuardado, setMensajeGuardado] = useState(false);

  const tareasFiltradas = tareas.filter((t) => t.proyectoId === proyectoId);
  const proyectoActivo = proyectos.find((p) => p.id === proyectoId);

  const manejarIniciar = () => {
    iniciarCronometro(proyectoId, tareaId, descripcion);
  };

  const manejarDetener = () => {
    detenerYGuardarCronometro();
    setMensajeGuardado(true);
    setDescripcion('');
    setTimeout(() => setMensajeGuardado(false), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Encabezado del Módulo */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tarea 08 • Requisitos UTEL RF-22 a RF-24</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Cronómetro Persistente en Tiempo Real
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Mide el tiempo exacto dedicado a tus proyectos y tareas. El cronómetro no se detiene si
          recargas o cierras la pestaña del navegador.
        </p>
      </div>

      {/* Tarjeta Principal del Cronómetro */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center">
        {/* Glow de fondo si está activo */}
        {cronometro.estaActivo && (
          <div className="absolute inset-0 bg-indigo-600/10 blur-3xl pointer-events-none animate-pulse" />
        )}

        {/* Notificación de guardado */}
        {mensajeGuardado && (
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>¡Tiempo registrado exitosamente en tu historial!</span>
          </div>
        )}

        {/* Display del Cronómetro */}
        <div className="py-6 font-mono font-black text-6xl sm:text-8xl tracking-tight text-white select-none">
          {formatearSegundos(cronometro.segundosTranscurridos)}
        </div>

        {/* Proyecto activo indicador */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: proyectoActivo?.color || '#6366f1' }}
          />
          <span className="text-sm font-semibold text-slate-300">
            {proyectoActivo?.nombre}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ({cronometro.estaActivo ? 'En ejecución' : 'En pausa'})
          </span>
        </div>

        {/* Controles de Selección */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-6 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Proyecto
            </label>
            <select
              value={proyectoId}
              disabled={cronometro.estaActivo}
              onChange={(e) => {
                setProyectoId(e.target.value);
                const primeras = tareas.filter((t) => t.proyectoId === e.target.value);
                if (primeras.length > 0) setTareaId(primeras[0].id);
              }}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 disabled:opacity-50"
            >
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo} – {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Tarea
            </label>
            <select
              value={tareaId}
              disabled={cronometro.estaActivo}
              onChange={(e) => setTareaId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 disabled:opacity-50"
            >
              {tareasFiltradas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Descripción de lo que se está haciendo */}
        <div className="max-w-xl mx-auto mb-8 text-left">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            ¿En qué estás trabajando ahora?
          </label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Corrección de consultas lentas en módulo de reportes..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-center gap-4">
          {!cronometro.estaActivo ? (
            <button
              onClick={manejarIniciar}
              className="px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/40 flex items-center gap-2 transition-all transform hover:scale-105 cursor-pointer text-lg"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{cronometro.segundosTranscurridos > 0 ? 'Reanudar' : 'Iniciar Tiempo'}</span>
            </button>
          ) : (
            <button
              onClick={pausarCronometro}
              className="px-8 py-3.5 rounded-2xl font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-xl shadow-amber-600/40 flex items-center gap-2 transition-all transform hover:scale-105 cursor-pointer text-lg"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pausar</span>
            </button>
          )}

          {cronometro.segundosTranscurridos > 0 && (
            <button
              onClick={manejarDetener}
              className="px-6 py-3.5 rounded-2xl font-semibold text-slate-200 bg-slate-800 hover:bg-red-600 hover:text-white border border-slate-700 hover:border-red-500 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Detener y Guardar</span>
            </button>
          )}
        </div>
      </div>

      {/* Nota de especificación UTEL */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Garantía de Persistencia Local (RNF-14)</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            El estado de tu cronómetro se respalda localmente en tiempo real. Aunque la conexión falle o
            cierres tu navegador, tus segundos no se perderán y podrás finalizar tu registro en cuanto
            regreses.
          </p>
        </div>
      </div>
    </div>
  );
};
