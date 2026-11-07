import { useState } from 'react'
import { TIPOS_DOCUMENTO, TIPOS_PERSONA, TIPOS_PROFESOR } from './constantes'

const VACIO = {
  nombre_completo: '',
  numero_documento: '',
  tipo_documento: 'CC',
  tipo_persona: 'estudiante',
  tipo_profesor: 'vinculado',
}

function validar(datos) {
  const errores = {}
  const nombre = datos.nombre_completo.trim()

  // El correo se genera con nombre y apellido, por eso piden mínimo 2 palabras
  if (nombre.split(/\s+/).filter(Boolean).length < 2) {
    errores.nombre_completo = 'Escribe nombre y apellido'
  }
  if (!/^\d{5,15}$/.test(datos.numero_documento.trim())) {
    errores.numero_documento = 'Solo números (entre 5 y 15 dígitos)'
  }
  return errores
}

// modo: 'crear' | 'editar'. Si es editar, `persona` trae los datos actuales.
export default function UsuarioForm({ modo, persona, onGuardar, onCancelar }) {
  const [datos, setDatos] = useState(() =>
    persona
      ? {
          ...VACIO,
          nombre_completo: persona.nombre_completo.trim(),
          numero_documento: persona.numero_documento,
          tipo_documento: persona.tipo_documento,
          tipo_persona: persona.tipo_persona,
        }
      : VACIO,
  )
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')

  const editando = modo === 'editar'

  const cambiar = (campo) => (e) =>
    setDatos((d) => ({ ...d, [campo]: e.target.value }))

  async function enviar(e) {
    e.preventDefault()
    const errs = validar(datos)
    setErrores(errs)
    if (Object.keys(errs).length > 0) return

    const cuerpo = {
      nombre_completo: datos.nombre_completo.trim(),
      numero_documento: datos.numero_documento.trim(),
      tipo_documento: datos.tipo_documento,
      tipo_persona: datos.tipo_persona,
    }
    // tipo_profesor solo aplica al crear un profesor
    if (!editando && datos.tipo_persona === 'profesor') {
      cuerpo.tipo_profesor = datos.tipo_profesor
    }

    setGuardando(true)
    setErrorServidor('')
    try {
      await onGuardar(cuerpo)
    } catch (err) {
      setErrorServidor(err.message)
      setGuardando(false)
    }
  }

  return (
    <form className="gp-form" onSubmit={enviar} noValidate>
      <label>
        Nombre completo
        <input value={datos.nombre_completo} onChange={cambiar('nombre_completo')} />
        {errores.nombre_completo && <span className="gp-error">{errores.nombre_completo}</span>}
      </label>

      <label>
        Número de documento
        <input
          value={datos.numero_documento}
          onChange={cambiar('numero_documento')}
          inputMode="numeric"
        />
        {errores.numero_documento && <span className="gp-error">{errores.numero_documento}</span>}
      </label>

      <label>
        Tipo de documento
        <select value={datos.tipo_documento} onChange={cambiar('tipo_documento')}>
          {TIPOS_DOCUMENTO.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>

      <label>
        Clasificación
        <select
          value={datos.tipo_persona}
          onChange={cambiar('tipo_persona')}
          disabled={editando}
        >
          {TIPOS_PERSONA.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {editando && (
          <span className="gp-hint">
            No se puede cambiar: afecta el beneficio y los datos de profesor.
          </span>
        )}
      </label>

      {!editando && datos.tipo_persona === 'profesor' && (
        <label>
          Tipo de profesor
          <select value={datos.tipo_profesor} onChange={cambiar('tipo_profesor')}>
            {TIPOS_PROFESOR.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
      )}

      {!editando && (
        <p className="gp-hint">El correo institucional se genera automáticamente.</p>
      )}

      {errorServidor && <p className="gp-error gp-error-box">{errorServidor}</p>}

      <div className="gp-actions">
        <button type="button" className="gp-btn gp-btn-ghost" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="gp-btn" disabled={guardando}>
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Registrar usuario'}
        </button>
      </div>
    </form>
  )
}
