// src/pages/OrderTrackingPage.jsx
// Página pública (sin necesidad de estar logueado) donde cualquiera puede
// consultar el estado de un pedido con su teléfono + número de pedido.
import { useState } from 'react'
import { Search } from 'lucide-react'
import { trackOrder } from '../services/api'
import OrderStatusBadge from '../components/common/OrderStatusBadge'

function OrderTrackingPage() {
  const [telefono, setTelefono] = useState('')
  const [numeroPedido, setNumeroPedido] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null) // el pedido encontrado, o null si todavía no se buscó

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setOrder(null)
    setLoading(true)

    try {
      const result = await trackOrder(telefono, numeroPedido)
      setOrder(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="font-display text-arroz text-2xl font-bold text-center mb-2">
        Estado de mi pedido
      </h1>
      <p className="text-arroz/50 text-sm text-center mb-8">
        Ingresá tu teléfono y el número de pedido para ver en qué está.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-8">
        <div>
          <label className="text-arroz/70 text-xs block mb-1">Teléfono</label>
          <input
            type="tel"
            required
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            placeholder="Ej: 1123456789"
            className="w-full bg-superficie text-arroz rounded-xl px-4 py-3 text-sm placeholder:text-arroz/30 outline-none focus:ring-2 focus:ring-acento"
          />
        </div>

        <div>
          <label className="text-arroz/70 text-xs block mb-1">Número de pedido</label>
          <input
            type="number"
            required
            value={numeroPedido}
            onChange={e => setNumeroPedido(e.target.value)}
            placeholder="Ej: 33"
            className="w-full bg-superficie text-arroz rounded-xl px-4 py-3 text-sm placeholder:text-arroz/30 outline-none focus:ring-2 focus:ring-acento"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-acento text-arroz font-semibold hover:brightness-110 transition-all disabled:opacity-50"
        >
          <Search size={18} />
          {loading ? 'Buscando...' : 'Dónde está mi pedido'}
        </button>
      </form>

      {error && (
        <p className="text-acento text-sm text-center">{error}</p>
      )}

      {order && (
        <div className="bg-superficie rounded-2xl p-5 text-center">
          <p className="text-arroz/50 text-xs mb-1">Pedido #{order.numero_pedido}</p>
          <div className="mb-3">
            <OrderStatusBadge status={order.estado} />
          </div>
          <p className="text-arroz/70 text-sm">
            {order.tipo_entrega === 'delivery' ? 'Delivery' : 'Take away'}
          </p>
        </div>
      )}
    </div>
  )
}

export default OrderTrackingPage