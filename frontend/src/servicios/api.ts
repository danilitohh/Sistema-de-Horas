/**
 * CONTRATOS API REST & CLIENTE HTTP COMPARTIDO (Tarea 13 / Subtareas 86e3rjrr1 y 86e3rjrr4)
 * Define las interfaces de entrada/salida (DTOs), endpoints y cliente con Bearer token.
 */

// 1. DTOs de Autenticación
export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RegisterRequestDTO {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponseDTO {
  message: string;
  token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
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
  tareaId?: string | null;
  descripcion: string;
  fecha: string; // YYYY-MM-DD
  horaInicio?: string | null; // HH:mm
  horaFin?: string | null; // HH:mm
  duracionMinutos: number;
  esFacturable: boolean;
  creadoEn: string;
}

export interface CrearRegistroHoraDTO {
  id?: string;
  creadoEn?: string;
  proyectoId: string;
  tareaId?: string | null;
  descripcion: string;
  fecha: string;
  horaInicio?: string | null;
  horaFin?: string | null;
  duracionMinutos: number;
  esFacturable: boolean;
}

interface RespuestaPaginadaDTO<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message: string;
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
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8002/api';

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

interface ProyectoLaravel {
  id: number;
  name: string;
  code: string | null;
  color: string | null;
  estimated_hours: number | string | null;
  client: {
    id: number;
    name: string;
  } | null;
}

export const obtenerProyectos = async (): Promise<{
  data: ProyectoDTO[];
  message: string;
}> => {
  const respuesta = await clienteApi.get<{
    data: ProyectoLaravel[];
    message: string;
  }>('/projects');

  return {
    message: respuesta.message,
    data: respuesta.data.map((proyecto) => ({
      id: String(proyecto.id),
      nombre: proyecto.name,
      codigo: proyecto.code ?? '',
      cliente: proyecto.client?.name ?? '',
      color: proyecto.color ?? '#22C55E',
      horasEstimadas: Number(proyecto.estimated_hours ?? 0),
      horasConsumidas: 0,
    })),
  };
};

export const obtenerRegistrosHora = async (): Promise<RegistroHoraDTO[]> => {
  const registros: RegistroHoraDTO[] = [];
  let pagina = 1;
  let ultimaPagina = 1;

  do {
    const respuesta = await clienteApi.get<RespuestaPaginadaDTO<RegistroHoraDTO>>(
      `/time-entries?per_page=100&page=${pagina}`
    );

    registros.push(...respuesta.data);
    ultimaPagina = respuesta.meta.last_page;
    pagina += 1;
  } while (pagina <= ultimaPagina);

  return registros;
};

export const crearRegistroHora = async (
  registro: CrearRegistroHoraDTO
): Promise<RegistroHoraDTO> => {
  const respuesta = await clienteApi.post<{ data: RegistroHoraDTO }>(
    '/time-entries',
    registro
  );

  return respuesta.data;
};

export const actualizarRegistroHora = async (
  id: string,
  registro: CrearRegistroHoraDTO
): Promise<RegistroHoraDTO> => {
  const respuesta = await clienteApi.put<{ data: RegistroHoraDTO }>(
    `/time-entries/${encodeURIComponent(id)}`,
    registro
  );

  return respuesta.data;
};

export const eliminarRegistroHora = async (id: string): Promise<void> => {
  await clienteApi.delete<void>(`/time-entries/${encodeURIComponent(id)}`);
};
