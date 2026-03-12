const jwt = require('jsonwebtoken');

// Clave secreta para firmar los tokens (En producción debería venir de process.env)
const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_key_taller_erp_2026';

const verifyToken = (req, res, next) => {
    // 1. Obtener el token del header (formato: Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Se requiere un token de autenticación para acceder a este recurso.' });
    }

    // 2. Verificar el token
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido o expirado.' });
        }
        
        // 3. Si es válido, guardamos los datos del usuario en la request y continuamos
        req.user = decoded;
        next();
    });
};

module.exports = {
    verifyToken,
    SECRET_KEY
};
