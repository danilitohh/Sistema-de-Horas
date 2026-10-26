/**
 * UTILIDADES: Funciones auxiliares para formato de horas, minutos y fechas.
 */

// Convierte minutos a formato legible "Xh Ym" o "0.00 h"
export function formatearMinutos(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const minsRestantes = minutos % 60;
  if (horas === 0) return `${minsRestantes}m`;
  if (minsRestantes === 0) return `${horas}h`;
  return `${horas}h ${minsRestantes}m`;
}

// Convierte segundos a formato de cronómetro "00:00:00"
export function formatearSegundos(segundos: number): string {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = segundos % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(horas)}:${pad(minutos)}:${pad(segs)}`;
}

// Calcula la diferencia en minutos entre dos horas "HH:mm"
export function calcularDiferenciaMinutos(inicio: string, fin: string): number {
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);
  const minsInicio = h1 * 60 + m1;
  const minsFin = h2 * 60 + m2;
  return Math.max(0, minsFin - minsInicio);
}

// Obtiene la fecha actual en formato "YYYY-MM-DD"
export function obtenerFechaHoy(): string {
  return new Date().toISOString().split('T')[0];
}

// Rangos de fecha predefinidos para filtros rápidos
export type TipoRangoFecha = 'todo' | 'hoy' | 'esta_semana' | 'semana_pasada' | 'este_mes' | 'mes_pasado' | 'personalizado';

export function obtenerLimitesRango(tipo: TipoRangoFecha): { inicio: string; fin: string } {
  const hoy = new Date();
  const aIso = (d: Date) => d.toISOString().split('T')[0];

  if (tipo === 'hoy') {
    const fecha = aIso(hoy);
    return { inicio: fecha, fin: fecha };
  }

  if (tipo === 'esta_semana') {
    const d = new Date(hoy);
    const dia = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dia);
    const lunes = new Date(d);
    d.setDate(d.getDate() + 6);
    return { inicio: aIso(lunes), fin: aIso(d) };
  }

  if (tipo === 'semana_pasada') {
    const d = new Date(hoy);
    const dia = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dia - 7);
    const lunes = new Date(d);
    d.setDate(d.getDate() + 6);
    return { inicio: aIso(lunes), fin: aIso(d) };
  }

  if (tipo === 'este_mes') {
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    return { inicio: aIso(inicio), fin: aIso(fin) };
  }

  if (tipo === 'mes_pasado') {
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    return { inicio: aIso(inicio), fin: aIso(fin) };
  }

  return { inicio: '', fin: '' };
}
