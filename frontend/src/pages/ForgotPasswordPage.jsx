// src/pages/ForgotPasswordPage.jsx
// Formulario simple: el usuario pone su email, el backend le manda un link de recuperación.
// Importante: siempre mostramos el mismo mensaje de éxito, exista o no el email en el sistema
// (así lo diseñó el backend) — esto evita que alguien pueda "probar" emails al azar para
// descubrir cuáles están registrados en la base.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../services/api'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await forgotPassword(email)
      setSubmitted(true) // mostramos el mensaje de confirmación, sin importar el resultado real
    } catch (err) {
      // Esto solo pasa ante un error real de servidor/red, no por "el email no existe"
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-fondo flex items-center justify-center p-4">
      <div className="bg-superficie rounded-2xl w-full max-w-sm p-6">
        <h1 className="font-display text-arroz text-2xl font-bold text-center mb-2">
          ¿Olvidaste tu contraseña?
        </h1>

        {submitted ? (
          // Estado post-envío: mensaje genérico, sin confirmar ni negar si el email existe
          <p className="text-arroz/70 text-sm text-center mt-6">
            Si el email está registrado, vas a recibir un correo con instrucciones
            para recuperar tu contraseña. Revisá también la carpeta de spam.
          </p>
        ) : (
          <>
            <p className="text-arroz/50 text-sm text-center mb-6">
              Ingresá tu email y te mandamos un link para crear una nueva contraseña.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tuemail@ejemplo.com"
                className="w-full bg-fondo text-arroz rounded-xl px-4 py-3 text-sm placeholder:text-arroz/30 outline-none focus:ring-2 focus:ring-acento"
              />

              {error && <p className="text-acento text-sm text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-acento text-arroz font-semibold hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </button>
            </form>
          </>
        )}

        <p className="text-arroz/70 text-sm text-center mt-6">
          <Link to="/login" className="text-acento font-medium">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordPage