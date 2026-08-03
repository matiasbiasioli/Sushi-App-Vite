// src/components/cart/checkout/DeliveryStep.jsx
import { Bike, Store } from 'lucide-react'
import { useCart } from '../../../context/CartContext'

function DeliveryStep({ onContinue, onBack }) {
  const { deliveryType, setDeliveryType, deliveryAddress, updateAddressField } = useCart()

  const canContinue =
    deliveryType === 'pickup' ||
    (deliveryType === 'delivery' &&
      deliveryAddress.street.trim() !== '' &&
      deliveryAddress.number.trim() !== '')

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-fondo">
        <button onClick={onBack} className="text-arroz/70 text-sm mb-2">
          &lt; Volver
        </button>
        <h2 className="font-display text-arroz text-lg font-semibold">
          ¿Delivery o Pick Up?
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setDeliveryType('delivery')}
            className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-colors ${
              deliveryType === 'delivery'
                ? 'border-acento bg-acento/10'
                : 'border-fondo bg-fondo'
            }`}
          >
            <Bike size={28} className="text-arroz" />
            <span className="text-arroz text-sm font-medium">Delivery</span>
          </button>

          <button
            onClick={() => setDeliveryType('pickup')}
            className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-colors ${
              deliveryType === 'pickup'
                ? 'border-wasabi bg-wasabi/10'
                : 'border-fondo bg-fondo'
            }`}
          >
            <Store size={28} className="text-arroz" />
            <span className="text-arroz text-sm font-medium">Pick Up</span>
          </button>
        </div>

        {deliveryType === 'delivery' && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-arroz/70 text-xs block mb-1">Calle *</label>
                <input
                  type="text"
                  value={deliveryAddress.street}
                  onChange={e => updateAddressField('street', e.target.value)}
                  placeholder="Av. Corrientes"
                  className="w-full bg-fondo text-arroz rounded-xl px-3 py-2.5 text-sm placeholder:text-arroz/30 outline-none focus:ring-2 focus:ring-acento"
                />
              </div>
              <div className="w-24">
                <label className="text-arroz/70 text-xs block mb-1">Altura *</label>
                <input
                  type="text"
                  value={deliveryAddress.number}
                  onChange={e => updateAddressField('number', e.target.value)}
                  placeholder="1234"
                  className="w-full bg-fondo text-arroz rounded-xl px-3 py-2.5 text-sm placeholder:text-arroz/30 outline-none focus:ring-2 focus:ring-acento"
                />
              </div>
            </div>

            <div>
              <label className="text-arroz/70 text-xs block mb-1">Piso / Depto (opcional)</label>
              <input
                type="text"
                value={deliveryAddress.floorApt}
                onChange={e => updateAddressField('floorApt', e.target.value)}
                placeholder="3° B"
                className="w-full bg-fondo text-arroz rounded-xl px-3 py-2.5 text-sm placeholder:text-arroz/30 outline-none focus:ring-2 focus:ring-acento"
              />
            </div>

            <div>
              <label className="text-arroz/70 text-xs block mb-1">Entre calles (opcional)</label>
              <input
                type="text"
                value={deliveryAddress.betweenStreets}
                onChange={e => updateAddressField('betweenStreets', e.target.value)}
                placeholder="Callao y Rodríguez Peña"
                className="w-full bg-fondo text-arroz rounded-xl px-3 py-2.5 text-sm placeholder:text-arroz/30 outline-none focus:ring-2 focus:ring-acento"
              />
            </div>

            <div>
              <label className="text-arroz/70 text-xs block mb-1">Observaciones (opcional)</label>
              <textarea
                value={deliveryAddress.notes}
                onChange={e => updateAddressField('notes', e.target.value)}
                placeholder="Timbre roto, llamar al llegar, portón azul..."
                rows={2}
                className="w-full bg-fondo text-arroz rounded-xl px-3 py-2.5 text-sm placeholder:text-arroz/30 outline-none focus:ring-2 focus:ring-acento resize-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-fondo">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="w-full py-3 rounded-full bg-acento text-arroz font-semibold disabled:bg-fondo disabled:text-arroz/30 hover:brightness-110 transition-all"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

export default DeliveryStep