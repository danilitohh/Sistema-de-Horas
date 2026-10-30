import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, BarChart3, Users, FolderKanban, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import type { RolUsuario } from '../tipos';

interface VistaLoginProps {
  onLogin: (rol?: RolUsuario) => void;
}

export const VistaLogin: React.FC<VistaLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [recordar, setRecordar] = useState(false);
  const [modalPrivacidad, setModalPrivacidad] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex font-['Inter']">
      {/* Left side – Login Form */}
      <div className="w-full lg:w-[48%] bg-[#1A2E1A] flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#22C55E]/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#22C55E]/8 blur-3xl" />

        <div className="relative z-10 max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E] flex items-center justify-center shadow-lg shadow-[#22C55E]/30">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              My<span className="text-[#22C55E]">Task</span>
            </span>
          </div>

          {/* Welcome */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
            ¡Bienvenido de nuevo!
          </h1>
          <p className="text-[#86EFAC]/70 text-sm mb-8">
            Inicia sesión para gestionar tus proyectos y tareas
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#86EFAC]/80 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@empresa.com"
                className="w-full px-4 py-3 rounded-xl bg-[#243824] border border-[#2D4A2D] text-white placeholder-[#6B8F6B] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#86EFAC]/80 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-[#243824] border border-[#2D4A2D] text-white placeholder-[#6B8F6B] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 transition text-sm pr-11"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B8F6B] hover:text-[#86EFAC] cursor-pointer"
                >
                  {mostrarPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recordar}
                  onChange={(e) => setRecordar(e.target.checked)}
                  className="w-4 h-4 rounded border-[#2D4A2D] bg-[#243824] text-[#22C55E] focus:ring-[#22C55E]/30"
                />
                <span className="text-xs text-[#86EFAC]/70">Recordarme</span>
              </label>
              <a href="#" className="text-xs text-[#22C55E] hover:text-[#86EFAC] transition">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#22C55E]/25 transition-all duration-200 cursor-pointer hover:shadow-xl hover:shadow-[#22C55E]/30 active:scale-[0.98]"
            >
              Iniciar Sesión
            </button>
          </form>

          {/* Acceso Rápido por Rol para Demo */}
          <div className="mt-5 pt-4 border-t border-[#2D4A2D]">
            <p className="text-[11px] font-bold text-[#86EFAC]/70 uppercase tracking-wider mb-2.5 text-center">
              Acceso Rápido según Rol
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onLogin('administrador')}
                className="py-2.5 px-3 rounded-xl bg-[#243824] hover:bg-[#2D4A2D] border border-[#22C55E]/40 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span>Panel Admin</span>
              </button>
              <button
                type="button"
                onClick={() => onLogin('colaborador')}
                className="py-2.5 px-3 rounded-xl bg-[#243824] hover:bg-[#2D4A2D] border border-blue-400/40 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-blue-400" />
                <span>Panel Usuario</span>
              </button>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="py-2.5 rounded-xl border border-[#2D4A2D] bg-[#243824] text-[#86EFAC] text-xs font-medium hover:bg-[#2D4A2D] transition cursor-pointer flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"/></svg>
              Google
            </button>
            <button className="py-2.5 rounded-xl border border-[#2D4A2D] bg-[#243824] text-[#86EFAC] text-xs font-medium hover:bg-[#2D4A2D] transition cursor-pointer flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10Z"/></svg>
              GitHub
            </button>
          </div>

          {/* Footer y Política de Privacidad */}
          <div className="mt-8 pt-6 border-t border-[#2D4A2D] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80"
                alt="Avatar"
                className="w-10 h-10 rounded-full ring-2 ring-[#22C55E]/50 object-cover"
              />
              <div>
                <p className="text-white text-sm font-semibold">Alejandro Miguel</p>
                <p className="text-[#6B8F6B] text-[11px]">PM en R.T Consulting Group</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setModalPrivacidad(true)}
              className="text-[11px] text-[#86EFAC]/70 hover:text-white underline cursor-pointer"
            >
              Política de Datos (Ley 1581)
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Política de Privacidad en Login */}
      {modalPrivacidad && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Política de Datos (Ley 1581 de 2012)</h3>
              <button
                type="button"
                onClick={() => setModalPrivacidad(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2 max-h-60 overflow-y-auto pr-2">
              <p>
                En cumplimiento de la <strong>Ley 1581 de 2012</strong> de la República de Colombia, la plataforma <strong>MyTask UTEL</strong> garantiza el tratamiento confidencial y la protección integral de tus datos de usuario y registros de tiempo.
              </p>
              <p>
                <strong>Seguridad de credenciales:</strong> Las contraseñas están resguardadas mediante algoritmos criptográficos irreversibles en servidor. No almacenamos contraseñas en texto plano.
              </p>
              <p>
                <strong>Derechos ARCO:</strong> Puedes solicitar acceso, rectificación, portabilidad o eliminación de tus registros en cualquier momento.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalPrivacidad(false)}
              className="w-full btn-primary py-2 text-xs"
            >
              He leído y comprendo la política
            </button>
          </div>
        </div>
      )}

      {/* Right side – Feature Showcase */}
      <div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-[#F0FDF0] via-[#DCFCE7] to-[#BBF7D0] flex-col justify-center items-center p-16 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-20 w-40 h-40 rounded-full bg-[#22C55E]/10 blur-2xl" />
        <div className="absolute bottom-20 left-20 w-56 h-56 rounded-full bg-[#86EFAC]/15 blur-3xl" />

        <div className="relative z-10 max-w-lg text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A2E1A] leading-tight mb-4">
            Organiza proyectos complejos con{' '}
            <span className="text-[#22C55E]">ritmo y claridad</span> milimétrica.
          </h2>
          <p className="text-[#4B5563] text-sm mb-10">
            Gestiona tareas, controla tiempos y genera reportes profesionales desde un solo lugar.
          </p>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { icon: FolderKanban, label: 'Gestión de Proyectos', desc: 'Organiza y prioriza', color: '#8B5CF6' },
              { icon: BarChart3, label: 'Informes & Métricas', desc: 'Datos en tiempo real', color: '#22C55E' },
              { icon: Users, label: 'Equipos Colaborativos', desc: 'Trabajo en equipo', color: '#3B82F6' },
              { icon: Clock, label: 'Control de Tiempo', desc: 'Cronómetro integrado', color: '#FB923C' },
            ].map((feat) => (
              <div
                key={feat.label}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: feat.color + '15' }}
                >
                  <feat.icon className="w-5 h-5" style={{ color: feat.color }} />
                </div>
                <p className="text-sm font-bold text-[#1A2E1A]">{feat.label}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom indicator bar */}
          <div className="mt-10 bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#4B5563]">
              <span className="font-semibold text-[#1A2E1A]">🚀 MyTask Performance Manager</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                <span>En línea</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
