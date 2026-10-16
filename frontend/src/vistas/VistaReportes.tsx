import React, { useState } from 'react';
import { BarChart3, Download, Filter, TrendingUp } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearMinutos } from '../utilidades/formateadores';

export const VistaReportes: React.FC = () => {
  const { registros, proyectos, usuario } = usarHoras();
  const [filtroProyecto, setFiltroProyecto] = useState('todos');

  // Filtramos registros según el proyecto seleccionado
  const registrosFiltrados = registros.filter((r) => {
    if (filtroProyecto !== 'todos' && r.proyectoId !== filtroProyecto) return false;
    return true;
  });

  // Cálculos estadísticos
  const totalMinutos = registrosFiltrados.reduce((acc, curr) => acc + curr.duracionMinutos, 0);
  const totalFacturable = registrosFiltrados
    .filter((r) => r.esFacturable)
    .reduce((acc, curr) => acc + curr.duracionMinutos, 0);

  // Horas por cada proyecto
  const horasPorProyecto = proyectos.map((p) => {
    const minutos = registros
      .filter((r) => r.proyectoId === p.id)
      .reduce((acc, curr) => acc + curr.duracionMinutos, 0);
    const porcentaje = totalMinutos > 0 ? Math.round((minutos / totalMinutos) * 100) : 0;
    return { ...p, minutos, porcentaje };
  });

  // Exportador de CSV oficial UTEL (Tarea 12 / RF-45 a RF-48)
  const exportarCSVUtel = () => {
    const encabezados = ['ID Registro', 'Fecha', 'Colaborador', 'Código Proyecto', 'Proyecto', 'Duración (Mins)', 'Horas Decimal', 'Facturable', 'Descripción'];
    
    const filas = registrosFiltrados.map((r) => {
      const proy = proyectos.find((p) => p.id === r.proyectoId);
      const horasDecimal = (r.duracionMinutos / 60).toFixed(2);
      return [
        `"${r.id}"`,
        `"${r.fecha}"`,
        `"${usuario.nombre}"`,
        `"${proy?.codigo || ''}"`,
        `"${proy?.nombre || ''}"`,
        r.duracionMinutos,
        horasDecimal,
        r.esFacturable ? '"SÍ"' : '"NO"',
        `"${r.descripcion.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const contenidoCsv = [encabezados.join(','), ...filas].join('\r\n');
    const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.setAttribute('href', url);
    enlace.setAttribute('download', `UTEL_Reporte_Horas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  };

  return (
    <div className="space-y-8">
      {/* Encabezado y Botón de Exportar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Dashboard y Métricas UTEL
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tareas 10, 11 y 12 • Gráficas, filtros avanzados y exportación CSV oficial
          </p>
        </div>

        <button
          onClick={exportarCSVUtel}
          className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 flex items-center gap-2 text-sm transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV Formato UTEL</span>
        </button>
      </div>

      {/* Tarjetas de Estadísticas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Horas Computadas
          </span>
          <div className="text-3xl font-black text-white mt-1">
            {formatearMinutos(totalMinutos)}
          </div>
          <span className="text-xs text-indigo-400 mt-1 block">{(totalMinutos / 60).toFixed(1)} horas decimales</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Horas Facturables UTEL
          </span>
          <div className="text-3xl font-black text-emerald-400 mt-1">
            {formatearMinutos(totalFacturable)}
          </div>
          <span className="text-xs text-emerald-400/80 mt-1 block">
            {totalMinutos > 0 ? Math.round((totalFacturable / totalMinutos) * 100) : 0}% del tiempo total
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Proyectos con Actividad
          </span>
          <div className="text-3xl font-black text-violet-400 mt-1">
            {horasPorProyecto.filter((p) => p.minutos > 0).length} de {proyectos.length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Espacios activos en ClickUp</span>
        </div>
      </div>

      {/* Distribución por Proyecto (Gráfica de Barras de Progreso) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-md font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Distribución de Horas por Proyecto (RF-41)
        </h3>

        <div className="space-y-4 pt-2">
          {horasPorProyecto.map((p) => (
            <div key={p.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="font-semibold text-slate-200">{p.nombre}</span>
                  <span className="text-slate-400 font-mono">({p.codigo})</span>
                </div>
                <div className="font-mono text-slate-300">
                  <span className="font-bold text-white">{formatearMinutos(p.minutos)}</span> ({p.porcentaje}%)
                </div>
              </div>

              {/* Barra de Porcentaje */}
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${p.porcentaje}%`,
                    backgroundColor: p.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros Combinables y Tabla Detallada */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400" />
            Tabla de Registros Filtrable (RF-36-RF-40)
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filtrar por proyecto:</span>
            <select
              value={filtroProyecto}
              onChange={(e) => setFiltroProyecto(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="todos">Todos los proyectos</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Fecha</th>
                <th className="px-4 py-3">Proyecto</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Facturable</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {registrosFiltrados.map((r) => {
                const proy = proyectos.find((p) => p.id === r.proyectoId);
                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono text-slate-400">{r.fecha}</td>
                    <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: proy?.color }}
                      />
                      {proy?.codigo}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{r.descripcion}</td>
                    <td className="px-4 py-3">
                      {r.esFacturable ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                          SÍ
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          NO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">
                      {formatearMinutos(r.duracionMinutos)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
