const db = require('../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../authMiddleware');

// ==========================================
// MÓDULO DE AUTENTICACIÓN (LOGIN / REGISTRO)
// ==========================================

const registerUser = async (req, res) => {
    try {
        const { username, password, rol } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
        }

        // Verificar si existe
        const userExists = await db.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const userRol = rol || 'mecanico';

        const result = await db.query(
            'INSERT INTO usuarios (username, password_hash, rol) VALUES ($1, $2, $3) RETURNING id, username, rol',
            [username, password_hash, userRol]
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente', user: result.rows[0] });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error del servidor al registrar' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
        }

        // Buscar usuario
        const result = await db.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar Token JWT
        const payload = {
            id: user.id,
            username: user.username,
            rol: user.rol
        };

        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '8h' });

        res.json({
            message: 'Autenticación exitosa',
            token: token,
            user: { id: user.id, username: user.username, rol: user.rol }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error del servidor al iniciar sesión' });
    }
};

// ==========================================
// MÓDULO DE VEHÍCULOS
// ==========================================

exports.registerUser = registerUser;
exports.loginUser = loginUser;

exports.getUsuarios = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, username, rol, fecha_creacion FROM usuarios ORDER BY id ASC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUsuario = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const { rows } = await db.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json({ message: `Usuario eliminado.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVehiculos = async (req, res) => {
    try {
        const query = `
            SELECT v.id, v.marca, v.modelo, v.anio, v.vin, v.placas, 
                   c.nombre_completo AS cliente, v.cliente_id 
            FROM vehiculos v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            ORDER BY v.id ASC
        `;
        const { rows } = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVehiculoById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const query = `
            SELECT v.id, v.marca, v.modelo, v.anio, v.vin, v.placas, 
                   c.nombre_completo AS cliente, v.cliente_id 
            FROM vehiculos v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            WHERE v.id = $1
        `;
        const { rows } = await db.query(query, [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Vehículo no encontrado' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createVehiculo = async (req, res) => {
    // Nota: 'cliente' es ahora 'cliente_id' numérico
    const { marca, modelo, anio, vin, placas, cliente_id } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO vehiculos (marca, modelo, anio, vin, placas, cliente_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [marca, modelo, anio, vin, placas, cliente_id]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateVehiculo = async (req, res) => {
    const id = parseInt(req.params.id);
    const { marca, modelo, anio, vin, placas, cliente_id } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE vehiculos SET marca = $1, modelo = $2, anio = $3, vin = $4, placas = $5, cliente_id = $6 WHERE id = $7 RETURNING *',
            [marca, modelo, anio, vin, placas, cliente_id, id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Vehículo no encontrado' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteVehiculo = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const { rows } = await db.query('DELETE FROM vehiculos WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Vehículo no encontrado' });
        res.status(200).json({ message: `Vehículo con ID: ${id} eliminado exitosamente.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- Controladores para Mantenimientos ---

exports.getMantenimientos = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM mantenimientos ORDER BY fecha DESC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMantenimientoById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const { rows } = await db.query('SELECT * FROM mantenimientos WHERE id = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Registro no encontrado' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMantenimientosByVehiculo = async (req, res) => {
    const vehiculoId = parseInt(req.params.vehiculoId);
    try {
        const { rows } = await db.query('SELECT * FROM mantenimientos WHERE vehiculo_id = $1 ORDER BY fecha DESC', [vehiculoId]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createMantenimiento = async (req, res) => {
    const {
        vehiculo_id, fecha, tipo_servicio, descripcion_falla, codigos_falla,
        lecturas_multimetro, kilometraje, voltaje_bateria, trabajo_realizado,
        refacciones_utilizadas, costo
    } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO mantenimientos (vehiculo_id, fecha, tipo_servicio, descripcion_falla, codigos_falla, lecturas_multimetro, kilometraje, voltaje_bateria, trabajo_realizado, refacciones_utilizadas, costo) VALUES ($1, COALESCE($2, CURRENT_TIMESTAMP), $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [vehiculo_id, fecha, tipo_servicio, descripcion_falla, codigos_falla, lecturas_multimetro, kilometraje, voltaje_bateria, trabajo_realizado, refacciones_utilizadas, costo]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateMantenimiento = async (req, res) => {
    const id = parseInt(req.params.id);
    const {
        vehiculo_id, fecha, tipo_servicio, descripcion_falla, codigos_falla,
        lecturas_multimetro, kilometraje, voltaje_bateria, trabajo_realizado,
        refacciones_utilizadas, costo
    } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE mantenimientos SET vehiculo_id = $1, fecha = COALESCE($2, fecha), tipo_servicio = $3, descripcion_falla = $4, codigos_falla = $5, lecturas_multimetro = $6, kilometraje = $7, voltaje_bateria = $8, trabajo_realizado = $9, refacciones_utilizadas = $10, costo = $11 WHERE id = $12 RETURNING *',
            [vehiculo_id, fecha, tipo_servicio, descripcion_falla, codigos_falla, lecturas_multimetro, kilometraje, voltaje_bateria, trabajo_realizado, refacciones_utilizadas, costo, id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Registro no encontrado' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteMantenimiento = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const { rows } = await db.query('DELETE FROM mantenimientos WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Registro no encontrado' });
        res.status(200).json({ message: `Registro con ID: ${id} eliminado exitosamente.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==========================================
// MÓDULO DE CLIENTES
// ==========================================

exports.getClientes = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM clientes ORDER BY nombre_completo ASC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCliente = async (req, res) => {
    const { nombre_completo, telefono, email, direccion } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO clientes (nombre_completo, telefono, email, direccion) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre_completo, telefono, email, direccion]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCliente = async (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre_completo, telefono, email, direccion } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE clientes SET nombre_completo = $1, telefono = $2, email = $3, direccion = $4 WHERE id = $5 RETURNING *',
            [nombre_completo, telefono, email, direccion, id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCliente = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const { rows } = await db.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.status(200).json({ message: 'Cliente eliminado.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==========================================
// MÓDULO DE INVENTARIO
// ==========================================

exports.getInventario = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM inventario ORDER BY nombre_pieza ASC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createArticulo = async (req, res) => {
    const { sku, nombre_pieza, descripcion, cantidad_stock, precio_unitario, categoria } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO inventario (sku, nombre_pieza, descripcion, cantidad_stock, precio_unitario, categoria) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [sku, nombre_pieza, descripcion, cantidad_stock, precio_unitario, categoria]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateArticulo = async (req, res) => {
    const id = parseInt(req.params.id);
    const { sku, nombre_pieza, descripcion, cantidad_stock, precio_unitario, categoria } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE inventario SET sku = $1, nombre_pieza = $2, descripcion = $3, cantidad_stock = $4, precio_unitario = $5, categoria = $6 WHERE id = $7 RETURNING *',
            [sku, nombre_pieza, descripcion, cantidad_stock, precio_unitario, categoria, id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Artículo no encontrado' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteArticulo = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const { rows } = await db.query('DELETE FROM inventario WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Artículo no encontrado' });
        res.status(200).json({ message: 'Artículo eliminado.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

