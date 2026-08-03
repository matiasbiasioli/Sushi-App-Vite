// src/pages/AdminPage.jsx
import { useState } from 'react'
import AdminOrdersTab from '../components/admin/AdminOrdersTab'
import AdminProductsTab from '../components/admin/AdminProductsTab'
import AdminStoreStatusTab from '../components/admin/AdminStoreStatusTab'

function AdminPage() {
  const [activeTab, setActiveTab] = useState('pedidos')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-arroz text-2xl font-bold mb-6">
        Panel de administración
      </h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pedidos')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'pedidos' ? 'bg-acento text-arroz' : 'bg-superficie text-arroz/60'
          }`}
        >
          Pedidos
        </button>
        <button
          onClick={() => setActiveTab('productos')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'productos' ? 'bg-acento text-arroz' : 'bg-superficie text-arroz/60'
          }`}
        >
          Productos
        </button>
        <button
          onClick={() => setActiveTab('local')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'local' ? 'bg-acento text-arroz' : 'bg-superficie text-arroz/60'
          }`}
        >
          Local
        </button>
      </div>

      {activeTab === 'pedidos' && <AdminOrdersTab />}
      {activeTab === 'productos' && <AdminProductsTab />}
      {activeTab === 'local' && <AdminStoreStatusTab />}
    </div>
  )
}

export default AdminPage