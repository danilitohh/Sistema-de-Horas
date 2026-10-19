import React, { useState } from 'react';
import { Play, DollarSign, Clock, List, Trash2 } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearSegundos, formatearMinutos, obtenerFechaHoy } from '../utilidades/formateadores';

export const VistaCronometro: React.FC = () => {
  // 1. Obtenemos datos globales y funciones desde el contexto
  const {
    proyectos,
    registros,
    cronometro,
    agregarRegistro,
    eliminarRegistro,
    iniciarCronometro,
    detenerYGuardarCronometro,
  } = usarHoras();

  // 2. Estados locales sencillos para el formulario de rastreo
  const [modo, setModo] = useState<'cronometro' | 'manual'>('cronometro');
  const [descripcion, setDescripcion] = useState(cronometro.descripcion || '');
  const [proyectoId, setProyectoId] = useState(cronometro.proyectoId || proyectos[0]?.id || '');
  const [esFacturable, setEsFacturable] = useState(true);

  // Estados para cuando se usa el modo manual (horas fijas)
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('11:00');

  // 3. Función para iniciar o detener el cronómetro
  const manejarBotonCronometro = () => {
    if (cronometro.estaActivo) {
      detenerYGuardarCronometro();
      setDescripcion('');
    } else {
      iniciarCronometro(proyectoId, '', descripcion);
    }
  };

  // 4. Función para guardar una entrada en modo manual
  const guardarModoManual = () => {
    if (!descripcion.trim()) return;

    // Calculamos duración en minutos
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFin.split(':').map(Number);
    const minutos = Math.max(15, (h2 * 60 + m2) - (h1 * 60 + m1));

    agregarRegistro({
      proyectoId,
      descripcion,
      fecha: obtenerFechaHoy(),
      horaInicio,
      horaFin,
      duracionMinutos: minutos,
      esFacturable,
    });

    setDescripcion('');
  };

  // 5. Función para reanudar una tarea anterior con el botón play
  const reanudarTarea = (reg: typeof registros[0]) => {
    setDescripcion(reg.descripcion);
    setProyectoId(reg.proyectoId);
    setEsFacturable(reg.esFacturable);
    iniciarCronometro(reg.proyectoId, reg.tareaId || '', reg.descripcion);
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* BARRA DE RASTREO HORIZONTAL (Estilo Clockify)            */}
      {/* ======================================================== */}
      <div className="bg-white border border-[#D9D9D9] rounded-md shadow-sm flex flex-wrap items-center justify-between text-xs">
        {/* Campo de texto: ¿En qué trabajas? */}
        <div className="flex-1 min-w-[220px] p-3 border-b sm:border-b-0 sm:border-r border-[#D9D9D9]">
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="¿En qué estás trabajando?"
            className="w-full text-[#1C2D1A] placeholder-[#4E4E4E]/60 focus:outline-none bg-transparent"
          />
        </div>

        {/* Selector de Proyecto sencillo */}
        <div className="p-3 border-r border-[#D9D9D9]">
          <select
            value={proyectoId}
            onChange={(e) => setProyectoId(e.target.value)}
            className="bg-transparent text-[#06B706] font-bold cursor-pointer focus:outline-none"
          >
            {proyectos.map((p) => (
              <option key={p.id} value={p.id} className="text-[#1C2D1A] font-normal">
                ● {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Botón Facturable ($) */}
        <div className="p-3 border-r border-[#D9D9D9]">
          <button
            type="button"
            onClick={() => setEsFacturable(!esFacturable)}
            className={`w-6 h-6 rounded flex items-center justify-center font-bold cursor-pointer transition ${
              esFacturable ? 'bg-[#e8fbe8] text-[#06B706]' : 'text-[#D9D9D9] hover:text-[#4E4E4E]'
            }`}
            title="Marcar como facturable"
          >
            <DollarSign className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modo Cronómetro vs Modo Manual */}
        {modo === 'cronometro' ? (
          <>
            {/* Contador de tiempo */}
            <div className="px-4 py-3 font-mono font-bold text-base text-[#1C2D1A]">
              {formatearSegundos(cronometro.segundosTranscurridos)}
            </div>

            {/* Botón Iniciar / Detener */}
            <div className="p-2">
              <button
                type="button"
                onClick={manejarBotonCronometro}
                className={`px-5 py-2 font-bold uppercase tracking-wider rounded text-white cursor-pointer shadow-sm ${
                  cronometro.estaActivo
                    ? 'bg-[#e53935] hover:bg-[#d32f2f]'
                    : 'bg-[#06B706] hover:bg-[#059e05]'
                }`}
              >
                {cronometro.estaActivo ? 'Detener' : 'Iniciar'}
              </button>
            </div>
          </>
        ) : (
          /* Entradas de hora en modo manual */
          <div className="flex items-center gap-2 p-2">
            <input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="border border-[#D9D9D9] rounded px-1.5 py-1 text-[#1C2D1A]"
            />
            <span className="text-[#4E4E4E]">-</span>
            <input
              type="time"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              className="border border-[#D9D9D9] rounded px-1.5 py-1 text-[#1C2D1A]"
            />
            <button
              type="button"
              onClick={guardarModoManual}
              className="px-4 py-1.5 font-bold uppercase rounded text-white bg-[#06B706] hover:bg-[#059e05] cursor-pointer"
            >
              + Añadir
            </button>
          </div>
        )}

        {/* Alternador de modo (⏱ Cronómetro o ☰ Manual) */}
        <div className="p-3 border-l border-[#D9D9D9] flex items-center gap-1 text-[#4E4E4E]">
          <button
            type="button"
            onClick={() => setModo('cronometro')}
            className={`p-1 cursor-pointer ${modo === 'cronometro' ? 'text-[#06B706]' : 'hover:text-[#1C2D1A]'}`}
            title="Modo temporizador"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setModo('manual')}
            className={`p-1 cursor-pointer ${modo === 'manual' ? 'text-[#06B706]' : 'hover:text-[#1C2D1A]'}`}
            title="Modo manual"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* LISTA DE TRABAJOS REGISTRADOS                            */}
      {/* ======================================================== */}
      <div className="bg-white border border-[#D9D9D9] rounded-md shadow-sm overflow-hidden text-xs">
        <div className="bg-[#F8F8F8] px-4 py-2.5 border-b border-[#D9D9D9] flex items-center justify-between font-bold text-[#1C2D1A]">
          <span>Historial de Horas</span>
          <span className="text-[#4E4E4E] font-normal">Total: {registros.length} entradas</span>
        </div>

        <div className="divide-y divide-[#F8F8F8]">
          {registros.map((reg) => {
            const proy = proyectos.find((p) => p.id === reg.proyectoId);

            return (
              <div
                key={reg.id}
                className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-[#F8F8F8] transition"
              >
                {/* Descripción y Proyecto */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="font-medium text-[#1C2D1A] truncate">{reg.descripcion}</span>
                  {proy && (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F8F8F8] border border-[#D9D9D9] text-[11px] font-semibold text-[#1C2D1A]">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: proy.color }} />
                      <span>{proy.nombre}</span>
                    </span>
                  )}
                </div>

                {/* Facturable, Horario y Duración */}
                <div className="flex items-center gap-4 shrink-0">
                  {reg.esFacturable && <span className="text-[#06B706] font-bold" title="Facturable">$</span>}

                  {reg.horaInicio && reg.horaFin && (
                    <span className="text-[#4E4E4E] font-mono text-[11px] hidden sm:inline">
                      {reg.horaInicio} - {reg.horaFin}
                    </span>
                  )}

                  <span className="font-mono font-bold text-[#1C2D1A] w-14 text-right">
                    {formatearMinutos(reg.duracionMinutos)}
                  </span>

                  {/* Botón Reanudar Tarea */}
                  <button
                    onClick={() => reanudarTarea(reg)}
                    className="p-1 text-[#4E4E4E] hover:text-[#06B706] hover:bg-[#e8fbe8] rounded cursor-pointer"
                    title="Continuar con este trabajo"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>

                  {/* Botón Eliminar */}
                  <button
                    onClick={() => eliminarRegistro(reg.id)}
                    className="p-1 text-[#D9D9D9] hover:text-red-500 rounded cursor-pointer"
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
  );
};
