const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const resend = require('../resend');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password, telefono } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
        }

        const [existente] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existente.length > 0) {
            return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [resultado] = await pool.query(
            'INSERT INTO usuarios (nombre, email, password_hash, telefono, rol) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, passwordHash, telefono || null, 'cliente']
        );

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuarioId: resultado.insertId
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
        }

        const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (usuarios.length === 0) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        const usuario = usuarios[0];

        const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordCorrecta) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// Solicitar recuperación de contraseña. Es un endpoint PÚBLICO (cualquiera
// puede llamarlo, no requiere estar logueado, tiene sentido porque justamente
// es para gente que no puede loguearse).
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'El email es obligatorio' });
        }

        const [usuarios] = await pool.query('SELECT id, nombre FROM usuarios WHERE email = ?', [email]);

        // IMPORTANTE: respondemos con el mismo mensaje exista o no el email.
        // Si le dijéramos "ese email no existe" a un email inválido, cualquiera
        // podría usar este endpoint para descubrir qué emails están registrados
        // en el sistema, probando uno por uno.
        const mensajeGenerico = { mensaje: 'Si el email está registrado, vas a recibir un correo con instrucciones' };

        if (usuarios.length === 0) {
            return res.json(mensajeGenerico);
        }

        const usuario = usuarios[0];

        // Generamos un token aleatorio y criptográficamente seguro (no algo
        // predecible como Math.random()). 32 bytes = un token bien largo,
        // imposible de adivinar por fuerza bruta en un tiempo razonable.
        const tokenPlano = crypto.randomBytes(32).toString('hex');

        // Guardamos en la base solo el HASH del token, nunca el token real —
        // mismo criterio que con las contraseñas: si alguien accediera a la
        // base, no podría usar este hash para resetear la contraseña de nadie.
        const tokenHash = crypto.createHash('sha256').update(tokenPlano).digest('hex');

        // El token vence en 1 hora.
        const expira = new Date(Date.now() + 60 * 60 * 1000);

        await pool.query(
            'UPDATE usuarios SET reset_token_hash = ?, reset_token_expira = ? WHERE id = ?',
            [tokenHash, expira, usuario.id]
        );

        // Este link lo tiene que abrir el navegador del usuario, y renderizarlo
        // React (no el backend) — por eso usa FRONTEND_URL, no BASE_URL.
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${tokenPlano}`;

        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Recuperación de contraseña - Sushi App',
            html: `
                <p>Hola ${usuario.nombre},</p>
                <p>Recibimos una solicitud para restablecer tu contraseña. Hacé click en el siguiente link (válido por 1 hora):</p>
                <p><a href="${resetLink}">${resetLink}</a></p>
                <p>Si no solicitaste esto, podés ignorar este email.</p>
            `
        });

        res.json(mensajeGenerico);

    } catch (error) {
        console.error('Error al solicitar recuperación de contraseña:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

// Confirmar el reset: recibe el token (en texto plano, el que vino en el
// link del email) y la nueva contraseña.
router.post('/reset-password', async (req, res) => {
    try {
        const { token, nuevaPassword } = req.body;

        if (!token || !nuevaPassword) {
            return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
        }

        // Hasheamos el token recibido de la MISMA forma que lo hicimos al
        // generarlo, para poder compararlo contra lo que está guardado.
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Buscamos un usuario cuyo hash coincida Y cuyo token todavía no haya vencido.
        const [usuarios] = await pool.query(
            'SELECT id FROM usuarios WHERE reset_token_hash = ? AND reset_token_expira > NOW()',
            [tokenHash]
        );

        if (usuarios.length === 0) {
            return res.status(400).json({ error: 'El link de recuperación es inválido o expiró' });
        }

        const usuario = usuarios[0];

        const passwordHash = await bcrypt.hash(nuevaPassword, 10);

        // Actualizamos la contraseña Y limpiamos el token (poniéndolo NULL) —
        // así ese mismo link no se puede volver a usar una segunda vez.
        await pool.query(
            'UPDATE usuarios SET password_hash = ?, reset_token_hash = NULL, reset_token_expira = NULL WHERE id = ?',
            [passwordHash, usuario.id]
        );

        res.json({ mensaje: 'Contraseña actualizada correctamente' });

    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({ error: 'Error al restablecer la contraseña' });
    }
});

module.exports = router;