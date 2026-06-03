const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Đọc file .env
const envPath = path.join(__dirname, '.env');
const envConfig = {};
if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
    envLines.forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
            }
            envConfig[key] = value.trim();
        }
    });
}

const host = envConfig.DB_HOST || 'zephyr.proxy.rlwy.net';
const user = envConfig.DB_USER || 'root';
const password = envConfig.DB_PASSWORD || 'QcDvrNGLozFIXQRZFIzQJXsEloeyiELG';
const database = envConfig.DB_NAME || 'railway';
const port = parseInt(envConfig.DB_PORT) || 33333;

const connection = mysql.createConnection({
    host,
    user,
    password,
    database,
    port
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Lỗi kết nối:', err.message);
        process.exit(1);
    }
    
    connection.query('SHOW TABLES', (err, results) => {
        if (err) {
            console.error('❌ Lỗi truy vấn SHOW TABLES:', err.message);
        } else {
            console.log('--- DANH SÁCH BẢNG TRONG DATABASE RAILWAY ---');
            if (results.length === 0) {
                console.log('👉 Không có bảng nào! Database trống trơn.');
            } else {
                results.forEach(row => {
                    console.log(`- ${Object.values(row)[0]}`);
                });
            }
            console.log('---------------------------------------------');
        }
        connection.end();
    });
});
