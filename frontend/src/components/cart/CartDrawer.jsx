// src/components/cart/CartDrawer.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShoppingBag, CheckCircle } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { createOrder } from "../../services/api";
import CartItem from "./CartItem";
import DeliveryStep from "./checkout/DeliveryStep";
import PaymentStep from "./checkout/PaymentStep";
import { useStoreStatus } from "../../context/StoreStatusContext";

function CartDrawer({ isOpen, onClose }) {
  const {
    items,
    totalPrice,
    deliveryType,
    deliveryAddress,
    paymentMethod,
    clearCart,
  } = useCart();
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("cart"); // 'cart' | 'delivery' | 'payment' | 'confirmation'
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const formattedTotal = totalPrice.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });

  const { abierto, horarioApertura } = useStoreStatus();

  function handleClose() {
    onClose();
    if (step === "confirmation") {
      setStep("cart");
      setConfirmedOrder(null);
    }
  }

  async function handleConfirmOrder() {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "checkout" } });
      return;
    }

    setSubmitting(true);
    setOrderError("");

    try {
      const orderData = {
        items: items.map((item) => ({
          productoId: item.id,
          cantidad: item.quantity,
        })),
        deliveryType: deliveryType === "pickup" ? "take_away" : "delivery",
        paymentMethod,
      };

      if (deliveryType === "delivery") {
        orderData.deliveryAddress = deliveryAddress;
      }

      const result = await createOrder(orderData, token);

      // Si el backend devolvió una URL de checkout, significa que el pedido se paga con
      // Mercado Pago: sacamos al usuario de nuestra web y lo mandamos al checkout externo.
      // Usamos window.location.href (no navigate de React Router) porque es una redirección
      // a un dominio distinto, no una ruta interna de nuestra SPA.
      if (result.checkoutUrl) {
        clearCart(); // el pedido ya quedó guardado en la base (pendiente_pago); el carrito cumplió su función
        window.location.href = result.checkoutUrl;
        return;
      }

      // Si no hay checkoutUrl (pago en efectivo), seguimos el flujo de siempre:
      // mostrar la pantalla de confirmación acá mismo, sin salir del sitio.
      setConfirmedOrder(result);
      clearCart();
      setStep("confirmation");
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-superficie z-50 flex flex-col transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {step === "cart" && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-fondo">
              <h2 className="font-display text-arroz text-lg font-semibold">
                Tu pedido
              </h2>
              <button onClick={handleClose} aria-label="Cerrar carrito">
                <X size={22} className="text-arroz" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-arroz/40 gap-2">
                  <ShoppingBag size={40} />
                  <p className="text-sm">No hay productos en el pedido</p>
                </div>
              ) : (
                items.map((item) => <CartItem key={item.id} item={item} />)
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-fondo">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-arroz/70 text-sm">Total</span>
                  <span className="text-arroz text-xl font-bold">
                    {formattedTotal}
                  </span>
                </div>

                {abierto ? (
                  <button
                    onClick={() => setStep("delivery")}
                    className="w-full py-3 rounded-full bg-acento text-arroz font-semibold hover:brightness-110 transition-all"
                  >
                    Continuar
                  </button>
                ) : (
                  // Si el local está cerrado, no dejamos avanzar el checkout — mostramos el motivo
                  // en vez del botón, para que quede claro por qué no puede continuar.
                  <div className="text-center">
                    <p className="text-arroz/70 text-sm mb-1">
                      Estamos cerrados en este momento.
                    </p>
                    {horarioApertura && (
                      <p className="text-arroz/50 text-xs">{horarioApertura}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {step === "delivery" && (
          <DeliveryStep
            onContinue={() => setStep("payment")}
            onBack={() => setStep("cart")}
          />
        )}

        {step === "payment" && (
          <PaymentStep
            onContinue={handleConfirmOrder}
            onBack={() => setStep("delivery")}
            submitting={submitting}
            orderError={orderError}
          />
        )}

        {step === "confirmation" && confirmedOrder && (
          <div className="flex flex-col h-full items-center justify-center text-center p-6">
            <CheckCircle size={56} className="text-wasabi mb-4" />
            <h2 className="font-display text-arroz text-xl font-bold mb-2">
              ¡Pedido confirmado!
            </h2>
            <p className="text-arroz/70 text-sm mb-4">Tu número de pedido es</p>
            <p className="font-display text-acento text-2xl font-bold mb-6">
              {confirmedOrder.numeroPedido}
            </p>
            <p className="text-arroz/70 text-sm mb-8">
              Total:{" "}
              {confirmedOrder.total.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
                minimumFractionDigits: 0,
              })}
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-full bg-acento text-arroz font-semibold hover:brightness-110 transition-all"
            >
              Volver al catálogo
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
