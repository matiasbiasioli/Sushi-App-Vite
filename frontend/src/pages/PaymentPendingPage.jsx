// src/pages/PaymentPendingPage.jsx
// Página a la que Mercado Pago redirige cuando el pago quedó en estado pendiente
// (típico de medios de pago como Rapipago/Pago Fácil, que no se acreditan al instante).
import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'

function PaymentPendingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-16">
      <Clock size={64} className="text-arroz/50 mb-4" />
      <h1 className="font-display text-arroz text-2xl font-bold mb-2">
        Tu pago está siendo procesado
      </h1>
      <p className="text-arroz/70 text-sm mb-8">
        Puede tardar un rato en confirmarse, según el medio de pago que hayas elegido.
        En cuanto se acredite, vas a ver el pedido actualizado en tu perfil.
      </p>
      <Link
        to="/profile"
        className="px-6 py-3 rounded-full bg-acento text-arroz font-semibold hover:brightness-110 transition-all"
      >
        Ver mis pedidos
      </Link>
    </div>
  )
}

export default PaymentPendingPage