import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, X, FolderKanban, Clock, Check, Eye } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearMinutos } from '../utilidades/formateadores';
import { VistaDetalleProyecto } from './VistaDetalleProyecto';

const coloresDisponibles = ['#22C55E', '#8B5CF6', '#3B82F6', '#FBBF24', '#FB923C', '#EF4444', '#EC4899', '#14B8A6'];

interface ProyectoForm {
  nombre: string;
  codigo: string;
  cliente: string;
  color: string;
  horasEstimadas: number;
}

const formInicial: ProyectoForm = {
  nombre: '',
  codigo: '',
  cliente: '',
  color: '#22C55E',
  horasEstimadas: 0,
};

export const VistaProyectos: React.FC = () => {
  const { proyectos, tareas, registros } = usarHoras();
  const [buscar, setBuscar] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [proyectoSeleccionadoId, setProyectoSeleccionadoId] = useState<string | null>(null);
  const [form, setForm] = useState<ProyectoForm>(formInicial);

  if (proyectoSeleccionadoId) {
    return (
      <VistaDetalleProyecto
        proyectoId={proyectoSeleccionadoId}
        onVolver={() => setProyectoSeleccionadoId(null)}
      />
    );
  }

  const proyectosFiltrados = proyectos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
      p.codigo.toLowerCase().includes(buscar.toLowerCase()) ||
      p.cliente.toLowerCase().includes(buscar.toLowerCase())
  );

  const abrirCrear = () => {
    setForm(formInicial);
    setEditandoId(null);
    setModalAbierto(true);
  };

  const abrirEditar = (id: string) => {
    const proy = proyectos.find((p) => p.id === id);
    if (!proy) return;
    setForm({
      nombre: proy.nombre,
      codigo: proy.codigo,
      cliente: proy.cliente,
      color: proy.color,
      horasEstimadas: proy.horasEstimadas,
    });
    setEditandoId(id);
    setModalAbierto(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Cabecera y Buscador */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#22C55E]" />
            Gestión de Proyectos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Administra tus proyectos, presupuestos y horas</p>
        </div>
        <button onClick={abrirCrear} className="btn-primary">
          <Plus className="w-4 h-4" />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar proyectos por nombre, cliente o código..."
          className="form-input pl-10"
        />
      </div>

      {/* 2. Cuadrícula de Proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {proyectosFiltrados.map((proy) => {
          const tareasProyecto = tareas.filter((t) => t.proyectoId === proy.id);
          const minutosProyecto = registros
            .filter((r) => r.proyectoId === proy.id)
            .reduce((sum, r) => sum + r.duracionMinutos, 0);
          const percent = proy.horasEstimadas > 0 ? Math.round((proy.horasConsumidas / proy.horasEstimadas) * 100) : 0;

          return (
            <div key={proy.id} className="app-card app-card-hover overflow-hidden flex flex-col justify-between">
              {/* Barra superior de color */}
              <div className="h-1.5" style={{ backgroundColor: proy.color }} />

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Título y cliente */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0"
                      style={{ backgroundColor: proy.color }}
                    >
                      {proy.codigo.substring(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 truncate">{proy.nombre}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">{proy.cliente}</p>
                    </div>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Progreso</span>
                      <span style={{ color: proy.color }}>{percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: proy.color }} />
                    </div>
                  </div>

                  {/* Métricas del proyecto */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-2 bg-slate-50 rounded-xl text-center mb-4">
                    <div>
                      <div className="text-base font-extrabold text-slate-800">{tareasProyecto.length}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Tareas</div>
                    </div>
                    <div>
                      <div className="text-base font-extrabold text-slate-800">{proy.horasConsumidas}h</div>
                      <div className="text-[10px] text-slate-500 font-medium">Horas</div>
                    </div>
                    <div>
                      <div className="text-base font-extrabold text-slate-800">{proy.horasEstimadas}h</div>
                      <div className="text-[10px] text-slate-500 font-medium">Meta</div>
                    </div>
                  </div>
                </div>

                {/* Pie de tarjeta y acciones */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3 font-mono">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${proy.color}15`, color: proy.color }}>
                      {proy.codigo}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatearMinutos(minutosProyecto)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setProyectoSeleccionadoId(proy.id)}
                      className="flex-1 py-1.5 rounded-lg bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E] hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detalle
                    </button>
                    <button
                      onClick={() => abrirEditar(proy.id)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#22C55E] hover:text-[#22C55E] hover:bg-[#22C55E]/5 transition cursor-pointer"
                      title="Editar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Tarjeta rápida para crear */}
        <button
          onClick={abrirCrear}
          className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#22C55E] min-h-[280px] flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-[#22C55E] transition cursor-pointer p-6"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold">Crear nuevo proyecto</span>
        </button>
      </div>

      {/* 3. Modal Crear / Editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="bg-[#1A2E1A] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">{editandoId ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setModalAbierto(false); }} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre del proyecto</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Rediseño Web"
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Código</label>
                  <input
                    type="text"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    placeholder="PROY-01"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cliente</label>
                  <input
                    type="text"
                    value={form.cliente}
                    onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                    placeholder="Nombre del cliente"
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Horas estimadas</label>
                <input
                  type="number"
                  min={0}
                  value={form.horasEstimadas}
                  onChange={(e) => setForm({ ...form, horasEstimadas: Number(e.target.value) })}
                  className="form-input"
                />
              </div>

              {/* Selector de color */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Color identificador</label>
                <div className="flex items-center gap-2">
                  {coloresDisponibles.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: c, boxShadow: form.color === c ? `0 0 0 3px ${c}40` : 'none' }}
                    >
                      {form.color === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalAbierto(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editandoId ? 'Guardar Cambios' : 'Crear Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
