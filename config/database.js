const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'showroom_oto'
    // Neu MySQL chay cong khac, them bien moi truong DB_PORT.
    // port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.log('Loi ket noi database:', err);
        return;
    }

    console.log('Ket noi database thanh cong');
});

module.exports = db;
