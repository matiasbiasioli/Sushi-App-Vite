const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.production.DB_HOST,
    user: process.env.production.DB_USER,
    password: process.env.production.DB_PASSWORD,
    database: process.env.production.DB_NAME,
    port: process.env.production.DB_PORT
});

module.exports = pool;