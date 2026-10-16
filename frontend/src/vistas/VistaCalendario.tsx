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
  
  // Calculamos el lunes de esta semana
  const diaDeLaSemana = (fechaHoy.getDay() + 6) % 7; // 0 = Lunes
  const fechaLunes = new Date(fechaHoy);
  fechaLunes.setDate(fechaHoy.getDate() - diaDeLaSemana);

  // Armamos la lista de días con sus registros
  const diasDeLaSemana = diasSemanaNombres.map((nombre, indice) => {
    const fecha = new Date(fechaLunes);
    fecha.setDate(fechaLunes.getDate() + indice);
    const fechaIso = fecha.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Buscamos los registros que pertenecen a este día
    const registrosDelDia = registros.filter((reg) => reg.fecha === fechaIso);

    // Sumamos los minutos trabajados en este día
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

  // 6. Función para abrir el modal cuando el usuario hace clic en "+ Añadir" en un día
  const abrirFormularioParaDia = (dia: typeof diasDeLaSemana[0]) => {
    setFechaSeleccionada(dia.fechaIso);
    setNombreDiaSeleccionado(`${dia.nombre} ${dia.numero}`);
    setDescripcion('');
    setErrorValidacion('');
    setModalAbierto(true);
  };

  // 7. Función para guardar el nuevo trabajo creado en el calendario
  const guardarTrabajoEnCalendario = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica: la descripción no puede estar vacía
    if (!descripcion.trim()) {
      setErrorValidacion('Por favor escribe en qué trabajaste.');
      return;
    }

    // Validación básica: la hora de inicio debe ser antes que la de fin
    if (horaInicio >= horaFin) {
      setErrorValidacion('La hora de inicio debe ser menor que la de fin.');
      return;
    }

    // Calculamos cuántos minutos duró el trabajo
    const duracion = calcularDiferenciaMinutos(horaInicio, horaFin);

    // Guardamos la nueva entrada
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

    // Cerramos el modal y limpiamos el formulario
    setModalAbierto(false);
    setDescripcion('');
    setErrorValidacion('');
  };

  return (
    <div className="space-y-4">
      {/* Barra superior de controles */}
      <div className="bg-white border border-[#dfe5eb] rounded-md px-4 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-[#dfe5eb] rounded">
            <button className="p-1.5 text-slate-500 hover:bg-[#f2f6f8] border-r border-[#dfe5eb] cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-[#f2f6f8] cursor-pointer">
              Hoy
            </button>
            <button className="p-1.5 text-slate-500 hover:bg-[#f2f6f8] border-l border-[#dfe5eb] cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-semibold text-slate-800">
            Esta Semana • Octubre 2026
          </span>
        </div>

        {/* Selector de Semana / Mes */}
        <div className="flex border border-[#dfe5eb] rounded overflow-hidden text-xs">
          <button
            onClick={() => setModo('semana')}
            className={`px-3 py-1.5 font-semibold cursor-pointer ${
              modo === 'semana' ? 'bg-[#03a9f4] text-white' : 'bg-white text-slate-600 hover:bg-[#f2f6f8]'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setModo('mes')}
            className={`px-3 py-1.5 font-semibold cursor-pointer border-l border-[#dfe5eb] ${
              modo === 'mes' ? 'bg-[#03a9f4] text-white' : 'bg-white text-slate-600 hover:bg-[#f2f6f8]'
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
              dia.esHoy ? 'border-[#03a9f4] ring-1 ring-[#03a9f4]' : 'border-[#dfe5eb]'
            }`}
          >
            {/* Cabecera de cada día */}
            <div className={`p-2.5 border-b text-center ${dia.esHoy ? 'bg-[#e1f5fe]/50 border-[#03a9f4]/30' : 'bg-[#fafbfc] border-[#dfe5eb]'}`}>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{dia.nombre}</div>
              <div className={`text-lg font-bold ${dia.esHoy ? 'text-[#03a9f4]' : 'text-slate-800'}`}>
                {dia.numero}
              </div>
              <div className="text-[11px] font-mono text-slate-500 font-semibold mt-0.5">
                {dia.minutosTotales > 0 ? formatearMinutos(dia.minutosTotales) : '0h 0m'}
              </div>

              {/* Botón rápido "+ Añadir" para crear trabajo en este día */}
              <button
                type="button"
                onClick={() => abrirFormularioParaDia(dia)}
                className="mt-2 w-full py-1 px-2 rounded bg-white hover:bg-[#e1f5fe] border border-[#dfe5eb] hover:border-[#03a9f4] text-[11px] font-bold text-[#03a9f4] flex items-center justify-center gap-1 transition cursor-pointer"
                title={`Crear entrada para el ${dia.nombre}`}
              >
                <Plus className="w-3 h-3" />
                <span>Añadir</span>
              </button>
            </div>

            {/* Lista de tarjetas de trabajo registradas en este día */}
            <div className="p-2 space-y-1.5 flex-1 overflow-y-auto">
              {dia.registros.map((reg) => {
                const proy = proyectos.find((p) => p.id === reg.proyectoId);
                return (
                  <div
                    key={reg.id}
                    className="p-2 rounded text-[11px] border shadow-xs transition hover:shadow-sm"
                    style={{
                      borderLeftColor: proy?.color || '#03a9f4',
                      borderLeftWidth: '3px',
                      backgroundColor: '#f8fafc',
                      borderColor: '#e2e8f0',
                    }}
                  >
                    <div className="flex items-center justify-between text-slate-700 font-semibold truncate">
                      <span>{proy?.codigo}</span>
                      <span className="font-mono text-[10px] text-slate-500">{formatearMinutos(reg.duracionMinutos)}</span>
                    </div>
                    {reg.horaInicio && reg.horaFin && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        {reg.horaInicio} - {reg.horaFin}
                      </div>
                    )}
                    <p className="text-slate-600 truncate text-[10px] mt-0.5">{reg.descripcion}</p>
                  </div>
                );
              })}

              {dia.registros.length === 0 && (
                <div className="h-28 flex items-center justify-center text-center p-2">
                  <span className="text-[11px] text-slate-400">Sin horas registradas</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ======================================================== */}
      {/* MODAL SENCILLO PARA CREAR TRABAJO DESDE EL CALENDARIO    */}
      {/* ======================================================== */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-[#dfe5eb] shadow-2xl max-w-md w-full overflow-hidden animate-fade-in text-xs">
            {/* Cabecera del modal */}
            <div className="bg-[#1b2733] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#03a9f4]" />
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
            <form onSubmit={guardarTrabajoEnCalendario} className="p-5 space-y-4 text-slate-700">
              {/* Mensaje de error si falta llenar algo */}
              {errorValidacion && (
                <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  {errorValidacion}
                </div>
              )}

              {/* Campo: ¿En qué trabajaste? */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ¿En qué trabajaste? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: Revisión de requerimientos con el equipo"
                  className="w-full border border-[#dfe5eb] rounded p-2 text-slate-800 text-xs focus:outline-none focus:border-[#03a9f4]"
                />
              </div>

              {/* Campo: Proyecto */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Proyecto
                </label>
                <select
                  value={proyectoId}
                  onChange={(e) => setProyectoId(e.target.value)}
                  className="w-full border border-[#dfe5eb] rounded p-2 text-slate-800 text-xs bg-white focus:outline-none focus:border-[#03a9f4]"
                >
                  {proyectos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} – {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo: Horario de inicio y fin */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full border border-[#dfe5eb] rounded p-2 text-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full border border-[#dfe5eb] rounded p-2 text-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Campo: Facturable */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="facturable-cal"
                  checked={esFacturable}
                  onChange={(e) => setEsFacturable(e.target.checked)}
                  className="rounded border-[#dfe5eb] text-[#03a9f4]"
                />
                <label htmlFor="facturable-cal" className="text-slate-600 font-medium cursor-pointer">
                  Trabajo facturable para UTEL
                </label>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#dfe5eb]">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-3 py-1.5 rounded border border-[#dfe5eb] text-slate-600 hover:bg-[#f2f6f8] cursor-pointer font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#03a9f4] hover:bg-[#0288d1] text-white font-bold cursor-pointer flex items-center gap-1 shadow-sm"
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
