/**
 * UTILIDADES DE ESTILOS:
 * Centraliza clases CSS para evitar código CSS inline en los componentes.
 */

export function obtenerEstiloPorcentaje(percent: number) {
  if (percent > 75) {
    return { textClass: 'percent-high', barClass: 'bar-high' };
  }
  if (percent > 50) {
    return { textClass: 'percent-medium', barClass: 'bar-medium' };
  }
  return { textClass: 'percent-low', barClass: 'bar-low' };
}

export function obtenerBadgeEstado(estado: string) {
  switch (estado) {
    case 'completada':
      return { etiqueta: 'Completada', badgeClass: 'badge-status badge-completed' };
    case 'en_progreso':
      return { etiqueta: 'En progreso', badgeClass: 'badge-status badge-in-progress' };
    default:
      return { etiqueta: 'Por hacer', badgeClass: 'badge-status badge-pending' };
  }
}
