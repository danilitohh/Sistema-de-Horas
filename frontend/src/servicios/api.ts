/**
 * CONTRATOS API REST & CLIENTE HTTP COMPARTIDO (Tarea 13 / Subtareas 86e3rjrr1 y 86e3rjrr4)
 * Define las interfaces de entrada/salida (DTOs), endpoints y cliente con Bearer token.
 */

// 1. DTOs de Autenticación
export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  usuario: {
    id: string;
    nombre: string;
    correo: string;
    rol: 'administrador' | 'gestor' | 'colaborador';
  };
}

// 2. DTOs de Proyectos y Tareas
export interface ProyectoDTO {
  id: string;
  nombre: string;
  codigo: string;
  cliente: string;
  color: string;
  horasEstimadas: number;
  horasConsumidas: number;
}

export interface CrearProyectoDTO {
  nombre: string;
  codigo: string;
  cliente: string;
  color: string;
  horasEstimadas: number;
}

export interface TareaDTO {
  id: string;
  proyectoId: string;
  nombre: string;
  estado: 'por_hacer' | 'en_progreso' | 'completada';
}

// 3. DTOs de Registros de Tiempo
export interface RegistroHoraDTO {
  id: string;
  usuarioId: string;
  proyectoId: string;
  tareaId?: string;
  descripcion: string;
  fecha: string; // YYYY-MM-DD
  horaInicio?: string; // HH:mm
  horaFin?: string; // HH:mm
  duracionMinutos: number;
  esFacturable: boolean;
}

export interface CrearRegistroHoraDTO {
  proyectoId: string;
  tareaId?: string;
  descripcion: string;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  duracionMinutos: number;
  esFacturable: boolean;
}

// 4. Clase de Error Estructurado
export class ErrorApi extends Error {
  codigo: number;
  detalles?: Record<string, string[]>;

  constructor(mensaje: string, codigo: number, detalles?: Record<string, string[]>) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

// 5. Cliente HTTP Compartido (con token Bearer y cabeceras JSON)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function solicitudHttp<T>(endpoint: string, opciones: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('utel_auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...opciones.headers,
  };

  const respuesta = await fetch(`${BASE_URL}${endpoint}`, {
    ...opciones,
    headers,
  });

  if (!respuesta.ok) {
    let errorMensaje = `Error ${respuesta.status}: ${respuesta.statusText}`;
    let detalles: Record<string, string[]> | undefined;

    try {
      const errorJson = await respuesta.json();
      errorMensaje = errorJson.message || errorMensaje;
      detalles = errorJson.errors;
    } catch {
      // Sin cuerpo JSON
    }

    if (respuesta.status === 401) {
      localStorage.removeItem('utel_auth_token');
    }

    throw new ErrorApi(errorMensaje, respuesta.status, detalles);
  }

  // Si no hay contenido (ej: 204 No Content)
  if (respuesta.status === 204) {
    return {} as T;
  }

  return respuesta.json();
}

// Métodos expuestos para la aplicación
export const clienteApi = {
  get: <T>(endpoint: string) => solicitudHttp<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: any) => solicitudHttp<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any) => solicitudHttp<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => solicitudHttp<T>(endpoint, { method: 'DELETE' }),
};
