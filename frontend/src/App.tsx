import { useState } from 'react';
import { ProveedorHoras } from './contextos/ContextoHoras';
import { BarraLateralClockify } from './componentes/BarraLateralClockify';
import { VistaLogin } from './vistas/VistaLogin';
import { VistaDashboard } from './vistas/VistaDashboard';
import { VistaProyectos } from './vistas/VistaProyectos';
import { VistaTareas } from './vistas/VistaTareas';
import { VistaCronometro } from './vistas/VistaCronometro';
import { VistaCalendario } from './vistas/VistaCalendario';
import { VistaReportes } from './vistas/VistaReportes';
import { VistaRegistroHoras } from './vistas/VistaRegistroHoras';
import { Bell, HelpCircle, Menu, Clock } from 'lucide-react';

function ContenidoApp() {
  const [autenticado, setAutenticado] = useState(true);
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [menuAbierto, setMenuAbierto] = useState(false);

  const titulosVistas: { [key: string]: string } = {
    dashboard: 'Panel General',
    proyectos: 'Gestión de Proyectos',
    tareas: 'Gestión de Tareas',
    cronometro: 'Rastreador de tiempo',
    calendario: 'Calendario',
    reportes: 'Panel & Informes',
    registro: 'Registro Detallado',
  };

  if (!autenticado) {
    return <VistaLogin onLogin={() => setAutenticado(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex font-['Inter'] antialiased">
      {/* 1. Barra Lateral con Soporte Móvil y Overlay */}
      <BarraLateralClockify
        vistaActual={vistaActual}
        cambiarVista={setVistaActual}
        onLogout={() => setAutenticado(false)}
        menuAbierto={menuAbierto}
        onCerrarMenu={() => setMenuAbierto(false)}
      />

      {/* 2. Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Barra Superior Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 shadow-xs">
          {/* Botón hamburguesa para móviles y título de la vista */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuAbierto(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-base font-bold text-slate-800 tracking-tight">
              {titulosVistas[vistaActual] || 'MyTask'}
            </h1>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Espacio Principal</span>
          </div>

          {/* Acciones Rápidas del Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Acceso Rápido al Cronómetro en 1 Clic (RNF-16) */}
            {vistaActual !== 'cronometro' && (
              <button
                onClick={() => setVistaActual('cronometro')}
                className="btn-primary py-1.5 px-3 text-xs"
                title="Acceso rápido al cronómetro"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rastrear</span>
              </button>
            )}

            <button
              onClick={() => setAutenticado(false)}
              className="text-xs font-semibold text-slate-500 hover:text-[#22C55E] px-2 py-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer hidden md:inline"
            >
              Cerrar sesión
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <button
              className="hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition cursor-pointer"
              aria-label="Ayuda"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              className="hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition cursor-pointer relative"
              aria-label="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#22C55E] ring-2 ring-white absolute top-1.5 right-1.5"></span>
            </button>
          </div>
        </header>

        {/* 3. Área de Trabajo Responsiva (desde 360px a 4K) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {vistaActual === 'dashboard' && <VistaDashboard />}
          {vistaActual === 'proyectos' && <VistaProyectos />}
          {vistaActual === 'tareas' && <VistaTareas />}
          {vistaActual === 'cronometro' && <VistaCronometro />}
          {vistaActual === 'calendario' && <VistaCalendario />}
          {vistaActual === 'reportes' && <VistaReportes />}
          {vistaActual === 'registro' && <VistaRegistroHoras />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ProveedorHoras>
      <ContenidoApp />
    </ProveedorHoras>
  );
}

export default App;
