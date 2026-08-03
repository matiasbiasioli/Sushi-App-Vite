// Configuración de Cloudinary: acá le pasamos las credenciales del .env
// para que el SDK sepa a qué cuenta conectarse.
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Ya no usamos multer-storage-cloudinary (paquete desactualizado, sin
// compatibilidad con las versiones seguras de cloudinary v2). En su lugar,
// multer va a recibir el archivo y guardarlo en MEMORIA (no en disco, no
// en Cloudinary automáticamente) — nosotros nos encargamos de subirlo
// a mano con la función uploadToCloudinary de acá abajo.
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary espera un "stream" (un flujo de datos) para subir un archivo,
// no simplemente el buffer crudo que nos da multer. Esta función arma ese
// puente: convierte el buffer en memoria en un stream, se lo pasa a
// Cloudinary, y envuelve todo en una Promise para poder usar await
// en vez de manejar callbacks anidados.
function uploadToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'sushi-app/productos',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif']
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
}

module.exports = { cloudinary, upload, uploadToCloudinary };