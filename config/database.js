const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'showroom_oto',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    // Railway MySQL thường dùng port khác, đọc từ biến môi trường DB_PORT
    port: parseInt(process.env.DB_PORT) || 3306
});

// Test the pool connection
db.getConnection((err, connection) => {
    if (err) {
        console.log('Loi ket noi database:', err);
        return;
    }
    
    connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci', (charsetErr) => {
        connection.release();
        if (charsetErr) {
            console.log('Loi cau hinh UTF-8 database:', charsetErr);
            return;
        }
        console.log('Ket noi database thanh cong voi Pool');
    });
});

module.exports = db;
