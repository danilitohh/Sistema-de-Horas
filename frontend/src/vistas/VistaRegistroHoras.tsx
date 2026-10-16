import React, { useState } from 'react';
import { PlusCircle, Clock, Trash2, Check, AlertCircle } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearMinutos, calcularDiferenciaMinutos, obtenerFechaHoy } from '../utilidades/formateadores';

export const VistaRegistroHoras: React.FC = () => {
  const { proyectos, tareas, registros, agregarRegistro, eliminarRegistro } = usarHoras();

  const [fecha, setFecha] = useState(obtenerFechaHoy());
  const [proyectoId, setProyectoId] = useState(proyectos[0]?.id || '');
  const [tareaId, setTareaId] = useState(tareas[0]?.id || '');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('11:00');
  const [duracionManual, setDuracionManual] = useState(120);
  const [usarRangoHorario, setUsarRangoHorario] = useState(true);
  const [descripcion, setDescripcion] = useState('');
  const [esFacturable, setEsFacturable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const tareasFiltradas = tareas.filter((t) => t.proyectoId === proyectoId);

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!descripcion.trim()) {
      setError('Por favor ingresa una descripción para este registro.');
      return;
    }

    let minutosCalculados = duracionManual;

    if (usarRangoHorario) {
      if (horaInicio >= horaFin) {
        setError('La hora de inicio debe ser anterior a la hora de fin.');
        return;
      }
      minutosCalculados = calcularDiferenciaMinutos(horaInicio, horaFin);
      if (minutosCalculados <= 0) {
        setError('El rango horario debe ser mayor a 0 minutos.');
        return;
      }
    } else {
      if (duracionManual <= 0) {
        setError('La duración ingresada debe ser mayor a 0 minutos.');
        return;
      }
    }

    agregarRegistro({
      proyectoId,
      tareaId,
      descripcion,
      fecha,
      horaInicio: usarRangoHorario ? horaInicio : undefined,
      horaFin: usarRangoHorario ? horaFin : undefined,
      duracionMinutos: minutosCalculados,
      esFacturable,
    });

    setDescripcion('');
    setExito(true);
    setTimeout(() => setExito(false), 3000);
  };

  const minutosHoy = registros
    .filter((r) => r.fecha === obtenerFechaHoy())
    .reduce((acc, curr) => acc + curr.duracionMinutos, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Formulario Clockify */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white border border-[#dfe5eb] rounded-md p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#dfe5eb]">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#03a9f4]" />
              Formulario de Horas Detallado
            </h2>
            <span className="text-[10px] bg-[#e1f5fe] text-[#03a9f4] font-bold px-2 py-0.5 rounded uppercase">
              Tarea 07
            </span>
          </div>

          {error && (
            <div className="mt-3 p-2.5 rounded bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {exito && (
            <div className="mt-3 p-2.5 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-700">
              <Check className="w-4 h-4 shrink-0" />
              <span>¡Registro guardado correctamente!</span>
            </div>
          )}

          <form onSubmit={manejarEnvio} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Proyecto</label>
              <select
                value={proyectoId}
                onChange={(e) => {
                  setProyectoId(e.target.value);
                  const primeras = tareas.filter((t) => t.proyectoId === e.target.value);
                  if (primeras.length > 0) setTareaId(primeras[0].id);
                }}
                className="w-full border border-[#dfe5eb] rounded p-2 text-slate-700 bg-white"
              >
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} – {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Tarea</label>
              <select
                value={tareaId}
                onChange={(e) => setTareaId(e.target.value)}
                className="w-full border border-[#dfe5eb] rounded p-2 text-slate-700 bg-white"
              >
                {tareasFiltradas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full border border-[#dfe5eb] rounded p-2 text-slate-700 bg-white"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500">Tipo de cálculo:</span>
              <div className="flex border border-[#dfe5eb] rounded overflow-hidden">
                <button
                  type="button"
                  onClick={() => setUsarRangoHorario(true)}
                  className={`px-2.5 py-1 ${
                    usarRangoHorario ? 'bg-[#03a9f4] text-white font-bold' : 'bg-white text-slate-600'
                  }`}
                >
                  Horario
                </button>
                <button
                  type="button"
                  onClick={() => setUsarRangoHorario(false)}
                  className={`px-2.5 py-1 border-l border-[#dfe5eb] ${
                    !usarRangoHorario ? 'bg-[#03a9f4] text-white font-bold' : 'bg-white text-slate-600'
                  }`}
                >
                  Duración
                </button>
              </div>
            </div>

            {usarRangoHorario ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Inicio</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full border border-[#dfe5eb] rounded p-1.5 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Fin</label>
                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full border border-[#dfe5eb] rounded p-1.5 text-slate-700"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-slate-500 mb-1">Minutos</label>
                <input
                  type="number"
                  min="1"
                  step="15"
                  value={duracionManual}
                  onChange={(e) => setDuracionManual(Number(e.target.value))}
                  className="w-full border border-[#dfe5eb] rounded p-1.5 text-slate-700"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Descripción</label>
              <textarea
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del trabajo..."
                className="w-full border border-[#dfe5eb] rounded p-2 text-slate-700 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="facturable-manual"
                checked={esFacturable}
                onChange={(e) => setEsFacturable(e.target.checked)}
                className="text-[#03a9f4] rounded"
              />
              <label htmlFor="facturable-manual" className="text-slate-600 cursor-pointer">
                Hora facturable
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded font-bold text-white uppercase tracking-wider bg-[#03a9f4] hover:bg-[#0288d1] shadow-xs transition cursor-pointer"
            >
              Guardar Entrada
            </button>
          </form>
        </div>
      </div>

      {/* Historial */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white border border-[#dfe5eb] rounded-md p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Registrado Hoy
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5 font-mono">
              {formatearMinutos(minutosHoy)}
            </div>
          </div>
          <Clock className="w-8 h-8 text-[#03a9f4]/40" />
        </div>

        <div className="bg-white border border-[#dfe5eb] rounded-md shadow-sm overflow-hidden">
          <div className="p-3 bg-[#f8fafc] border-b border-[#dfe5eb] flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Historial de Entradas ({registros.length})
            </span>
          </div>
          <div className="divide-y divide-[#f0f3f6]">
            {registros.map((reg) => {
              const proy = proyectos.find((p) => p.id === reg.proyectoId);
              return (
                <div key={reg.id} className="p-3 flex items-center justify-between text-xs hover:bg-[#fafbfc]">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: proy?.color }} />
                      <span className="font-semibold text-slate-800">{proy?.codigo}</span>
                      <span className="text-slate-400">• {reg.fecha}</span>
                    </div>
                    <p className="text-slate-600">{reg.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-800">{formatearMinutos(reg.duracionMinutos)}</span>
                    <button
                      onClick={() => eliminarRegistro(reg.id)}
                      className="text-slate-300 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
