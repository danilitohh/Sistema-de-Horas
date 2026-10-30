import React, { useState } from 'react';
import { Play, Square, DollarSign, Clock, List, Trash2, Calendar, ChevronDown } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import {
  formatearSegundos,
  formatearMinutos,
  calcularDiferenciaMinutos,
  obtenerFechaHoy,
} from '../utilidades/formateadores';

export const VistaCronometro: React.FC = () => {
  const {
    proyectos,
    tareas,
    registros,
    cronometro,
    agregarRegistro,
    eliminarRegistro,
    iniciarCronometro,
    detenerYGuardarCronometro,
  } = usarHoras();

  // Estados del rastreador
  const [modo, setModo] = useState<'cronometro' | 'manual'>('cronometro');
  const [descripcion, setDescripcion] = useState(cronometro.descripcion || '');
  const [proyectoId, setProyectoId] = useState(cronometro.proyectoId || proyectos[0]?.id || '');
  const [tareaId, setTareaId] = useState(cronometro.tareaId || '');
  const [esFacturable, setEsFacturable] = useState(true);
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('11:00');

  const tareasDelProyecto = tareas.filter((t) => t.proyectoId === proyectoId);

  // Acciones
  const alternarCronometro = () => {
    if (cronometro.estaActivo) {
      detenerYGuardarCronometro();
      setDescripcion('');
    } else {
      iniciarCronometro(proyectoId, tareaId || tareasDelProyecto[0]?.id || '', descripcion);
    }
  };

  const agregarRegistroManual = () => {
    if (!descripcion.trim()) return;
    agregarRegistro({
      proyectoId,
      tareaId: tareaId || undefined,
      descripcion,
      fecha: obtenerFechaHoy(),
      horaInicio,
      horaFin,
      duracionMinutos: Math.max(15, calcularDiferenciaMinutos(horaInicio, horaFin)),
      esFacturable,
    });
    setDescripcion('');
  };

  const reanudarRegistro = (reg: typeof registros[0]) => {
    setDescripcion(reg.descripcion);
    setProyectoId(reg.proyectoId);
    setTareaId(reg.tareaId || '');
    setEsFacturable(reg.esFacturable);
    iniciarCronometro(reg.proyectoId, reg.tareaId || '', reg.descripcion);
  };

  const proyectoActual = proyectos.find((p) => p.id === proyectoId);
  const totalHoy = registros
    .filter((r) => r.fecha === obtenerFechaHoy())
    .reduce((sum, r) => sum + r.duracionMinutos, 0);

  return (
    <div className="space-y-6">
      {/* 1. Barra de Rastreo */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Input descripción */}
        <input
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="¿En qué estás trabajando ahora mismo?"
          className="flex-1 min-w-0 text-base font-medium text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
        />

        {/* Controles de rastreo */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de proyecto */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: proyectoActual?.color || '#22C55E' }}
            />
            <select
              value={proyectoId}
              onChange={(e) => {
                setProyectoId(e.target.value);
                const relacionadas = tareas.filter((t) => t.proyectoId === e.target.value);
                setTareaId(relacionadas[0]?.id || '');
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
            >
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Selector de tarea */}
          {tareasDelProyecto.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
              <select
                value={tareaId}
                onChange={(e) => setTareaId(e.target.value)}
                className="bg-transparent text-xs text-slate-600 cursor-pointer focus:outline-none"
              >
                {tareasDelProyecto.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          )}

          {/* Botón Facturable */}
          <button
            type="button"
            onClick={() => setEsFacturable(!esFacturable)}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              esFacturable
                ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={esFacturable ? 'Facturable' : 'No facturable'}
          >
            <DollarSign className="w-4 h-4" />
          </button>

          {/* Selector de Modo */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setModo('cronometro')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                modo === 'cronometro' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
              }`}
              title="Temporizador"
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              onClick={() => setModo('manual')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                modo === 'manual' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
              }`}
              title="Manual"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Modo Cronómetro o Manual */}
          {modo === 'cronometro' ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-mono text-xl font-extrabold text-slate-900 tracking-wider">
                  {formatearSegundos(cronometro.segundosTranscurridos)}
                </span>
                {cronometro.segundosTranscurridos >= 36000 && (
                  <span className="block text-[10px] text-amber-600 font-bold">
                    ⚠️ Jornada &gt; 10h
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={alternarCronometro}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition active:scale-95 cursor-pointer ${
                  cronometro.estaActivo
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25'
                    : 'bg-[#22C55E] hover:bg-[#16A34A] shadow-[#22C55E]/30'
                }`}
              >
                {cronometro.estaActivo ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{cronometro.estaActivo ? 'Detener' : 'Iniciar'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none"
              />
              <span className="text-slate-400 font-bold">-</span>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none"
              />
              <button
                type="button"
                onClick={agregarRegistroManual}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider shadow-md shadow-[#22C55E]/25 transition active:scale-95 cursor-pointer"
              >
                + Añadir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Historial de Registros */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Cabecera del historial */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">Historial de Registros</h2>
            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {registros.length} entradas
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Hoy: <strong className="text-slate-800">{formatearMinutos(totalHoy)}</strong></span>
          </div>
        </div>

        {/* Lista de entradas */}
        <div className="divide-y divide-slate-100">
          {registros.map((reg) => {
            const proy = proyectos.find((p) => p.id === reg.proyectoId);
            return (
              <div
                key={reg.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition group"
              >
                {/* Info de la tarea */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: proy?.color || '#22C55E' }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-[#22C55E] transition-colors">
                      {reg.descripcion}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {proy && (
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: `${proy.color}15`, color: proy.color }}
                        >
                          {proy.nombre}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">{reg.fecha}</span>
                    </div>
                  </div>
                </div>

                {/* Métricas y botones */}
                <div className="flex items-center gap-4 shrink-0">
                  {reg.esFacturable && (
                    <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#22C55E] flex items-center justify-center font-bold text-xs" title="Facturable">
                      $
                    </span>
                  )}
                  {reg.horaInicio && reg.horaFin && (
                    <span className="text-xs text-slate-400 font-mono hidden md:inline">
                      {reg.horaInicio} - {reg.horaFin}
                    </span>
                  )}
                  <span className="font-mono font-bold text-sm text-slate-800 min-w-[70px] text-right">
                    {formatearMinutos(reg.duracionMinutos)}
                  </span>
                  <button
                    onClick={() => reanudarRegistro(reg)}
                    className="p-2 rounded-xl text-slate-400 hover:text-[#22C55E] hover:bg-[#22C55E]/10 transition cursor-pointer"
                    title="Continuar tarea"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={() => eliminarRegistro(reg.id)}
                    className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
