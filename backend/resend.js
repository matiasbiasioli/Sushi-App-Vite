// Configuración de Resend: acá le pasamos la API key del .env para poder
// mandar emails reales desde el código.
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = resend;