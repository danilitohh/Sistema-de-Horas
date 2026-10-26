import React, { createContext, useContext, useState, useEffect } from 'react';
import type { RegistroHora, Proyecto, Tarea, Usuario, EstadoCronometro } from '../tipos';
import { usuarioActual, proyectosIniciales, tareasIniciales, registrosIniciales } from '../servicios/datosPrueba';
import { obtenerFechaHoy } from '../utilidades/formateadores';

interface ContextoHorasTipo {
  usuario: Usuario;
  proyectos: Proyecto[];
  tareas: Tarea[];
  registros: RegistroHora[];
  cronometro: EstadoCronometro;
  agregarRegistro: (nuevo: Omit<RegistroHora, 'id' | 'creadoEn' | 'usuarioId'>) => void;
  eliminarRegistro: (id: string) => void;
  iniciarCronometro: (proyectoId: string, tareaId: string, descripcion: string) => void;
  pausarCronometro: () => void;
  detenerYGuardarCronometro: () => void;
}

const ContextoHoras = createContext<ContextoHorasTipo | undefined>(undefined);

export const ProveedorHoras: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario] = useState<Usuario>(usuarioActual);
  const [proyectos] = useState<Proyecto[]>(proyectosIniciales);
  const [tareas] = useState<Tarea[]>(tareasIniciales);

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

  // Ticker del cronómetro cada segundo si está activo
  useEffect(() => {
    let intervalo: any = null;
    if (cronometro.estaActivo) {
      intervalo = setInterval(() => {
        setCronometro((prev) => ({
          ...prev,
          segundosTranscurridos: prev.segundosTranscurridos + 1,
        }));
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
    setCronometro({
      estaActivo: true,
      segundosTranscurridos: cronometro.segundosTranscurridos,
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

  return (
    <ContextoHoras.Provider
      value={{
        usuario,
        proyectos,
        tareas,
        registros,
        cronometro,
        agregarRegistro,
        eliminarRegistro,
        iniciarCronometro,
        pausarCronometro,
        detenerYGuardarCronometro,
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
