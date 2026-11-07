import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  crearPersona,
  desactivarPersona,
  editarPersona,
  eliminarPersona,
  listarMembresias,
  listarPersonas,
} from './api'
import { TIPOS_PERSONA, etiquetaTipo } from './constantes'
import { formatearFecha, resumenMembresia } from './membresiaUtils'
import Modal from './Modal'
import UsuarioForm from './UsuarioForm'
import UsuariosTable from './UsuariosTable'
import './personas.css'

// Quita tildes y pasa a minúsculas para buscar sin importar acentos
const normalizar = (t) =>
  String(t ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export default function GestionPersonas() {
  const [personas, setPersonas] = useState([])
  const [membresias, setMembresias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')

  // null | { modo: 'crear' } | { modo: 'editar', persona }
  const [formulario, setFormulario] = useState(null)
  // null | { accion: 'desactivar' | 'eliminar', persona }
  const [confirmacion, setConfirmacion] = useState(null)
  const [personaMembresia, setPersonaMembresia] = useState(null)
  const [aviso, setAviso] = useState(null) // { tipo: 'ok' | 'error', texto }

  // Cada vez que "version" cambia, se vuelve a pedir la información al backend
  const [version, setVersion] = useState(0)
  const recargar = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    let cancelado = false

    Promise.all([listarPersonas(), listarMembresias()])
      .then(([listaPersonas, listaMembresias]) => {
        if (cancelado) return
        setPersonas(listaPersonas)
        setMembresias(listaMembresias)
        setErrorCarga('')
      })
      .catch((err) => {
        if (!cancelado) setErrorCarga(err.message)
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [version])

  function mostrarAviso(tipo, texto) {
    setAviso({ tipo, texto })
    setTimeout(() => setAviso(null), 6000)
  }

  // persona_id -> última membresía de esa persona
  const membresiaPorPersona = useMemo(
    () => new Map(membresias.map((m) => [m.persona_id, m])),
    [membresias],
  )

  const visibles = useMemo(() => {
    const q = normalizar(busqueda)
    return personas.filter((p) => {
      const coincideTipo = filtroTipo === 'todos' || p.tipo_persona === filtroTipo
      const coincideTexto =
        !q ||
        normalizar(p.nombre_completo).includes(q) ||
        p.numero_documento.includes(q) ||
        normalizar(p.correo).includes(q)
      return coincideTipo && coincideTexto
    })
  }, [personas, busqueda, filtroTipo])

  const conteo = useMemo(() => {
    const c = { estudiante: 0, profesor: 0, administrativo: 0 }
    personas.forEach((p) => {
      if (c[p.tipo_persona] !== undefined) c[p.tipo_persona] += 1
    })
    return c
  }, [personas])

  // ---- Acciones ----
  async function guardarUsuario(datos) {
    if (formulario.modo === 'editar') {
      const r = await editarPersona(formulario.persona.id, datos)
      mostrarAviso('ok', r.mensaje)
    } else {
      const r = await crearPersona(datos)
      mostrarAviso('ok', r.correo ? `${r.mensaje}. Correo: ${r.correo}` : r.mensaje)
    }
    setFormulario(null)
    recargar()
  }

  async function confirmar() {
    const { accion, persona } = confirmacion
    try {
      if (accion === 'desactivar') {
        const r = await desactivarPersona(persona.id)
        mostrarAviso('ok', r.mensaje)
      } else {
        const r = await eliminarPersona(persona.id)
        // El backend responde 200 con permitido:false cuando hay membresías o ingresos
        mostrarAviso(r.permitido ? 'ok' : 'error', r.mensaje)
      }
      recargar()
    } catch (err) {
      mostrarAviso('error', err.message)
    } finally {
      setConfirmacion(null)
    }
  }

  const detalle = personaMembresia
    ? {
        persona: personaMembresia,
        membresia: membresiaPorPersona.get(personaMembresia.id),
      }
    : null

  return (
    <section className="gp-root">
      <header className="gp-header">
        <div>
          <h1>Gestión de personas</h1>
          <p className="gp-sub">
            {personas.length} usuarios activos · {conteo.estudiante} estudiantes ·{' '}
            {conteo.profesor} profesores · {conteo.administrativo} administrativos
          </p>
        </div>
        <button type="button" className="gp-btn" onClick={() => setFormulario({ modo: 'crear' })}>
          + Nuevo usuario
        </button>
      </header>

      {aviso && (
        <div className={`gp-aviso gp-aviso-${aviso.tipo}`} role="status">
          <span>{aviso.texto}</span>
          <button type="button" className="gp-icon-btn" onClick={() => setAviso(null)}>✕</button>
        </div>
      )}

      <div className="gp-filtros">
        <input
          type="search"
          placeholder="Buscar por nombre, documento o correo…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="todos">Todas las clasificaciones</option>
          {TIPOS_PERSONA.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {cargando && <p className="gp-vacio">Cargando usuarios…</p>}

      {errorCarga && (
        <div className="gp-error-box">
          <p>No se pudo cargar la información: {errorCarga}</p>
          <button type="button" className="gp-btn gp-btn-sm" onClick={recargar}>Reintentar</button>
        </div>
      )}

      {!cargando && !errorCarga && (
        <UsuariosTable
          personas={visibles}
          membresiaPorPersona={membresiaPorPersona}
          onEditar={(persona) => setFormulario({ modo: 'editar', persona })}
          onDesactivar={(persona) => setConfirmacion({ accion: 'desactivar', persona })}
          onEliminar={(persona) => setConfirmacion({ accion: 'eliminar', persona })}
          onVerMembresia={setPersonaMembresia}
        />
      )}

      {formulario && (
        <Modal
          titulo={formulario.modo === 'editar' ? 'Editar usuario' : 'Nuevo usuario'}
          onCerrar={() => setFormulario(null)}
        >
          <UsuarioForm
            modo={formulario.modo}
            persona={formulario.persona}
            onGuardar={guardarUsuario}
            onCancelar={() => setFormulario(null)}
          />
        </Modal>
      )}

      {confirmacion && (
        <Modal
          titulo={confirmacion.accion === 'desactivar' ? 'Desactivar usuario' : 'Eliminar usuario'}
          onCerrar={() => setConfirmacion(null)}
        >
          <p>
            {confirmacion.accion === 'desactivar'
              ? `${confirmacion.persona.nombre_completo} dejará de aparecer en la lista de usuarios activos. Su historial se conserva.`
              : `Se intentará eliminar definitivamente a ${confirmacion.persona.nombre_completo}. Solo es posible si no tiene membresías ni historial de ingresos.`}
          </p>
          <div className="gp-actions">
            <button type="button" className="gp-btn gp-btn-ghost" onClick={() => setConfirmacion(null)}>
              Cancelar
            </button>
            <button type="button" className="gp-btn gp-btn-danger" onClick={confirmar}>
              {confirmacion.accion === 'desactivar' ? 'Sí, desactivar' : 'Sí, eliminar'}
            </button>
          </div>
        </Modal>
      )}

      {detalle && (
        <Modal
          titulo={`Membresía de ${detalle.persona.nombre_completo}`}
          onCerrar={() => setPersonaMembresia(null)}
        >
          <MembresiaDetalle persona={detalle.persona} membresia={detalle.membresia} />
        </Modal>
      )}
    </section>
  )
}

function MembresiaDetalle({ persona, membresia }) {
  const r = resumenMembresia(membresia)

  if (!membresia) {
    return <p>Este usuario todavía no tiene ninguna membresía registrada.</p>
  }

  return (
    <dl className="gp-detalle">
      <dt>Clasificación</dt>
      <dd>{etiquetaTipo(persona.tipo_persona)}</dd>
      <dt>Tipo de membresía</dt>
      <dd>{membresia.tipo}</dd>
      <dt>Estado</dt>
      <dd><span className={`gp-badge gp-estado-${r.clase}`}>{r.texto}</span></dd>
      <dt>Inicio</dt>
      <dd>{formatearFecha(membresia.fecha_inicio)}</dd>
      <dt>Fin</dt>
      <dd>
        {membresia.tipo === 'chequera'
          ? 'Sin vencimiento'
          : membresia.tipo === 'beneficio'
            ? 'Sin vencimiento'
            : formatearFecha(membresia.fecha_fin)}
      </dd>
      <dt>Disponible</dt>
      <dd>{r.detalle}</dd>
      <dt>Comprobante</dt>
      <dd>
        {membresia.comprobante ? (
          <a href={`/uploads/${membresia.comprobante}`} target="_blank" rel="noreferrer">
            Ver archivo
          </a>
        ) : (
          'Sin archivo'
        )}
      </dd>
    </dl>
  )
}
