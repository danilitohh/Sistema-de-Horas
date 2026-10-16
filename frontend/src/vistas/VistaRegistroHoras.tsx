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
      {/* Formulario */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white border border-[#D9D9D9] rounded-md p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9D9D9]">
            <h2 className="text-sm font-bold text-[#1C2D1A] flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#06B706]" />
              Formulario de Horas Detallado
            </h2>
            <span className="text-[10px] bg-[#e8fbe8] text-[#06B706] font-bold px-2 py-0.5 rounded uppercase">
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
            <div className="mt-3 p-2.5 rounded bg-[#e8fbe8] border border-[#06B706]/30 flex items-center gap-2 text-xs text-[#06B706] font-semibold">
              <Check className="w-4 h-4 shrink-0" />
              <span>¡Registro guardado correctamente!</span>
            </div>
          )}

          <form onSubmit={manejarEnvio} className="mt-4 space-y-3.5 text-xs text-[#1C2D1A]">
            <div>
              <label className="block font-semibold text-[#1C2D1A] mb-1">Proyecto</label>
              <select
                value={proyectoId}
                onChange={(e) => {
                  setProyectoId(e.target.value);
                  const primeras = tareas.filter((t) => t.proyectoId === e.target.value);
                  if (primeras.length > 0) setTareaId(primeras[0].id);
                }}
                className="w-full border border-[#D9D9D9] rounded p-2 text-[#1C2D1A] bg-white focus:outline-none focus:border-[#06B706]"
              >
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} – {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#1C2D1A] mb-1">Tarea</label>
              <select
                value={tareaId}
                onChange={(e) => setTareaId(e.target.value)}
                className="w-full border border-[#D9D9D9] rounded p-2 text-[#1C2D1A] bg-white focus:outline-none focus:border-[#06B706]"
              >
                {tareasFiltradas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#1C2D1A] mb-1">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full border border-[#D9D9D9] rounded p-2 text-[#1C2D1A] bg-white focus:outline-none focus:border-[#06B706]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[#4E4E4E]">Tipo de cálculo:</span>
              <div className="flex border border-[#D9D9D9] rounded overflow-hidden">
                <button
                  type="button"
                  onClick={() => setUsarRangoHorario(true)}
                  className={`px-2.5 py-1 ${
                    usarRangoHorario ? 'bg-[#06B706] text-white font-bold' : 'bg-white text-[#4E4E4E]'
                  }`}
                >
                  Horario
                </button>
                <button
                  type="button"
                  onClick={() => setUsarRangoHorario(false)}
                  className={`px-2.5 py-1 border-l border-[#D9D9D9] ${
                    !usarRangoHorario ? 'bg-[#06B706] text-white font-bold' : 'bg-white text-[#4E4E4E]'
                  }`}
                >
                  Duración
                </button>
              </div>
            </div>

            {usarRangoHorario ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4E4E4E] mb-1">Inicio</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full border border-[#D9D9D9] rounded p-1.5 text-[#1C2D1A]"
                  />
                </div>
                <div>
                  <label className="block text-[#4E4E4E] mb-1">Fin</label>
                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full border border-[#D9D9D9] rounded p-1.5 text-[#1C2D1A]"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[#4E4E4E] mb-1">Minutos</label>
                <input
                  type="number"
                  min="1"
                  step="15"
                  value={duracionManual}
                  onChange={(e) => setDuracionManual(Number(e.target.value))}
                  className="w-full border border-[#D9D9D9] rounded p-1.5 text-[#1C2D1A]"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-[#1C2D1A] mb-1">Descripción</label>
              <textarea
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del trabajo..."
                className="w-full border border-[#D9D9D9] rounded p-2 text-[#1C2D1A] resize-none focus:outline-none focus:border-[#06B706]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="facturable-manual"
                checked={esFacturable}
                onChange={(e) => setEsFacturable(e.target.checked)}
                className="text-[#06B706] rounded"
              />
              <label htmlFor="facturable-manual" className="text-[#4E4E4E] cursor-pointer">
                Hora facturable
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded font-bold text-white uppercase tracking-wider bg-[#06B706] hover:bg-[#059e05] shadow-xs transition cursor-pointer"
            >
              Guardar Entrada
            </button>
          </form>
        </div>
      </div>

      {/* Historial */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white border border-[#D9D9D9] rounded-md p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#4E4E4E] uppercase tracking-wider">
              Total Registrado Hoy
            </div>
            <div className="text-2xl font-bold text-[#1C2D1A] mt-0.5 font-mono">
              {formatearMinutos(minutosHoy)}
            </div>
          </div>
          <Clock className="w-8 h-8 text-[#06B706]/40" />
        </div>

        <div className="bg-white border border-[#D9D9D9] rounded-md shadow-sm overflow-hidden">
          <div className="p-3 bg-[#F8F8F8] border-b border-[#D9D9D9] flex items-center justify-between">
            <span className="text-xs font-bold text-[#1C2D1A] uppercase tracking-wider">
              Historial de Entradas ({registros.length})
            </span>
          </div>
          <div className="divide-y divide-[#F8F8F8]">
            {registros.map((reg) => {
              const proy = proyectos.find((p) => p.id === reg.proyectoId);
              return (
                <div key={reg.id} className="p-3 flex items-center justify-between text-xs hover:bg-[#F8F8F8]">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: proy?.color }} />
                      <span className="font-semibold text-[#1C2D1A]">{proy?.codigo}</span>
                      <span className="text-[#4E4E4E]">• {reg.fecha}</span>
                    </div>
                    <p className="text-[#4E4E4E]">{reg.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[#1C2D1A]">{formatearMinutos(reg.duracionMinutos)}</span>
                    <button
                      onClick={() => eliminarRegistro(reg.id)}
                      className="text-[#D9D9D9] hover:text-red-500 p-1 cursor-pointer"
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
