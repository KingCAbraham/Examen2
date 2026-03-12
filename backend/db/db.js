const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    user: 'charly',
    password: 'root',
    database: 'db_mantenimiento_auto',
    port: 5432,
});

pool.on('connect', () => {
    console.log('Conexión a la base de datos PostgreSQL exitosa!');
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
