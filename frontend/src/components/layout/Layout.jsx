// src/components/layout/Layout.jsx
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'
import AddedToCartModal from '../cart/AddedToCartModal'

function Layout() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const location = useLocation()

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="min-h-screen bg-fondo flex flex-col">
      <Header onCartClick={() => setIsCartOpen(true)} />

       <div className="flex-1">
        <Outlet />
      </div>

      <Footer />

      <CartDrawer isOpen={isCartOpen && !isAuthPage} onClose={() => setIsCartOpen(false)} />
      <AddedToCartModal onGoToCart={() => setIsCartOpen(true)} />
    </div>
  )
}

export default Layout