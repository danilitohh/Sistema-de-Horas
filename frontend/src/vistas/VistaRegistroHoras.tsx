import React, { useState } from 'react';
import { PlusCircle, Clock, Trash2, Check, AlertCircle } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearMinutos, calcularDiferenciaMinutos, obtenerFechaHoy } from '../utilidades/formateadores';

export const VistaRegistroHoras: React.FC = () => {
  // 1. Obtenemos los datos del contexto
  const { proyectos, registros, agregarRegistro, eliminarRegistro } = usarHoras();

  // 2. Estados simples para el formulario
  const [fecha, setFecha] = useState(obtenerFechaHoy());
  const [proyectoId, setProyectoId] = useState(proyectos[0]?.id || '');
  const [descripcion, setDescripcion] = useState('');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('11:00');
  const [esFacturable, setEsFacturable] = useState(true);

  // Estados de mensajes
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  // 3. Función para guardar una nueva entrada manual
  const guardarRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación básica de texto
    if (!descripcion.trim()) {
      setError('Escribe qué actividades realizaste.');
      return;
    }

    // Validación de horario
    if (horaInicio >= horaFin) {
      setError('La hora de inicio debe ser anterior a la de fin.');
      return;
    }

    const minutos = calcularDiferenciaMinutos(horaInicio, horaFin);

    agregarRegistro({
      proyectoId,
      descripcion,
      fecha,
      horaInicio,
      horaFin,
      duracionMinutos: minutos,
      esFacturable,
    });

    setDescripcion('');
    setExito(true);
    setTimeout(() => setExito(false), 3000);
  };

  // Suma total de minutos registrados en el día de hoy
  const minutosHoy = registros
    .filter((r) => r.fecha === obtenerFechaHoy())
    .reduce((total, r) => total + r.duracionMinutos, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs text-[#1C2D1A]">
      {/* Columna izquierda: Formulario */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white border border-[#D9D9D9] rounded-md p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9D9D9]">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#06B706]" />
              Formulario Manual de Horas
            </h2>
            <span className="text-[10px] bg-[#e8fbe8] text-[#06B706] font-bold px-2 py-0.5 rounded uppercase">
              Tarea 07
            </span>
          </div>

          {/* Alertas sencillas */}
          {error && (
            <div className="mt-3 p-2.5 rounded bg-red-50 border border-red-200 text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {exito && (
            <div className="mt-3 p-2.5 rounded bg-[#e8fbe8] border border-[#06B706]/30 text-[#06B706] font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>¡Horas guardadas con éxito!</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={guardarRegistro} className="mt-4 space-y-3.5">
            <div>
              <label className="block font-semibold mb-1">Proyecto</label>
              <select
                value={proyectoId}
                onChange={(e) => setProyectoId(e.target.value)}
                className="w-full border border-[#D9D9D9] rounded p-2 bg-white focus:outline-none focus:border-[#06B706]"
              >
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} – {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full border border-[#D9D9D9] rounded p-2 bg-white focus:outline-none focus:border-[#06B706]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#4E4E4E] mb-1">Hora Inicio</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full border border-[#D9D9D9] rounded p-1.5"
                />
              </div>
              <div>
                <label className="block text-[#4E4E4E] mb-1">Hora Fin</label>
                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full border border-[#D9D9D9] rounded p-1.5"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Descripción de la actividad</label>
              <textarea
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="¿Qué actividades realizaste?"
                className="w-full border border-[#D9D9D9] rounded p-2 resize-none focus:outline-none focus:border-[#06B706]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="facturable-ch"
                checked={esFacturable}
                onChange={(e) => setEsFacturable(e.target.checked)}
                className="text-[#06B706] rounded"
              />
              <label htmlFor="facturable-ch" className="text-[#4E4E4E] cursor-pointer">
                Hora facturable
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded font-bold text-white uppercase tracking-wider bg-[#06B706] hover:bg-[#059e05] shadow-xs cursor-pointer transition"
            >
              Guardar Entrada
            </button>
          </form>
        </div>
      </div>

      {/* Columna derecha: Resumen e historial */}
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
          <Clock className="w-8 h-8 text-[#06B706]/30" />
        </div>

        <div className="bg-white border border-[#D9D9D9] rounded-md shadow-sm overflow-hidden">
          <div className="p-3 bg-[#F8F8F8] border-b border-[#D9D9D9] font-bold">
            Entradas Guardadas ({registros.length})
          </div>
          <div className="divide-y divide-[#F8F8F8]">
            {registros.map((reg) => {
              const proy = proyectos.find((p) => p.id === reg.proyectoId);
              return (
                <div key={reg.id} className="p-3 flex items-center justify-between hover:bg-[#F8F8F8]">
                  <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: proy?.color }} />
                      <span className="font-semibold">{proy?.codigo}</span>
                      <span className="text-[#4E4E4E]">• {reg.fecha}</span>
                      {reg.horaInicio && (
                        <span className="text-[#4E4E4E] font-mono text-[10px]">
                          ({reg.horaInicio} - {reg.horaFin})
                        </span>
                      )}
                    </div>
                    <p className="text-[#4E4E4E] truncate">{reg.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold">{formatearMinutos(reg.duracionMinutos)}</span>
                    <button
                      onClick={() => eliminarRegistro(reg.id)}
                      className="text-[#D9D9D9] hover:text-red-500 p-1 cursor-pointer"
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
