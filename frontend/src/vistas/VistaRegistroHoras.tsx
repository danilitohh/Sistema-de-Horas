import React, { useState } from 'react';
import { PlusCircle, Trash2, CheckCircle2, AlertCircle, DollarSign, Edit2, Copy, AlertTriangle, X } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import type { RegistroHora } from '../tipos';
import {
  formatearMinutos,
  calcularDiferenciaMinutos,
  obtenerFechaHoy,
} from '../utilidades/formateadores';

export const VistaRegistroHoras: React.FC = () => {
  const { proyectos, tareas, registros, agregarRegistro, actualizarRegistro, eliminarRegistro } = usarHoras();

  // Estados del formulario
  const [fecha, setFecha] = useState(obtenerFechaHoy());
  const [proyectoId, setProyectoId] = useState(proyectos[0]?.id || '');
  const [tareaId, setTareaId] = useState(tareas[0]?.id || '');
  const [descripcion, setDescripcion] = useState('');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('11:00');
  const [esFacturable, setEsFacturable] = useState(true);

  // Edición, alertas y mensajes
  const [registroEnEdicion, setRegistroEnEdicion] = useState<RegistroHora | null>(null);
  const [error, setError] = useState('');
  const [advertenciaSolape, setAdvertenciaSolape] = useState('');
  const [exito, setExito] = useState('');

  // Tareas filtradas por proyecto
  const tareasDelProyecto = tareas.filter((t) => t.proyectoId === proyectoId);

  // Manejo de cambio de proyecto
  const handleCambioProyecto = (nuevoProyectoId: string) => {
    setProyectoId(nuevoProyectoId);
    const tareasRelacionadas = tareas.filter((t) => t.proyectoId === nuevoProyectoId);
    setTareaId(tareasRelacionadas[0]?.id || '');
  };

  // Cargar registro para edición
  const iniciarEdicion = (reg: RegistroHora) => {
    setRegistroEnEdicion(reg);
    setFecha(reg.fecha);
    setProyectoId(reg.proyectoId);
    setTareaId(reg.tareaId || '');
    setDescripcion(reg.descripcion);
    setHoraInicio(reg.horaInicio || '09:00');
    setHoraFin(reg.horaFin || '10:00');
    setEsFacturable(reg.esFacturable);
    setError('');
    setAdvertenciaSolape('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Duplicar registro en 1 clic
  const duplicarRegistro = (reg: RegistroHora) => {
    agregarRegistro({
      proyectoId: reg.proyectoId,
      tareaId: reg.tareaId,
      descripcion: `${reg.descripcion} (Copia)`,
      fecha: obtenerFechaHoy(),
      horaInicio: reg.horaInicio,
      horaFin: reg.horaFin,
      duracionMinutos: reg.duracionMinutos,
      esFacturable: reg.esFacturable,
    });
    setExito('¡Registro duplicado exitosamente para el día de hoy!');
    setTimeout(() => setExito(''), 3000);
  };

  const cancelarEdicion = () => {
    setRegistroEnEdicion(null);
    setDescripcion('');
    setError('');
    setAdvertenciaSolape('');
  };

  const guardarRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAdvertenciaSolape('');

    // Validaciones estrictas
    if (fecha > obtenerFechaHoy()) {
      return setError('No está permitido registrar horas en fechas futuras.');
    }
    if (horaInicio >= horaFin) {
      return setError('La hora de inicio debe ser anterior a la hora de fin.');
    }

    const duracionMin = calcularDiferenciaMinutos(horaInicio, horaFin);
    if (duracionMin > 1440) {
      return setError('La duración no puede superar las 24 horas continuas.');
    }

    // Validación no bloqueante de solapamiento
    const tieneSolape = registros.some(
      (r) =>
        r.id !== registroEnEdicion?.id &&
        r.fecha === fecha &&
        r.horaInicio &&
        r.horaFin &&
        horaInicio < r.horaFin &&
        horaFin > r.horaInicio
    );

    if (tieneSolape) {
      setAdvertenciaSolape('Aviso: Ya tienes un registro en este mismo rango de horas.');
    }

    if (registroEnEdicion) {
      actualizarRegistro({
        ...registroEnEdicion,
        proyectoId,
        tareaId: tareaId || undefined,
        descripcion: descripcion.slice(0, 500) || 'Actividad sin descripción',
        fecha,
        horaInicio,
        horaFin,
        duracionMinutos: duracionMin,
        esFacturable,
      });
      setRegistroEnEdicion(null);
      setExito('¡Registro actualizado correctamente!');
    } else {
      agregarRegistro({
        proyectoId,
        tareaId: tareaId || undefined,
        descripcion: descripcion.slice(0, 500) || 'Actividad sin descripción',
        fecha,
        horaInicio,
        horaFin,
        duracionMinutos: duracionMin,
        esFacturable,
      });
      setExito('¡Horas guardadas con éxito!');
    }

    setDescripcion('');
    setTimeout(() => setExito(''), 3000);
  };

  const minutosHoy = registros
    .filter((r) => r.fecha === obtenerFechaHoy())
    .reduce((total, r) => total + r.duracionMinutos, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* 1. Formulario Manual de Horas */}
      <div className="lg:col-span-5 app-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {registroEnEdicion ? 'Editar Registro de Tiempo' : 'Registro Manual de Horas'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {registroEnEdicion ? 'Modifica los valores del registro' : 'Ingreso directo de actividades con validaciones'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-[#22C55E]">
            {registroEnEdicion ? <Edit2 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {advertenciaSolape && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{advertenciaSolape}</span>
          </div>
        )}

        {exito && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{exito}</span>
          </div>
        )}

        <form onSubmit={guardarRegistro} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Fecha</label>
            <input
              type="date"
              max={obtenerFechaHoy()}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Proyecto Asignado</label>
              <select
                value={proyectoId}
                onChange={(e) => handleCambioProyecto(e.target.value)}
                className="form-input"
              >
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tarea Asociada</label>
              <select
                value={tareaId}
                onChange={(e) => setTareaId(e.target.value)}
                className="form-input"
              >
                {tareasDelProyecto.length > 0 ? (
                  tareasDelProyecto.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))
                ) : (
                  <option value="">(Sin tareas)</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Hora Inicio</label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="form-input font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Hora Fin</label>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="form-input font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-700 font-semibold">Descripción (Opcional, máx 500)</label>
              <span className="text-[10px] text-slate-400 font-mono">{descripcion.length}/500</span>
            </div>
            <textarea
              rows={2}
              maxLength={500}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalle de actividades realizadas..."
              className="form-input resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-700 font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#22C55E]" />
              ¿Es facturable?
            </span>
            <button
              type="button"
              onClick={() => setEsFacturable(!esFacturable)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                esFacturable ? 'bg-[#22C55E]' : 'bg-slate-200'
              }`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                esFacturable ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            {registroEnEdicion && (
              <button
                type="button"
                onClick={cancelarEdicion}
                className="btn-secondary flex-1 justify-center py-2.5"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="btn-primary flex-1 justify-center py-2.5"
            >
              {registroEnEdicion ? 'Actualizar Registro' : 'Guardar Entrada de Horas'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Banner de Meta Diaria e Historial */}
      <div className="lg:col-span-7 space-y-5">
        <div className="bg-[#1A2E1A] rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#86EFAC]">Progreso Diario</span>
            <h3 className="text-lg font-bold mt-1">Horas Registradas Hoy</h3>
            <p className="text-xs text-slate-300 mt-0.5">Fecha: {obtenerFechaHoy()}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-[#86EFAC] font-mono">{formatearMinutos(minutosHoy)}</span>
            <p className="text-xs text-slate-300 mt-1">{(minutosHoy / 60).toFixed(1)} / 8h meta</p>
          </div>
        </div>

        {/* Lista de Registros con Edición, Duplicación y Borrado */}
        <div className="app-card overflow-hidden">
          <div className="app-card-header">
            <h3 className="text-sm font-bold text-slate-800">Registros Recientes</h3>
            <span className="text-xs text-slate-400 font-mono">{registros.length} entradas</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
            {registros.map((reg) => {
              const proy = proyectos.find((p) => p.id === reg.proyectoId);
              const tar = tareas.find((t) => t.id === reg.tareaId);
              return (
                <div
                  key={reg.id}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {proy && (
                        <span className="text-[10px] font-semibold" style={{ color: proy.color }}>
                          {proy.nombre}
                        </span>
                      )}
                      {tar && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {tar.nombre}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">
                        {reg.fecha} • {reg.horaInicio}-{reg.horaFin}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 truncate">{reg.descripcion}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {reg.esFacturable && (
                      <span className="font-bold text-[#22C55E] bg-emerald-50 px-2 py-0.5 rounded-md">$</span>
                    )}
                    <span className="font-mono font-bold text-slate-800 mr-1">
                      {formatearMinutos(reg.duracionMinutos)}
                    </span>
                    <button
                      onClick={() => iniciarEdicion(reg)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                      title="Editar registro"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => duplicarRegistro(reg)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                      title="Duplicar para hoy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => eliminarRegistro(reg.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                      title="Eliminar"
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
