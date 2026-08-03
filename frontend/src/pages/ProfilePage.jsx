// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../services/api'
import { LogOut, Package } from 'lucide-react'
import OrderStatusBadge from '../components/common/OrderStatusBadge'

function ProfilePage() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

  // Estado local para los pedidos del usuario: la data en sí, si está cargando, y posible error
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [ordersError, setOrdersError] = useState('')

  // Al montar la página, pedimos los pedidos del usuario logueado
  useEffect(() => {
    getMyOrders(token)
      .then(data => setOrders(data))
      .catch(err => setOrdersError(err.message))
      .finally(() => setLoadingOrders(false))
  }, [token])

  function handleLogout() {
    logout()
    navigate('/')
  }

  // Formatea un precio en pesos argentinos (mismo patrón que usamos en ProductCard/CartItem)
  function formatPrice(price) {
    return price.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    })
  }

  // Formatea una fecha tipo "2026-07-16" a algo más legible, ej "16 jul 2026"
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="font-display text-arroz text-2xl font-bold mb-6">
        Mi perfil
      </h1>

      <div className="bg-superficie rounded-2xl p-5 mb-6">
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-arroz/50 text-xs block">Nombre</span>
            <span className="text-arroz text-sm font-medium">{user.nombre}</span>
          </div>
          <div>
            <span className="text-arroz/50 text-xs block">Email</span>
            <span className="text-arroz text-sm font-medium">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Sección de pedidos */}
      <h2 className="font-display text-arroz text-lg font-semibold mb-3 flex items-center gap-2">
        <Package size={18} />
        Mis pedidos
      </h2>

      {loadingOrders && (
        <p className="text-arroz/50 text-sm mb-6">Cargando tus pedidos...</p>
      )}

      {ordersError && (
        <p className="text-acento text-sm mb-6">{ordersError}</p>
      )}

      {!loadingOrders && !ordersError && orders.length === 0 && (
        <p className="text-arroz/50 text-sm mb-6">Todavía no hiciste ningún pedido.</p>
      )}

      {!loadingOrders && orders.length > 0 && (
        <div className="flex flex-col gap-3 mb-6">
          {orders.map(order => (
            <div key={order.id} className="bg-superficie rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-arroz font-semibold text-sm">
                  Pedido #{order.numero_pedido}
                </span>
                <OrderStatusBadge status={order.estado} />
              </div>
              <div className="flex items-center justify-between text-xs text-arroz/50">
                <span>{formatDate(order.pedido_fecha)}</span>
                <span>{order.tipo_entrega === 'delivery' ? 'Delivery' : 'Take away'}</span>
              </div>
              <div className="text-right text-arroz font-semibold text-sm mt-2">
                {formatPrice(order.total)}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-acento text-arroz font-semibold hover:brightness-110 transition-all"
      >
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </div>
  )
}

export default ProfilePage