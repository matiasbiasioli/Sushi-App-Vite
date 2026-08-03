// src/pages/ResetPasswordPage.jsx
// Página a la que llega el usuario desde el link del email (?token=xxxx en la URL).
// Muestra un formulario de nueva contraseña, y usa ese token para confirmar el cambio.
import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { resetPassword } from '../services/api'

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      await resetPassword(token, password)
      setSuccess(true)
      // Después de unos segundos, mandamos al usuario a loguearse con la contraseña nueva
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Si a la página le falta el token (alguien entró a /reset-password directo, sin link),
  // no tiene sentido mostrar el formulario — avisamos y ofrecemos pedir uno nuevo
  if (!token) {
    return (
      <div className="min-h-screen bg-fondo flex items-center justify-center p-4">
        <div className="bg-superficie rounded-2xl w-full max-w-sm p-6 text-center">
          <p className="text-arroz/70 text-sm mb-4">
            Este link no es válido. Pedí uno nuevo desde la pantalla de recuperación.
          </p>
          <Link to="/forgot-password" className="text-acento font-medium text-sm">
            Solicitar link de recuperación
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fondo flex items-center justify-center p-4">
      <div className="bg-superficie rounded-2xl w-full max-w-sm p-6">
        <h1 className="font-display text-arroz text-2xl font-bold text-center mb-6">
          Nueva contraseña
        </h1>

        {success ? (
          <p className="text-wasabi text-sm text-center">
            ¡Contraseña actualizada! Te llevamos al login en un momento...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="w-full bg-fondo text-arroz rounded-xl px-4 py-3 text-sm placeholder:text-arroz/30 outline-none focus:ring-2 focus:ring-acento"
            />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repetí la nueva contraseña"
              className="w-full bg-fondo text-arroz rounded-xl px-4 py-3 text-sm placeholder:text-arroz/30 outline-none focus:ring-2 focus:ring-acento"
            />

            {/* Este error cubre tanto "no coinciden" como "token inválido/vencido" que devuelve el backend */}
            {error && <p className="text-acento text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-acento text-arroz font-semibold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage