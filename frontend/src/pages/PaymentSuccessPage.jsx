// src/pages/PaymentSuccessPage.jsx
// Página a la que Mercado Pago redirige cuando el pago se completó con éxito.
// MP agrega parámetros a la URL (query params), como ?payment_id=...&status=approved&external_reference=...
// external_reference es el `pedidoId` interno que mandamos al crear la preferencia — así sabemos
// a qué pedido corresponde este pago, sin tener que guardar nada en el frontend de antemano.
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('external_reference')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-16">
      <CheckCircle size={64} className="text-wasabi mb-4" />
      <h1 className="font-display text-arroz text-2xl font-bold mb-2">
        ¡Pago aprobado!
      </h1>
      <p className="text-arroz/70 text-sm mb-1">
        Tu pedido ya está confirmado y en camino a la cocina.
      </p>
      {orderId && (
        <p className="text-arroz/50 text-xs mb-8">
          Pedido interno #{orderId}
        </p>
      )}
      <Link
        to="/profile"
        className="px-6 py-3 rounded-full bg-acento text-arroz font-semibold hover:brightness-110 transition-all"
      >
        Ver mis pedidos
      </Link>
    </div>
  )
}

export default PaymentSuccessPage