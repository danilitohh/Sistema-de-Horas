import React, { useState } from 'react';
import { Shield, FileText, Download, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { usarHoras } from '../contextos/ContextoHoras';

export const VistaPoliticaDatos: React.FC = () => {
  const { usuario } = usarHoras();
  const [mensajeExito, setMensajeExito] = useState('');
  const [modalConfirmarBorrado, setModalConfirmarBorrado] = useState(false);

  // Descarga los datos del usuario en formato JSON según el derecho de portabilidad
  const exportarMisDatos = () => {
    const registrosLocales = localStorage.getItem('utel_registros_horas') || '[]';
    const datosExportacion = {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        zonaHoraria: 'America/Bogota (UTC-5)',
      },
      fechaExportacion: new Date().toISOString(),
      registrosHoras: JSON.parse(registrosLocales),
      marcoLegal: 'Ley 1581 de 2012 de Colombia - Protección de Datos Personales',
    };

    const blob = new Blob([JSON.stringify(datosExportacion, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mis_datos_utel_${usuario.nombre.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setMensajeExito('Tus datos personales y registros se han exportado correctamente.');
    setTimeout(() => setMensajeExito(''), 4000);
  };

  // Solicitar supresión de datos locales
  const solicitarBorradoDatos = () => {
    localStorage.removeItem('utel_registros_horas');
    localStorage.removeItem('utel_cronometro_activo');
    setModalConfirmarBorrado(false);
    setMensajeExito('Se ha procesado tu solicitud de supresión de datos locales (Caché y Registros).');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#22C55E]" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              Privacidad y Política de Datos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cumplimiento normativo y tratamiento de datos personales conforme a la <strong>Ley 1581 de 2012</strong> (Colombia) y lineamientos de UTEL.
          </p>
        </div>
      </div>

      {mensajeExito && (
        <div className="p-3 bg-[#DCFCE7] text-[#15803D] rounded-xl text-xs font-semibold flex items-center gap-2 border border-[#22C55E]/30 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* 2. Resumen de Derechos ARCO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Exportación de datos */}
        <div className="app-card p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Portabilidad y Acceso</h3>
              <p className="text-xs text-slate-500">Descarga una copia de toda tu actividad y perfil</p>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Tienes derecho a conocer y obtener en un formato abierto y legible los registros de horas, tareas asociadas y datos de cuenta almacenados.
          </p>
          <button
            onClick={exportarMisDatos}
            className="w-full btn-secondary py-2 text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar mis Datos (JSON)</span>
          </button>
        </div>

        {/* Supresión de datos */}
        <div className="app-card p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Derecho de Supresión</h3>
              <p className="text-xs text-slate-500">Solicitar eliminación de datos personales</p>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Puedes solicitar la rectificación, revocatoria o eliminación definitiva de tus datos locales y registros cuando no exista un deber legal o contractual.
          </p>
          <button
            onClick={() => setModalConfirmarBorrado(true)}
            className="w-full py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar mis Datos Locales</span>
          </button>
        </div>
      </div>

      {/* 3. Documento Legal Compacto */}
      <div className="app-card p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <FileText className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-800">
            Términos y Política de Tratamiento de la Información
          </h2>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <section>
            <h4 className="font-bold text-slate-800 mb-1">1. Responsable del Tratamiento</h4>
            <p>
              El sistema <strong>MyTask UTEL</strong> es operado con fines académicos y de gestión horaria institucional. La entidad garantiza la estricta reserva y custodia de la información suministrada por estudiantes, colaboradores y administradores.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-slate-800 mb-1">2. Finalidad del Tratamiento de Datos</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-1">
              <li>Monitoreo, registro y validación de horas laboradas o dedicadas a proyectos.</li>
              <li>Generación de reportes analíticos para auditorías y cálculo de productividad.</li>
              <li>Control de acceso seguro basado en roles (Administrador y Colaborador).</li>
            </ul>
          </section>

          <section>
            <h4 className="font-bold text-slate-800 mb-1">3. Seguridad y Confidencialidad (RNF-07, RNF-08, RNF-11)</h4>
            <p>
              Las contraseñas no se almacenan en texto plano; son procesadas en el backend con algoritmos de hashing seguro (Bcrypt/Argon2). En el navegador no se exponen secretos, llaves maestras ni credenciales privilegiadas.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-slate-800 mb-1">4. Canales para Ejercer Derechos</h4>
            <p>
              Cualquier titular puede solicitar rectificaciones o consultas mediante los canales oficiales de soporte institucional UTEL o escribiendo a: <span className="font-semibold text-slate-800">privacidad@utel.edu</span>.
            </p>
          </section>
        </div>
      </div>

      {/* Modal de confirmación para borrado */}
      {modalConfirmarBorrado && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-800">¿Deseas limpiar tus datos locales?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Esto eliminará los registros guardados en la memoria de este navegador conforme a tu derecho de supresión.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setModalConfirmarBorrado(false)}
                className="flex-1 btn-secondary text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={solicitarBorradoDatos}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition"
              >
                Confirmar y Limpiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
