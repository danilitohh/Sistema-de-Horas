import { useState } from 'react';
import { ProveedorHoras } from './contextos/ContextoHoras';
import { BarraNavegacion } from './componentes/BarraNavegacion';
import { VistaRegistroHoras } from './vistas/VistaRegistroHoras';
import { VistaCronometro } from './vistas/VistaCronometro';
import { VistaCalendario } from './vistas/VistaCalendario';
import { VistaReportes } from './vistas/VistaReportes';

function App() {
  const [vistaActual, setVistaActual] = useState('registro');

  return (
    <ProveedorHoras>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Barra de Navegación Superior */}
        <BarraNavegacion vistaActual={vistaActual} cambiarVista={setVistaActual} />

        {/* Contenido Principal Dinámico */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {vistaActual === 'registro' && <VistaRegistroHoras />}
          {vistaActual === 'cronometro' && <VistaCronometro />}
          {vistaActual === 'calendario' && <VistaCalendario />}
          {vistaActual === 'reportes' && <VistaReportes />}
        </main>

        {/* Pie de Página */}
        <footer className="border-t border-slate-800/80 bg-slate-900/40 py-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 Sistema de Horas UTEL • Proyecto TEMPO</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-400">Rama activa: <strong className="text-indigo-400">sofia</strong> (Persona 2 - Frontend)</span>
            </div>
          </div>
        </footer>
      </div>
    </ProveedorHoras>
  );
}

export default App;
