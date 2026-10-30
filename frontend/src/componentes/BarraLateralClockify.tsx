import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Clock,
  Calendar,
  BarChart2,
  FileText,
  Settings,
  LogOut,
  CheckCircle2,
  ChevronDown,
  X,
  ShieldCheck,
  User,
} from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';

interface PropsBarra {
  vistaActual: string;
  cambiarVista: (vista: string) => void;
  onLogout: () => void;
  menuAbierto?: boolean;
  onCerrarMenu?: () => void;
}

export const BarraLateralClockify: React.FC<PropsBarra> = ({
  vistaActual,
  cambiarVista,
  onLogout,
  menuAbierto = false,
  onCerrarMenu,
}) => {
  const { usuario, cambiarRol } = usarHoras();
  const esAdmin = usuario.rol === 'administrador';

  // Configuración de menús según el rol activo
  const menuAdmin = [
    { id: 'dashboard', etiqueta: 'Dashboard General', icono: LayoutDashboard },
    { id: 'proyectos', etiqueta: 'Gestión de Proyectos', icono: FolderKanban },
    { id: 'tareas', etiqueta: 'Control de Tareas', icono: ListChecks },
    { id: 'reportes', etiqueta: 'Reportes & Exportar', icono: BarChart2 },
  ];

  const menuColaborador = [
    { id: 'cronometro', etiqueta: 'Rastreador de Tiempo', icono: Clock },
    { id: 'calendario', etiqueta: 'Mi Calendario', icono: Calendar },
    { id: 'registro', etiqueta: 'Registro Manual', icono: FileText },
    { id: 'tareas', etiqueta: 'Mis Tareas Asignadas', icono: ListChecks },
  ];

  const menuHerramientasAdmin = [
    { id: 'cronometro', etiqueta: 'Cronómetro', icono: Clock },
    { id: 'calendario', etiqueta: 'Calendario', icono: Calendar },
    { id: 'registro', etiqueta: 'Registro Manual', icono: FileText },
  ];

  const seleccionar = (id: string) => {
    cambiarVista(id);
    if (onCerrarMenu) onCerrarMenu();
  };

  const alternarRol = () => {
    const nuevo = esAdmin ? 'colaborador' : 'administrador';
    cambiarRol(nuevo);
    if (nuevo === 'colaborador' && ['dashboard', 'proyectos', 'reportes'].includes(vistaActual)) {
      cambiarVista('cronometro');
    }
  };

  const renderItemMenu = (item: { id: string; etiqueta: string; icono: React.ElementType }) => {
    const Icono = item.icono;
    const activo = vistaActual === item.id;
    return (
      <button
        key={item.id}
        onClick={() => seleccionar(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-[13px] transition-all duration-150 cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-[#22C55E] ${
          activo
            ? 'bg-[#22C55E] text-white shadow-md shadow-[#22C55E]/25 font-bold'
            : 'text-slate-300 hover:bg-[#243824] hover:text-white'
        }`}
      >
        <Icono className={`w-[18px] h-[18px] ${activo ? 'text-white' : 'text-[#86EFAC]'}`} />
        <span>{item.etiqueta}</span>
      </button>
    );
  };

  return (
    <>
      {/* Overlay Backdrop para móviles y tablets */}
      {menuAbierto && (
        <div
          onClick={onCerrarMenu}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Barra Lateral Navegable */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#1A2E1A] text-slate-300 flex flex-col shrink-0 min-h-screen select-none transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          menuAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navegación principal"
      >
        {/* Cabecera / Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#243824]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#22C55E] flex items-center justify-center shadow-lg shadow-[#22C55E]/25">
              <CheckCircle2 className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              My<span className="text-[#86EFAC]">Task</span>
            </span>
          </div>

          <button
            onClick={onCerrarMenu}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#243824] transition cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Espacio de trabajo e Indicador de Rol */}
        <div className="px-4 py-3 border-b border-[#243824]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#86EFAC]/70">
              {esAdmin ? 'Panel Administrador' : 'Panel Colaborador'}
            </span>
            <button
              onClick={alternarRol}
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition ${
                esAdmin
                  ? 'bg-[#22C55E]/20 text-[#86EFAC] hover:bg-[#22C55E]/30'
                  : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
              }`}
              title="Clic para cambiar de rol (Admin / Colaborador)"
            >
              {esAdmin ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
              <span>{esAdmin ? 'Admin' : 'Usuario'}</span>
            </button>
          </div>
          <div className="flex items-center justify-between bg-[#243824] px-3 py-2 rounded-xl text-xs text-white cursor-pointer hover:bg-[#2D4A2D] transition border border-[#2D4A2D]">
            <span className="font-semibold truncate">
              {esAdmin ? 'Espacio Global UTEL' : 'Mi Área de Trabajo'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#86EFAC] shrink-0" />
          </div>
        </div>

        {/* Navegación según Rol */}
        <nav className="flex-grow py-4 px-3 space-y-5 overflow-y-auto">
          {esAdmin ? (
            <>
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#86EFAC]/50">
                  Gestión Global
                </div>
                {menuAdmin.map(renderItemMenu)}
              </div>

              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#86EFAC]/50">
                  Mi Tiempo
                </div>
                {menuHerramientasAdmin.map(renderItemMenu)}
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#86EFAC]/50">
                Mi Espacio
              </div>
              {menuColaborador.map(renderItemMenu)}
            </div>
          )}
        </nav>

        {/* Configuración */}
        <div className="px-3 pb-2">
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-slate-400 hover:bg-[#243824] hover:text-white transition cursor-pointer"
            aria-label="Configuración"
          >
            <Settings className="w-[18px] h-[18px] text-[#86EFAC]/50" />
            <span>Configuración</span>
          </button>
        </div>

        {/* Perfil de Usuario con indicador de rol */}
        <div className="p-3 border-t border-[#243824] bg-[#142213]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={usuario.avatar}
                alt={usuario.nombre}
                className="w-9 h-9 rounded-xl ring-2 ring-[#22C55E]/40 object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{usuario.nombre}</p>
                <p className="text-[10px] text-[#86EFAC]/60 truncate capitalize">Rol: {usuario.rol}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-[#243824] text-[#86EFAC]/40 hover:text-red-400 transition cursor-pointer"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
