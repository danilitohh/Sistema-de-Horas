import React, { useState } from 'react';
import { Play, DollarSign, Clock, List, Trash2, Tag, FolderPlus, ChevronDown } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearSegundos, formatearMinutos, obtenerFechaHoy } from '../utilidades/formateadores';

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

  // Modo del rastreador: 'cronometro' o 'manual'
  const [modo, setModo] = useState<'cronometro' | 'manual'>('cronometro');

  // Estados de la barra de entrada
  const [descripcion, setDescripcion] = useState(cronometro.descripcion || '');
  const [proyectoId, setProyectoId] = useState(cronometro.proyectoId || proyectos[0]?.id || '');
  const [esFacturable, setEsFacturable] = useState(true);
  const [mostrarSelectorProyectos, setMostrarSelectorProyectos] = useState(false);

  // Estados para modo manual
  const [horaInicioManual, setHoraInicioManual] = useState('09:00');
  const [horaFinManual, setHoraFinManual] = useState('11:00');

  const proyectoSeleccionado = proyectos.find((p) => p.id === proyectoId);

  // Iniciar / Detener cronómetro
  const manejarBotonPrincipal = () => {
    if (cronometro.estaActivo) {
      detenerYGuardarCronometro();
      setDescripcion('');
    } else {
      iniciarCronometro(proyectoId, tareas[0]?.id || '', descripcion);
    }
  };

  // Guardar en modo manual
  const manejarAgregarManual = () => {
    if (!descripcion.trim()) return;
    const [h1, m1] = horaInicioManual.split(':').map(Number);
    const [h2, m2] = horaFinManual.split(':').map(Number);
    const duracion = Math.max(15, (h2 * 60 + m2) - (h1 * 60 + m1));

    agregarRegistro({
      proyectoId,
      tareaId: tareas[0]?.id || '',
      descripcion,
      fecha: obtenerFechaHoy(),
      horaInicio: horaInicioManual,
      horaFin: horaFinManual,
      duracionMinutos: duracion,
      esFacturable,
    });
    setDescripcion('');
  };

  // Reanudar una tarea existente
  const reanudarRegistro = (reg: any) => {
    setDescripcion(reg.descripcion);
    setProyectoId(reg.proyectoId);
    setEsFacturable(reg.esFacturable);
    iniciarCronometro(reg.proyectoId, reg.tareaId || '', reg.descripcion);
  };

  // Agrupar registros por fecha
  const registrosPorFecha: { [fecha: string]: typeof registros } = {};
  registros.forEach((reg) => {
    if (!registrosPorFecha[reg.fecha]) {
      registrosPorFecha[reg.fecha] = [];
    }
    registrosPorFecha[reg.fecha].push(reg);
  });

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* BARRA SUPERIOR DE RASTREO CON LA PALETA CORPORATIVA      */}
      {/* ======================================================== */}
      <div className="bg-white border border-[#D9D9D9] shadow-sm rounded-md flex flex-wrap items-center justify-between text-sm">
        {/* Input descripción */}
        <div className="flex-1 min-w-[240px] px-4 py-3 border-b sm:border-b-0 sm:border-r border-[#D9D9D9]">
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="¿En qué estás trabajando?"
            className="w-full text-[#1C2D1A] placeholder-[#4E4E4E]/60 focus:outline-none text-sm bg-transparent"
          />
        </div>

        {/* Selector de Proyecto */}
        <div className="relative px-3 py-3 border-r border-[#D9D9D9]">
          <button
            type="button"
            onClick={() => setMostrarSelectorProyectos(!mostrarSelectorProyectos)}
            className="flex items-center gap-2 text-xs font-semibold text-[#06B706] hover:text-[#059e05] cursor-pointer"
          >
            {proyectoSeleccionado ? (
              <span className="flex items-center gap-1.5 text-[#1C2D1A]">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: proyectoSeleccionado.color }}
                />
                <span className="font-medium truncate max-w-[140px]">
                  {proyectoSeleccionado.nombre}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#4E4E4E]" />
              </span>
            ) : (
              <>
                <FolderPlus className="w-4 h-4" />
                <span>+ Proyecto</span>
              </>
            )}
          </button>

          {/* Menú flotante de Proyectos */}
          {mostrarSelectorProyectos && (
            <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-[#D9D9D9] shadow-xl rounded z-50 py-1">
              <div className="px-3 py-1.5 text-[11px] font-bold text-[#4E4E4E] uppercase tracking-wider border-b border-[#F8F8F8]">
                Proyectos UTEL
              </div>
              {proyectos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setProyectoId(p.id);
                    setMostrarSelectorProyectos(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#F8F8F8] text-[#1C2D1A] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-medium">{p.nombre}</span>
                  </span>
                  <span className="text-[10px] text-[#4E4E4E] font-mono">{p.codigo}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Icono de Etiquetas */}
        <div className="px-3 py-3 border-r border-[#D9D9D9] hidden md:flex items-center text-[#4E4E4E] hover:text-[#1C2D1A] cursor-pointer">
          <Tag className="w-4 h-4" />
        </div>

        {/* Icono Facturable ($) */}
        <div className="px-3 py-3 border-r border-[#D9D9D9] flex items-center">
          <button
            type="button"
            onClick={() => setEsFacturable(!esFacturable)}
            className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs cursor-pointer transition ${
              esFacturable
                ? 'bg-[#e8fbe8] text-[#06B706]'
                : 'text-[#D9D9D9] hover:text-[#4E4E4E]'
            }`}
            title={esFacturable ? 'Facturable (Activo)' : 'No facturable'}
          >
            <DollarSign className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modo Temporizador vs Modo Manual */}
        {modo === 'cronometro' ? (
          <>
            {/* Display Monospace del tiempo */}
            <div className="px-5 py-3 font-mono font-bold text-lg text-[#1C2D1A] tracking-wider">
              {formatearSegundos(cronometro.segundosTranscurridos)}
            </div>

            {/* Botón INICIAR / DETENER */}
            <div className="px-3 py-2">
              <button
                type="button"
                onClick={manejarBotonPrincipal}
                className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded text-white cursor-pointer transition-all shadow-sm ${
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
          /* Modo Manual */
          <>
            <div className="flex items-center gap-2 px-3 py-2">
              <input
                type="time"
                value={horaInicioManual}
                onChange={(e) => setHoraInicioManual(e.target.value)}
                className="border border-[#D9D9D9] rounded px-2 py-1 text-xs text-[#1C2D1A]"
              />
              <span className="text-[#4E4E4E] text-xs">-</span>
              <input
                type="time"
                value={horaFinManual}
                onChange={(e) => setHoraFinManual(e.target.value)}
                className="border border-[#D9D9D9] rounded px-2 py-1 text-xs text-[#1C2D1A]"
              />
            </div>
            <div className="px-3 py-2">
              <button
                type="button"
                onClick={manejarAgregarManual}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded text-white bg-[#06B706] hover:bg-[#059e05] cursor-pointer"
              >
                + Añadir
              </button>
            </div>
          </>
        )}

        {/* Selector de modo (Reloj vs Lista) */}
        <div className="px-3 py-3 border-l border-[#D9D9D9] flex items-center gap-1">
          <button
            type="button"
            onClick={() => setModo('cronometro')}
            className={`p-1 rounded cursor-pointer ${
              modo === 'cronometro' ? 'text-[#06B706]' : 'text-[#4E4E4E] hover:text-[#1C2D1A]'
            }`}
            title="Modo temporizador"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setModo('manual')}
            className={`p-1 rounded cursor-pointer ${
              modo === 'manual' ? 'text-[#06B706]' : 'text-[#4E4E4E] hover:text-[#1C2D1A]'
            }`}
            title="Modo manual"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* HISTORIAL AGRUPADO POR DÍA                               */}
      {/* ======================================================== */}
      <div className="space-y-6">
        {Object.entries(registrosPorFecha).map(([fecha, lista]) => {
          const totalMinutosDia = lista.reduce((sum, r) => sum + r.duracionMinutos, 0);

          return (
            <div key={fecha} className="border border-[#D9D9D9] bg-white rounded-md shadow-sm overflow-hidden">
              {/* Barra de cabecera de la fecha */}
              <div className="bg-[#F8F8F8] px-4 py-2.5 flex items-center justify-between border-b border-[#D9D9D9] text-xs font-semibold text-[#1C2D1A]">
                <span className="uppercase tracking-wider font-bold">
                  {fecha === obtenerFechaHoy() ? 'Hoy' : fecha}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[#4E4E4E] uppercase text-[11px]">Total:</span>
                  <span className="font-mono font-bold text-[#1C2D1A] text-sm">
                    {formatearMinutos(totalMinutosDia)}
                  </span>
                </div>
              </div>

              {/* Filas de registros */}
              <div className="divide-y divide-[#F8F8F8]">
                {lista.map((reg) => {
                  const proy = proyectos.find((p) => p.id === reg.proyectoId);

                  return (
                    <div
                      key={reg.id}
                      className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-[#F8F8F8] transition group text-xs text-[#1C2D1A]"
                    >
                      {/* Descripción y Proyecto */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className="font-medium text-[#1C2D1A] truncate">
                          {reg.descripcion}
                        </span>
                        {proy && (
                          <span className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-[#F8F8F8] text-[#1C2D1A] text-[11px] font-medium border border-[#D9D9D9]">
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: proy.color }}
                            />
                            <span>{proy.nombre}</span>
                          </span>
                        )}
                      </div>

                      {/* Facturable ($) y Horas */}
                      <div className="flex items-center gap-6 shrink-0">
                        {reg.esFacturable && (
                          <span title="Facturable">
                            <DollarSign className="w-3.5 h-3.5 text-[#06B706]" />
                          </span>
                        )}

                        {reg.horaInicio && reg.horaFin && (
                          <span className="text-[#4E4E4E] font-mono text-[11px] hidden sm:inline">
                            {reg.horaInicio} - {reg.horaFin}
                          </span>
                        )}

                        {/* Duración */}
                        <span className="font-mono font-bold text-[#1C2D1A] text-sm w-16 text-right">
                          {formatearMinutos(reg.duracionMinutos)}
                        </span>

                        {/* Botón Reanudar (Play) */}
                        <button
                          onClick={() => reanudarRegistro(reg)}
                          className="p-1.5 text-[#4E4E4E] hover:text-[#06B706] hover:bg-[#e8fbe8] rounded transition cursor-pointer"
                          title="Continuar temporizador para esta tarea"
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>

                        {/* Botón Eliminar */}
                        <button
                          onClick={() => eliminarRegistro(reg.id)}
                          className="p-1.5 text-[#D9D9D9] hover:text-red-500 hover:bg-red-50 rounded transition cursor-pointer"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
