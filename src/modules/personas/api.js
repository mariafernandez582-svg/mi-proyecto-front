// Todas las llamadas al backend (Express) del módulo de personas.
// Las rutas empiezan con /api: en desarrollo Vite las redirige al puerto 3000 (ver vite.config.js).

const JSON_HEADERS = { 'Content-Type': 'application/json' }

async function request(url, options) {
  const res = await fetch(url, options)

  // Si la respuesta no trae JSON válido, data queda en null
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.mensaje || `Error del servidor (${res.status})`)
  }
  return data
}

// ---- Personas ----
export const listarPersonas = () => request('/api/personas')

export const crearPersona = (persona) =>
  request('/api/personas', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(persona),
  })

export const editarPersona = (id, persona) =>
  request(`/api/personas/${id}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(persona),
  })

// Desactivar = borrado lógico (estado = 'inactivo')
export const desactivarPersona = (id) =>
  request(`/api/personas/eliminar/${id}`, { method: 'PUT' })

// Eliminar definitivo: el backend responde { permitido, mensaje }
export const eliminarPersona = (id) =>
  request(`/api/personas/${id}`, { method: 'DELETE' })

// ---- Membresías (solo consulta) ----
export const listarMembresias = () => request('/api/membresias')
