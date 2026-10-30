import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  X,
  Clock,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import type { RegistroHora } from '../tipos';
import { formatearMinutos, calcularDiferenciaMinutos } from '../utilidades/formateadores';

type ModoVista = 'dia' | 'semana' | 'mes';

export const VistaCalendario: React.FC = () => {
  const { registros, proyectos, agregarRegistro, actualizarRegistro } = usarHoras();

  // 1. Estados principales: Modo de vista (día, semana, mes) y fecha base navegable
  const [modoVista, setModoVista] = useState<ModoVista>('semana');
  const [fechaBase, setFechaBase] = useState<Date>(new Date());

  // 2. Estados del modal para registrar horas
  const [modalAbierto, setModalAbierto] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [proyectoId, setProyectoId] = useState(proyectos[0]?.id || '');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('11:00');
  const [esFacturable, setEsFacturable] = useState(true);
  const [error, setError] = useState('');
  const [registroEnEdicion, setRegistroEnEdicion] = useState<RegistroHora | null>(null);

  // 3. Funciones auxiliares de fechas
  const aIso = (d: Date) => d.toISOString().split('T')[0];

  // Navegación: Avanzar o retroceder según el modo activo
  const navegar = (delta: number) => {
    const nueva = new Date(fechaBase);
    if (modoVista === 'dia') nueva.setDate(nueva.getDate() + delta);
    else if (modoVista === 'semana') nueva.setDate(nueva.getDate() + delta * 7);
    else if (modoVista === 'mes') nueva.setMonth(nueva.getMonth() + delta);
    setFechaBase(nueva);
  };

  const irAHoy = () => setFechaBase(new Date());

  // 4. Cálculo de los datos para la VISTA SEMANA
  const diasSemana = useMemo(() => {
    const hoyIso = aIso(new Date());
    const primerDia = new Date(fechaBase);
    const diaOffset = (primerDia.getDay() + 6) % 7; // Lunes = 0
    primerDia.setDate(primerDia.getDate() - diaOffset);

    const nombres = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return nombres.map((nombre, i) => {
      const d = new Date(primerDia);
      d.setDate(d.getDate() + i);
      const iso = aIso(d);
      const tareasDia = registros.filter((r) => r.fecha === iso);
      return {
        nombre,
        numero: d.getDate(),
        iso,
        esHoy: iso === hoyIso,
        registros: tareasDia,
        minutos: tareasDia.reduce((sum, r) => sum + r.duracionMinutos, 0),
      };
    });
  }, [fechaBase, registros]);

  // 5. Cálculo de los datos para la VISTA MES
  const diasMes = useMemo(() => {
    const año = fechaBase.getFullYear();
    const mes = fechaBase.getMonth();
    const primerDiaMes = new Date(año, mes, 1);
    const ultimoDiaMes = new Date(año, mes + 1, 0);

    // Días de relleno previo (lunes anterior)
    const diaInicio = (primerDiaMes.getDay() + 6) % 7;
    const dias = [];

    for (let i = diaInicio; i > 0; i--) {
      const d = new Date(año, mes, 1 - i);
      const iso = aIso(d);
      dias.push({ numero: d.getDate(), iso, esMesActual: false, registros: registros.filter((r) => r.fecha === iso) });
    }

    // Días del mes
    for (let i = 1; i <= ultimoDiaMes.getDate(); i++) {
      const d = new Date(año, mes, i);
      const iso = aIso(d);
      dias.push({ numero: i, iso, esMesActual: true, registros: registros.filter((r) => r.fecha === iso) });
    }

    // Días de relleno posterior hasta completar semanas de 7
    let diaSiguiente = 1;
    while (dias.length % 7 !== 0) {
      const dPosterior = new Date(año, mes + 1, diaSiguiente);
      const iso = aIso(dPosterior);
      dias.push({ numero: dPosterior.getDate(), iso, esMesActual: false, registros: registros.filter((r) => r.fecha === iso) });
      diaSiguiente++;
    }

    return dias;
  }, [fechaBase, registros]);

  // 6. Horas del día para la VISTA DÍA
  const horasDia = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const diaActualIso = aIso(fechaBase);
  const registrosDiaActual = registros.filter((r) => r.fecha === diaActualIso);
  const totalMinutosDia = registrosDiaActual.reduce((s, r) => s + r.duracionMinutos, 0);
  const totalMinutosSemana = diasSemana.reduce((s, d) => s + d.minutos, 0);

  // Apertura del modal
  const abrirModalCrear = (fecha: string, inicio: string = '09:00') => {
    setRegistroEnEdicion(null);
    setFechaSeleccionada(fecha);
    setHoraInicio(inicio);
    setHoraFin(inicio < '17:00' ? `${String(Number(inicio.split(':')[0]) + 1).padStart(2, '0')}:00` : '18:00');
    setDescripcion('');
    setError('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (registro: RegistroHora) => {
    setRegistroEnEdicion(registro);
    setFechaSeleccionada(registro.fecha);
    setHoraInicio(registro.horaInicio);
    setHoraFin(registro.horaFin);
    setDescripcion(registro.descripcion);
    setProyectoId(registro.proyectoId);
    setEsFacturable(registro.esFacturable);
    setError('');
    setModalAbierto(true);
  };

  const guardarTrabajo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) return setError('Escribe qué actividades realizaste.');
    if (horaInicio >= horaFin) return setError('La hora de inicio debe ser anterior a la de fin.');

    if (registroEnEdicion) {
      actualizarRegistro({
        ...registroEnEdicion,
        proyectoId,
        descripcion,
        fecha: fechaSeleccionada,
        horaInicio,
        horaFin,
        duracionMinutos: calcularDiferenciaMinutos(horaInicio, horaFin),
        esFacturable,
      });
      setRegistroEnEdicion(null);
    } else {
      agregarRegistro({
        proyectoId,
        descripcion,
        fecha: fechaSeleccionada,
        horaInicio,
        horaFin,
        duracionMinutos: calcularDiferenciaMinutos(horaInicio, horaFin),
        esFacturable,
      });
    }
    setModalAbierto(false);
  };

  // Etiqueta del periodo según la vista
  const etiquetaPeriodo = () => {
    if (modoVista === 'dia') {
      return fechaBase.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    return fechaBase.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Barra de Control: Selector de vista, navegación y totalizadores */}
      <div className="app-card p-5 flex flex-wrap items-center justify-between gap-4">
        {/* Controles de navegación */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button onClick={() => navegar(-1)} className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={irAHoy} className="px-3 text-xs font-bold text-slate-700 hover:text-[#22C55E] cursor-pointer">
              Hoy
            </button>
            <button onClick={() => navegar(1)} className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="capitalize font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-[#22C55E]" />
            {etiquetaPeriodo()}
          </span>
        </div>

        {/* Alternador de Modo: Día / Semana / Mes */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['dia', 'semana', 'mes'] as const).map((modo) => (
              <button
                key={modo}
                onClick={() => setModoVista(modo)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                  modoVista === modo ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {modo}
              </button>
            ))}
          </div>

          <div className="text-right pl-3 border-l border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono">
              {formatearMinutos(modoVista === 'dia' ? totalMinutosDia : totalMinutosSemana)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. VISTA SEMANA (Parrilla de los 7 días) */}
      {modoVista === 'semana' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {diasSemana.map((dia) => (
            <div
              key={dia.iso}
              className={`rounded-2xl border p-4 flex flex-col min-h-[400px] transition ${
                dia.esHoy ? 'bg-[#F0FDF4] border-[#22C55E]/40 ring-2 ring-[#22C55E]/20' : 'bg-white border-slate-200/80 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <p className={`text-xs font-bold uppercase ${dia.esHoy ? 'text-[#22C55E]' : 'text-slate-400'}`}>{dia.nombre}</p>
                  <p className="text-xl font-extrabold text-slate-900">{dia.numero}</p>
                </div>
                <button
                  onClick={() => abrirModalCrear(dia.iso)}
                  className={`p-1.5 rounded-xl cursor-pointer transition ${
                    dia.esHoy ? 'bg-[#22C55E] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-[#22C55E] hover:text-white'
                  }`}
                  title="Añadir horas"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="py-2">
                <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                  {formatearMinutos(dia.minutos)}
                </span>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto">
                {dia.registros.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-8">
                    <Clock className="w-5 h-5 mb-1" />
                    <span className="text-[11px]">Sin horas</span>
                  </div>
                ) : (
                  dia.registros.map((reg) => {
                    const proy = proyectos.find((p) => p.id === reg.proyectoId);
                    return (
                      <div key={reg.id} className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: proy?.color || '#22C55E' }} />
                          <span className="text-[10px] font-bold text-slate-500 truncate">{proy?.nombre || 'General'}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 line-clamp-2">{reg.descripcion}</p>
                        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
                          <span>{formatearMinutos(reg.duracionMinutos)}</span>
                          {reg.esFacturable && <span className="text-[#22C55E] font-bold">$</span>} <Edit className="w-4 h-4 text-slate-500 hover:text-[#22C55E] cursor-pointer" onClick={() => abrirModalEditar(reg)} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. VISTA DÍA (Timeline por franjas horarias) */}
      {modoVista === 'dia' && (
        <div className="app-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">Horario del Día</h3>
              <p className="text-xs text-slate-500 font-mono">{diaActualIso} • {registrosDiaActual.length} registros</p>
            </div>
            <button onClick={() => abrirModalCrear(diaActualIso)} className="btn-primary">
              <Plus className="w-4 h-4" />
              <span>Añadir Registro</span>
            </button>
          </div>

          <div className="space-y-3">
            {horasDia.map((hora) => {
              const regsEnHora = registrosDiaActual.filter((r) => r.horaInicio && r.horaInicio.startsWith(hora.split(':')[0]));
              return (
                <div key={hora} className="flex items-start gap-4 p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                  <span className="w-14 text-xs font-mono font-bold text-slate-400 pt-1">{hora}</span>
                  <div className="flex-1">
                    {regsEnHora.length === 0 ? (
                      <button
                        onClick={() => abrirModalCrear(diaActualIso, hora)}
                        className="text-xs text-slate-300 hover:text-[#22C55E] flex items-center gap-1.5 py-1 cursor-pointer transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Espacio disponible — Clic para registrar</span>
                      </button>
                    ) : (
                      regsEnHora.map((reg) => {
                        const proy = proyectos.find((p) => p.id === reg.proyectoId);
                        return (
                          <div
                            key={reg.id}
                            className="p-3 rounded-xl border border-slate-200/80 bg-white shadow-2xs flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: proy?.color || '#22C55E' }} />
                              <div>
                                <p className="text-xs font-bold text-slate-800">{reg.descripcion}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{proy?.nombre} • {reg.horaInicio}-{reg.horaFin}</p>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-xs text-slate-800">{formatearMinutos(reg.duracionMinutos)}</span>
<Edit className="w-4 h-4 text-slate-500 hover:text-[#22C55E] cursor-pointer" onClick={() => abrirModalEditar(reg)} />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. VISTA MES (Cuadrícula del mes con 7 columnas) */}
      {modoVista === 'mes' && (
        <div className="app-card overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-xs font-bold text-slate-600 py-3 uppercase">
            <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
          </div>
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {diasMes.map((dia, idx) => {
              const mins = dia.registros.reduce((s, r) => s + r.duracionMinutos, 0);
              return (
                <div
                  key={idx}
                  onClick={() => abrirModalCrear(dia.iso)}
                  className={`min-h-[105px] p-2 flex flex-col justify-between hover:bg-emerald-50/30 transition cursor-pointer ${
                    !dia.esMesActual ? 'bg-slate-50/50 opacity-40' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{dia.numero}</span>
                    {mins > 0 && (
                      <span className="text-[10px] font-mono font-bold text-[#22C55E] bg-emerald-50 px-1.5 rounded">
                        {formatearMinutos(mins)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 my-1">
                    {dia.registros.slice(0, 2).map((r) => {
                      const proy = proyectos.find((p) => p.id === r.proyectoId);
                      return (
                        <div key={r.id} className="text-[10px] truncate px-1.5 py-0.5 rounded text-white font-medium" style={{ backgroundColor: proy?.color || '#22C55E' }}>
                          {r.descripcion}
                        </div>
                      );
                    })}
                    {dia.registros.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-bold block">+{dia.registros.length - 2} más</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Modal para Crear Entrada de Horas */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">{registroEnEdicion ? 'Editar Horas' : 'Registrar Horas'}</h3>
                <p className="text-xs text-slate-500 font-mono">Fecha: <strong className="text-[#22C55E]">{fechaSeleccionada}</strong></p>
              </div>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarTrabajo} className="p-6 space-y-4 text-xs">
              {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-200">{error}</div>}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Proyecto</label>
                <select value={proyectoId} onChange={(e) => setProyectoId(e.target.value)} className="form-input">
                  {proyectos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="¿Qué actividades completaste?"
                  className="form-input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Inicio</label>
                  <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="form-input font-mono" />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fin</label>
                  <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="form-input font-mono" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-700 font-semibold">¿Es facturable?</span>
                <button
                  type="button"
                  onClick={() => setEsFacturable(!esFacturable)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${esFacturable ? 'bg-[#22C55E]' : 'bg-slate-200'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${esFacturable ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setModalAbierto(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Horas</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
