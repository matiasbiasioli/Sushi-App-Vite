// src/components/cart/AddedToCartModal.jsx
import { ImageOff, X } from 'lucide-react'
import { useCart } from '../../context/CartContext'

function AddedToCartModal({ onGoToCart }) {
  const { pendingProduct, confirmAdd, cancelAdd } = useCart()

  if (!pendingProduct) return null

  const formattedPrice = pendingProduct.price.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  })

  function handleContinueShopping() {
    confirmAdd()
  }

  function handleGoToCart() {
    confirmAdd()
    onGoToCart()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-superficie rounded-2xl w-full max-w-sm overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b border-fondo">
          <span className="text-arroz/70 text-sm font-medium">Confirmar producto</span>
          <button onClick={cancelAdd} aria-label="Cerrar sin agregar">
            <X size={20} className="text-arroz" />
          </button>
        </div>

        <div className="p-4 flex gap-4">
          <div className="w-20 h-20 shrink-0 rounded-xl bg-fondo flex items-center justify-center overflow-hidden">
            {pendingProduct.imageUrl ? (
              <img
                src={pendingProduct.imageUrl}
                alt={pendingProduct.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageOff size={24} className="text-arroz/30" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display text-arroz font-semibold leading-tight">
              {pendingProduct.name}
            </h3>
            {pendingProduct.pieces && (
              <span className="text-arroz/50 text-xs">{pendingProduct.pieces} piezas</span>
            )}
            <p className="text-acento font-semibold mt-1">{formattedPrice}</p>
          </div>
        </div>

        <div className="p-4 pt-0 flex flex-col gap-2">
          <button
            onClick={handleGoToCart}
            className="w-full py-3 rounded-full bg-acento text-arroz font-semibold hover:brightness-110 transition-all"
          >
            Añadir e ir a pagar
          </button>
          <button
            onClick={handleContinueShopping}
            className="w-full py-3 rounded-full bg-fondo text-arroz font-semibold hover:bg-fondo/70 transition-all"
          >
            Añadir y seguir comprando
          </button>
        </div>

      </div>
    </div>
  )
}

export default AddedToCartModal