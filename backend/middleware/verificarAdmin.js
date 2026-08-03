function verificarAdmin(req, res, next) {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'No tenés permisos para acceder a este recurso' });
    }
    next();
}

module.exports = verificarAdmin;