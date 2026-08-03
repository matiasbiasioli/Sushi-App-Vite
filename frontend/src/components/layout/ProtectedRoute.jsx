// src/components/layout/ProtectedRoute.jsx
// Protege una ruta: si no hay sesión, redirige a /login.
// Si se pasa la prop `adminOnly`, además exige que el usuario tenga rol 'admin';
// si no lo tiene, lo redirige al catálogo (no tiene sentido mandarlo a /login, ya está logueado).
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, checkingSession, user } = useAuth()

  if (checkingSession) {
    return <p className="text-arroz p-8">Cargando...</p>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.rol !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute