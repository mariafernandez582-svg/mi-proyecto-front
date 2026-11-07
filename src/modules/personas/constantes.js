export const TIPOS_PERSONA = [
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'profesor', label: 'Profesor' },
  { value: 'administrativo', label: 'Administrativo' },
]

export const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula' },
  { value: 'TI', label: 'Tarjeta de identidad' },
  { value: 'CE', label: 'Cédula de extranjería' },
]

export const TIPOS_PROFESOR = [
  { value: 'vinculado', label: 'Vinculado' },
  { value: 'externo', label: 'Externo' },
]

export const etiquetaTipo = (valor) =>
  TIPOS_PERSONA.find((t) => t.value === valor)?.label ?? valor
