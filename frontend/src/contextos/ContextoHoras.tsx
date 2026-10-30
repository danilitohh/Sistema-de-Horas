import React, { createContext, useContext, useState, useEffect } from 'react';
import type { RegistroHora, Proyecto, Tarea, Usuario, EstadoCronometro, RolUsuario } from '../tipos';
import { usuarioActual, proyectosIniciales, tareasIniciales, registrosIniciales } from '../servicios/datosPrueba';
import { obtenerFechaHoy } from '../utilidades/formateadores';

interface ContextoHorasTipo {
  usuario: Usuario;
  cambiarRol: (rol: RolUsuario) => void;
  proyectos: Proyecto[];
  tareas: Tarea[];
  registros: RegistroHora[];
  cronometro: EstadoCronometro;
  agregarRegistro: (nuevo: Omit<RegistroHora, 'id' | 'creadoEn' | 'usuarioId'>) => void;
  eliminarRegistro: (id: string) => void;
  iniciarCronometro: (proyectoId: string, tareaId: string, descripcion: string) => void;
  pausarCronometro: () => void;
  detenerYGuardarCronometro: () => void;
  actualizarRegistro: (actualizado: RegistroHora) => void;
}

const ContextoHoras = createContext<ContextoHorasTipo | undefined>(undefined);

export const ProveedorHoras: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario>(usuarioActual);
  const [proyectos] = useState<Proyecto[]>(proyectosIniciales);
  const [tareas] = useState<Tarea[]>(tareasIniciales);

  const cambiarRol = (rol: RolUsuario) => {
    setUsuario((prev) => ({ ...prev, rol }));
  };

  // Carga registros persistidos o iniciales
  const [registros, setRegistros] = useState<RegistroHora[]>(() => {
    const guardados = localStorage.getItem('utel_registros_horas');
    return guardados ? JSON.parse(guardados) : registrosIniciales;
  });

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
  };

  const eliminarRegistro = (id: string) => {
    setRegistros((prev) => prev.filter((r) => r.id !== id));
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
