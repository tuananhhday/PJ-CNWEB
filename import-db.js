const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Đọc thủ công file .env để lấy cấu hình
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
const password = envConfig.DB_PASSWORD || '';
const database = envConfig.DB_NAME || 'railway';
const port = parseInt(envConfig.DB_PORT) || 33333;

console.log('--- ĐÃ ĐỌC CẤU HÌNH ---');
console.log('Host:', host);
console.log('User:', user);
console.log('Database:', database);
console.log('Port:', port);
console.log('Mật khẩu dài:', password.length, 'ký tự');
console.log('Ký tự cuối mật khẩu:', password.slice(-2));
console.log('----------------------');

console.log(`Đang kết nối tới database '${database}' tại ${host}:${port}...`);

const connection = mysql.createConnection({
    host,
    user,
    password,
    database,
    port,
    multipleStatements: true // Bật tính năng chạy nhiều câu lệnh SQL cùng lúc
});

connection.connect((err) => {
    if (err) {
        console.error('❌ LỖI KẾT NỐI DATABASE:', err.message);
        process.exit(1);
    }
    console.log('✅ KẾT NỐI DATABASE THÀNH CÔNG!');
    
    const sqlPath = path.join(__dirname, 'database', 'showroom_oto.sql');
    if (!fs.existsSync(sqlPath)) {
        console.error(`❌ KHÔNG TÌM THẤY FILE SQL TẠI: ${sqlPath}`);
        connection.end();
        process.exit(1);
    }
    
    console.log('📖 Đang đọc file SQL...');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🧹 Đang xóa các bảng cũ nếu có...');
    const dropSql = `
        SET FOREIGN_KEY_CHECKS = 0;
        DROP TABLE IF EXISTS anh_xe, anh_xe_360, binh_luan_tin, bo_anh_360, dac_diem_xe, dai_ly, dong_xe, hang_xe, lich_lai_thu, like_tin, loai_xe, mau_xe, panel_anh, thong_so_ky_thuat, tin_tuc, xe, yeu_cau_bao_gia;
        SET FOREIGN_KEY_CHECKS = 1;
    `;
    
    connection.query(dropSql, (dropErr) => {
        if (dropErr) {
            console.error('❌ LỖI KHI XÓA BẢNG CŨ:', dropErr.message);
            connection.end();
            process.exit(1);
        }
        console.log('🚀 Đang chạy lệnh import dữ liệu (vui lòng chờ vài giây)...');
        connection.query(sql, (queryErr) => {
            if (queryErr) {
                console.error('❌ LỖI KHI IMPORT DỮ LIỆU:', queryErr.message);
            } else {
                console.log('🎉 IMPORT DATABASE THÀNH CÔNG LÊN RAILWAY!');
            }
            connection.end();
        });
    });
});
