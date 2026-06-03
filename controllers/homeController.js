const db = require('../config/database');
const dbp = db.promise();
const dbInit = require('../services/dbInit');
const parser = require('../helpers/parserHelper');

async function getDealers(onlyVisible = true, filters = {}) {
    await dbInit.ensureDealerTable();
    const where = [];
    const params = [];

    if (onlyVisible) {
        where.push("trang_thai = 'hien'");
    }

    if (filters.ten) {
        where.push('(ten_dai_ly LIKE ? OR dia_chi LIKE ?)');
        params.push(`%${filters.ten}%`, `%${filters.ten}%`);
    }

    if (filters.vung_mien) {
        where.push('vung_mien = ?');
        params.push(filters.vung_mien);
    }

    if (filters.khu_vuc) {
        where.push('khu_vuc = ?');
        params.push(filters.khu_vuc);
    }

    if (filters.loai_dai_ly) {
        where.push('loai_dai_ly = ?');
        params.push(filters.loai_dai_ly);
    }

    const [dealers] = await dbp.query(`
        SELECT *
        FROM dai_ly
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY thu_tu ASC, id DESC
    `, params);
    return dealers;
}

function getUniqueDealerValues(dealers, key) {
    return [...new Set(dealers.map((dealer) => dealer[key]).filter(Boolean))]
        .sort((a, b) => String(a).localeCompare(String(b), 'vi'));
}

async function getNewsPosts(onlyVisible = true, searchQuery = '') {
    await dbInit.ensureNewsTables();
    let whereClause = onlyVisible ? "WHERE tin_tuc.trang_thai = 'hien'" : "WHERE 1=1";
    const params = [];
    if (searchQuery) {
        whereClause += " AND (tin_tuc.tieu_de LIKE ? OR tin_tuc.noi_dung LIKE ?)";
        params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }
    const [posts] = await dbp.query(`
        SELECT
            tin_tuc.*,
            (SELECT COUNT(*) FROM like_tin WHERE like_tin.tin_tuc_id = tin_tuc.id) AS so_luot_thich,
            (SELECT COUNT(*) FROM binh_luan_tin WHERE binh_luan_tin.tin_tuc_id = tin_tuc.id AND binh_luan_tin.trang_thai = 'hien') AS so_binh_luan
        FROM tin_tuc
        ${whereClause}
        ORDER BY tin_tuc.ghim DESC, tin_tuc.ngay_tao DESC
    `, params);
    return posts;
}

async function getNewsPostBySlug(slug) {
    await dbInit.ensureNewsTables();
    const [posts] = await dbp.query(`
        SELECT
            tin_tuc.*,
            (SELECT COUNT(*) FROM like_tin WHERE like_tin.tin_tuc_id = tin_tuc.id) AS so_luot_thich,
            (SELECT COUNT(*) FROM binh_luan_tin WHERE binh_luan_tin.tin_tuc_id = tin_tuc.id AND binh_luan_tin.trang_thai = 'hien') AS so_binh_luan
        FROM tin_tuc
        WHERE tin_tuc.duong_dan = ? AND tin_tuc.trang_thai = 'hien'
        LIMIT 1
    `, [slug]);
    if (!posts.length) return null;

    const [comments] = await dbp.query(`
        SELECT *
        FROM binh_luan_tin
        WHERE tin_tuc_id = ? AND trang_thai = 'hien'
        ORDER BY ngay_tao ASC
    `, [posts[0].id]);

    return { post: posts[0], comments };
}

async function getPanels(onlyVisible = true) {
    await dbInit.ensurePanelTable();
    const [panels] = await dbp.query(`
        SELECT *
        FROM panel_anh
        ${onlyVisible ? "WHERE trang_thai = 'hien'" : ''}
        ORDER BY thu_tu ASC, id DESC
    `);
    return panels;
}

function groupCarsByModel(carsList) {
    const groupedMap = new Map();
    carsList.forEach((car) => {
        const cleanName = String(car.ten_xe || '').trim().toLowerCase();
        if (!groupedMap.has(cleanName)) {
            groupedMap.set(cleanName, car);
        } else {
            const existing = groupedMap.get(cleanName);
            if (Number(car.gia_ban) < Number(existing.gia_ban)) {
                groupedMap.set(cleanName, car);
            }
        }
    });
    return Array.from(groupedMap.values()).sort((a, b) => b.id - a.id);
}

async function getCars() {
    const [cars] = await dbp.query(`
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
            xe.trang_thai,
            hang_xe.ten_hang,
            loai_xe.ten_loai,
            COALESCE(anh_xe.duong_dan_anh, 'no-car.jpg') AS anh_dai_dien
        FROM xe
        INNER JOIN dong_xe ON xe.dong_xe_id = dong_xe.id
        INNER JOIN hang_xe ON dong_xe.hang_xe_id = hang_xe.id
        INNER JOIN loai_xe ON dong_xe.loai_xe_id = loai_xe.id
        LEFT JOIN anh_xe ON xe.id = anh_xe.xe_id AND anh_xe.la_anh_dai_dien = TRUE
        WHERE xe.trang_thai = 'con_hang'
        ORDER BY xe.gia_ban ASC
    `);
    return groupCarsByModel(cars);
}

// Route handlers
exports.redirectToHome = (req, res) => {
    res.redirect('/trang-chu');
};

exports.getHome = async (req, res) => {
    const { tim_kiem } = req.query;
    let cars = [], panels = [], posts = [];

    try {
        if (tim_kiem) {
            const [searchedCars] = await dbp.query(`
                SELECT xe.*, hang_xe.ten_hang, loai_xe.ten_loai, COALESCE(anh_xe.duong_dan_anh, 'no-car.jpg') AS anh_dai_dien 
                FROM xe 
                INNER JOIN dong_xe ON xe.dong_xe_id = dong_xe.id 
                INNER JOIN hang_xe ON dong_xe.hang_xe_id = hang_xe.id 
                INNER JOIN loai_xe ON dong_xe.loai_xe_id = loai_xe.id 
                LEFT JOIN anh_xe ON xe.id = anh_xe.xe_id AND anh_xe.la_anh_dai_dien = TRUE 
                WHERE xe.trang_thai = 'con_hang' AND xe.ten_xe LIKE ? 
                ORDER BY xe.gia_ban ASC`, [`%${tim_kiem}%`]);
            cars = groupCarsByModel(searchedCars);
        } else {
            cars = await getCars();
        }
        panels = await getPanels(true);
        posts = await getNewsPosts(true);
    } catch (err) {
        console.log('Loi tai trang chu:', err);
    }

    res.render('home', {
        title: tim_kiem ? `Tìm kiếm cho: ${tim_kiem}` : 'Trang chủ',
        formatPrice: parser.formatPrice,
        formatDateTime: parser.formatDateTime,
        cars,
        panels,
        posts,
        query: tim_kiem
    });
};

exports.getDealers = async (req, res) => {
    try {
        const filters = {
            ten: String(req.query.ten || '').trim(),
            vung_mien: String(req.query.vung_mien || '').trim(),
            khu_vuc: String(req.query.khu_vuc || '').trim(),
            loai_dai_ly: String(req.query.loai_dai_ly || '').trim()
        };
        const allDealers = await getDealers(true);
        const dealers = await getDealers(true, filters);
        res.render('dealers', {
            title: 'Đại lý | Showroom Double Anh',
            dealers,
            filters,
            filterOptions: {
                vungMiens: getUniqueDealerValues(allDealers, 'vung_mien'),
                khuVucs: getUniqueDealerValues(allDealers, 'khu_vuc'),
                loaiDaiLys: getUniqueDealerValues(allDealers, 'loai_dai_ly')
            }
        });
    } catch (err) {
        console.log('Lỗi tải trang đại lý:', err);
        res.status(500).send('Không thể tải danh sách đại lý.');
    }
};

exports.getNews = async (req, res) => {
    try {
        const searchQuery = String(req.query.q || '').trim();
        const posts = await getNewsPosts(true, searchQuery);
        res.render('news', {
            title: searchQuery ? `Tìm kiếm tin tức: ${searchQuery}` : 'Tin tức | Showroom Double Anh',
            posts,
            searchQuery,
            formatDateTime: parser.formatDateTime
        });
    } catch (err) {
        console.log('Lỗi tải trang tin tức:', err);
        res.status(500).send('Không thể tải tin tức.');
    }
};

exports.getNewsDetail = async (req, res) => {
    try {
        const result = await getNewsPostBySlug(req.params.duong_dan);
        if (!result) return res.status(404).send('Không tìm thấy bài viết.');

        res.render('news-detail', {
            title: `${result.post.tieu_de} | Showroom Double Anh`,
            post: result.post,
            comments: result.comments,
            formatDateTime: parser.formatDateTime,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.log('Lỗi tải chi tiết tin tức:', err);
        res.status(500).send('Không thể tải bài viết.');
    }
};

exports.likeNews = async (req, res) => {
    try {
        const result = await getNewsPostBySlug(req.params.duong_dan);
        if (!result) return res.status(404).send('Không tìm thấy bài viết.');

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local';
        await dbp.query(
            'INSERT IGNORE INTO like_tin (tin_tuc_id, dia_chi_ip) VALUES (?, ?)',
            [result.post.id, String(ip).slice(0, 64)]
        );
        res.redirect(`/tin-tuc/${req.params.duong_dan}`);
    } catch (err) {
        console.log('Lỗi thích bài viết:', err);
        res.redirect(`/tin-tuc/${req.params.duong_dan}`);
    }
};

exports.commentNews = async (req, res) => {
    const { ten_nguoi_binh_luan, email, noi_dung } = req.body;

    if (!ten_nguoi_binh_luan || !noi_dung) {
        return parser.redirectWithMessage(res, `/tin-tuc/${req.params.duong_dan}`, 'error', 'Vui lòng nhập tên và nội dung bình luận.');
    }

    try {
        const result = await getNewsPostBySlug(req.params.duong_dan);
        if (!result) return res.status(404).send('Không tìm thấy bài viết.');

        await dbp.query(`
            INSERT INTO binh_luan_tin (tin_tuc_id, ten_nguoi_binh_luan, email, noi_dung)
            VALUES (?, ?, ?, ?)
        `, [
            result.post.id,
            ten_nguoi_binh_luan,
            email || null,
            noi_dung
        ]);
        parser.redirectWithMessage(res, `/tin-tuc/${req.params.duong_dan}`, 'success', 'Bình luận đã được đăng.');
    } catch (err) {
        console.log('Lỗi đăng bình luận:', err);
        parser.redirectWithMessage(res, `/tin-tuc/${req.params.duong_dan}`, 'error', 'Không thể đăng bình luận.');
    }
};

exports.getCarDetail = async (req, res) => {
    try {
        const [cars] = await dbp.query(`
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
        `, [req.params.duong_dan]);
        if (!cars.length) return res.status(404).send('Khong tim thay xe');

        const car = cars[0];
        const [variants] = await dbp.query(`
            SELECT
                xe.id,
                xe.ten_xe,
                xe.phien_ban,
                xe.duong_dan,
                xe.gia_ban,
                xe.slogan,
                xe.mo_ta_ngan,
                COALESCE(anh_xe.duong_dan_anh, 'no-car.jpg') AS anh_dai_dien
            FROM xe
            LEFT JOIN anh_xe ON xe.id = anh_xe.xe_id AND anh_xe.la_anh_dai_dien = TRUE
            WHERE xe.ten_xe = ? AND xe.trang_thai = 'con_hang'
            ORDER BY xe.gia_ban ASC
        `, [car.ten_xe]);

        const [specs] = await dbp.query('SELECT ten_thong_so, gia_tri FROM thong_so_ky_thuat WHERE xe_id = ? ORDER BY id ASC', [car.id]);
        const [colors] = await dbp.query('SELECT ten_mau, ma_mau, anh_mau, gia_them, anh_360 FROM mau_xe WHERE xe_id = ? ORDER BY id ASC', [car.id]);
        const [images] = await dbp.query('SELECT duong_dan_anh, nhom_anh, chu_thich FROM anh_xe WHERE xe_id = ? ORDER BY thu_tu ASC', [car.id]);
        await dbInit.ensureCarDetailTables();
        const [rotateImages] = await dbp.query('SELECT duong_dan_anh, nhom_360 FROM anh_xe_360 WHERE xe_id = ? ORDER BY thu_tu ASC, id ASC', [car.id]);
        const [features] = await dbp.query('SELECT * FROM dac_diem_xe WHERE xe_id = ? ORDER BY thu_tu ASC, id ASC', [car.id]);

        // Load global 360 sets to resolve color's anh_360 ID -> actual image list
        let bo360SetsMap = {};
        try {
            await dbInit.ensureBo360SetsTable();
            const [bo360Sets] = await dbp.query('SELECT id, ten_bo_anh, danh_sach_anh FROM bo_anh_360');
            bo360Sets.forEach(s => { bo360SetsMap[String(s.id)] = s; bo360SetsMap[s.ten_bo_anh] = s; });
        } catch (e) { /* table may not exist yet */ }

        res.render('car-detail', {
            title: car.phien_ban ? `${car.ten_xe} - ${car.phien_ban}` : car.ten_xe,
            formatPrice: parser.formatPrice,
            car,
            specs,
            colors,
            images,
            rotateImages,
            features,
            variants,
            bo360SetsMap
        });
    } catch (err) {
        console.log('Loi tai chi tiet xe:', err);
        res.status(500).send('Loi tai chi tiet xe');
    }
};

exports.searchCarsApi = async (req, res) => {
    const query = String(req.query.q || '').trim();
    if (!query) {
        return res.json([]);
    }

    try {
        const [cars] = await dbp.query(`
            SELECT ten_xe, duong_dan, COALESCE(anh_xe.duong_dan_anh, 'no-car.jpg') AS anh_dai_dien 
            FROM xe 
            LEFT JOIN anh_xe ON xe.id = anh_xe.xe_id AND anh_xe.la_anh_dai_dien = TRUE
            WHERE xe.ten_xe LIKE ? AND xe.trang_thai = 'con_hang'
            ORDER BY xe.id DESC
            LIMIT 7`,
            [`%${query}%`]
        );
        res.json(cars);
    } catch (err) {
        console.error('Lỗi API tìm kiếm xe:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

exports.getQuote = async (req, res) => {
    try {
        const cars = await getCars();
        res.render('quote', {
            title: 'Nhận báo giá | Showroom Double Anh',
            cars,
            selectedCarId: req.query.xe_id || '',
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.log('Lỗi trang báo giá:', err);
        res.status(500).send('Không thể tải trang báo giá.');
    }
};

exports.postQuote = async (req, res) => {
    const { ho_ten, email, so_dien_thoai, xe_id, thanh_pho, noi_dung, dong_y_tiep_thi } = req.body;

    if (!ho_ten || !email || !so_dien_thoai || !xe_id || !thanh_pho) {
        const cars = await getCars();
        return res.status(400).render('quote', {
            title: 'Nhận báo giá | Showroom Double Anh',
            cars,
            selectedCarId: xe_id || '',
            formData: req.body,
            error: 'Vui lòng nhập đủ họ tên, email, số điện thoại, mẫu xe và tỉnh/thành phố.'
        });
    }

    try {
        await dbInit.ensureCustomerRequestTables();
        await dbp.query(`
            INSERT INTO yeu_cau_bao_gia
                (xe_id, ho_ten, email, so_dien_thoai, thanh_pho, noi_dung, dong_y_tiep_thi)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            xe_id,
            ho_ten,
            email,
            so_dien_thoai,
            thanh_pho,
            noi_dung || null,
            dong_y_tiep_thi === 'co' ? 1 : 0
        ]);
        parser.redirectWithMessage(res, '/bao-gia', 'success', 'Yêu cầu báo giá đã được gửi. Tư vấn viên sẽ liên hệ bạn trong thời gian sớm nhất.');
    } catch (err) {
        console.log('Lỗi gửi báo giá:', err);
        const cars = await getCars();
        res.status(500).render('quote', {
            title: 'Nhận báo giá | Showroom Double Anh',
            cars,
            selectedCarId: xe_id || '',
            formData: req.body,
            error: 'Không thể gửi yêu cầu báo giá. Vui lòng thử lại.'
        });
    }
};

exports.getTestDrive = async (req, res) => {
    try {
        const cars = await getCars();
        res.render('test-drive', {
            title: 'Đăng ký lái thử | Showroom Double Anh',
            cars,
            selectedCarId: req.query.xe_id || '',
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.log('Lỗi trang đăng ký lái thử:', err);
        res.status(500).send('Không thể tải trang đăng ký lái thử.');
    }
};

exports.postTestDrive = async (req, res) => {
    const {
        ho_ten,
        email,
        so_dien_thoai,
        mau_xe,
        thanh_pho,
        dai_ly,
        ngay_muon_lai,
        gio_muon_lai,
        dong_y_tiep_thi
    } = req.body;

    if (!ho_ten || !email || !so_dien_thoai || !mau_xe || !thanh_pho || !dai_ly) {
        const cars = await getCars();
        return res.status(400).render('test-drive', {
            title: 'Đăng ký lái thử | Showroom Double Anh',
            cars,
            selectedCarId: mau_xe || '',
            formData: req.body,
            error: 'Vui lòng nhập đủ họ tên, email, số điện thoại, mẫu xe, tỉnh/thành phố và đại lý.'
        });
    }

    try {
        await dbInit.ensureCustomerRequestTables();
        await dbp.query(`
            INSERT INTO lich_lai_thu
                (xe_id, ho_ten, email, so_dien_thoai, thanh_pho, dai_ly, ngay_muon_lai, gio_muon_lai, dong_y_tiep_thi)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            mau_xe,
            ho_ten,
            email,
            so_dien_thoai,
            thanh_pho,
            dai_ly,
            ngay_muon_lai || null,
            gio_muon_lai || null,
            dong_y_tiep_thi === 'co' ? 1 : 0
        ]);
        parser.redirectWithMessage(res, '/dang-ky-lai-thu', 'success', 'Lịch lái thử đã được gửi. Showroom sẽ liên hệ xác nhận lịch với bạn.');
    } catch (err) {
        console.log('Lỗi gửi lịch lái thử:', err);
        const cars = await getCars();
        res.status(500).render('test-drive', {
            title: 'Đăng ký lái thử | Showroom Double Anh',
            cars,
            selectedCarId: mau_xe || '',
            formData: req.body,
            error: 'Không thể gửi lịch lái thử. Vui lòng thử lại.'
        });
    }
};

// Export these helpers so they can be re-used in adminController
exports.getDealersData = getDealers;
exports.getNewsPostsData = getNewsPosts;
exports.getPanelsData = getPanels;

exports.getCarsPage = async (req, res) => {
    const tim_kiem = String(req.query.tim_kiem || '').trim();
    const loai = String(req.query.loai || '').trim();
    try {
        // Build WHERE clause
        const where = ["xe.trang_thai = 'con_hang'"];
        const params = [];
        if (tim_kiem) {
            where.push('(xe.ten_xe LIKE ? OR xe.phien_ban LIKE ?)');
            params.push(`%${tim_kiem}%`, `%${tim_kiem}%`);
        }
        if (loai) {
            where.push('loai_xe.ten_loai = ?');
            params.push(loai);
        }

        const [cars] = await dbp.query(`
            SELECT
                xe.id, xe.ten_xe, xe.duong_dan, xe.phien_ban,
                xe.nam_san_xuat, xe.gia_ban, xe.gia_niem_yet,
                xe.mo_ta_ngan, xe.dong_co, xe.hop_so,
                xe.nhien_lieu, xe.so_cho_ngoi, xe.so_luong_ton,
                hang_xe.ten_hang,
                loai_xe.ten_loai,
                COALESCE(anh_xe.duong_dan_anh, 'no-car.jpg') AS anh_dai_dien
            FROM xe
            INNER JOIN dong_xe  ON xe.dong_xe_id = dong_xe.id
            INNER JOIN hang_xe  ON dong_xe.hang_xe_id = hang_xe.id
            INNER JOIN loai_xe  ON dong_xe.loai_xe_id = loai_xe.id
            LEFT  JOIN anh_xe   ON xe.id = anh_xe.xe_id AND anh_xe.la_anh_dai_dien = TRUE
            WHERE ${where.join(' AND ')}
            ORDER BY xe.gia_ban ASC
        `, params);

        // Sidebar: count all types (no filter)
        const [typeCounts] = await dbp.query(`
            SELECT loai_xe.ten_loai, COUNT(*) AS so_luong
            FROM xe
            INNER JOIN dong_xe ON xe.dong_xe_id = dong_xe.id
            INNER JOIN loai_xe ON dong_xe.loai_xe_id = loai_xe.id
            WHERE xe.trang_thai = 'con_hang'
            GROUP BY loai_xe.ten_loai
            ORDER BY so_luong DESC
        `);

        res.render('cars-list', {
            title: loai ? `Dòng xe ${loai} | Showroom` : 'Danh sách xe | Showroom Double Anh',
            formatPrice: parser.formatPrice,
            cars,
            typeCounts,
            activeLoai: loai,
            timKiem: tim_kiem
        });
    } catch (err) {
        console.log('Lỗi trang danh sách xe:', err);
        res.render('cars-list', {
            title: 'Danh sách xe | Showroom Double Anh',
            formatPrice: parser.formatPrice,
            cars: [],
            typeCounts: [],
            activeLoai: loai,
            timKiem: tim_kiem
        });
    }
};

