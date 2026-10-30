import React, { useState } from 'react';
import { PlusCircle, Trash2, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import {
  formatearMinutos,
  calcularDiferenciaMinutos,
  obtenerFechaHoy,
} from '../utilidades/formateadores';

export const VistaRegistroHoras: React.FC = () => {
  const { proyectos, registros, agregarRegistro, eliminarRegistro } = usarHoras();

  const [fecha, setFecha] = useState(obtenerFechaHoy());
  const [proyectoId, setProyectoId] = useState(proyectos[0]?.id || '');
  const [descripcion, setDescripcion] = useState('');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('11:00');
  const [esFacturable, setEsFacturable] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const guardarRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!descripcion.trim()) return setError('Por favor escribe qué actividades realizaste.');
    if (horaInicio >= horaFin) return setError('La hora de inicio debe ser anterior a la de fin.');

    agregarRegistro({
      proyectoId,
      descripcion,
      fecha,
      horaInicio,
      horaFin,
      duracionMinutos: calcularDiferenciaMinutos(horaInicio, horaFin),
      esFacturable,
    });

    setDescripcion('');
    setExito(true);
    setTimeout(() => setExito(false), 2500);
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
            <h2 className="text-base font-bold text-slate-800">Registro Manual</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ingreso directo de actividades y horas</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-[#22C55E]">
            <PlusCircle className="w-5 h-5" />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {exito && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#22C55E] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>¡Horas guardadas con éxito!</span>
          </div>
        )}

        <form onSubmit={guardarRegistro} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Fecha</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="form-input" />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Proyecto Asignado</label>
            <select value={proyectoId} onChange={(e) => setProyectoId(e.target.value)} className="form-input">
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Hora Inicio</label>
              <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="form-input font-mono" />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Hora Fin</label>
              <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="form-input font-mono" />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Descripción</label>
            <textarea
              rows={3}
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
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${esFacturable ? 'bg-[#22C55E]' : 'bg-slate-200'}`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${esFacturable ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <button type="submit" className="btn-primary w-full justify-center py-3">
            Guardar Entrada de Horas
          </button>
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

        {/* Lista de Registros */}
        <div className="app-card overflow-hidden">
          <div className="app-card-header">
            <h3 className="text-sm font-bold text-slate-800">Registros Recientes</h3>
            <span className="text-xs text-slate-400 font-mono">{registros.length} entradas</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
            {registros.map((reg) => {
              const proy = proyectos.find((p) => p.id === reg.proyectoId);
              return (
                <div key={reg.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {proy && <span className="text-[10px] font-semibold" style={{ color: proy.color }}>{proy.nombre}</span>}
                      <span className="text-[11px] text-slate-400 font-mono">{reg.fecha} • {reg.horaInicio}-{reg.horaFin}</span>
                    </div>
                    <p className="font-semibold text-slate-800 truncate">{reg.descripcion}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {reg.esFacturable && <span className="font-bold text-[#22C55E] bg-emerald-50 px-2 py-0.5 rounded-md">$</span>}
                    <span className="font-mono font-bold text-slate-800">{formatearMinutos(reg.duracionMinutos)}</span>
                    <button
                      onClick={() => eliminarRegistro(reg.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                      title="Eliminar"
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
