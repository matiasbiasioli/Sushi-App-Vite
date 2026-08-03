// src/components/common/OrderStatusBadge.jsx
// Muestra el estado de un pedido con un color distinto según corresponda.
// Se reutiliza tanto en "Mis pedidos" (cliente) como en el panel de admin.

// Mapeamos cada estado posible (definidos en el ENUM de la tabla `pedidos`)
// a un texto en español para mostrar, y a clases de Tailwind para el color.
const STATUS_CONFIG = {
  pendiente_pago: { label: 'Pendiente de pago', className: 'bg-fondo text-arroz/70' },
  pagado: { label: 'Pagado', className: 'bg-wasabi/20 text-wasabi' },
  en_preparacion: { label: 'En preparación', className: 'bg-acento/20 text-acento' },
  listo: { label: 'Listo', className: 'bg-wasabi/20 text-wasabi' },
  entregado: { label: 'Entregado', className: 'bg-superficie text-arroz/50 border border-arroz/20' },
  cancelado: { label: 'Cancelado', className: 'bg-red-500/20 text-red-400' },
}

function OrderStatusBadge({ status }) {
  // Si por algún motivo llega un estado que no está en el mapa, mostramos un fallback genérico
  const config = STATUS_CONFIG[status] || { label: status, className: 'bg-fondo text-arroz/70' }

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export default OrderStatusBadge