// src/components/common/StoreClosedBanner.jsx
// Aviso que se muestra en la home cuando el local está cerrado, con el horario si está cargado.
// No renderiza nada si el local está abierto (ver la condición en HomePage.jsx).
import { Clock } from 'lucide-react'

function StoreClosedBanner({ horarioApertura }) {
  return (
    <div className="flex items-center gap-3 bg-superficie border border-acento/30 rounded-2xl p-4 mb-6">
      <Clock size={24} className="text-acento shrink-0" />
      <div>
        <p className="text-arroz font-semibold text-sm">
          En este momento estamos cerrados
        </p>
        <p className="text-arroz/60 text-xs">
          No podemos procesar tu pedido ahora.
          {horarioApertura ? ` ${horarioApertura}.` : ''}
        </p>
      </div>
    </div>
  )
}

export default StoreClosedBanner