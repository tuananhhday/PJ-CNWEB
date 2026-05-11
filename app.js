const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const db = require('./config/database');

const app = express();
const dbp = db.promise();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.currentUser = req.cookies.user_id ? {
        id: req.cookies.user_id,
        ho_ten: req.cookies.ho_ten,
        email: req.cookies.email,
        so_dien_thoai: req.cookies.so_dien_thoai,
        vai_tro: req.cookies.vai_tro
    } : null;
    next();
});

function formatPrice(value) {
    return Number(value || 0).toLocaleString('vi-VN') + ' VNĐ';
}

function getCars(callback) {
    const sql = `
        SELECT
            xe.id,
            xe.ten_xe,
            xe.duong_dan,
            xe.phien_ban,
            xe.nam_san_xuat,
            xe.gia_ban,
            xe.gia_niem_yet,
            xe.mo_ta_ngan,
            xe.dong_co,
            xe.hop_so,
            xe.nhien_lieu,
            xe.so_cho_ngoi,
            xe.so_luong_ton,
            hang_xe.ten_hang,
            loai_xe.ten_loai,
            COALESCE(anh_xe.duong_dan_anh, 'no-car.jpg') AS anh_dai_dien
        FROM xe
        INNER JOIN dong_xe ON xe.dong_xe_id = dong_xe.id
        INNER JOIN hang_xe ON dong_xe.hang_xe_id = hang_xe.id
        INNER JOIN loai_xe ON dong_xe.loai_xe_id = loai_xe.id
        LEFT JOIN anh_xe ON xe.id = anh_xe.xe_id AND anh_xe.la_anh_dai_dien = TRUE
        WHERE xe.trang_thai = 'con_hang'
        ORDER BY xe.id DESC
    `;

    db.query(sql, callback);
}

function renderWithCars(res, view, data = {}) {
    getCars((err, cars) => {
        if (err) {
            console.log('Loi tai danh sach xe:', err);
            cars = [];
        }

        res.render(view, {
            formatPrice,
            cars,
            ...data
        });
    });
}

function requireAdmin(req, res, next) {
    const role = req.cookies.vai_tro;

    if (role === 'admin' || role === 'nhan_vien') {
        return next();
    }

    return res.redirect('/login?error=admin');
}

function requireLogin(req, res, next) {
    if (req.cookies.user_id) {
        return next();
    }

    return res.redirect('/login?error=login');
}

app.get('/', (req, res) => {
    res.redirect('/trang-chu');
});

app.get('/trang-chu', (req, res) => {
    const newsSql = `
        SELECT id, tieu_de, duong_dan, anh_dai_dien, noi_dung, ngay_tao
        FROM tin_tuc
        WHERE trang_thai = 'da_dang'
        ORDER BY ngay_tao DESC
        LIMIT 3
    `;

    getCars((err, cars) => {
        if (err) {
            console.log('Loi tai xe:', err);
            cars = [];
        }

        db.query(newsSql, (newsErr, news) => {
            if (newsErr) {
                console.log('Loi tai tin tuc:', newsErr);
                news = [];
            }

            res.render('home', {
                title: 'Trang chủ',
                formatPrice,
                cars,
                news
            });
        });
    });
});

app.get('/xe', (req, res) => {
    renderWithCars(res, 'cars', {
        title: 'Sản phẩm xe'
    });
});

app.get('/xe/:duong_dan', (req, res) => {
    const carSql = `
        SELECT
            xe.*,
            hang_xe.ten_hang,
            loai_xe.ten_loai,
            COALESCE(anh_xe.duong_dan_anh, 'no-car.jpg') AS anh_dai_dien
        FROM xe
        INNER JOIN dong_xe ON xe.dong_xe_id = dong_xe.id
        INNER JOIN hang_xe ON dong_xe.hang_xe_id = hang_xe.id
        INNER JOIN loai_xe ON dong_xe.loai_xe_id = loai_xe.id
        LEFT JOIN anh_xe ON xe.id = anh_xe.xe_id AND anh_xe.la_anh_dai_dien = TRUE
        WHERE xe.duong_dan = ? AND xe.trang_thai = 'con_hang'
        LIMIT 1
    `;

    db.query(carSql, [req.params.duong_dan], (err, result) => {
        if (err) {
            console.log('Loi tai chi tiet xe:', err);
            return res.status(500).send('Lỗi tải chi tiết xe');
        }

        if (result.length === 0) {
            return res.status(404).send('Không tìm thấy xe');
        }

        const car = result[0];
        const specsSql = 'SELECT ten_thong_so, gia_tri FROM thong_so_ky_thuat WHERE xe_id = ? ORDER BY id ASC';
        const colorsSql = 'SELECT ten_mau, ma_mau, gia_them FROM mau_xe WHERE xe_id = ? ORDER BY id ASC';
        const imagesSql = 'SELECT duong_dan_anh FROM anh_xe WHERE xe_id = ? ORDER BY thu_tu ASC';

        db.query(specsSql, [car.id], (specErr, specs) => {
            if (specErr) specs = [];

            db.query(colorsSql, [car.id], (colorErr, colors) => {
                if (colorErr) colors = [];

                db.query(imagesSql, [car.id], (imageErr, images) => {
                    if (imageErr) images = [];

                    res.render('car-detail', {
                        title: car.ten_xe,
                        formatPrice,
                        car,
                        specs,
                        colors,
                        images
                    });
                });
            });
        });
    });
});

app.get('/bang-gia', (req, res) => {
    renderWithCars(res, 'price-list', {
        title: 'Bảng giá xe'
    });
});

const buyPages = {
    'dat-coc-truc-tuyen': ['Đặt cọc trực tuyến', 'Giữ xe nhanh với thông tin liên hệ và mẫu xe bạn quan tâm.'],
    'kiem-tra-xe-co-san': ['Kiểm tra xe có sẵn', 'Xem danh sách xe còn hàng trong showroom và gửi yêu cầu tư vấn.'],
    'chon-mau-xe-va-bao-gia': ['Lựa chọn mẫu xe và báo giá', 'Chọn phiên bản phù hợp và nhận báo giá chi tiết.'],
    'so-sanh-xe': ['So sánh xe', 'Đối chiếu giá bán, động cơ, hộp số, số chỗ ngồi và thông tin nổi bật.'],
    'phu-kien-phu-tung': ['Phụ kiện & Phụ tùng', 'Tư vấn phụ kiện, phụ tùng và các gói nâng cấp phù hợp.'],
    'dang-ky-catalogue': ['Đăng ký Catalogue', 'Để lại thông tin để nhận catalogue, thông số và bảng giá mới nhất.'],
    'ban-lo': ['Bán lô', 'Tư vấn mua xe số lượng lớn cho công ty, vận tải và đội xe nội bộ.']
};

Object.keys(buyPages).forEach((slug) => {
    app.get('/' + slug, (req, res) => {
        res.render('feature-page', {
            title: buyPages[slug][0],
            heading: buyPages[slug][0],
            description: buyPages[slug][1],
            action: slug === 'kiem-tra-xe-co-san' || slug === 'so-sanh-xe' ? '/xe' : '/bao-gia'
        });
    });
});

app.get('/bao-gia', (req, res) => {
    renderWithCars(res, 'quote', {
        title: 'Yêu cầu báo giá',
        error: null,
        success: null,
        formData: {
            xe_id: req.query.xe_id || ''
        }
    });
});

app.post('/bao-gia', (req, res) => {
    const { ho_ten, so_dien_thoai, email, xe_id, noi_dung } = req.body;
    const userId = req.cookies.user_id || null;

    const renderQuote = (error, success = null) => {
        renderWithCars(res, 'quote', {
            title: 'Yêu cầu báo giá',
            error,
            success,
            formData: req.body
        });
    };

    if (!ho_ten || !so_dien_thoai) {
        return renderQuote('Vui lòng nhập họ tên và số điện thoại');
    }

    const sql = `
        INSERT INTO yeu_cau_tu_van (nguoi_dung_id, xe_id, ho_ten, so_dien_thoai, email, noi_dung)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [userId, xe_id || null, ho_ten, so_dien_thoai, email || req.cookies.email || null, noi_dung || null], (err) => {
        if (err) {
            console.log('Loi luu yeu cau bao gia:', err);
            return renderQuote('Không thể lưu yêu cầu báo giá. Vui lòng thử lại sau.');
        }

        return renderQuote(null, 'Yêu cầu báo giá đã được gửi. Nhân viên tư vấn sẽ liên hệ với bạn.');
    });
});

app.get('/khuyen-mai', (req, res) => {
    const sql = `
        SELECT *
        FROM khuyen_mai
        WHERE trang_thai = 'hoat_dong'
        ORDER BY ngay_tao DESC
    `;

    db.query(sql, (err, promotions) => {
        if (err) {
            console.log('Loi tai khuyen mai:', err);
            promotions = [];
        }

        res.render('promotions', {
            title: 'Khuyến mãi',
            formatPrice,
            promotions
        });
    });
});

app.get('/tin-tuc', (req, res) => {
    const sql = `
        SELECT *
        FROM tin_tuc
        WHERE trang_thai = 'da_dang'
        ORDER BY ngay_tao DESC
    `;

    db.query(sql, (err, news) => {
        if (err) {
            console.log('Loi tai tin tuc:', err);
            news = [];
        }

        res.render('news', {
            title: 'Tin tức',
            news
        });
    });
});

app.get('/dich-vu', (req, res) => {
    res.render('service', {
        title: 'Dịch vụ'
    });
});

const servicePages = {
    'dat-lich-dich-vu': ['Đặt lịch Dịch vụ trực tuyến', 'Gửi yêu cầu đặt lịch bảo dưỡng, sửa chữa hoặc kiểm tra xe tại showroom.'],
    'bao-gia-dich-vu': ['Báo Giá Tạm tính Chi phí Dịch vụ', 'Ước tính nhanh chi phí bảo dưỡng, phụ tùng và công sửa chữa theo nhu cầu.'],
    'quy-trinh-bao-duong-nhanh': ['Quy trình bảo dưỡng nhanh', 'Quy trình tiếp nhận, kiểm tra, báo giá, thực hiện và bàn giao xe minh bạch.'],
    'lich-bao-duong-dinh-ky': ['Lịch bảo dưỡng định kỳ', 'Theo dõi các mốc bảo dưỡng để xe vận hành ổn định và an toàn.'],
    'co-so-bao-hanh-bao-duong': ['Cơ sở bảo hành bảo dưỡng', 'Thông tin showroom và khu vực tiếp nhận bảo hành, bảo dưỡng.'],
    'nhan-giao-xe-tan-noi': ['Nhận & giao xe tận nơi miễn phí', 'Hỗ trợ nhận xe và bàn giao xe sau dịch vụ trong khu vực áp dụng.'],
    'he-thong-canh-bao-thay-dau': ['Hệ thống Cảnh báo Thay dầu Thông minh', 'Theo dõi tình trạng dầu động cơ và thời điểm cần bảo dưỡng.'],
    'ford-sync-cap-nhat-dinh-vi': ['Ford SYNC và Cập nhật Định vị', 'Hỗ trợ cập nhật hệ thống giải trí, kết nối và định vị trên xe.'],
    'ung-dung-ford': ['Ứng dụng Ford', 'Quản lý thông tin xe, lịch dịch vụ và các tiện ích sở hữu xe.'],
    'ford-ensure': ['Ford Ensure', 'Các gói hỗ trợ, bảo vệ và chăm sóc xe trong quá trình sử dụng.'],
    'bao-hanh-mo-rong': ['Bảo hành mở rộng', 'Thông tin về điều khoản bảo hành và các quyền lợi mở rộng.'],
    'chu-xe': ['Chủ xe', 'Các thông tin hữu ích dành cho khách hàng đã sở hữu xe.']
};

Object.keys(servicePages).forEach((slug) => {
    app.get('/' + slug, (req, res) => {
        res.render('feature-page', {
            title: servicePages[slug][0],
            heading: servicePages[slug][0],
            description: servicePages[slug][1],
            action: '/lien-he'
        });
    });
});

app.get('/lien-he', (req, res) => {
    const sql = 'SELECT * FROM showroom ORDER BY id ASC';

    db.query(sql, (err, showrooms) => {
        if (err) {
            console.log('Loi tai showroom:', err);
            showrooms = [];
        }

        res.render('contact', {
            title: 'Liên hệ',
            showrooms
        });
    });
});

app.get('/dang-ky-lai-thu', (req, res) => {
    renderWithCars(res, 'test-drive', {
        title: 'Đăng ký lái thử',
        error: null,
        success: null,
        formData: {}
    });
});

app.post('/dang-ky-lai-thu', (req, res) => {
    const {
        ho_ten,
        email,
        so_dien_thoai,
        mau_xe,
        thanh_pho,
        dai_ly,
        ngay_muon_lai,
        gio_muon_lai,
        dong_y_chinh_sach,
        dong_y_marketing
    } = req.body;

    const renderTestDrive = (error, success = null) => {
        renderWithCars(res, 'test-drive', {
            title: 'Đăng ký lái thử',
            error,
            success,
            formData: req.body
        });
    };

    if (!ho_ten || !email || !so_dien_thoai || !mau_xe || !thanh_pho || !dai_ly || !ngay_muon_lai || !gio_muon_lai) {
        return renderTestDrive('Vui lòng nhập đầy đủ thông tin bắt buộc');
    }

    if (!dong_y_chinh_sach) {
        return renderTestDrive('Vui lòng đồng ý với chính sách bảo mật trước khi gửi');
    }

    const sql = `
        INSERT INTO dat_lich_lai_thu
        (nguoi_dung_id, xe_id, ho_ten, so_dien_thoai, email, ngay_muon_lai, gio_muon_lai, dia_diem_showroom, ghi_chu)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        req.cookies.user_id || null,
        Number(mau_xe),
        ho_ten,
        so_dien_thoai,
        email,
        ngay_muon_lai,
        gio_muon_lai,
        `${dai_ly} - ${thanh_pho}`,
        dong_y_marketing === 'co' ? 'Đồng ý nhận thông tin tiếp thị' : 'Không nhận thông tin tiếp thị'
    ];

    db.query(sql, values, (err) => {
        if (err) {
            console.log('Loi luu dang ky lai thu:', err);
            return renderTestDrive('Không thể lưu lịch lái thử. Vui lòng kiểm tra mẫu xe và thử lại.');
        }

        return renderTestDrive(null, 'Thông tin đăng ký lái thử đã được ghi nhận. Nhân viên tư vấn sẽ liên hệ với bạn sớm.');
    });
});

app.get('/test-db', (req, res) => {
    db.query('SELECT * FROM vai_tro', (err, result) => {
        if (err) {
            console.log(err);
            return res.send('Lỗi kết nối database');
        }

        res.json(result);
    });
});

app.get('/tai-khoan', requireLogin, async (req, res) => {
    try {
        const userId = req.cookies.user_id;
        const email = req.cookies.email || '';
        const phone = req.cookies.so_dien_thoai || '';

        const [quotes] = await dbp.query(`
            SELECT yeu_cau_tu_van.*, xe.ten_xe
            FROM yeu_cau_tu_van
            LEFT JOIN xe ON yeu_cau_tu_van.xe_id = xe.id
            WHERE yeu_cau_tu_van.nguoi_dung_id = ?
               OR yeu_cau_tu_van.email = ?
               OR yeu_cau_tu_van.so_dien_thoai = ?
            ORDER BY yeu_cau_tu_van.ngay_tao DESC
        `, [userId, email, phone]);

        const [testDrives] = await dbp.query(`
            SELECT dat_lich_lai_thu.*, xe.ten_xe
            FROM dat_lich_lai_thu
            INNER JOIN xe ON dat_lich_lai_thu.xe_id = xe.id
            WHERE dat_lich_lai_thu.nguoi_dung_id = ?
               OR dat_lich_lai_thu.email = ?
               OR dat_lich_lai_thu.so_dien_thoai = ?
            ORDER BY dat_lich_lai_thu.ngay_tao DESC
        `, [userId, email, phone]);

        res.render('account', {
            title: 'Tài khoản của tôi',
            quotes,
            testDrives
        });
    } catch (err) {
        console.log('Loi tai tai khoan:', err);
        res.status(500).send('Lỗi tải tài khoản');
    }
});

app.get('/admin', requireAdmin, async (req, res) => {
    try {
        const [[carCount]] = await dbp.query('SELECT COUNT(*) AS total FROM xe');
        const [[quoteCount]] = await dbp.query('SELECT COUNT(*) AS total FROM yeu_cau_tu_van');
        const [[testDriveCount]] = await dbp.query('SELECT COUNT(*) AS total FROM dat_lich_lai_thu');
        const [[showroomCount]] = await dbp.query('SELECT COUNT(*) AS total FROM showroom');
        const [quotes] = await dbp.query(`
            SELECT yeu_cau_tu_van.*, xe.ten_xe
            FROM yeu_cau_tu_van
            LEFT JOIN xe ON yeu_cau_tu_van.xe_id = xe.id
            ORDER BY yeu_cau_tu_van.ngay_tao DESC
            LIMIT 6
        `);
        const [testDrives] = await dbp.query(`
            SELECT dat_lich_lai_thu.*, xe.ten_xe
            FROM dat_lich_lai_thu
            INNER JOIN xe ON dat_lich_lai_thu.xe_id = xe.id
            ORDER BY dat_lich_lai_thu.ngay_tao DESC
            LIMIT 6
        `);

        res.render('admin/dashboard', {
            title: 'Quản trị showroom',
            stats: {
                cars: carCount.total,
                quotes: quoteCount.total,
                testDrives: testDriveCount.total,
                showrooms: showroomCount.total
            },
            quotes,
            testDrives
        });
    } catch (err) {
        console.log('Loi admin dashboard:', err);
        res.status(500).send('Lỗi tải trang quản trị');
    }
});

app.get('/admin/xe', requireAdmin, async (req, res) => {
    try {
        const [cars] = await dbp.query(`
            SELECT
                xe.*,
                dong_xe.ten_dong,
                hang_xe.ten_hang,
                anh_xe.duong_dan_anh
            FROM xe
            INNER JOIN dong_xe ON xe.dong_xe_id = dong_xe.id
            INNER JOIN hang_xe ON dong_xe.hang_xe_id = hang_xe.id
            LEFT JOIN anh_xe ON xe.id = anh_xe.xe_id AND anh_xe.la_anh_dai_dien = TRUE
            ORDER BY xe.id DESC
        `);
        const [models] = await dbp.query('SELECT id, ten_dong FROM dong_xe ORDER BY ten_dong ASC');

        res.render('admin/cars', {
            title: 'Quản lý xe',
            formatPrice,
            cars,
            models,
            success: req.query.success || null
        });
    } catch (err) {
        console.log('Loi tai xe admin:', err);
        res.status(500).send('Lỗi tải quản lý xe');
    }
});

app.post('/admin/xe/them', requireAdmin, (req, res) => {
    const {
        dong_xe_id,
        ten_xe,
        duong_dan,
        phien_ban,
        nam_san_xuat,
        gia_ban,
        mo_ta_ngan,
        dong_co,
        hop_so,
        nhien_lieu,
        so_cho_ngoi,
        so_luong_ton,
        anh_dai_dien
    } = req.body;

    if (!dong_xe_id || !ten_xe || !duong_dan || !gia_ban) {
        return res.redirect('/admin/xe');
    }

    const sql = `
        INSERT INTO xe
        (dong_xe_id, ten_xe, duong_dan, phien_ban, nam_san_xuat, gia_ban, mo_ta_ngan, dong_co, hop_so, nhien_lieu, so_cho_ngoi, so_luong_ton)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        dong_xe_id,
        ten_xe,
        duong_dan,
        phien_ban || null,
        nam_san_xuat || null,
        gia_ban,
        mo_ta_ngan || null,
        dong_co || null,
        hop_so || null,
        nhien_lieu || 'xang',
        so_cho_ngoi || null,
        so_luong_ton || 0
    ], (err, result) => {
        if (err) console.log('Loi them xe:', err);
        if (!err && anh_dai_dien) {
            return db.query(
                'INSERT INTO anh_xe (xe_id, duong_dan_anh, la_anh_dai_dien, thu_tu) VALUES (?, ?, TRUE, 1)',
                [result.insertId, anh_dai_dien],
                (imageErr) => {
                    if (imageErr) console.log('Loi them anh xe:', imageErr);
                    res.redirect('/admin/xe?success=Đã thêm xe mới');
                }
            );
        }
        res.redirect('/admin/xe?success=Đã thêm xe mới');
    });
});

app.get('/admin/xe/:id/sua', requireAdmin, async (req, res) => {
    try {
        const [cars] = await dbp.query(`
            SELECT xe.*, anh_xe.duong_dan_anh
            FROM xe
            LEFT JOIN anh_xe ON xe.id = anh_xe.xe_id AND anh_xe.la_anh_dai_dien = TRUE
            WHERE xe.id = ?
            LIMIT 1
        `, [req.params.id]);
        const [models] = await dbp.query('SELECT id, ten_dong FROM dong_xe ORDER BY ten_dong ASC');

        if (cars.length === 0) {
            return res.status(404).send('Không tìm thấy xe');
        }

        res.render('admin/edit-car', {
            title: 'Sửa thông tin xe',
            car: cars[0],
            models,
            error: null
        });
    } catch (err) {
        console.log('Loi tai form sua xe:', err);
        res.status(500).send('Lỗi tải form sửa xe');
    }
});

app.post('/admin/xe/:id/sua', requireAdmin, (req, res) => {
    const {
        dong_xe_id,
        ten_xe,
        duong_dan,
        phien_ban,
        nam_san_xuat,
        gia_ban,
        mo_ta_ngan,
        mo_ta_chi_tiet,
        dong_co,
        hop_so,
        nhien_lieu,
        so_cho_ngoi,
        xuat_xu,
        bao_hanh,
        so_luong_ton,
        trang_thai,
        anh_dai_dien
    } = req.body;

    const sql = `
        UPDATE xe
        SET dong_xe_id = ?, ten_xe = ?, duong_dan = ?, phien_ban = ?, nam_san_xuat = ?,
            gia_ban = ?, mo_ta_ngan = ?, mo_ta_chi_tiet = ?, dong_co = ?, hop_so = ?,
            nhien_lieu = ?, so_cho_ngoi = ?, xuat_xu = ?, bao_hanh = ?, so_luong_ton = ?,
            trang_thai = ?
        WHERE id = ?
    `;

    db.query(sql, [
        dong_xe_id,
        ten_xe,
        duong_dan,
        phien_ban || null,
        nam_san_xuat || null,
        gia_ban,
        mo_ta_ngan || null,
        mo_ta_chi_tiet || null,
        dong_co || null,
        hop_so || null,
        nhien_lieu || 'xang',
        so_cho_ngoi || null,
        xuat_xu || null,
        bao_hanh || null,
        so_luong_ton || 0,
        trang_thai || 'con_hang',
        req.params.id
    ], (err) => {
        if (err) {
            console.log('Loi cap nhat xe:', err);
            return res.redirect('/admin/xe/' + req.params.id + '/sua');
        }

        if (!anh_dai_dien) {
            return res.redirect('/admin/xe?success=Đã cập nhật xe');
        }

        const imageSql = `
            INSERT INTO anh_xe (xe_id, duong_dan_anh, la_anh_dai_dien, thu_tu)
            VALUES (?, ?, TRUE, 1)
            ON DUPLICATE KEY UPDATE duong_dan_anh = VALUES(duong_dan_anh), la_anh_dai_dien = TRUE
        `;

        db.query(
            'SELECT id FROM anh_xe WHERE xe_id = ? AND la_anh_dai_dien = TRUE LIMIT 1',
            [req.params.id],
            (findErr, images) => {
                if (findErr) {
                    console.log('Loi tim anh xe:', findErr);
                    return res.redirect('/admin/xe?success=Đã cập nhật xe');
                }

                if (images.length > 0) {
                    return db.query(
                        'UPDATE anh_xe SET duong_dan_anh = ? WHERE id = ?',
                        [anh_dai_dien, images[0].id],
                        () => res.redirect('/admin/xe?success=Đã cập nhật xe')
                    );
                }

                db.query(imageSql, [req.params.id, anh_dai_dien], (imageErr) => {
                    if (imageErr) console.log('Loi cap nhat anh xe:', imageErr);
                    res.redirect('/admin/xe?success=Đã cập nhật xe');
                });
            }
        );
    });
});

app.post('/admin/xe/:id/trang-thai', requireAdmin, (req, res) => {
    db.query('UPDATE xe SET trang_thai = ? WHERE id = ?', [req.body.trang_thai, req.params.id], (err) => {
        if (err) console.log('Loi cap nhat trang thai xe:', err);
        res.redirect('/admin/xe');
    });
});

app.get('/admin/showroom', requireAdmin, async (req, res) => {
    try {
        const [showrooms] = await dbp.query('SELECT * FROM showroom ORDER BY id DESC');

        res.render('admin/showrooms', {
            title: 'Quản lý showroom',
            showrooms,
            success: req.query.success || null
        });
    } catch (err) {
        console.log('Loi tai showroom admin:', err);
        res.status(500).send('Lỗi tải showroom');
    }
});

app.post('/admin/showroom/them', requireAdmin, (req, res) => {
    const { ten_showroom, dia_chi, so_dien_thoai, email, ban_do, gio_mo_cua } = req.body;

    if (!ten_showroom || !dia_chi) {
        return res.redirect('/admin/showroom');
    }

    const sql = `
        INSERT INTO showroom (ten_showroom, dia_chi, so_dien_thoai, email, ban_do, gio_mo_cua)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [ten_showroom, dia_chi, so_dien_thoai || null, email || null, ban_do || null, gio_mo_cua || null], (err) => {
        if (err) console.log('Loi them showroom:', err);
        res.redirect('/admin/showroom?success=Đã thêm showroom');
    });
});

app.get('/admin/yeu-cau', requireAdmin, async (req, res) => {
    try {
        const [quotes] = await dbp.query(`
            SELECT yeu_cau_tu_van.*, xe.ten_xe
            FROM yeu_cau_tu_van
            LEFT JOIN xe ON yeu_cau_tu_van.xe_id = xe.id
            ORDER BY yeu_cau_tu_van.ngay_tao DESC
        `);
        const [testDrives] = await dbp.query(`
            SELECT dat_lich_lai_thu.*, xe.ten_xe
            FROM dat_lich_lai_thu
            INNER JOIN xe ON dat_lich_lai_thu.xe_id = xe.id
            ORDER BY dat_lich_lai_thu.ngay_tao DESC
        `);

        res.render('admin/requests', {
            title: 'Quản lý yêu cầu',
            quotes,
            testDrives
        });
    } catch (err) {
        console.log('Loi tai yeu cau admin:', err);
        res.status(500).send('Lỗi tải yêu cầu');
    }
});

app.post('/admin/yeu-cau-tu-van/:id/trang-thai', requireAdmin, (req, res) => {
    db.query('UPDATE yeu_cau_tu_van SET trang_thai = ? WHERE id = ?', [req.body.trang_thai, req.params.id], (err) => {
        if (err) console.log('Loi cap nhat yeu cau tu van:', err);
        res.redirect('/admin/yeu-cau');
    });
});

app.post('/admin/lai-thu/:id/trang-thai', requireAdmin, (req, res) => {
    db.query('UPDATE dat_lich_lai_thu SET trang_thai = ? WHERE id = ?', [req.body.trang_thai, req.params.id], (err) => {
        if (err) console.log('Loi cap nhat lai thu:', err);
        res.redirect('/admin/yeu-cau');
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        title: 'Đăng nhập',
        error: req.query.error === 'admin'
            ? 'Vui lòng đăng nhập bằng tài khoản quản lý'
            : (req.query.error === 'login' ? 'Vui lòng đăng nhập để xem tài khoản' : null)
    });
});

app.post('/login', (req, res) => {
    const { email, mat_khau } = req.body;

    if (!email || !mat_khau) {
        return res.render('login', {
            title: 'Đăng nhập',
            error: 'Vui lòng nhập email và mật khẩu'
        });
    }

    const sql = `
        SELECT
            nguoi_dung.id,
            nguoi_dung.ho_ten,
            nguoi_dung.email,
            nguoi_dung.mat_khau,
            nguoi_dung.trang_thai,
            vai_tro.ten_vai_tro
        FROM nguoi_dung
        INNER JOIN vai_tro ON nguoi_dung.vai_tro_id = vai_tro.id
        WHERE nguoi_dung.email = ?
        LIMIT 1
    `;

    db.query(sql, [email], (err, result) => {
        if (err) {
            console.log('Loi login:', err);
            return res.render('login', {
                title: 'Đăng nhập',
                error: 'Lỗi truy vấn database'
            });
        }

        if (result.length === 0) {
            return res.render('login', {
                title: 'Đăng nhập',
                error: 'Email không tồn tại'
            });
        }

        const user = result[0];

        if (user.trang_thai === 'bi_khoa') {
            return res.render('login', {
                title: 'Đăng nhập',
                error: 'Tài khoản đã bị khóa'
            });
        }

        if (mat_khau !== user.mat_khau) {
            return res.render('login', {
                title: 'Đăng nhập',
                error: 'Mật khẩu không đúng'
            });
        }

        res.cookie('user_id', user.id, { httpOnly: true });
        res.cookie('ho_ten', user.ho_ten, { httpOnly: true });
        res.cookie('email', user.email, { httpOnly: true });
        res.cookie('so_dien_thoai', user.so_dien_thoai || '', { httpOnly: true });
        res.cookie('vai_tro', user.ten_vai_tro, { httpOnly: true });

        if (user.ten_vai_tro === 'admin' || user.ten_vai_tro === 'nhan_vien') {
            return res.redirect('/admin');
        }

        return res.redirect('/trang-chu');
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie('user_id');
    res.clearCookie('ho_ten');
    res.clearCookie('email');
    res.clearCookie('so_dien_thoai');
    res.clearCookie('vai_tro');
    res.redirect('/login');
});

app.get('/register', (req, res) => {
    res.render('register', {
        title: 'Đăng ký tài khoản',
        error: null
    });
});

app.post('/register', (req, res) => {
    const {
        ho_ten,
        email,
        so_dien_thoai,
        dia_chi,
        vai_tro_id,
        ma_quan_ly,
        mat_khau,
        xac_nhan_mat_khau
    } = req.body;

    if (!ho_ten || !email || !so_dien_thoai || !mat_khau || !xac_nhan_mat_khau) {
        return res.render('register', {
            title: 'Đăng ký tài khoản',
            error: 'Vui lòng nhập đầy đủ thông tin'
        });
    }

    if (mat_khau !== xac_nhan_mat_khau) {
        return res.render('register', {
            title: 'Đăng ký tài khoản',
            error: 'Mật khẩu xác nhận không khớp'
        });
    }

    const checkEmailSql = `
        SELECT id
        FROM nguoi_dung
        WHERE email = ?
        LIMIT 1
    `;

    db.query(checkEmailSql, [email], (err, result) => {
        if (err) {
            console.log('Loi kiem tra email:', err);
            return res.render('register', {
                title: 'Đăng ký tài khoản',
                error: 'Lỗi kiểm tra email'
            });
        }

        if (result.length > 0) {
            return res.render('register', {
                title: 'Đăng ký tài khoản',
                error: 'Email đã tồn tại'
            });
        }

        const selectedRole = Number(vai_tro_id || 3);

        if ((selectedRole === 1 || selectedRole === 2) && ma_quan_ly !== 'ADMIN123') {
            return res.render('register', {
                title: 'ÄÄƒng kÃ½ tÃ i khoáº£n',
                error: 'Mã tạo tài khoản quản lý không đúng'
            });
        }

        const insertSql = `
            INSERT INTO nguoi_dung
            (vai_tro_id, ho_ten, email, so_dien_thoai, mat_khau, dia_chi)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const values = [
            [1, 2, 3].includes(selectedRole) ? selectedRole : 3,
            ho_ten,
            email,
            so_dien_thoai,
            mat_khau,
            dia_chi || null
        ];

        db.query(insertSql, values, (err) => {
            if (err) {
                console.log('Loi luu user:', err);
                return res.render('register', {
                    title: 'Đăng ký tài khoản',
                    error: 'Lỗi lưu tài khoản vào database'
                });
            }

            return res.redirect('/login');
        });
    });
});

module.exports = app;
