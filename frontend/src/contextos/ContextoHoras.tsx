import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import type { RegistroHora, Proyecto, Tarea, Usuario, EstadoCronometro, RolUsuario } from '../tipos';
import { usuarioActual, proyectosIniciales, tareasIniciales, registrosIniciales } from '../servicios/datosPrueba';
import {
  actualizarRegistroHora,
  crearRegistroHora,
  eliminarRegistroHora,
  obtenerRegistrosHora,
  type CrearRegistroHoraDTO,
  type RegistroHoraDTO,
} from '../servicios/api';
import { obtenerFechaHoy } from '../utilidades/formateadores';

interface ContextoHorasTipo {
  usuario: Usuario;
  cambiarRol: (rol: RolUsuario) => void;
  proyectos: Proyecto[];
  tareas: Tarea[];
  registros: RegistroHora[];
  cronometro: EstadoCronometro;
  errorPersistencia: string | null;
  recargarRegistros: () => Promise<void>;
  agregarRegistro: (nuevo: Omit<RegistroHora, 'id' | 'creadoEn' | 'usuarioId'>) => void;
  eliminarRegistro: (id: string) => void;
  iniciarCronometro: (proyectoId: string, tareaId: string, descripcion: string) => void;
  pausarCronometro: () => void;
  detenerYGuardarCronometro: () => void;
  actualizarRegistro: (actualizado: RegistroHora) => void;
}

const ContextoHoras = createContext<ContextoHorasTipo | undefined>(undefined);

const convertirRegistroApi = (registro: RegistroHoraDTO): RegistroHora => ({
  id: registro.id,
  usuarioId: registro.usuarioId,
  proyectoId: registro.proyectoId,
  tareaId: registro.tareaId ?? undefined,
  descripcion: registro.descripcion,
  fecha: registro.fecha,
  horaInicio: registro.horaInicio ?? undefined,
  horaFin: registro.horaFin ?? undefined,
  duracionMinutos: Number(registro.duracionMinutos),
  esFacturable: Boolean(registro.esFacturable),
  creadoEn: registro.creadoEn,
});

const convertirRegistroRequest = (registro: RegistroHora): CrearRegistroHoraDTO => ({
  id: registro.id,
  creadoEn: registro.creadoEn,
  proyectoId: registro.proyectoId,
  tareaId: registro.tareaId ?? null,
  descripcion: registro.descripcion,
  fecha: registro.fecha,
  horaInicio: registro.horaInicio ?? null,
  horaFin: registro.horaFin ?? null,
  duracionMinutos: registro.duracionMinutos,
  esFacturable: registro.esFacturable,
});

export const ProveedorHoras: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario>(usuarioActual);
  const [proyectos] = useState<Proyecto[]>(proyectosIniciales);
  const [tareas] = useState<Tarea[]>(tareasIniciales);
  const [errorPersistencia, setErrorPersistencia] = useState<string | null>(null);

  const cambiarRol = useCallback((rol: RolUsuario) => {
    setUsuario((prev) => ({ ...prev, rol }));
  }, []);

  // Carga registros persistidos o iniciales
  const [registros, setRegistros] = useState<RegistroHora[]>(() => {
    const guardados = localStorage.getItem('utel_registros_horas');
    return guardados ? JSON.parse(guardados) : registrosIniciales;
  });

  const recargarRegistros = useCallback(async () => {
    if (!localStorage.getItem('utel_auth_token')) return;

    try {
      const registrosApi = await obtenerRegistrosHora();
      setRegistros(registrosApi.map(convertirRegistroApi));
      setErrorPersistencia(null);
    } catch {
      setErrorPersistencia(
        'No se pudieron cargar los registros del servidor. Los datos del navegador siguen disponibles.'
      );
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('utel_auth_token')) {
      void recargarRegistros();
    }
  }, [recargarRegistros]);

  // Estado del cronómetro persistente en localStorage
  const [cronometro, setCronometro] = useState<EstadoCronometro>(() => {
    const guardado = localStorage.getItem('utel_cronometro_activo');
    return guardado
      ? JSON.parse(guardado)
      : {
          estaActivo: false,
          segundosTranscurridos: 0,
          proyectoId: proyectosIniciales[0].id,
          tareaId: tareasIniciales[0].id,
          descripcion: '',
          inicioTimestamp: null,
        };
  });

  // Guarda en localStorage cuando cambian los registros
  useEffect(() => {
    localStorage.setItem('utel_registros_horas', JSON.stringify(registros));
  }, [registros]);

  // Sincroniza el cronómetro y guarda en localStorage
  useEffect(() => {
    localStorage.setItem('utel_cronometro_activo', JSON.stringify(cronometro));
  }, [cronometro]);

  // Ticker del cronómetro con sincronización precisa por timestamp (RNF-02, RNF-14)
  useEffect(() => {
    let intervalo: any = null;
    if (cronometro.estaActivo) {
      intervalo = setInterval(() => {
        setCronometro((prev) => {
          if (!prev.estaActivo || !prev.inicioTimestamp) return prev;
          const segundosReales = Math.floor((Date.now() - prev.inicioTimestamp) / 1000);
          return {
            ...prev,
            segundosTranscurridos: segundosReales,
          };
        });
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [cronometro.estaActivo]);

  const agregarRegistro = (nuevo: Omit<RegistroHora, 'id' | 'creadoEn' | 'usuarioId'>) => {
    const registroCompleto: RegistroHora = {
      ...nuevo,
      id: 'reg-' + Date.now(),
      usuarioId: usuario.id,
      creadoEn: new Date().toISOString(),
    };
    setRegistros((prev) => [registroCompleto, ...prev]);

    if (localStorage.getItem('utel_auth_token')) {
      void crearRegistroHora(convertirRegistroRequest(registroCompleto))
        .then((registroGuardado) => {
          const registroConvertido = convertirRegistroApi(registroGuardado);
          setRegistros((prev) => prev.map((registro) => (
            registro.id === registroCompleto.id ? registroConvertido : registro
          )));
          setErrorPersistencia(null);
        })
        .catch(() => {
          setErrorPersistencia(
            'No se pudo guardar una entrada en el servidor. La entrada permanece en este navegador.'
          );
        });
    }
  };

  const eliminarRegistro = (id: string) => {
    const registroEliminado = registros.find((registro) => registro.id === id);
    setRegistros((prev) => prev.filter((r) => r.id !== id));

    if (registroEliminado && localStorage.getItem('utel_auth_token')) {
      void eliminarRegistroHora(id)
        .then(() => setErrorPersistencia(null))
        .catch(() => {
          setRegistros((prev) => (
            prev.some((registro) => registro.id === id)
              ? prev
              : [registroEliminado, ...prev]
          ));
          setErrorPersistencia(
            'No se pudo eliminar el registro del servidor; se restauró en la lista.'
          );
        });
    }
  };

  const iniciarCronometro = (proyectoId: string, tareaId: string, descripcion: string) => {
    // Relevo automático: si ya había un cronómetro corriendo, se guarda automáticamente el anterior (RF-23)
    if (cronometro.estaActivo && cronometro.segundosTranscurridos > 0) {
      const minutosTotales = Math.max(1, Math.round(cronometro.segundosTranscurridos / 60));
      agregarRegistro({
        proyectoId: cronometro.proyectoId,
        tareaId: cronometro.tareaId,
        descripcion: cronometro.descripcion || 'Registro completado por relevo automático',
        fecha: obtenerFechaHoy(),
        duracionMinutos: minutosTotales,
        esFacturable: true,
      });
    }

    setCronometro({
      estaActivo: true,
      segundosTranscurridos: 0,
      proyectoId,
      tareaId,
      descripcion,
      inicioTimestamp: Date.now(),
    });
  };

  const pausarCronometro = () => {
    setCronometro((prev) => ({ ...prev, estaActivo: false }));
  };

  const detenerYGuardarCronometro = () => {
    if (cronometro.segundosTranscurridos > 0) {
      const minutosTotales = Math.max(1, Math.round(cronometro.segundosTranscurridos / 60));
      agregarRegistro({
        proyectoId: cronometro.proyectoId,
        tareaId: cronometro.tareaId,
        descripcion: cronometro.descripcion || 'Registro desde cronómetro',
        fecha: obtenerFechaHoy(),
        duracionMinutos: minutosTotales,
        esFacturable: true,
      });
    }

    setCronometro({
      estaActivo: false,
      segundosTranscurridos: 0,
      proyectoId: proyectos[0].id,
      tareaId: tareas[0].id,
      descripcion: '',
      inicioTimestamp: null,
    });
  };
  
  const actualizarRegistro = (actualizado: RegistroHora) => {
    setRegistros(prev => prev.map(r => r.id === actualizado.id ? actualizado : r));

    if (localStorage.getItem('utel_auth_token')) {
      void actualizarRegistroHora(
        actualizado.id,
        convertirRegistroRequest(actualizado)
      )
        .then((registroGuardado) => {
          const registroConvertido = convertirRegistroApi(registroGuardado);
          setRegistros((prev) => prev.map((registro) => (
            registro.id === actualizado.id ? registroConvertido : registro
          )));
          setErrorPersistencia(null);
        })
        .catch(() => {
          setErrorPersistencia(
            'No se pudo actualizar el registro en el servidor. El cambio permanece en este navegador.'
          );
        });
    }
  };

  return (
    <ContextoHoras.Provider
      value={{
        usuario,
        cambiarRol,
        proyectos,
        tareas,
        registros,
        cronometro,
        errorPersistencia,
        recargarRegistros,
        agregarRegistro,
        eliminarRegistro,
        iniciarCronometro,
        pausarCronometro,
        detenerYGuardarCronometro,
          actualizarRegistro,
      }}
    >
      {children}
    </ContextoHoras.Provider>
  );
};

export const usarHoras = () => {
  const context = useContext(ContextoHoras);
  if (!context) {
    throw new Error('usarHoras debe usarse dentro de un ProveedorHoras');
  }
  return context;
};
