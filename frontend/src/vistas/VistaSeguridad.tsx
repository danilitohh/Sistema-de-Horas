import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import {
  cambiarContrasena,
  ErrorApi,
  type ChangePasswordRequestDTO,
} from '../servicios/api';

type CampoContrasena = keyof ChangePasswordRequestDTO;
type ErroresFormulario = Partial<Record<CampoContrasena, string>>;

const formularioInicial: ChangePasswordRequestDTO = {
  current_password: '',
  password: '',
  password_confirmation: '',
};

const validarFormulario = (
  formulario: ChangePasswordRequestDTO
): ErroresFormulario => {
  const errores: ErroresFormulario = {};

  if (!formulario.current_password) {
    errores.current_password = 'Escribe tu contraseña actual.';
  }

  if (!formulario.password) {
    errores.password = 'Escribe una contraseña nueva.';
  } else if (formulario.password.length < 12) {
    errores.password = 'Debe tener al menos 12 caracteres.';
  } else if (!/[A-Z]/.test(formulario.password)) {
    errores.password = 'Debe incluir al menos una letra mayúscula.';
  } else if (!/[a-z]/.test(formulario.password)) {
    errores.password = 'Debe incluir al menos una letra minúscula.';
  } else if (!/\d/.test(formulario.password)) {
    errores.password = 'Debe incluir al menos un número.';
  } else if (!/[^A-Za-z0-9]/.test(formulario.password)) {
    errores.password = 'Debe incluir al menos un símbolo.';
  }

  if (!formulario.password_confirmation) {
    errores.password_confirmation = 'Confirma la contraseña nueva.';
  } else if (formulario.password !== formulario.password_confirmation) {
    errores.password_confirmation = 'Las contraseñas no coinciden.';
  }

  return errores;
};

export const VistaSeguridad: React.FC = () => {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const [visibles, setVisibles] = useState<Record<CampoContrasena, boolean>>({
    current_password: false,
    password: false,
    password_confirmation: false,
  });

  const actualizarCampo = (
    campo: CampoContrasena,
    valor: string
  ) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }));
    setMensajeError('');
    setMensajeExito('');
  };

  const alternarVisibilidad = (campo: CampoContrasena) => {
    setVisibles((actuales) => ({
      ...actuales,
      [campo]: !actuales[campo],
    }));
  };

  const enviarFormulario = async (evento: React.FormEvent) => {
    evento.preventDefault();

    const erroresLocales = validarFormulario(formulario);
    if (Object.keys(erroresLocales).length > 0) {
      setErrores(erroresLocales);
      setMensajeError('Revisa los campos marcados para continuar.');
      return;
    }

    setCargando(true);
    setErrores({});
    setMensajeError('');
    setMensajeExito('');

    try {
      const respuesta = await cambiarContrasena(formulario);
      setFormulario(formularioInicial);
      setMensajeExito(respuesta.message || 'Contraseña actualizada correctamente.');
    } catch (error) {
      if (error instanceof ErrorApi) {
        setErrores(
          Object.fromEntries(
            Object.entries(error.detalles ?? {}).map(([campo, mensajes]) => [
              campo,
              mensajes[0],
            ])
          ) as ErroresFormulario
        );
        setMensajeError(error.message);
      } else {
        setMensajeError('No se pudo actualizar la contraseña. Inténtalo de nuevo.');
      }
    } finally {
      setCargando(false);
    }
  };

  const campoContrasena = (
    campo: CampoContrasena,
    etiqueta: string,
    placeholder: string
  ) => {
    const id = `seguridad-${campo}`;
    const mensajeCampo = errores[campo];

    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
          {etiqueta}
        </label>
        <div className="relative">
          <input
            id={id}
            type={visibles[campo] ? 'text' : 'password'}
            value={formulario[campo]}
            onChange={(evento) => actualizarCampo(campo, evento.target.value)}
            placeholder={placeholder}
            autoComplete={campo === 'current_password' ? 'current-password' : 'new-password'}
            aria-invalid={Boolean(mensajeCampo)}
            aria-describedby={mensajeCampo ? `${id}-error` : undefined}
            className={`form-input pr-11 ${mensajeCampo ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
          />
          <button
            type="button"
            onClick={() => alternarVisibilidad(campo)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]"
            aria-label={visibles[campo] ? `Ocultar ${etiqueta.toLowerCase()}` : `Mostrar ${etiqueta.toLowerCase()}`}
          >
            {visibles[campo] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {mensajeCampo && (
          <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600" role="alert">
            {mensajeCampo}
          </p>
        )}
      </div>
    );
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <header>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#22C55E]">
          Cuenta y acceso
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">
          Seguridad de la cuenta
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Actualiza tu contraseña cuando lo necesites. Tu sesión actual seguirá activa.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="app-card bg-[#1A2E1A] p-6 text-white">
          <div className="mb-5 flex items-center gap-3">
            <KeyRound className="h-6 w-6 text-[#86EFAC]" aria-hidden="true" />
            <h3 className="text-base font-bold">Protege tu acceso</h3>
          </div>
          <p className="text-sm leading-6 text-[#D1FAE5]">
            Usa una contraseña única y evita compartirla. El sistema comprueba tu contraseña actual antes de guardar la nueva.
          </p>
          <div className="mt-6 flex items-start gap-2 text-xs leading-5 text-[#86EFAC]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Mínimo 12 caracteres, mayúsculas, minúsculas, números y símbolos.</span>
          </div>
        </aside>

        <form onSubmit={enviarFormulario} className="app-card space-y-5 p-6" noValidate>
          {mensajeError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert" aria-live="assertive">
              {mensajeError}
            </div>
          )}
          {mensajeExito && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status" aria-live="polite">
              {mensajeExito}
            </div>
          )}

          {campoContrasena('current_password', 'Contraseña actual', 'Escribe tu contraseña actual')}
          {campoContrasena('password', 'Contraseña nueva', 'Crea una contraseña segura')}
          {campoContrasena('password_confirmation', 'Confirmar contraseña nueva', 'Repite la contraseña nueva')}

          <button
            type="submit"
            disabled={cargando}
            className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargando ? 'Actualizando contraseña…' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </div>
    </section>
  );
};
