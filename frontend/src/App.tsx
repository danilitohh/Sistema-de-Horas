import { useState } from 'react';
import { ProveedorHoras } from './contextos/ContextoHoras';
import { BarraLateralClockify } from './componentes/BarraLateralClockify';
import { VistaCronometro } from './vistas/VistaCronometro';
import { VistaCalendario } from './vistas/VistaCalendario';
import { VistaReportes } from './vistas/VistaReportes';
import { VistaRegistroHoras } from './vistas/VistaRegistroHoras';
import { Bell, HelpCircle } from 'lucide-react';

function App() {
  const [vistaActual, setVistaActual] = useState('cronometro');

  const titulosVistas: { [key: string]: string } = {
    cronometro: 'Rastreador de tiempo',
    calendario: 'Calendario',
    reportes: 'Panel & Informes',
    registro: 'Registro Detallado',
  };

  return (
    <ProveedorHoras>
      <div className="min-h-screen bg-[#f2f6f8] text-[#333333] flex font-sans antialiased">
        {/* Barra Lateral estilo Clockify */}
        <BarraLateralClockify vistaActual={vistaActual} cambiarVista={setVistaActual} />

        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Barra Superior Clockify */}
          <header className="h-14 bg-white border-b border-[#dfe5eb] px-6 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-bold text-slate-800 tracking-tight">
                {titulosVistas[vistaActual] || 'Rastreador'}
              </h1>
              <span className="text-slate-300">/</span>
              <span className="text-xs text-slate-500 font-medium">Utel proyecto</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <button className="hover:text-slate-600 cursor-pointer">
                <HelpCircle className="w-4 h-4" />
              </button>
              <button className="hover:text-slate-600 cursor-pointer relative">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-[#03a9f4] absolute top-0 right-0"></span>
              </button>
            </div>
          </header>

          {/* Área de Trabajo */}
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            {vistaActual === 'cronometro' && <VistaCronometro />}
            {vistaActual === 'calendario' && <VistaCalendario />}
            {vistaActual === 'reportes' && <VistaReportes />}
            {vistaActual === 'registro' && <VistaRegistroHoras />}
          </main>
        </div>
      </div>
    </ProveedorHoras>
  );
}

export default App;
