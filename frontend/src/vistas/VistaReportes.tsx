import React, { useState } from 'react';
import { Download, TrendingUp } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';
import { formatearMinutos } from '../utilidades/formateadores';

export const VistaReportes: React.FC = () => {
  const { registros, proyectos, usuario } = usarHoras();
  const [filtroProyecto, setFiltroProyecto] = useState('todos');

  const registrosFiltrados = registros.filter((r) => {
    if (filtroProyecto !== 'todos' && r.proyectoId !== filtroProyecto) return false;
    return true;
  });

  const totalMinutos = registrosFiltrados.reduce((acc, curr) => acc + curr.duracionMinutos, 0);
  const totalFacturable = registrosFiltrados
    .filter((r) => r.esFacturable)
    .reduce((acc, curr) => acc + curr.duracionMinutos, 0);

  const horasPorProyecto = proyectos.map((p) => {
    const minutos = registros
      .filter((r) => r.proyectoId === p.id)
      .reduce((acc, curr) => acc + curr.duracionMinutos, 0);
    const porcentaje = totalMinutos > 0 ? Math.round((minutos / totalMinutos) * 100) : 0;
    return { ...p, minutos, porcentaje };
  });

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
    <div className="space-y-6">
      {/* Cabecera y Exportador estilo Clockify */}
      <div className="bg-white border border-[#dfe5eb] rounded-md px-5 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Informe Resumen • Control de Horas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de horas para UTEL Educación
          </p>
        </div>

        <button
          onClick={exportarCSVUtel}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded text-white bg-[#03a9f4] hover:bg-[#0288d1] flex items-center gap-2 cursor-pointer shadow-sm transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Tarjetas de Resumen estilo Clockify */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#dfe5eb] rounded-md p-4 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Tiempo Total
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-1 font-mono">
            {formatearMinutos(totalMinutos)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {(totalMinutos / 60).toFixed(2)} horas
          </div>
        </div>

        <div className="bg-white border border-[#dfe5eb] rounded-md p-4 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Tiempo Facturable
          </div>
          <div className="text-2xl font-bold text-[#03a9f4] mt-1 font-mono">
            {formatearMinutos(totalFacturable)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalMinutos > 0 ? Math.round((totalFacturable / totalMinutos) * 100) : 0}% facturable
          </div>
        </div>

        <div className="bg-white border border-[#dfe5eb] rounded-md p-4 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Proyectos Activos
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-1 font-mono">
            {horasPorProyecto.filter((p) => p.minutos > 0).length} de {proyectos.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Espacio de UTEL en ClickUp
          </div>
        </div>
      </div>

      {/* Gráfico de barras de proyectos estilo Clockify */}
      <div className="bg-white border border-[#dfe5eb] rounded-md p-5 shadow-sm space-y-4">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#03a9f4]" />
          Desglose de Horas por Proyecto
        </div>

        <div className="space-y-3 pt-1">
          {horasPorProyecto.map((p) => (
            <div key={p.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: p.color }} />
                  {p.nombre}
                </span>
                <span className="font-mono text-slate-600 font-bold">
                  {formatearMinutos(p.minutos)} ({p.porcentaje}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#f0f3f6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${p.porcentaje}%`, backgroundColor: p.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla detallada de entradas */}
      <div className="bg-white border border-[#dfe5eb] rounded-md shadow-sm overflow-hidden">
        <div className="p-3 bg-[#f8fafc] border-b border-[#dfe5eb] flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Entradas de Tiempo Detalladas
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Filtrar:</span>
            <select
              value={filtroProyecto}
              onChange={(e) => setFiltroProyecto(e.target.value)}
              className="border border-[#dfe5eb] rounded px-2 py-1 text-xs text-slate-700 bg-white"
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
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#f0f3f6] border-b border-[#dfe5eb] text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Fecha</th>
                <th className="px-4 py-2.5">Proyecto</th>
                <th className="px-4 py-2.5">Descripción</th>
                <th className="px-4 py-2.5">Facturable</th>
                <th className="px-4 py-2.5 text-right">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f3f6]">
              {registrosFiltrados.map((r) => {
                const proy = proyectos.find((p) => p.id === r.proyectoId);
                return (
                  <tr key={r.id} className="hover:bg-[#fafbfc]">
                    <td className="px-4 py-2.5 text-slate-500 font-mono">{r.fecha}</td>
                    <td className="px-4 py-2.5 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: proy?.color }} />
                      {proy?.nombre}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{r.descripcion}</td>
                    <td className="px-4 py-2.5">
                      {r.esFacturable ? (
                        <span className="text-[#03a9f4] font-bold">$</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-800">
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
