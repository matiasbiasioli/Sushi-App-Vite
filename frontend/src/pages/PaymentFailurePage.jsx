// src/pages/PaymentFailurePage.jsx
// Página a la que Mercado Pago redirige cuando el pago fue rechazado o cancelado.
import { Link } from 'react-router-dom'
import { XCircle } from 'lucide-react'

function PaymentFailurePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-16">
      <XCircle size={64} className="text-acento mb-4" />
      <h1 className="font-display text-arroz text-2xl font-bold mb-2">
        El pago no se pudo completar
      </h1>
      <p className="text-arroz/70 text-sm mb-8">
        Tu pedido quedó guardado, pero todavía no se registró el pago.
        Podés revisar el estado desde tu perfil o intentar de nuevo.
      </p>
      <div className="flex gap-3">
        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-fondo text-arroz font-semibold hover:bg-fondo/70 transition-all"
        >
          Volver al catálogo
        </Link>
        <Link
          to="/profile"
          className="px-6 py-3 rounded-full bg-acento text-arroz font-semibold hover:brightness-110 transition-all"
        >
          Ver mis pedidos
        </Link>
      </div>
    </div>
  )
}

export default PaymentFailurePage