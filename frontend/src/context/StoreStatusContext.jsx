// src/context/StoreStatusContext.jsx
// Guarda el estado del local (abierto/cerrado + horario) en un lugar centralizado,
// para que tanto la home (banner) como el carrito (bloqueo de checkout) lean el mismo dato
// sin pedirlo cada uno por su cuenta.
import { createContext, useContext, useState, useEffect } from 'react'
import { getStoreStatus } from '../services/api'

const StoreStatusContext = createContext()

export function StoreStatusProvider({ children }) {
  const [abierto, setAbierto] = useState(true) // arrancamos asumiendo abierto, se corrige al cargar
  const [horarioApertura, setHorarioApertura] = useState(null)
  const [loading, setLoading] = useState(true)

  // Pide el estado actual al backend. La exportamos como función (no solo en el useEffect)
  // para poder llamarla de nuevo manualmente, por ejemplo después de que el admin
  // cambie el estado desde el panel, sin tener que recargar toda la página.
  async function refreshStoreStatus() {
    try {
      const data = await getStoreStatus()
      setAbierto(data.abierto)
      setHorarioApertura(data.horarioApertura)
    } catch (err) {
      // Si falla la consulta (ej. backend caído), no bloqueamos la compra por las dudas:
      // preferimos asumir "abierto" antes que impedir ventas por un error de red.
      console.error('No se pudo consultar el estado del local:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshStoreStatus()
  }, [])

  const value = { abierto, horarioApertura, loading, refreshStoreStatus }

  return (
    <StoreStatusContext.Provider value={value}>
      {children}
    </StoreStatusContext.Provider>
  )
}

export function useStoreStatus() {
  return useContext(StoreStatusContext)
}