import { etiquetaTipo } from './constantes'
import { resumenMembresia } from './membresiaUtils'

export default function UsuariosTable({
  personas,
  membresiaPorPersona,
  onEditar,
  onDesactivar,
  onEliminar,
  onVerMembresia,
}) {
  if (personas.length === 0) {
    return <p className="gp-vacio">No hay usuarios que coincidan con la búsqueda.</p>
  }

  return (
    <div className="gp-tabla-wrap">
      <table className="gp-tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Documento</th>
            <th>Clasificación</th>
            <th>Correo</th>
            <th>Membresía</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {personas.map((p) => {
            const m = resumenMembresia(membresiaPorPersona.get(p.id))
            return (
              <tr key={p.id}>
                <td>{p.nombre_completo}</td>
                <td>{p.tipo_documento} {p.numero_documento}</td>
                <td>
                  <span className={`gp-badge gp-tipo-${p.tipo_persona}`}>
                    {etiquetaTipo(p.tipo_persona)}
                  </span>
                </td>
                <td>{p.correo || 'Sin correo'}</td>
                <td>
                  <button
                    type="button"
                    className={`gp-badge gp-estado-${m.clase} gp-badge-btn`}
                    onClick={() => onVerMembresia(p)}
                    title="Ver detalle de la membresía"
                  >
                    {m.texto}
                  </button>
                </td>
                <td>{p.estado}</td>
                <td className="gp-acciones">
                  <button type="button" className="gp-btn gp-btn-sm" onClick={() => onEditar(p)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="gp-btn gp-btn-sm gp-btn-warn"
                    onClick={() => onDesactivar(p)}
                  >
                    Desactivar
                  </button>
                  <button
                    type="button"
                    className="gp-btn gp-btn-sm gp-btn-danger"
                    onClick={() => onEliminar(p)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
