const express = require('express');
const pool = require('../db');
const verificarToken = require('../middleware/auth');
const verificarAdmin = require('../middleware/verificarAdmin');

const router = express.Router();

// Ahora upload y uploadToCloudinary vienen directamente desde cloudinary.js,
// que ya se encarga de toda la configuración de multer y del puente a Cloudinary.
const { upload, uploadToCloudinary } = require('../cloudinary');

router.get('/pedidos', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const [pedidos] = await pool.query(`
            SELECT 
                pedidos.id,
                pedidos.numero_pedido,
                pedidos.pedido_fecha,
                pedidos.tipo_entrega,
                pedidos.direccion_entrega,
                pedidos.estado,
                pedidos.total,
                pedidos.mp_payment_id,
                pedidos.created_at,
                usuarios.nombre AS cliente_nombre,
                usuarios.telefono AS cliente_telefono
            FROM pedidos
            JOIN usuarios ON pedidos.usuario_id = usuarios.id
            ORDER BY pedidos.created_at DESC
        `);

        res.json(pedidos);
    } catch (error) {
        console.error('Error al listar pedidos (admin):', error);
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
});

const ESTADOS_VALIDOS = ['pendiente_pago', 'pagado', 'en_preparacion', 'listo', 'entregado', 'cancelado'];

router.patch('/pedidos/:id/estado', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!ESTADOS_VALIDOS.includes(estado)) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        const [resultado] = await pool.query(
            'UPDATE pedidos SET estado = ? WHERE id = ?',
            [estado, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json({ mensaje: 'Estado actualizado correctamente', nuevoEstado: estado });

    } catch (error) {
        console.error('Error al actualizar estado del pedido:', error);
        res.status(500).json({ error: 'Error al actualizar el estado' });
    }
});

router.post('/productos', verificarToken, verificarAdmin, upload.single('imagen'), async (req, res) => {
    try {
        const { categoriaId, nombre, descripcion, precio, piezas } = req.body;

        if (!categoriaId || !nombre || !precio) {
            return res.status(400).json({ error: 'Categoría, nombre y precio son obligatorios' });
        }

        // Si se subió un archivo, lo mandamos a Cloudinary explícitamente acá
        // (antes esto lo hacía multer-storage-cloudinary de forma automática).
        // req.file.buffer contiene el archivo en memoria, gracias a multer.memoryStorage().
        let imagenUrl = null;
        if (req.file) {
            const resultadoSubida = await uploadToCloudinary(req.file.buffer);
            imagenUrl = resultadoSubida.secure_url;
        }

        const [resultado] = await pool.query(
            `INSERT INTO productos (categoria_id, nombre, descripcion, precio, piezas, imagen_url, disponible, activo)
             VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE)`,
            [categoriaId, nombre, descripcion || null, precio, piezas || null, imagenUrl]
        );

        res.status(201).json({
            mensaje: 'Producto creado correctamente',
            productoId: resultado.insertId,
            imagenUrl
        });

    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
});

router.patch('/productos/:id', verificarToken, verificarAdmin, upload.single('imagen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { categoriaId, nombre, descripcion, precio, piezas, disponible, activo } = req.body;

        const campos = [];
        const valores = [];

        if (categoriaId !== undefined) { campos.push('categoria_id = ?'); valores.push(categoriaId); }
        if (nombre !== undefined) { campos.push('nombre = ?'); valores.push(nombre); }
        if (descripcion !== undefined) { campos.push('descripcion = ?'); valores.push(descripcion); }
        if (precio !== undefined) { campos.push('precio = ?'); valores.push(precio); }
        if (piezas !== undefined) { campos.push('piezas = ?'); valores.push(piezas); }
        if (disponible !== undefined) { campos.push('disponible = ?'); valores.push(disponible); }
        if (activo !== undefined) { campos.push('activo = ?'); valores.push(activo); }

        // Igual que en crear: si hay archivo nuevo, lo subimos a mano a Cloudinary
        // y usamos la URL resultante. Si no hay archivo, no tocamos imagen_url.
        if (req.file) {
            const resultadoSubida = await uploadToCloudinary(req.file.buffer);
            campos.push('imagen_url = ?');
            valores.push(resultadoSubida.secure_url);
        }

        if (campos.length === 0) {
            return res.status(400).json({ error: 'No se especificó ningún campo para actualizar' });
        }

        valores.push(id);

        const [resultado] = await pool.query(
            `UPDATE productos SET ${campos.join(', ')} WHERE id = ?`,
            valores
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ mensaje: 'Producto actualizado correctamente' });

    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// Lista TODOS los productos (disponibles y no disponibles), para el panel de admin.
// A diferencia de GET /api/productos (público), acá no filtramos por disponibilidad.
router.get('/productos', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const [productos] = await pool.query(`
            SELECT productos.*, categorias.nombre AS categoria_nombre
            FROM productos
            JOIN categorias ON productos.categoria_id = categorias.id
            ORDER BY productos.categoria_id, productos.nombre
        `);
        res.json(productos);
    } catch (error) {
        console.error('Error al listar productos (admin):', error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Actualiza el estado del local. Igual que con productos, aceptamos
// actualización parcial: el admin puede mandar solo "abierto", o solo
// "horarioApertura", o los dos juntos.
router.patch('/estado-local', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { abierto, horarioApertura } = req.body;

        const campos = [];
        const valores = [];

        if (abierto !== undefined) { campos.push('abierto = ?'); valores.push(abierto); }
        if (horarioApertura !== undefined) { campos.push('horario_apertura = ?'); valores.push(horarioApertura); }

        if (campos.length === 0) {
            return res.status(400).json({ error: 'No se especificó ningún campo para actualizar' });
        }

        // Como es una tabla de una sola fila, actualizamos directamente por id = 1,
        // sin necesitar recibir ningún id desde el frontend.
        await pool.query(
            `UPDATE estado_local SET ${campos.join(', ')} WHERE id = 1`,
            valores
        );

        res.json({ mensaje: 'Estado del local actualizado correctamente' });

    } catch (error) {
        console.error('Error al actualizar estado del local:', error);
        res.status(500).json({ error: 'Error al actualizar el estado del local' });
    }
});

module.exports = router;