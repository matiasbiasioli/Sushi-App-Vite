const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const pedidosRoutes = require('./routes/pedidos');
const adminRoutes = require('./routes/admin');

const app = express();

// Solo aceptamos pedidos desde el dominio del frontend (variable de entorno).
// En desarrollo local, si FRONTEND_URL no está definida, permitimos cualquier
// origen (comportamiento actual) para no romper el flujo de trabajo local.
app.use(cors({
    origin: process.env.FRONTEND_URL || '*'
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/productos', async (req, res) => {
    try {
        // Filtramos por activo = TRUE: un producto "eliminado" por el admin
        // no debe aparecer nunca en el catálogo público, ni siquiera tachado.
        // "disponible" queda sin filtrar a propósito — esos SÍ se muestran
        // (tachados/agotados) porque son productos que siguen en el menú,
        // solo que sin stock momentáneo.
        const [rows] = await pool.query(`
    SELECT 
        productos.id,
        productos.nombre,
        productos.descripcion,
        productos.precio,
        productos.piezas,
        productos.disponible,
        productos.imagen_url,
        productos.categoria_id,
        categorias.nombre AS categoria_nombre
    FROM productos
    JOIN categorias ON productos.categoria_id = categorias.id
    WHERE productos.activo = TRUE
`);
        res.json(rows);
    } catch (error) {
        console.error('Error al consultar productos:', error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

app.get('/api/categorias', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categorias ORDER BY orden');
        res.json(rows);
    } catch (error) {
        console.error('Error al consultar categorías:', error);
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
});

// Endpoint público: cualquiera puede consultar si el local está abierto o
// cerrado, sin necesidad de estar logueado — lo va a usar la home para
// mostrar (o no) el aviso de horario.
app.get('/api/estado-local', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT abierto, horario_apertura FROM estado_local LIMIT 1');

        // Como es una tabla de una sola fila, tomamos directamente la primera.
        // Mapeamos a camelCase para el frontend (convención ya usada en todo el proyecto).
        const estado = rows[0];
        res.json({
            abierto: !!estado.abierto,
            horarioApertura: estado.horario_apertura
        });
    } catch (error) {
        console.error('Error al consultar estado del local:', error);
        res.status(500).json({ error: 'Error al obtener el estado del local' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});