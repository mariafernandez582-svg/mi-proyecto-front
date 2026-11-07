import { GestionPersonas } from './modules/personas'

// OJO: App.jsx lo van a tocar los 3 integrantes. Cuando esté el router/login,
// <GestionPersonas /> se monta en la ruta del administrador.
function App() {
  return <GestionPersonas />
}

export default App
