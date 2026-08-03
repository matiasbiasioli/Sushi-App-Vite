// src/components/cart/checkout/PaymentStep.jsx
import { Banknote, CreditCard } from "lucide-react";
import { useCart } from "../../../context/CartContext";

function PaymentStep({ onContinue, onBack, submitting, orderError }) {
  const { paymentMethod, setPaymentMethod } = useCart();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-fondo">
        <button onClick={onBack} className="text-arroz/70 text-sm mb-2">
          &lt; Volver
        </button>
        <h2 className="font-display text-arroz text-lg font-semibold">
          ¿Efectivo o tarjeta?
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <button
          onClick={() => setPaymentMethod("efectivo")}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
            paymentMethod === "efectivo"
              ? "border-wasabi bg-wasabi/10"
              : "border-fondo bg-fondo"
          }`}
        >
          <Banknote size={24} className="text-arroz shrink-0" />
          <div>
            <p className="text-arroz text-sm font-semibold">Efectivo</p>
            <p className="text-arroz/50 text-xs">Abonás al recibir tu pedido</p>
          </div>
        </button>

        <button
          onClick={() => setPaymentMethod("mercadopago")}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
            paymentMethod === "mercadopago"
              ? "border-acento bg-acento/10"
              : "border-fondo bg-fondo"
          }`}
        >
          <CreditCard size={24} className="text-arroz shrink-0" />
          <div>
            <p className="text-arroz text-sm font-semibold">Mercado Pago</p>
            <p className="text-arroz/50 text-xs">Abonás online con tarjeta</p>
          </div>
        </button>
      </div>

      <div className="p-4 border-t border-fondo">
        <button
          onClick={onContinue}
          disabled={!paymentMethod || submitting}
          className="w-full py-3 rounded-full bg-acento text-arroz font-semibold disabled:bg-fondo disabled:text-arroz/30 hover:brightness-110 transition-all"
        >
          {submitting ? "Confirmando..." : "Confirmar pedido"}
        </button>

        {orderError && (
          <p className="text-acento text-sm text-center mt-2">{orderError}</p>
        )}
      </div>
    </div>
  );
}

export default PaymentStep;
