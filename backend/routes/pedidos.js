const express = require('express');
const pool = require('../db');
const verificarToken = require('../middleware/auth');
const { client, Preference, Payment } = require('../mercadopago');

const router = express.Router();

router.post('/', verificarToken, async (req, res) => {
    const { items, deliveryType, deliveryAddress, paymentMethod } = req.body;
    const usuarioId = req.usuario.id;

    // --- Validaciones básicas de entrada ---
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'El pedido no puede estar vacío' });
    }
    if (!['take_away', 'delivery'].includes(deliveryType)) {
        return res.status(400).json({ error: 'Tipo de entrega inválido' });
    }

    const connection = await pool.getConnection();

    try {
        // --- 1. Traer los precios, disponibilidad y NOMBRE reales de la base ---
        // Agregamos "nombre" para poder mostrarlo en la pantalla de pago de Mercado Pago,
        // en vez de un texto genérico tipo "Producto #6".
        const productoIds = items.map(item => item.productoId);
        const [productosDb] = await connection.query(
            `SELECT id, nombre, precio, disponible FROM productos WHERE id IN (?)`,
            [productoIds]
        );

        // --- 2. Validar que todos existan y estén disponibles ---
        for (const item of items) {
            const productoDb = productosDb.find(p => p.id === item.productoId);
            if (!productoDb) {
                return res.status(400).json({ error: `Producto ${item.productoId} no existe` });
            }
            if (!productoDb.disponible) {
                return res.status(400).json({ error: `Un producto de tu pedido ya no está disponible` });
            }
        }

        // --- 3. Calcular el total real (nunca confiar en el del frontend) ---
        let total = 0;
        for (const item of items) {
            const productoDb = productosDb.find(p => p.id === item.productoId);
            total += productoDb.precio * item.cantidad;
        }

        // --- 4. Armar la dirección de entrega como texto (solo si es delivery) ---
        let direccionTexto = null;
        if (deliveryType === 'delivery' && deliveryAddress) {
            const { street, number, floorApt, betweenStreets, notes } = deliveryAddress;
            direccionTexto = `${street} ${number}` +
                (floorApt ? `, ${floorApt}` : '') +
                (betweenStreets ? ` (entre ${betweenStreets})` : '') +
                (notes ? ` - ${notes}` : '');
        }

        // --- 5. Generar el número de pedido (resetea todos los días) ---
        const [conteoHoy] = await connection.query(
            `SELECT COUNT(*) AS cantidad FROM pedidos WHERE pedido_fecha = CURDATE()`
        );
        const numeroPedido = conteoHoy[0].cantidad + 1;

        // --- 6. Transacción: insertar pedido + items ---
        await connection.beginTransaction();

        const [resultadoPedido] = await connection.query(
            `INSERT INTO pedidos (usuario_id, numero_pedido, tipo_entrega, direccion_entrega, estado, total, pedido_fecha)
     VALUES (?, ?, ?, ?, 'pendiente_pago', ?, CURDATE())`,
            [usuarioId, numeroPedido, deliveryType, direccionTexto, total]
        );
        const pedidoId = resultadoPedido.insertId;

        for (const item of items) {
            const productoDb = productosDb.find(p => p.id === item.productoId);
            await connection.query(
                `INSERT INTO items_pedido (pedido_id, producto_id, cantidad, precio_unitario)
                 VALUES (?, ?, ?, ?)`,
                [pedidoId, item.productoId, item.cantidad, productoDb.precio]
            );
        }

        await connection.commit();

        // --- 7. Si el pago es con Mercado Pago, generamos la preferencia ---
        // Esto pasa DESPUÉS del commit: el pedido ya está guardado y seguro
        // en la base antes de siquiera hablar con Mercado Pago.
        // Si paymentMethod es 'efectivo', checkoutUrl queda en null y no pasa nada más
        // acá — el pedido lo marca "pagado" el admin a mano, desde el panel.
        let checkoutUrl = null;

        if (paymentMethod === 'mercadopago') {
            const preference = new Preference(client);

            // Armamos los items que va a mostrar Mercado Pago en su pantalla de pago,
            // usando el nombre y precio REALES de la base (no lo que mandó el frontend).
            const mpItems = items.map(item => {
                const productoDb = productosDb.find(p => p.id === item.productoId);
                return {
                    title: productoDb.nombre,
                    quantity: item.cantidad,
                    unit_price: Number(productoDb.precio),
                    currency_id: 'ARS'
                };
            });

            const resultadoPreferencia = await preference.create({
                body: {
                    items: mpItems,
                    // external_reference conecta esta preferencia con TU pedido interno.
                    // Es el dato que vamos a usar en el webhook para saber qué pedido
                    // hay que marcar como pagado cuando llegue la confirmación.
                    external_reference: String(pedidoId),
                    back_urls: {
                        // Estas 3 son páginas que muestra React, por eso usan FRONTEND_URL.
                        success: `${process.env.FRONTEND_URL}/pago-exitoso`,
                        failure: `${process.env.FRONTEND_URL}/pago-fallido`,
                        pending: `${process.env.FRONTEND_URL}/pago-pendiente`
                    },
                    auto_return: 'approved',
                    // notification_url en cambio SÍ tiene que llegar al backend (es el webhook,
                    // lo consume Express, no React) — por eso sigue usando BASE_URL, sin cambios.
                    notification_url: `${process.env.BASE_URL}/api/pedidos/webhook-mp`
                }
            });

            // init_point es la URL real de checkout, a la que el frontend debe redirigir al cliente.
            checkoutUrl = resultadoPreferencia.init_point;
        }

        res.status(201).json({
            mensaje: 'Pedido creado correctamente',
            pedidoId,
            numeroPedido,
            total,
            checkoutUrl
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al crear el pedido:', error);
        res.status(500).json({ error: 'Error al procesar el pedido' });
    } finally {
        connection.release();
    }
});

// Endpoint PÚBLICO (sin verificarToken) para que cualquiera pueda consultar
// el estado de un pedido con solo el teléfono y el número de pedido —
// pensado para clientes que no quieren crear cuenta o no recuerdan loguearse.
router.get('/estado', async (req, res) => {
    try {
        const { telefono, numeroPedido } = req.query;

        // Validación básica: ambos datos son obligatorios para hacer la búsqueda.
        if (!telefono || !numeroPedido) {
            return res.status(400).json({ error: 'Faltan datos: teléfono y número de pedido son obligatorios' });
        }

        // JOIN con usuarios para poder comparar el teléfono (que vive en esa tabla,
        // no en pedidos). Como numero_pedido resetea cada día, puede haber varios
        // pedidos con el mismo número en fechas distintas — nos quedamos con el
        // más reciente usando ORDER BY pedido_fecha DESC LIMIT 1.
        const [pedidos] = await pool.query(
            `SELECT pedidos.numero_pedido, pedidos.estado, pedidos.tipo_entrega
             FROM pedidos
             JOIN usuarios ON pedidos.usuario_id = usuarios.id
             WHERE usuarios.telefono = ? AND pedidos.numero_pedido = ?
             ORDER BY pedidos.pedido_fecha DESC
             LIMIT 1`,
            [telefono, numeroPedido]
        );

        // Si no hay coincidencias, respondemos 404 con un mensaje genérico —
        // a propósito no decimos "el teléfono no existe" o "el número no existe"
        // por separado, para no dar pistas de qué dato específico falló
        // (mismo criterio de seguridad que ya usamos en el login).
        if (pedidos.length === 0) {
            return res.status(404).json({ error: 'No encontramos ese pedido, revisá los datos' });
        }

        res.json(pedidos[0]);

    } catch (error) {
        console.error('Error al consultar estado de pedido:', error);
        res.status(500).json({ error: 'Error al consultar el pedido' });
    }
});

router.get('/mios', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const [pedidos] = await pool.query(
            `SELECT id, numero_pedido, pedido_fecha, tipo_entrega, direccion_entrega, 
                    estado, total, created_at
             FROM pedidos
             WHERE usuario_id = ?
             ORDER BY created_at DESC`,
            [usuarioId]
        );

        res.json(pedidos);
    } catch (error) {
        console.error('Error al obtener mis pedidos:', error);
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
});

// Webhook de Mercado Pago: este endpoint NO lleva verificarToken porque
// quien lo llama es el propio servidor de Mercado Pago, no un usuario logueado.
// MP manda un POST acá cada vez que el estado de un pago cambia.
router.post('/webhook-mp', async (req, res) => {
    try {
        // Mercado Pago manda distintos tipos de notificación; nos interesa
        // específicamente cuando el "type" es "payment" (hay otros tipos,
        // como notificaciones de suscripciones, que acá no usamos).
        const { type, data } = req.body;

        if (type === 'payment') {
            const payment = new Payment(client);

            // data.id es el ID del pago en Mercado Pago — con eso consultamos
            // el detalle completo, incluyendo su estado real (approved, rejected, etc.)
            const pagoInfo = await payment.get({ id: data.id });

            // external_reference es el pedidoId que nosotros mandamos al crear
            // la preferencia — así sabemos a qué pedido nuestro corresponde este pago.
            const pedidoId = pagoInfo.external_reference;
            const estadoPago = pagoInfo.status; // 'approved', 'rejected', 'pending', etc.

            if (estadoPago === 'approved') {
                await pool.query(
                    `UPDATE pedidos SET estado = 'pagado', mp_payment_id = ? WHERE id = ?`,
                    [String(data.id), pedidoId]
                );
            }
            // Si el pago fue rechazado o quedó pendiente, no cambiamos el estado del pedido
            // por ahora — queda en pendiente_pago, y el cliente puede reintentar el pago.
        }

        // Mercado Pago espera un 200 para saber que recibiste la notificación
        // correctamente — si no respondés 200, reintenta enviarla más tarde.
        res.sendStatus(200);

    } catch (error) {
        console.error('Error en webhook de Mercado Pago:', error);
        // Igual respondemos 200 para evitar que MP reintente indefinidamente
        // por un error de nuestro lado que no se va a resolver solo reintentando.
        res.sendStatus(200);
    }
});

module.exports = router;