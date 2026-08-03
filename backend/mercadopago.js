// Configuración del SDK de Mercado Pago.
// Acá le pasamos el Access Token de TEST guardado en el .env —
// con este token, cualquier pago que se genere queda automáticamente
// en modo prueba (no mueve dinero real).
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

module.exports = { client, Preference, Payment };