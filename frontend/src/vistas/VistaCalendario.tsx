import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, Check } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearMinutos, calcularDiferenciaMinutos } from '../utilidades/formateadores';

export const VistaCalendario: React.FC = () => {
  // 1. Obtenemos los datos globales desde nuestro contexto de horas
  const { registros, proyectos, tareas, agregarRegistro } = usarHoras();

  // 2. Estados para el control de vista (semana o mes)
  const [modo, setModo] = useState<'semana' | 'mes'>('semana');

  // 3. Estados para el modal de "Crear trabajo desde el calendario"
  const [modalAbierto, setModalAbierto] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [nombreDiaSeleccionado, setNombreDiaSeleccionado] = useState('');

  // 4. Estados del formulario para la nueva entrada
  const [descripcion, setDescripcion] = useState('');
  const [proyectoId, setProyectoId] = useState(proyectos[0]?.id || '');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('11:00');
  const [esFacturable, setEsFacturable] = useState(true);
  const [errorValidacion, setErrorValidacion] = useState('');

  // 5. Calculamos los 7 días de la semana actual
  const diasSemanaNombres = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const fechaHoy = new Date();
  
  const diaDeLaSemana = (fechaHoy.getDay() + 6) % 7; // 0 = Lunes
  const fechaLunes = new Date(fechaHoy);
  fechaLunes.setDate(fechaHoy.getDate() - diaDeLaSemana);

  // Armamos la lista de días con sus registros
  const diasDeLaSemana = diasSemanaNombres.map((nombre, indice) => {
    const fecha = new Date(fechaLunes);
    fecha.setDate(fechaLunes.getDate() + indice);
    const fechaIso = fecha.toISOString().split('T')[0];

    const registrosDelDia = registros.filter((reg) => reg.fecha === fechaIso);
    const minutosTotales = registrosDelDia.reduce((total, reg) => total + reg.duracionMinutos, 0);

    return {
      nombre,
      numero: fecha.getDate(),
      fechaIso,
      esHoy: fechaIso === fechaHoy.toISOString().split('T')[0],
      registros: registrosDelDia,
      minutosTotales,
    };
  });

  // 6. Abrir el modal para el día seleccionado
  const abrirFormularioParaDia = (dia: typeof diasDeLaSemana[0]) => {
    setFechaSeleccionada(dia.fechaIso);
    setNombreDiaSeleccionado(`${dia.nombre} ${dia.numero}`);
    setDescripcion('');
    setErrorValidacion('');
    setModalAbierto(true);
  };

  // 7. Guardar el nuevo trabajo
  const guardarTrabajoEnCalendario = (e: React.FormEvent) => {
    e.preventDefault();

    if (!descripcion.trim()) {
      setErrorValidacion('Por favor escribe en qué trabajaste.');
      return;
    }

    if (horaInicio >= horaFin) {
      setErrorValidacion('La hora de inicio debe ser menor que la de fin.');
      return;
    }

    const duracion = calcularDiferenciaMinutos(horaInicio, horaFin);

    agregarRegistro({
      proyectoId,
      tareaId: tareas[0]?.id || '',
      descripcion,
      fecha: fechaSeleccionada,
      horaInicio,
      horaFin,
      duracionMinutos: duracion,
      esFacturable,
    });

    setModalAbierto(false);
    setDescripcion('');
    setErrorValidacion('');
  };

  return (
    <div className="space-y-4">
      {/* Barra superior de controles */}
      <div className="bg-white border border-[#D9D9D9] rounded-md px-4 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-[#D9D9D9] rounded">
            <button className="p-1.5 text-[#4E4E4E] hover:bg-[#F8F8F8] border-r border-[#D9D9D9] cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 text-xs font-semibold text-[#1C2D1A] hover:bg-[#F8F8F8] cursor-pointer">
              Hoy
            </button>
            <button className="p-1.5 text-[#4E4E4E] hover:bg-[#F8F8F8] border-l border-[#D9D9D9] cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-semibold text-[#1C2D1A]">
            Esta Semana • Octubre 2026
          </span>
        </div>

        {/* Selector de Semana / Mes */}
        <div className="flex border border-[#D9D9D9] rounded overflow-hidden text-xs">
          <button
            onClick={() => setModo('semana')}
            className={`px-3 py-1.5 font-semibold cursor-pointer ${
              modo === 'semana' ? 'bg-[#06B706] text-white' : 'bg-white text-[#4E4E4E] hover:bg-[#F8F8F8]'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setModo('mes')}
            className={`px-3 py-1.5 font-semibold cursor-pointer border-l border-[#D9D9D9] ${
              modo === 'mes' ? 'bg-[#06B706] text-white' : 'bg-white text-[#4E4E4E] hover:bg-[#F8F8F8]'
            }`}
          >
            Mes
          </button>
        </div>
      </div>

      {/* Rejilla de los 7 días de la semana */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {diasDeLaSemana.map((dia) => (
          <div
            key={dia.fechaIso}
            className={`bg-white border rounded-md min-h-[420px] flex flex-col shadow-sm ${
              dia.esHoy ? 'border-[#06B706] ring-1 ring-[#06B706]' : 'border-[#D9D9D9]'
            }`}
          >
            {/* Cabecera de cada día */}
            <div className={`p-2.5 border-b text-center ${dia.esHoy ? 'bg-[#e8fbe8] border-[#06B706]/30' : 'bg-[#F8F8F8] border-[#D9D9D9]'}`}>
              <div className="text-[11px] font-bold text-[#4E4E4E] uppercase tracking-wider">{dia.nombre}</div>
              <div className={`text-lg font-bold ${dia.esHoy ? 'text-[#06B706]' : 'text-[#1C2D1A]'}`}>
                {dia.numero}
              </div>
              <div className="text-[11px] font-mono text-[#4E4E4E] font-semibold mt-0.5">
                {dia.minutosTotales > 0 ? formatearMinutos(dia.minutosTotales) : '0h 0m'}
              </div>

              {/* Botón rápido "+ Añadir" */}
              <button
                type="button"
                onClick={() => abrirFormularioParaDia(dia)}
                className="mt-2 w-full py-1 px-2 rounded bg-white hover:bg-[#e8fbe8] border border-[#D9D9D9] hover:border-[#06B706] text-[11px] font-bold text-[#06B706] flex items-center justify-center gap-1 transition cursor-pointer"
                title={`Crear entrada para el ${dia.nombre}`}
              >
                <Plus className="w-3 h-3" />
                <span>Añadir</span>
              </button>
            </div>

            {/* Lista de tarjetas de trabajo */}
            <div className="p-2 space-y-1.5 flex-1 overflow-y-auto">
              {dia.registros.map((reg) => {
                const proy = proyectos.find((p) => p.id === reg.proyectoId);
                return (
                  <div
                    key={reg.id}
                    className="p-2 rounded text-[11px] border shadow-xs transition hover:shadow-sm"
                    style={{
                      borderLeftColor: proy?.color || '#06B706',
                      borderLeftWidth: '3px',
                      backgroundColor: '#FFFFFF',
                      borderColor: '#D9D9D9',
                    }}
                  >
                    <div className="flex items-center justify-between text-[#1C2D1A] font-semibold truncate">
                      <span>{proy?.codigo}</span>
                      <span className="font-mono text-[10px] text-[#4E4E4E]">{formatearMinutos(reg.duracionMinutos)}</span>
                    </div>
                    {reg.horaInicio && reg.horaFin && (
                      <div className="text-[10px] text-[#4E4E4E] font-mono">
                        {reg.horaInicio} - {reg.horaFin}
                      </div>
                    )}
                    <p className="text-[#4E4E4E] truncate text-[10px] mt-0.5">{reg.descripcion}</p>
                  </div>
                );
              })}

              {dia.registros.length === 0 && (
                <div className="h-28 flex items-center justify-center text-center p-2">
                  <span className="text-[11px] text-[#4E4E4E]/60">Sin horas registradas</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ======================================================== */}
      {/* MODAL PARA CREAR TRABAJO DESDE EL CALENDARIO             */}
      {/* ======================================================== */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-[#1C2D1A]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-[#D9D9D9] shadow-2xl max-w-md w-full overflow-hidden text-xs">
            {/* Cabecera del modal */}
            <div className="bg-[#1C2D1A] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#9FE770]" />
                <span className="font-bold text-sm">
                  Añadir trabajo • {nombreDiaSeleccionado}
                </span>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={guardarTrabajoEnCalendario} className="p-5 space-y-4 text-[#1C2D1A]">
              {errorValidacion && (
                <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  {errorValidacion}
                </div>
              )}

              {/* ¿En qué trabajaste? */}
              <div>
                <label className="block font-semibold text-[#1C2D1A] mb-1">
                  ¿En qué trabajaste? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: Revisión de requerimientos con el equipo"
                  className="w-full border border-[#D9D9D9] rounded p-2 text-[#1C2D1A] text-xs focus:outline-none focus:border-[#06B706]"
                />
              </div>

              {/* Proyecto */}
              <div>
                <label className="block font-semibold text-[#1C2D1A] mb-1">
                  Proyecto
                </label>
                <select
                  value={proyectoId}
                  onChange={(e) => setProyectoId(e.target.value)}
                  className="w-full border border-[#D9D9D9] rounded p-2 text-[#1C2D1A] text-xs bg-white focus:outline-none focus:border-[#06B706]"
                >
                  {proyectos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} – {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Horario */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C2D1A] mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full border border-[#D9D9D9] rounded p-2 text-[#1C2D1A] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1C2D1A] mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full border border-[#D9D9D9] rounded p-2 text-[#1C2D1A] text-xs"
                  />
                </div>
              </div>

              {/* Facturable */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="facturable-cal"
                  checked={esFacturable}
                  onChange={(e) => setEsFacturable(e.target.checked)}
                  className="rounded border-[#D9D9D9] text-[#06B706]"
                />
                <label htmlFor="facturable-cal" className="text-[#4E4E4E] font-medium cursor-pointer">
                  Trabajo facturable para UTEL
                </label>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D9D9D9]">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-3 py-1.5 rounded border border-[#D9D9D9] text-[#4E4E4E] hover:bg-[#F8F8F8] cursor-pointer font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#06B706] hover:bg-[#059e05] text-white font-bold cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar entrada</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
