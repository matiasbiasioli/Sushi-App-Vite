// src/components/cart/CartItem.jsx
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'

function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart()

  const subtotal = (item.price * item.quantity).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  })

  return (
    <div className="flex items-center gap-3 py-3 border-b border-fondo">
      
      <div className="flex-1 min-w-0">
        <h4 className="font-body text-arroz text-sm font-medium truncate">
          {item.name}
        </h4>
        <span className="text-acento text-sm font-semibold">{subtotal}</span>
      </div>

      <div className="flex items-center gap-2 bg-fondo rounded-full px-1 py-1">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-superficie transition-colors"
          aria-label="Restar"
        >
          <Minus size={14} className="text-arroz" />
        </button>

        <span className="text-arroz text-sm font-semibold w-5 text-center">
          {item.quantity}
        </span>

        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-superficie transition-colors"
          aria-label="Sumar"
        >
          <Plus size={14} className="text-arroz" />
        </button>
      </div>

      <button
        onClick={() => removeItem(item.id)}
        className="text-arroz/40 hover:text-acento transition-colors"
        aria-label="Eliminar producto"
      >
        <Trash2 size={16} />
      </button>

    </div>
  )
}

export default CartItem