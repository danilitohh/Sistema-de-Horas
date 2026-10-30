import { useState } from 'react';
import { ProveedorHoras, usarHoras } from './contextos/ContextoHoras';
import { BarraLateralClockify } from './componentes/BarraLateralClockify';
import { VistaLogin } from './vistas/VistaLogin';
import { VistaDashboard } from './vistas/VistaDashboard';
import { VistaProyectos } from './vistas/VistaProyectos';
import { VistaTareas } from './vistas/VistaTareas';
import { VistaCronometro } from './vistas/VistaCronometro';
import { VistaCalendario } from './vistas/VistaCalendario';
import { VistaReportes } from './vistas/VistaReportes';
import { VistaRegistroHoras } from './vistas/VistaRegistroHoras';
import { VistaPoliticaDatos } from './vistas/VistaPoliticaDatos';
import { Bell, HelpCircle, Menu, Clock, ShieldCheck, User, Lock } from 'lucide-react';
import type { RolUsuario } from './tipos';

function ContenidoApp() {
  const [autenticado, setAutenticado] = useState(true);
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { usuario, cambiarRol } = usarHoras();

  const esAdmin = usuario.rol === 'administrador';
  const esVistaAdminExclusiva = ['dashboard', 'proyectos', 'reportes'].includes(vistaActual);

  const titulosVistas: Record<string, string> = {
    dashboard: esAdmin ? 'Panel General (Admin)' : 'Dashboard',
    proyectos: 'Gestión de Proyectos',
    tareas: esAdmin ? 'Control Global de Tareas' : 'Mis Tareas Asignadas',
    cronometro: 'Rastreador de Tiempo',
    calendario: esAdmin ? 'Calendario de Horas' : 'Mi Calendario',
    reportes: 'Reportes & Exportación',
    registro: 'Registro Manual',
    privacidad: 'Privacidad & Política de Datos (Ley 1581)',
  };

  const handleLogin = (rol?: RolUsuario) => {
    if (rol) {
      cambiarRol(rol);
      setVistaActual(rol === 'colaborador' ? 'cronometro' : 'dashboard');
    }
    setAutenticado(true);
  };

  const alternarRol = () => {
    const nuevoRol: RolUsuario = esAdmin ? 'colaborador' : 'administrador';
    cambiarRol(nuevoRol);
    if (nuevoRol === 'colaborador' && esVistaAdminExclusiva) {
      setVistaActual('cronometro');
    }
  };

  if (!autenticado) {
    return <VistaLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex font-['Inter'] antialiased">
      {/* 1. Barra Lateral con Menús Separados por Rol */}
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
          {/* Botón menú móvil y títulos de la sección */}
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
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              {esAdmin ? 'Panel de Control Admin' : 'Espacio de Colaborador'}
            </span>
          </div>

          {/* Acciones Rápidas del Header & Selector de Rol */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Pill indicador y conmutador de rol interactivo */}
            <button
              onClick={alternarRol}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                esAdmin
                  ? 'bg-[#DCFCE7] text-[#15803D] border-[#22C55E]/40 hover:bg-[#BBF7D0]'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
              title="Clic para cambiar entre Panel Administrador y Colaborador"
            >
              {esAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" /> : <User className="w-3.5 h-3.5 text-blue-600" />}
              <span className="hidden sm:inline">{esAdmin ? 'Panel Admin' : 'Panel Usuario'}</span>
              <span className="text-[10px] opacity-75 hidden md:inline">(Cambiar)</span>
            </button>

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

        {/* 3. Área de Trabajo Responsiva con Protección de Rol */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {!esAdmin && esVistaAdminExclusiva ? (
            <div className="app-card p-8 sm:p-12 text-center max-w-lg mx-auto mt-10 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Vista exclusiva de Administrador</h2>
              <p className="text-sm text-slate-500 mb-6">
                El módulo de <strong>{titulosVistas[vistaActual]}</strong> está reservado para la gestión global y reportes de la organización.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setVistaActual('cronometro')} className="btn-primary">
                  Ir a mi Rastreador
                </button>
                <button onClick={alternarRol} className="btn-secondary">
                  Cambiar a Modo Admin
                </button>
              </div>
            </div>
          ) : (
            <>
              {vistaActual === 'dashboard' && <VistaDashboard />}
              {vistaActual === 'proyectos' && <VistaProyectos />}
              {vistaActual === 'tareas' && <VistaTareas />}
              {vistaActual === 'cronometro' && <VistaCronometro />}
              {vistaActual === 'calendario' && <VistaCalendario />}
              {vistaActual === 'reportes' && <VistaReportes />}
              {vistaActual === 'registro' && <VistaRegistroHoras />}
              {vistaActual === 'privacidad' && <VistaPoliticaDatos />}
            </>
          )}
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
