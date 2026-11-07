import { useEffect } from 'react'

export default function Modal({ titulo, onCerrar, children }) {
  // Cerrar con la tecla Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCerrar])

  return (
    <div className="gp-overlay" onMouseDown={onCerrar}>
      <div
        className="gp-modal"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="gp-modal-header">
          <h2>{titulo}</h2>
          <button type="button" className="gp-icon-btn" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
