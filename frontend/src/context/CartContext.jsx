// src/context/CartContext.jsx
import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [pendingProduct, setPendingProduct] = useState(null)
  const [deliveryType, setDeliveryType] = useState(null) // 'delivery' | 'pickup'
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    number: '',
    floorApt: '',
    betweenStreets: '',
    notes: '',
  })
  const [paymentMethod, setPaymentMethod] = useState(null) // 'efectivo' | 'mercadopago'

  function updateAddressField(field, value) {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }))
  }

  function requestAdd(product) {
    setPendingProduct(product)
  }

  function confirmAdd() {
    if (!pendingProduct) return

    setItems(prevItems => {
      const existing = prevItems.find(item => item.id === pendingProduct.id)

      if (existing) {
        return prevItems.map(item =>
          item.id === pendingProduct.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...prevItems, { ...pendingProduct, quantity: 1 }]
    })

    setPendingProduct(null)
  }

  function cancelAdd() {
    setPendingProduct(null)
  }

  function removeItem(productId) {
    setItems(prevItems => prevItems.filter(item => item.id !== productId))
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  function clearCart() {
  setItems([])
  setDeliveryType(null)
  setDeliveryAddress({
    street: '',
    number: '',
    floorApt: '',
    betweenStreets: '',
    notes: '',
  })
  setPaymentMethod(null)
}

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const value = {
  items, removeItem, updateQuantity, totalCount, totalPrice, clearCart,
  pendingProduct, requestAdd, confirmAdd, cancelAdd,
  deliveryType, setDeliveryType,
  deliveryAddress, updateAddressField,
  paymentMethod, setPaymentMethod,
}

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}