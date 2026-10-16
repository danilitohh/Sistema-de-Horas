import type { Proyecto, Tarea, RegistroHora, Usuario } from '../tipos';

export const usuarioActual: Usuario = {
  id: 'usr-1',
  nombre: 'Sofia Valcárcel',
  correo: 'edna.valcarcel@utel.edu.mx',
  rol: 'administrador',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
};

export const proyectosIniciales: Proyecto[] = [
  {
    id: 'proy-1',
    nombre: 'Sistema de Horas UTEL',
    codigo: 'UTEL-HORAS',
    color: '#6366f1', // Indigo
    cliente: 'Universidad UTEL',
    horasEstimadas: 120,
    horasConsumidas: 42,
  },
  {
    id: 'proy-2',
    nombre: 'Portal de Alumnos 2026',
    codigo: 'UTEL-PORTAL',
    color: '#06b6d4', // Cyan
    cliente: 'UTEL Educación',
    horasEstimadas: 80,
    horasConsumidas: 65,
  },
  {
    id: 'proy-3',
    nombre: 'Integración Pasarela Pagos',
    codigo: 'UTEL-PAGOS',
    color: '#10b981', // Esmeralda
    cliente: 'Finanzas UTEL',
    horasEstimadas: 40,
    horasConsumidas: 18,
  },
];

export const tareasIniciales: Tarea[] = [
  { id: 'tar-1', proyectoId: 'proy-1', nombre: '07 - Registro manual y validaciones', estado: 'en_progreso' },
  { id: 'tar-2', proyectoId: 'proy-1', nombre: '08 - Cronómetro persistente', estado: 'por_hacer' },
  { id: 'tar-3', proyectoId: 'proy-1', nombre: '09 - Calendario día/semana/mes', estado: 'por_hacer' },
  { id: 'tar-4', proyectoId: 'proy-1', nombre: '10 - Dashboard y gráficas', estado: 'por_hacer' },
  { id: 'tar-5', proyectoId: 'proy-2', nombre: 'Diseño de interfaz responsive', estado: 'completada' },
  { id: 'tar-6', proyectoId: 'proy-3', nombre: 'Pruebas de Webhook en sandbox', estado: 'en_progreso' },
];

export const registrosIniciales: RegistroHora[] = [
  {
    id: 'reg-1',
    usuarioId: 'usr-1',
    proyectoId: 'proy-1',
    tareaId: 'tar-1',
    descripcion: 'Diseño del componente de formulario y validaciones',
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '09:00',
    horaFin: '11:30',
    duracionMinutos: 150,
    esFacturable: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 'reg-2',
    usuarioId: 'usr-1',
    proyectoId: 'proy-1',
    tareaId: 'tar-2',
    descripcion: 'Configuración inicial del temporizador en local',
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '12:00',
    horaFin: '13:30',
    duracionMinutos: 90,
    esFacturable: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 'reg-3',
    usuarioId: 'usr-1',
    proyectoId: 'proy-2',
    tareaId: 'tar-5',
    descripcion: 'Ajustes de accesibilidad WCAG y contrastes',
    fecha: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    horaInicio: '14:00',
    horaFin: '17:00',
    duracionMinutos: 180,
    esFacturable: true,
    creadoEn: new Date().toISOString(),
  },
];
