/**
 * TIPOS Y MODELOS DE DATOS (TypeScript)
 * Define la estructura exacta de los datos que viajan entre el Frontend y el Backend.
 */

export type RolUsuario = 'administrador' | 'gestor' | 'colaborador';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  avatar?: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  codigo: string;
  color: string; // Color hexadecimal para identificarlo en el calendario
  cliente: string;
  horasEstimadas: number;
  horasConsumidas: number;
}

export interface Tarea {
  id: string;
  proyectoId: string;
  nombre: string;
  estado: 'por_hacer' | 'en_progreso' | 'completada';
}

export interface RegistroHora {
  id: string;
  usuarioId: string;
  proyectoId: string;
  tareaId?: string;
  descripcion: string;
  fecha: string; // Formato YYYY-MM-DD
  horaInicio?: string; // Formato HH:mm
  horaFin?: string; // Formato HH:mm
  duracionMinutos: number; // Duración total en minutos
  esFacturable: boolean;
  creadoEn: string;
}

export interface EstadoCronometro {
  estaActivo: boolean;
  segundosTranscurridos: number;
  proyectoId: string;
  tareaId: string;
  descripcion: string;
  inicioTimestamp: number | null;
}
