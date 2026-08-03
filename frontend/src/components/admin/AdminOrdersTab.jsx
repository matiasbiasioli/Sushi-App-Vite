// src/components/admin/AdminOrdersTab.jsx
// Tab de gestión de pedidos dentro del panel de admin.
// Muestra todos los pedidos de todos los clientes, con un selector para cambiar el estado de cada uno.
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getAdminOrders, updateOrderStatus } from '../../services/api'
import OrderStatusBadge from '../common/OrderStatusBadge'

// Los 6 estados posibles, en el mismo orden que el ENUM de la base de datos.
// Los usamos para armar las opciones del <select> de cada pedido.
const ESTADOS = [
  'pendiente_pago', 'pagado', 'en_preparacion', 'listo', 'entregado', 'cancelado',
]

function AdminOrdersTab() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Guarda el id del pedido que se está actualizando en este momento (para deshabilitar su select mientras tanto)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  function loadOrders() {
    setLoading(true)
    getAdminOrders(token)
      .then(data => setOrders(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  // Cuando el admin elige un estado nuevo en el <select> de un pedido
  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId)
    try {
      await updateOrderStatus(orderId, newStatus, token)
      // Actualizamos el estado localmente en vez de volver a pedir todo a la API,
      // así la UI responde al instante sin esperar un segundo fetch
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, estado: newStatus } : order
        )
      )
    } catch (err) {
      alert(err.message) // simple por ahora; se podría reemplazar por un mensaje más prolijo
    } finally {
      setUpdatingId(null)
    }
  }

  function formatPrice(price) {
    return price.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    })
  }

  if (loading) return <p className="text-arroz/50 text-sm">Cargando pedidos...</p>
  if (error) return <p className="text-acento text-sm">{error}</p>
  if (orders.length === 0) return <p className="text-arroz/50 text-sm">No hay pedidos todavía.</p>

  return (
    <div className="flex flex-col gap-3">
      {orders.map(order => (
        <div key={order.id} className="bg-superficie rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-arroz font-semibold text-sm">
              Pedido #{order.numero_pedido} — {order.cliente_nombre}
            </span>
            <OrderStatusBadge status={order.estado} />
          </div>

          <div className="text-xs text-arroz/50 mb-1">
            {order.cliente_telefono} · {order.tipo_entrega === 'delivery' ? 'Delivery' : 'Take away'}
          </div>

          {order.direccion_entrega && (
            <div className="text-xs text-arroz/50 mb-2">
              {order.direccion_entrega}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <span className="text-arroz font-semibold text-sm">
              {formatPrice(order.total)}
            </span>

            {/* Selector para cambiar el estado del pedido */}
            <select
              value={order.estado}
              onChange={e => handleStatusChange(order.id, e.target.value)}
              disabled={updatingId === order.id}
              className="bg-fondo text-arroz text-xs rounded-lg px-2 py-1.5 outline-none"
            >
              {ESTADOS.map(estado => (
                <option key={estado} value={estado}>
                  {estado.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AdminOrdersTab