import React, { useState } from 'react';
import { PlusCircle, Clock, Trash2, FileText, Check, AlertCircle } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearMinutos, calcularDiferenciaMinutos, obtenerFechaHoy } from '../utilidades/formateadores';

export const VistaRegistroHoras: React.FC = () => {
  const { proyectos, tareas, registros, agregarRegistro, eliminarRegistro } = usarHoras();

  // Estados del formulario
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

  // Tareas filtradas por proyecto seleccionado
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

    // Agregar registro
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

  // Total de horas registradas hoy
  const minutosHoy = registros
    .filter((r) => r.fecha === obtenerFechaHoy())
    .reduce((acc, curr) => acc + curr.duracionMinutos, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Formulario de Alta Manual (Tarea 07) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                Registrar Horas Manualmente
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Requerimiento UTEL RF-25 a RF-29</p>
            </div>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono px-2 py-1 rounded">
              Tarea 07
            </span>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {exito && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-sm text-emerald-400">
              <Check className="w-4 h-4 shrink-0" />
              <span>¡Horas registradas exitosamente!</span>
            </div>
          )}

          <form onSubmit={manejarEnvio} className="mt-4 space-y-4">
            {/* Proyecto y Tarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Proyecto
              </label>
              <select
                value={proyectoId}
                onChange={(e) => {
                  setProyectoId(e.target.value);
                  const primeras = tareas.filter((t) => t.proyectoId === e.target.value);
                  if (primeras.length > 0) setTareaId(primeras[0].id);
                }}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} – {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tarea asociada
              </label>
              <select
                value={tareaId}
                onChange={(e) => setTareaId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {tareasFiltradas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
                {tareasFiltradas.length === 0 && (
                  <option value="">(Sin tareas asociadas)</option>
                )}
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Fecha de Trabajo
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Alternador Rango Horario vs Duración */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">Modalidad de registro:</span>
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setUsarRangoHorario(true)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    usarRangoHorario ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  Inicio y Fin
                </button>
                <button
                  type="button"
                  onClick={() => setUsarRangoHorario(false)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    !usarRangoHorario ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  Solo Duración
                </button>
              </div>
            </div>

            {usarRangoHorario ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Duración en minutos</label>
                <input
                  type="number"
                  min="1"
                  step="15"
                  value={duracionManual}
                  onChange={(e) => setDuracionManual(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Descripción */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Descripción de la Actividad
              </label>
              <textarea
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="¿Qué actividades realizaste en este lapso?"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Checkbox facturable */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="facturable"
                checked={esFacturable}
                onChange={(e) => setEsFacturable(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="facturable" className="text-xs text-slate-300 select-none">
                Hora facturable para UTEL
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Guardar Registro de Horas
            </button>
          </form>
        </div>
      </div>

      {/* Historial y Lista de Registros */}
      <div className="lg:col-span-7 space-y-6">
        {/* Tarjeta Resumen Hoy */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Total Acumulado Hoy
            </span>
            <div className="text-3xl font-extrabold text-white mt-0.5">
              {formatearMinutos(minutosHoy)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Registros cargados para la fecha actual</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Lista de Registros */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Historial de Registros ({registros.length})
            </h3>
            <span className="text-xs text-slate-400">Orden cronológico</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {registros.map((reg) => {
              const proy = proyectos.find((p) => p.id === reg.proyectoId);
              return (
                <div
                  key={reg.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: proy?.color || '#6366f1' }}
                      />
                      <span className="text-xs font-bold text-slate-200">
                        {proy?.codigo || 'UTEL'}
                      </span>
                      <span className="text-xs text-slate-400">• {reg.fecha}</span>
                      {reg.horaInicio && reg.horaFin && (
                        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                          {reg.horaInicio} - {reg.horaFin}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-1">{reg.descripcion}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm font-bold text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 font-mono">
                      {formatearMinutos(reg.duracionMinutos)}
                    </span>
                    <button
                      onClick={() => eliminarRegistro(reg.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Eliminar registro"
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
    </div>
  );
};
