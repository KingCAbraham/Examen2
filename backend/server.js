const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3005;

const controller = require('./controller/controller');
const { verifyToken } = require('./authMiddleware');

// Configuración de CORS y Body-Parser
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==========================================
// MÓDULO DE AUTENTICACIÓN
// ==========================================
app.post('/api/auth/register', controller.registerUser);
app.post('/api/auth/login', controller.loginUser);
app.get('/api/usuarios', controller.getUsuarios);
app.delete('/api/usuarios/:id', controller.deleteUsuario);

// ==========================================
// MÓDULO DE CLIENTES (Directorios)
// ==========================================
app.get('/api/clientes', controller.getClientes);
app.post('/api/clientes', controller.createCliente);
app.put('/api/clientes/:id', controller.updateCliente);
app.delete('/api/clientes/:id', controller.deleteCliente);

// ==========================================
// MÓDULO DE INVENTARIO (Refacciones)
// ==========================================
app.get('/api/inventario', controller.getInventario);
app.post('/api/inventario', controller.createArticulo);
app.put('/api/inventario/:id', controller.updateArticulo);
app.delete('/api/inventario/:id', controller.deleteArticulo);

// Rutas de Vehículos
app.get('/api/vehiculos', controller.getVehiculos);
app.get('/api/vehiculos/:id', controller.getVehiculoById);
app.post('/api/vehiculos', controller.createVehiculo);
app.put('/api/vehiculos/:id', controller.updateVehiculo);
app.delete('/api/vehiculos/:id', controller.deleteVehiculo);

// Rutas de Mantenimientos
app.get('/api/mantenimientos', controller.getMantenimientos);
app.get('/api/mantenimientos/:id', controller.getMantenimientoById);
app.get('/api/mantenimientos/vehiculo/:vehiculoId', controller.getMantenimientosByVehiculo);
app.post('/api/mantenimientos', controller.createMantenimiento);
app.put('/api/mantenimientos/:id', controller.updateMantenimiento);
app.delete('/api/mantenimientos/:id', controller.deleteMantenimiento);

app.listen(port, () => {
    console.log(`Servidor Backend corriendo en el puerto ${port}`);
    console.log(`Test URL: http://localhost:${port}/api/vehiculos`);
});
