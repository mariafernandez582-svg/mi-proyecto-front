export function formatearFecha(fecha) {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-CO')
}

export function diasHasta(fechaFin) {
  if (!fechaFin) return 0
  const dias = Math.ceil((new Date(fechaFin) - new Date()) / (1000 * 60 * 60 * 24))
  return dias > 0 ? dias : 0
}

// Convierte una fila de /api/membresias en algo fácil de mostrar.
// clase: 'activa' | 'vencida' | 'sin'
export function resumenMembresia(m) {
  if (!m) {
    return { texto: 'Sin membresía', clase: 'sin', detalle: '—' }
  }

  // Los administrativos tienen un "beneficio" automático (siempre activo)
  if (m.tipo === 'beneficio') {
    return { texto: 'Beneficio activo', clase: 'activa', detalle: 'Ilimitado' }
  }

  const activa = m.estado === 'activa'
  const texto = activa ? 'Activa' : 'Vencida'
  const clase = activa ? 'activa' : 'vencida'

  if (m.tipo === 'mensual') {
    return { texto, clase, detalle: `${diasHasta(m.fecha_fin)} días restantes` }
  }
  if (m.tipo === 'chequera') {
    return { texto, clase, detalle: `${m.dias_restantes ?? 0} accesos disponibles` }
  }
  return { texto, clase, detalle: '—' }
}
