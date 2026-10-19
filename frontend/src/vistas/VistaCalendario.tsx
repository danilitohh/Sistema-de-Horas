import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, Check } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearMinutos, calcularDiferenciaMinutos } from '../utilidades/formateadores';

export const VistaCalendario: React.FC = () => {
  // 1. Datos globales
  const { registros, proyectos, agregarRegistro } = usarHoras();

  // 2. Estados para el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [nombreDia, setNombreDia] = useState('');

  // 3. Estados del formulario
  const [descripcion, setDescripcion] = useState('');
  const [proyectoId, setProyectoId] = useState(proyectos[0]?.id || '');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('11:00');
  const [esFacturable, setEsFacturable] = useState(true);
  const [error, setError] = useState('');

  // 4. Calculamos los días de la semana actual (Lunes a Domingo)
  const nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const hoy = new Date();
  const diaSemana = (hoy.getDay() + 6) % 7; // 0 = Lunes
  const fechaLunes = new Date(hoy);
  fechaLunes.setDate(hoy.getDate() - diaSemana);

  const dias = nombresDias.map((nombre, i) => {
    const f = new Date(fechaLunes);
    f.setDate(fechaLunes.getDate() + i);
    const fechaIso = f.toISOString().split('T')[0];

    // Registros y total de este día
    const tareasDelDia = registros.filter((r) => r.fecha === fechaIso);
    const minutos = tareasDelDia.reduce((sum, r) => sum + r.duracionMinutos, 0);

    return {
      nombre,
      numero: f.getDate(),
      fechaIso,
      esHoy: fechaIso === hoy.toISOString().split('T')[0],
      registros: tareasDelDia,
      minutos,
    };
  });

  // 5. Abrir el modal para el día elegido
  const abrirModal = (dia: typeof dias[0]) => {
    setFechaSeleccionada(dia.fechaIso);
    setNombreDia(`${dia.nombre} ${dia.numero}`);
    setDescripcion('');
    setError('');
    setModalAbierto(true);
  };

  // 6. Guardar entrada desde el calendario
  const guardarTrabajo = (e: React.FormEvent) => {
    e.preventDefault();

    if (!descripcion.trim()) {
      setError('Escribe qué actividades realizaste.');
      return;
    }

    if (horaInicio >= horaFin) {
      setError('La hora de inicio debe ser anterior a la de fin.');
      return;
    }

    agregarRegistro({
      proyectoId,
      descripcion,
      fecha: fechaSeleccionada,
      horaInicio,
      horaFin,
      duracionMinutos: calcularDiferenciaMinutos(horaInicio, horaFin),
      esFacturable,
    });

    setModalAbierto(false);
  };

  return (
    <div className="space-y-4 text-xs text-[#1C2D1A]">
      {/* Barra superior */}
      <div className="bg-white border border-[#D9D9D9] rounded-md px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex border border-[#D9D9D9] rounded overflow-hidden">
            <button className="p-1.5 hover:bg-[#F8F8F8] border-r border-[#D9D9D9]"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <span className="px-3 py-1 font-bold">Esta Semana</span>
            <button className="p-1.5 hover:bg-[#F8F8F8] border-l border-[#D9D9D9]"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <span className="text-[#4E4E4E] font-medium">Octubre 2026</span>
      </div>

      {/* Rejilla de los 7 días */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5">
        {dias.map((dia) => (
          <div
            key={dia.fechaIso}
            className={`bg-white border rounded-md min-h-[380px] flex flex-col shadow-sm ${
              dia.esHoy ? 'border-[#06B706] ring-1 ring-[#06B706]' : 'border-[#D9D9D9]'
            }`}
          >
            {/* Cabecera del día */}
            <div className={`p-2.5 border-b text-center ${dia.esHoy ? 'bg-[#e8fbe8]' : 'bg-[#F8F8F8]'}`}>
              <div className="font-bold text-[#4E4E4E] uppercase text-[10px]">{dia.nombre}</div>
              <div className={`text-base font-bold ${dia.esHoy ? 'text-[#06B706]' : ''}`}>{dia.numero}</div>
              <div className="font-mono text-[#4E4E4E] text-[10px] mt-0.5">{formatearMinutos(dia.minutos)}</div>

              <button
                type="button"
                onClick={() => abrirModal(dia)}
                className="mt-2 w-full py-1 rounded bg-white hover:bg-[#e8fbe8] border border-[#D9D9D9] hover:border-[#06B706] text-[#06B706] font-bold flex items-center justify-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-3 h-3" />
                <span>Añadir</span>
              </button>
            </div>

            {/* Bloques de horas del día */}
            <div className="p-1.5 space-y-1.5 flex-1 overflow-y-auto">
              {dia.registros.map((reg) => {
                const proy = proyectos.find((p) => p.id === reg.proyectoId);
                return (
                  <div
                    key={reg.id}
                    className="p-1.5 rounded border border-[#D9D9D9] shadow-xs text-[10px]"
                    style={{ borderLeftColor: proy?.color || '#06B706', borderLeftWidth: '3px' }}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="truncate">{proy?.codigo}</span>
                      <span className="font-mono">{formatearMinutos(reg.duracionMinutos)}</span>
                    </div>
                    <p className="text-[#4E4E4E] truncate mt-0.5">{reg.descripcion}</p>
                  </div>
                );
              })}
              {dia.registros.length === 0 && (
                <div className="text-center text-[#4E4E4E]/50 pt-8 text-[11px]">Sin horas</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para añadir horas */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-[#1C2D1A]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-[#D9D9D9] shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="bg-[#1C2D1A] text-white p-3 flex items-center justify-between">
              <span className="font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#9FE770]" />
                Añadir trabajo • {nombreDia}
              </span>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={guardarTrabajo} className="p-4 space-y-3">
              {error && <div className="p-2 bg-red-50 text-red-600 rounded border border-red-200">{error}</div>}

              <div>
                <label className="block font-semibold mb-1">¿En qué trabajaste?</label>
                <input
                  type="text"
                  autoFocus
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción de la tarea"
                  className="w-full border border-[#D9D9D9] rounded p-1.5 focus:outline-none focus:border-[#06B706]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Proyecto</label>
                <select
                  value={proyectoId}
                  onChange={(e) => setProyectoId(e.target.value)}
                  className="w-full border border-[#D9D9D9] rounded p-1.5 bg-white focus:outline-none"
                >
                  {proyectos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#4E4E4E] mb-1">Inicio</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full border border-[#D9D9D9] rounded p-1"
                  />
                </div>
                <div>
                  <label className="block text-[#4E4E4E] mb-1">Fin</label>
                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full border border-[#D9D9D9] rounded p-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="fact-modal"
                  checked={esFacturable}
                  onChange={(e) => setEsFacturable(e.target.checked)}
                  className="text-[#06B706] rounded"
                />
                <label htmlFor="fact-modal" className="text-[#4E4E4E] cursor-pointer">Hora facturable</label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D9D9]">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-3 py-1 border border-[#D9D9D9] rounded text-[#4E4E4E] hover:bg-[#F8F8F8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-[#06B706] hover:bg-[#059e05] text-white font-bold rounded flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
