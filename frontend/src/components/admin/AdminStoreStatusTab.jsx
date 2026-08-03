// src/components/admin/AdminStoreStatusTab.jsx
// Tab del panel de admin para abrir/cerrar el local y editar el mensaje de horario.
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useStoreStatus } from '../../context/StoreStatusContext'
import { updateStoreStatus } from '../../services/api'

function AdminStoreStatusTab() {
  const { token } = useAuth()
  const { abierto, horarioApertura, refreshStoreStatus } = useStoreStatus()

  // Estado local del formulario, separado del contexto: así el admin puede escribir
  // el horario sin que se guarde letra por letra, solo al tocar "Guardar"
  const [localAbierto, setLocalAbierto] = useState(abierto)
  const [localHorario, setLocalHorario] = useState(horarioApertura || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Si el contexto se actualiza (por ejemplo, al entrar a esta pantalla), sincronizamos
  // los campos locales con el valor real más reciente
  useEffect(() => {
    setLocalAbierto(abierto)
    setLocalHorario(horarioApertura || '')
  }, [abierto, horarioApertura])

  async function handleSave() {
    setError('')
    setSaving(true)
    try {
      await updateStoreStatus({ abierto: localAbierto, horarioApertura: localHorario || null }, token)
      await refreshStoreStatus() // así el resto de la app (home, carrito) se entera del cambio al toque
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-superficie rounded-2xl p-5 max-w-md">
      <h3 className="text-arroz font-semibold text-sm mb-4">Estado del local</h3>

      <div className="flex items-center justify-between mb-4">
        <span className="text-arroz text-sm">
          {localAbierto ? 'Local abierto' : 'Local cerrado'}
        </span>

        {/* Switch simple: un botón que alterna entre dos estilos según localAbierto */}
        <button
          onClick={() => setLocalAbierto(prev => !prev)}
          className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${
            localAbierto ? 'bg-wasabi justify-end' : 'bg-fondo justify-start'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-arroz" />
        </button>
      </div>

      <label className="text-arroz/70 text-xs block mb-1">
        Mensaje de horario (se muestra solo cuando está cerrado)
      </label>
      <input
        type="text"
        value={localHorario}
        onChange={e => setLocalHorario(e.target.value)}
        placeholder="Ej: Abrimos a las 19hs"
        className="w-full bg-fondo text-arroz rounded-xl px-3 py-2 text-sm placeholder:text-arroz/30 outline-none mb-4"
      />

      {error && <p className="text-acento text-sm mb-3">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2.5 rounded-full bg-acento text-arroz font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  )
}

export default AdminStoreStatusTab