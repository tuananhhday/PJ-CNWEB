require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const db = require('./config/database');
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const dbInit = require('./services/dbInit');

// Khởi tạo database một lần duy nhất khi khởi chạy server
async function initDatabase() {
    try {
        console.log('🔄 Đang kiểm tra và đồng bộ cấu trúc database...');
        await dbInit.ensureDealerTable();
        await dbInit.ensureCar360Table();
        await dbInit.ensureCarDetailTables();
        await dbInit.ensureVehicleTypeOptions();
        await dbInit.ensureCustomerRequestTables();
        await dbInit.ensureNewsTables();
        await dbInit.ensurePanelTable();
        await dbInit.ensureBo360SetsTable();
        console.log('✅ Khởi tạo và đồng bộ database thành công!');
    } catch (err) {
        console.error('❌ Lỗi khởi tạo database:', err);
    }
}
initDatabase();

const app = express();

app.use(compression());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: 86400000 // Cache assets for 1 day in milliseconds
}));

// Middleware đặt header UTF-8 toàn cục cho EJS Render
app.use((req, res, next) => {
    res.locals.currentUser = null;
    res.setHeader('Content-Language', 'vi');
    const render = res.render;
    res.render = function renderUtf8(view, options, callback) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return render.call(this, view, options, callback);
    };
    next();
});

// Middleware lấy danh mục phân loại xe và xe có sẵn cho Mega Menu toàn cục (sử dụng cache 1 phút)
const dbp = db.promise();
let cachedNavCarTypes = null;
let cachedNavCars = null;
let lastCacheFetch = 0;
const CACHE_TTL = 60000; // Cache 60 giây

app.use(async (req, res, next) => {
    const now = Date.now();
    if (cachedNavCarTypes && cachedNavCars && (now - lastCacheFetch < CACHE_TTL)) {
        res.locals.navCarTypes = cachedNavCarTypes;
        res.locals.navCars = cachedNavCars;
        return next();
    }

    try {
        const [cars] = await dbp.query(`
            SELECT 
                xe.id, 
                xe.ten_xe, 
                xe.duong_dan, 
                xe.gia_ban,
                loai_xe.ten_loai, 
                COALESCE(anh_xe.duong_dan_anh, 'no-car.jpg') AS anh_dai_dien
            FROM xe
            INNER JOIN dong_xe ON xe.dong_xe_id = dong_xe.id
            INNER JOIN loai_xe ON dong_xe.loai_xe_id = loai_xe.id
            LEFT JOIN anh_xe ON xe.id = anh_xe.xe_id AND anh_xe.la_anh_dai_dien = TRUE
            WHERE xe.trang_thai = 'con_hang'
            ORDER BY xe.gia_ban ASC
        `);
        
        const navCarTypes = {};
        cars.forEach(car => {
            const typeName = car.ten_loai || 'Khác';
            if (!navCarTypes[typeName]) {
                navCarTypes[typeName] = [];
            }
            navCarTypes[typeName].push(car);
        });
        
        cachedNavCarTypes = navCarTypes;
        cachedNavCars = cars;
        lastCacheFetch = now;

        res.locals.navCarTypes = navCarTypes;
        res.locals.navCars = cars;
    } catch (err) {
        console.log('Loi lay du lieu menu dong xe:', err);
        res.locals.navCarTypes = cachedNavCarTypes || {};
        res.locals.navCars = cachedNavCars || [];
    }
    next();
});

// Gắn kết bộ định tuyến (Routers)
app.use('/admin', adminRouter);
app.use('/', indexRouter);

// Endpoint kiểm tra kết nối Database
app.get('/test-db', (req, res) => {
    db.query('SELECT DATABASE() AS database_name', (err, result) => {
        if (err) return res.status(500).send('Lỗi kết nối cơ sở dữ liệu.');
        res.json(result[0]);
    });
});

module.exports = app;
