// src/components/admin/AdminProductsTab.jsx
// Tab de gestión de productos: lista todos (incluidos los no disponibles),
// permite crear uno nuevo, editar uno existente, marcar sin stock, y eliminar/reactivar.
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getAdminProducts, updateProduct } from '../../services/api'
import useCategories from '../../hooks/useCategories'
import AdminProductForm from './AdminProductForm'
import { Pencil, Plus, Trash2, RotateCcw } from 'lucide-react'

function AdminProductsTab() {
  const { token } = useAuth()
  const { categories } = useCategories()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingProduct, setEditingProduct] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  // Controla si se muestra la sección de productos eliminados (colapsada por defecto)
  const [showDeleted, setShowDeleted] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  function loadProducts() {
    setLoading(true)
    getAdminProducts(token)
      .then(data => setProducts(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  function handleSaved() {
    setShowCreateForm(false)
    setEditingProduct(null)
    loadProducts()
  }

  // Activa/desactiva el stock (campo `disponible`) — el producto sigue visible en el catálogo,
  // pero se muestra como "agotado". Este es el control que ya tenías.
  async function toggleAvailability(product) {
    try {
      await updateProduct(product.id, { disponible: !product.disponible }, token)
      setProducts(prev =>
        prev.map(p => (p.id === product.id ? { ...p, disponible: !p.disponible } : p))
      )
    } catch (err) {
      alert(err.message)
    }
  }

  // Elimina el producto del menú (campo `activo` = false) — deja de aparecer en el catálogo público.
  // Pide confirmación antes, porque a diferencia de "sin stock", esta acción saca al producto
  // completamente de la vista del cliente.
  async function handleDelete(product) {
    const confirmed = window.confirm(
      `¿Seguro que querés eliminar "${product.nombre}" del menú? Vas a poder reactivarlo después si te arrepentís.`
    )
    if (!confirmed) return

    try {
      await updateProduct(product.id, { activo: false }, token)
      setProducts(prev =>
        prev.map(p => (p.id === product.id ? { ...p, activo: false } : p))
      )
    } catch (err) {
      alert(err.message)
    }
  }

  // Reactiva un producto previamente eliminado (activo = true de nuevo)
  async function handleReactivate(product) {
    try {
      await updateProduct(product.id, { activo: true }, token)
      setProducts(prev =>
        prev.map(p => (p.id === product.id ? { ...p, activo: true } : p))
      )
    } catch (err) {
      alert(err.message)
    }
  }

  function formatPrice(price) {
    return parseFloat(price).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    })
  }

  if (loading) return <p className="text-arroz/50 text-sm">Cargando productos...</p>
  if (error) return <p className="text-acento text-sm">{error}</p>

  // Separamos los productos en dos grupos: los que siguen en el menú, y los eliminados
  const activeProducts = products.filter(p => p.activo)
  const deletedProducts = products.filter(p => !p.activo)

  return (
    <div>
      {!showCreateForm && !editingProduct && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-acento text-arroz font-semibold text-sm hover:brightness-110 transition-all"
        >
          <Plus size={16} />
          Nuevo producto
        </button>
      )}

      {showCreateForm && (
        <AdminProductForm
          categories={categories}
          onSaved={handleSaved}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingProduct && (
        <AdminProductForm
          product={editingProduct}
          categories={categories}
          onSaved={handleSaved}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {/* Productos activos (en el menú) */}
      <div className="flex flex-col gap-2 mb-4">
        {activeProducts.map(product => (
          <div
            key={product.id}
            className={`bg-superficie rounded-xl p-3 flex items-center gap-3 ${
              !product.disponible ? 'opacity-50' : ''
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-arroz text-sm font-medium truncate">{product.nombre}</p>
              <p className="text-arroz/50 text-xs">
                {product.categoria_nombre} · {formatPrice(product.precio)}
              </p>
            </div>

            <button
              onClick={() => setEditingProduct(product)}
              className="p-2 rounded-full hover:bg-fondo transition-colors"
              aria-label="Editar producto"
            >
              <Pencil size={16} className="text-arroz" />
            </button>

            <button
              onClick={() => toggleAvailability(product)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                product.disponible
                  ? 'bg-wasabi/20 text-wasabi'
                  : 'bg-fondo text-arroz/50'
              }`}
            >
              {product.disponible ? 'Disponible' : 'Sin stock'}
            </button>

            <button
              onClick={() => handleDelete(product)}
              className="p-2 rounded-full hover:bg-fondo transition-colors"
              aria-label="Eliminar producto"
            >
              <Trash2 size={16} className="text-acento" />
            </button>
          </div>
        ))}
      </div>

      {/* Sección colapsable de productos eliminados */}
      {deletedProducts.length > 0 && (
        <div>
          <button
            onClick={() => setShowDeleted(prev => !prev)}
            className="text-arroz/50 text-xs mb-2 underline"
          >
            {showDeleted ? 'Ocultar' : 'Ver'} eliminados ({deletedProducts.length})
          </button>

          {showDeleted && (
            <div className="flex flex-col gap-2">
              {deletedProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-superficie rounded-xl p-3 flex items-center gap-3 opacity-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-arroz text-sm font-medium truncate">{product.nombre}</p>
                    <p className="text-arroz/50 text-xs">
                      {product.categoria_nombre} · {formatPrice(product.precio)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleReactivate(product)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-wasabi/20 text-wasabi text-xs font-medium"
                  >
                    <RotateCcw size={14} />
                    Reactivar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminProductsTab