// src/components/products/ProductCard.jsx
import { ImageOff } from 'lucide-react'
import { useCart } from '../../context/CartContext'

function ProductCard({ product }) {
  const { requestAdd } = useCart()

  const formattedPrice = product.price.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  })

  return (
    <div className="bg-superficie rounded-2xl overflow-hidden flex flex-col">
      
      <div className="aspect-square bg-fondo flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageOff size={32} className="text-arroz/30" />
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-display text-arroz text-sm font-semibold leading-tight">
          {product.name}
        </h3>

        {product.pieces && (
          <span className="text-arroz/50 text-xs mt-1">
            {product.pieces} piezas
          </span>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-acento font-semibold text-sm">
            {formattedPrice}
          </span>

          <button
            onClick={() => requestAdd(product)}
            disabled={!product.available}
            className="px-3 py-1.5 rounded-full bg-acento text-arroz text-xs font-semibold disabled:bg-superficie disabled:text-arroz/30 hover:brightness-110 transition-all"
          >
            {product.available ? 'Añadir' : 'Sin stock'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard