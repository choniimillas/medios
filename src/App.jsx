import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './layouts/Layout'
import { HomePage } from './pages/Home'
import { PropiedadesPage } from './pages/Propiedades'
import { PresupuestosPage } from './pages/Presupuestos'
import { ServiciosPage } from './pages/Servicios'
import { LocacionesPage } from './pages/Locaciones'
import { DirectorioPage } from './pages/Directorio'
import { MetricasPage } from './pages/Metricas'
import { ComprasPage } from './pages/Compras'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="propiedades" element={<PropiedadesPage />} />
        <Route path="presupuestos" element={<PresupuestosPage />} />
        <Route path="servicios" element={<ServiciosPage />} />
        <Route path="locaciones" element={<LocacionesPage />} />
        <Route path="directorio" element={<DirectorioPage />} />
        <Route path="metricas" element={<MetricasPage />} />
        <Route path="compras" element={<ComprasPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
