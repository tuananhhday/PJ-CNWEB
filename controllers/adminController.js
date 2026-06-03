const db = require('../config/database');
const dbp = db.promise();
const dbInit = require('../services/dbInit');
const parser = require('../helpers/parserHelper');
const homeController = require('./homeController');

exports.redirectToXe = (req, res) => {
    res.redirect('/admin/xe');
};

exports.getRequests = async (req, res) => {
    try {
        await dbInit.ensureCustomerRequestTables();
        const filter = {
            loai: String(req.query.loai || 'tat_ca'),
            trang_thai: String(req.query.trang_thai || 'tat_ca')
        };
        const statusWhere = filter.trang_thai !== 'tat_ca' ? 'AND request_table.trang_thai = ?' : '';
        const quoteParams = filter.trang_thai !== 'tat_ca' ? [filter.trang_thai] : [];
        const driveParams = filter.trang_thai !== 'tat_ca' ? [filter.trang_thai] : [];

        const [quotes] = filter.loai === 'lai_thu' ? [[]] : await dbp.query(`
            SELECT
                request_table.*,
                'bao_gia' AS loai_yeu_cau,
                xe.ten_xe,
                xe.duong_dan,
                COALESCE(anh_xe.duong_dan_anh, 'no-car.jpg') AS anh_dai_dien
            FROM yeu_cau_bao_gia request_table
            LEFT JOIN xe ON request_table.xe_id = xe.id
            LEFT JOIN anh_xe ON xe.id = anh_xe.xe_id AND anh_xe.la_anh_dai_dien = TRUE
            WHERE 1 = 1 ${statusWhere}
            ORDER BY request_table.ngay_tao DESC
        `, quoteParams);

        const [testDrives] = filter.loai === 'bao_gia' ? [[]] : await dbp.query(`
            SELECT
                request_table.*,
                'lai_thu' AS loai_yeu_cau,
                xe.ten_xe,
                xe.duong_dan,
                COALESCE(anh_xe.duong_dan_anh, 'no-car.jpg') AS anh_dai_dien
            FROM lich_lai_thu request_table
            LEFT JOIN xe ON request_table.xe_id = xe.id
            LEFT JOIN anh_xe ON xe.id = anh_xe.xe_id AND anh_xe.la_anh_dai_dien = TRUE
            WHERE 1 = 1 ${statusWhere}
            ORDER BY request_table.ngay_tao DESC
        `, driveParams);

        const sortRequestsForAdmin = (items) => {
            const activeStatuses = ['moi', 'dang_xu_ly'];
            return [...items].sort((a, b) => {
                const aProcessed = activeStatuses.includes(a.trang_thai) ? 0 : 1;
                const bProcessed = activeStatuses.includes(b.trang_thai) ? 0 : 1;
                if (aProcessed !== bProcessed) return aProcessed - bProcessed;
                return new Date(b.ngay_tao) - new Date(a.ngay_tao);
            });
        };
        const quoteRequests = sortRequestsForAdmin(quotes);
        const testDriveRequests = sortRequestsForAdmin(testDrives);

        res.render('admin/requests', {
            title: 'Quản lý yêu cầu khách hàng',
            requests: [...quoteRequests, ...testDriveRequests],
            quoteRequests,
            testDriveRequests,
            filter,
            formatDateTime: parser.formatDateTime,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.log('Loi trang quan ly yeu cau:', err);
        res.status(500).send('Khong the tai danh sach yeu cau.');
    }
};

exports.updateRequest = async (req, res) => {
    const { trang_thai, ghi_chu_admin } = req.body;
    const tableName = req.params.loai === 'lai-thu' ? 'lich_lai_thu' : 'yeu_cau_bao_gia';
    const allowedStatus = tableName === 'lich_lai_thu'
        ? ['moi', 'dang_xu_ly', 'da_xac_nhan', 'hoan_tat', 'huy']
        : ['moi', 'dang_xu_ly', 'da_lien_he', 'hoan_tat', 'huy'];

    if (!allowedStatus.includes(trang_thai)) {
        return parser.redirectWithMessage(res, '/admin/yeu-cau', 'error', 'Trạng thái không hợp lệ.');
    }

    try {
        await dbInit.ensureCustomerRequestTables();
        
        // Fetch current status and history
        const [currentRows] = await dbp.query(
            `SELECT trang_thai, ghi_chu_admin, lich_su_xu_ly, ngay_tao, ho_ten FROM ${tableName} WHERE id = ?`,
            [req.params.id]
        );
        
        if (currentRows.length === 0) {
            return parser.redirectWithMessage(res, '/admin/yeu-cau', 'error', 'Không tìm thấy yêu cầu.');
        }
        
        const current = currentRows[0];
        let historyList = [];
        if (current.lich_su_xu_ly) {
            try {
                historyList = JSON.parse(current.lich_su_xu_ly);
            } catch (e) {
                historyList = [];
            }
        }
        
        // If history is empty, populate the initial "created" state
        if (historyList.length === 0) {
            historyList.push({
                ngay: current.ngay_tao,
                trang_thai_cu: null,
                trang_thai_moi: 'moi',
                ghi_chu: tableName === 'lich_lai_thu' ? 'Khách đặt lịch lái thử trên website' : 'Khách gửi yêu cầu báo giá trên website',
                nguoi_thuc_hien: 'Khách hàng'
            });
        }
        
        // Append history only if status or note changed
        const statusChanged = current.trang_thai !== trang_thai;
        const noteChanged = (current.ghi_chu_admin || '') !== (ghi_chu_admin || '');
        
        if (statusChanged || noteChanged) {
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const nowStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
            
            historyList.push({
                ngay: nowStr,
                trang_thai_cu: current.trang_thai,
                trang_thai_moi: trang_thai,
                ghi_chu: ghi_chu_admin || (statusChanged ? 'Cập nhật trạng thái' : 'Cập nhật ghi chú'),
                nguoi_thuc_hien: 'Admin'
            });
        }

        await dbp.query(
            `UPDATE ${tableName} SET trang_thai = ?, ghi_chu_admin = ?, lich_su_xu_ly = ? WHERE id = ?`,
            [trang_thai, ghi_chu_admin || null, JSON.stringify(historyList), req.params.id]
        );
        parser.redirectWithMessage(res, '/admin/yeu-cau', 'success', 'Đã cập nhật yêu cầu khách hàng.');
    } catch (err) {
        console.log('Loi cap nhat yeu cau:', err);
        parser.redirectWithMessage(res, '/admin/yeu-cau', 'error', 'Không thể cập nhật yêu cầu.');
    }
};

exports.deleteRequest = async (req, res) => {
    const tableName = req.params.loai === 'lai-thu' ? 'lich_lai_thu' : 'yeu_cau_bao_gia';

    try {
        await dbInit.ensureCustomerRequestTables();
        await dbp.query(`DELETE FROM ${tableName} WHERE id = ?`, [req.params.id]);
        parser.redirectWithMessage(res, '/admin/yeu-cau', 'success', 'Đã xóa yêu cầu khách hàng.');
    } catch (err) {
        console.log('Loi xoa yeu cau:', err);
        parser.redirectWithMessage(res, '/admin/yeu-cau', 'error', 'Không thể xóa yêu cầu.');
    }
};

exports.getCars = async (req, res) => {
    try {
        await dbInit.ensureCarDetailTables();
        await dbInit.ensureVehicleTypeOptions();
        const [cars] = await dbp.query(`
            SELECT
                xe.*,
                dong_xe.ten_dong,
                hang_xe.ten_hang,
                loai_xe.ten_loai,
                COALESCE(anh_xe.duong_dan_anh, 'no-car.jpg') AS anh_dai_dien
            FROM xe
            INNER JOIN dong_xe ON xe.dong_xe_id = dong_xe.id
            INNER JOIN hang_xe ON dong_xe.hang_xe_id = hang_xe.id
            INNER JOIN loai_xe ON dong_xe.loai_xe_id = loai_xe.id
            LEFT JOIN anh_xe ON xe.id = anh_xe.xe_id AND anh_xe.la_anh_dai_dien = TRUE
            ORDER BY xe.id DESC
        `);
        const [models] = await dbp.query(`
            SELECT MIN(dong_xe.id) AS id, loai_xe.ten_loai
            FROM dong_xe
            INNER JOIN loai_xe ON dong_xe.loai_xe_id = loai_xe.id
            GROUP BY loai_xe.ten_loai
            ORDER BY FIELD(loai_xe.ten_loai, 'Sedan', 'SUV', 'Crossover', 'Hatchback', 'MPV', 'Pickup', 'Coupe', 'Convertible'), loai_xe.ten_loai ASC
        `);
        const carIds = cars.map((car) => car.id);
        let specsByCar = {};
        let colorsByCar = {};
        let featuresByCar = {};
        let imagesByCar = {};
        let rotateImagesByCar = {};

        if (carIds.length) {
            const [specRows] = await dbp.query('SELECT * FROM thong_so_ky_thuat WHERE xe_id IN (?) ORDER BY id ASC', [carIds]);
            const [colorRows] = await dbp.query('SELECT * FROM mau_xe WHERE xe_id IN (?) ORDER BY id ASC', [carIds]);
            const [featureRows] = await dbp.query('SELECT * FROM dac_diem_xe WHERE xe_id IN (?) ORDER BY thu_tu ASC, id ASC', [carIds]);
            const [imageRows] = await dbp.query('SELECT * FROM anh_xe WHERE xe_id IN (?) ORDER BY thu_tu ASC, id ASC', [carIds]);
            const [rotateImageRows] = await dbp.query('SELECT * FROM anh_xe_360 WHERE xe_id IN (?) ORDER BY thu_tu ASC, id ASC', [carIds]);

            specsByCar = specRows.reduce((map, item) => {
                map[item.xe_id] = map[item.xe_id] || [];
                map[item.xe_id].push(item);
                return map;
            }, {});
            colorsByCar = colorRows.reduce((map, item) => {
                map[item.xe_id] = map[item.xe_id] || [];
                map[item.xe_id].push(item);
                return map;
            }, {});
            featuresByCar = featureRows.reduce((map, item) => {
                map[item.xe_id] = map[item.xe_id] || [];
                map[item.xe_id].push(item);
                return map;
            }, {});
            imagesByCar = imageRows.reduce((map, item) => {
                map[item.xe_id] = map[item.xe_id] || [];
                map[item.xe_id].push(item);
                return map;
            }, {});
            rotateImagesByCar = rotateImageRows.reduce((map, item) => {
                map[item.xe_id] = map[item.xe_id] || [];
                map[item.xe_id].push(item);
                return map;
            }, {});
        }

        await dbInit.ensureBo360SetsTable();
        const [bo360Sets] = await dbp.query('SELECT id, ten_bo_anh, danh_sach_anh FROM bo_anh_360 ORDER BY ten_bo_anh ASC');

        res.render('admin/cars', {
            title: 'Quan ly xe',
            formatPrice: parser.formatPrice,
            cars,
            models,
            specsByCar,
            colorsByCar,
            featuresByCar,
            imagesByCar,
            rotateImagesByCar,
            specsToTextarea: parser.specsToTextarea,
            specsToSections: parser.specsToSections,
            SPEC_SECTIONS: parser.SPEC_SECTIONS,
            colorsToTextarea: parser.colorsToTextarea,
            featuresToTextarea: parser.featuresToTextarea,
            rotateImagesToTextarea: parser.rotateImagesToTextarea,
            imageFiles: parser.listImageFiles(),
            bo360Sets,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.log('Loi tai admin:', err);
        res.status(500).send('Khong the tai trang admin. Kiem tra database da import SQL chua.');
    }
};

exports.getPanels = async (req, res) => {
    try {
        const panels = await homeController.getPanelsData(false);
        res.render('admin/panels', {
            title: 'Quan ly panel',
            panels,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.log('Loi tai admin panel:', err);
        res.status(500).send('Khong the tai trang admin panel.');
    }
};

exports.addPanel = async (req, res) => {
    if ((req.headers['content-type'] || '').includes('multipart/form-data')) {
        req.body = await parser.parseMultipartForm(req);
    }

    let { duong_dan_anh, duong_dan_anh_text, thu_tu, trang_thai } = req.body;
    duong_dan_anh = duong_dan_anh || duong_dan_anh_text;
    if (!duong_dan_anh) return res.redirect('/admin/panel?error=Vui long chon hoac nhap anh panel');

    try {
        await dbInit.ensurePanelTable();
        await dbp.query(`
            INSERT INTO panel_anh (duong_dan_anh, thu_tu, trang_thai)
            VALUES (?, ?, ?)
        `, [duong_dan_anh, thu_tu || 0, trang_thai || 'hien']);
        await parser.cleanupOrphanImages();
        res.redirect('/admin/panel?success=Da them anh panel');
    } catch (err) {
        console.log('Loi them panel:', err);
        res.redirect('/admin/panel?error=Khong the them anh panel');
    }
};

exports.editPanel = async (req, res) => {
    if ((req.headers['content-type'] || '').includes('multipart/form-data')) {
        req.body = await parser.parseMultipartForm(req);
    }

    let { duong_dan_anh, duong_dan_anh_text, current_image, thu_tu, trang_thai } = req.body;
    duong_dan_anh = duong_dan_anh || duong_dan_anh_text || current_image;
    try {
        await dbInit.ensurePanelTable();
        await dbp.query(`
            UPDATE panel_anh
            SET duong_dan_anh = ?, thu_tu = ?, trang_thai = ?
            WHERE id = ?
        `, [duong_dan_anh, thu_tu || 0, trang_thai || 'hien', req.params.id]);
        await parser.cleanupOrphanImages();
        res.redirect('/admin/panel?success=Da cap nhat panel');
    } catch (err) {
        console.log('Loi sua panel:', err);
        res.redirect('/admin/panel?error=Khong the cap nhat panel');
    }
};

exports.deletePanel = async (req, res) => {
    try {
        await dbInit.ensurePanelTable();
        await dbp.query('DELETE FROM panel_anh WHERE id = ?', [req.params.id]);
        await parser.cleanupOrphanImages();
        res.redirect('/admin/panel?success=Da xoa panel');
    } catch (err) {
        console.log('Loi xoa panel:', err);
        res.redirect('/admin/panel?error=Khong the xoa panel');
    }
};

exports.getDealers = async (req, res) => {
    try {
        const dealers = await homeController.getDealersData(false);
        res.render('admin/dealers', {
            title: 'Quản lý đại lý',
            dealers,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.log('Lỗi tải admin đại lý:', err);
        res.status(500).send('Không thể tải trang quản lý đại lý.');
    }
};

exports.addDealer = async (req, res) => {
    const {
        ten_dai_ly,
        duong_dan,
        dia_chi,
        thanh_pho,
        vung_mien,
        khu_vuc,
        loai_dai_ly,
        so_dien_thoai,
        email,
        website,
        gio_lam_viec,
        google_map_url,
        map_embed_url,
        mo_ta,
        thu_tu,
        trang_thai
    } = req.body;

    if (!ten_dai_ly || !dia_chi || !thanh_pho) {
        return parser.redirectWithMessage(res, '/admin/dai-ly', 'error', 'Vui lòng nhập tên đại lý, địa chỉ và thành phố.');
    }

    try {
        await dbInit.ensureDealerTable();
        const slug = await parser.getUniqueSlug('dai_ly', duong_dan || ten_dai_ly);
        await dbp.query(`
            INSERT INTO dai_ly
            (ten_dai_ly, duong_dan, dia_chi, thanh_pho, vung_mien, khu_vuc, loai_dai_ly, so_dien_thoai, email, website, gio_lam_viec, google_map_url, map_embed_url, mo_ta, thu_tu, trang_thai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            ten_dai_ly,
            slug,
            dia_chi,
            thanh_pho,
            vung_mien || 'Miền Nam',
            khu_vuc || thanh_pho,
            loai_dai_ly || 'Đại lý bán xe',
            so_dien_thoai || null,
            email || null,
            website || null,
            gio_lam_viec || null,
            google_map_url || null,
            map_embed_url || google_map_url || null,
            mo_ta || null,
            Number(thu_tu || 0),
            trang_thai || 'hien'
        ]);
        parser.redirectWithMessage(res, '/admin/dai-ly', 'success', 'Đã thêm đại lý mới.');
    } catch (err) {
        console.log('Lỗi thêm đại lý:', err);
        parser.redirectWithMessage(res, '/admin/dai-ly', 'error', 'Không thể thêm đại lý.');
    }
};

exports.editDealer = async (req, res) => {
    const {
        ten_dai_ly,
        duong_dan,
        dia_chi,
        thanh_pho,
        vung_mien,
        khu_vuc,
        loai_dai_ly,
        so_dien_thoai,
        email,
        website,
        gio_lam_viec,
        google_map_url,
        map_embed_url,
        mo_ta,
        thu_tu,
        trang_thai
    } = req.body;

    if (!ten_dai_ly || !dia_chi || !thanh_pho) {
        return parser.redirectWithMessage(res, '/admin/dai-ly', 'error', 'Vui lòng nhập đủ thông tin bắt buộc khi sửa đại lý.');
    }

    try {
        await dbInit.ensureDealerTable();
        const slug = await parser.getUniqueSlug('dai_ly', duong_dan || ten_dai_ly, req.params.id);
        await dbp.query(`
            UPDATE dai_ly
            SET ten_dai_ly = ?, duong_dan = ?, dia_chi = ?, thanh_pho = ?, vung_mien = ?,
                khu_vuc = ?, loai_dai_ly = ?, so_dien_thoai = ?, email = ?, website = ?,
                gio_lam_viec = ?, google_map_url = ?, map_embed_url = ?, mo_ta = ?, thu_tu = ?, trang_thai = ?
            WHERE id = ?
        `, [
            ten_dai_ly,
            slug,
            dia_chi,
            thanh_pho,
            vung_mien || 'Miền Nam',
            khu_vuc || thanh_pho,
            loai_dai_ly || 'Đại lý bán xe',
            so_dien_thoai || null,
            email || null,
            website || null,
            gio_lam_viec || null,
            google_map_url || null,
            map_embed_url || google_map_url || null,
            mo_ta || null,
            Number(thu_tu || 0),
            trang_thai || 'hien',
            req.params.id
        ]);
        parser.redirectWithMessage(res, '/admin/dai-ly', 'success', 'Đã cập nhật đại lý.');
    } catch (err) {
        console.log('Lỗi sửa đại lý:', err);
        parser.redirectWithMessage(res, '/admin/dai-ly', 'error', 'Không thể cập nhật đại lý.');
    }
};

exports.deleteDealer = async (req, res) => {
    try {
        await dbInit.ensureDealerTable();
        await dbp.query('DELETE FROM dai_ly WHERE id = ?', [req.params.id]);
        parser.redirectWithMessage(res, '/admin/dai-ly', 'success', 'Đã xóa đại lý.');
    } catch (err) {
        console.log('Lỗi xóa đại lý:', err);
        parser.redirectWithMessage(res, '/admin/dai-ly', 'error', 'Không thể xóa đại lý.');
    }
};

exports.getNews = async (req, res) => {
    try {
        const posts = await homeController.getNewsPostsData(false);
        res.render('admin/news', {
            title: 'Quản lý tin tức',
            posts,
            formatDateTime: parser.formatDateTime,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.log('Lỗi tải admin tin tức:', err);
        res.status(500).send('Không thể tải trang quản lý tin tức.');
    }
};

exports.addNews = async (req, res) => {
    if ((req.headers['content-type'] || '').includes('multipart/form-data')) {
        req.body = await parser.parseMultipartForm(req);
    }

    const { tieu_de, duong_dan, noi_dung, anh_dai_dien, tac_gia, trang_thai, mau_nen } = req.body;
    if (!tieu_de || !noi_dung) {
        return parser.redirectWithMessage(res, '/admin/tin-tuc', 'error', 'Vui lòng nhập tiêu đề và nội dung bài viết.');
    }

    try {
        await dbInit.ensureNewsTables();
        const slug = await parser.getUniqueSlug('tin_tuc', duong_dan || tieu_de);
        await dbp.query(`
            INSERT INTO tin_tuc (tieu_de, duong_dan, noi_dung, anh_dai_dien, tac_gia, mau_nen, xem_nhieu, hien_sidebar, ghim, trang_thai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            tieu_de,
            slug,
            noi_dung,
            anh_dai_dien || null,
            tac_gia || 'Showroom Double Anh',
            mau_nen || null,
            parser.isChecked(req.body.xem_nhieu) ? 1 : 0,
            parser.isChecked(req.body.hien_sidebar) ? 1 : 0,
            parser.isChecked(req.body.ghim) ? 1 : 0,
            trang_thai || 'hien'
        ]);
        await parser.cleanupOrphanImages();
        parser.redirectWithMessage(res, '/admin/tin-tuc', 'success', 'Đã đăng bài viết mới.');
    } catch (err) {
        console.log('Lỗi thêm tin tức:', err);
        parser.redirectWithMessage(res, '/admin/tin-tuc', 'error', 'Không thể đăng bài viết.');
    }
};

exports.editNews = async (req, res) => {
    if ((req.headers['content-type'] || '').includes('multipart/form-data')) {
        req.body = await parser.parseMultipartForm(req);
    }

    const { tieu_de, duong_dan, noi_dung, anh_dai_dien, current_image, tac_gia, trang_thai, mau_nen } = req.body;
    if (!tieu_de || !noi_dung) {
        return parser.redirectWithMessage(res, '/admin/tin-tuc', 'error', 'Vui lòng nhập đủ tiêu đề và nội dung khi sửa bài viết.');
    }

    try {
        await dbInit.ensureNewsTables();
        const slug = await parser.getUniqueSlug('tin_tuc', duong_dan || tieu_de, req.params.id);
        await dbp.query(`
            UPDATE tin_tuc
            SET tieu_de = ?, duong_dan = ?, noi_dung = ?, anh_dai_dien = ?, tac_gia = ?, mau_nen = ?, xem_nhieu = ?, hien_sidebar = ?, ghim = ?, trang_thai = ?
            WHERE id = ?
        `, [
            tieu_de,
            slug,
            noi_dung,
            anh_dai_dien || current_image || null,
            tac_gia || 'Showroom Double Anh',
            mau_nen || null,
            parser.isChecked(req.body.xem_nhieu) ? 1 : 0,
            parser.isChecked(req.body.hien_sidebar) ? 1 : 0,
            parser.isChecked(req.body.ghim) ? 1 : 0,
            trang_thai || 'hien',
            req.params.id
        ]);
        await parser.cleanupOrphanImages();
        parser.redirectWithMessage(res, '/admin/tin-tuc', 'success', 'Đã cập nhật bài viết.');
    } catch (err) {
        console.log('Lỗi sửa tin tức:', err);
        parser.redirectWithMessage(res, '/admin/tin-tuc', 'error', 'Không thể cập nhật bài viết.');
    }
};

exports.deleteNews = async (req, res) => {
    try {
        await dbInit.ensureNewsTables();
        await dbp.query('DELETE FROM binh_luan_tin WHERE tin_tuc_id = ?', [req.params.id]);
        await dbp.query('DELETE FROM like_tin WHERE tin_tuc_id = ?', [req.params.id]);
        await dbp.query('DELETE FROM tin_tuc WHERE id = ?', [req.params.id]);
        await parser.cleanupOrphanImages();
        parser.redirectWithMessage(res, '/admin/tin-tuc', 'success', 'Đã xóa bài viết.');
    } catch (err) {
        console.log('Lỗi xóa tin tức:', err);
        parser.redirectWithMessage(res, '/admin/tin-tuc', 'error', 'Không thể xóa bài viết.');
    }
};

exports.hideComment = async (req, res) => {
    try {
        await dbInit.ensureNewsTables();
        await dbp.query('UPDATE binh_luan_tin SET trang_thai = ? WHERE id = ?', ['an', req.params.id]);
        parser.redirectWithMessage(res, '/admin/tin-tuc', 'success', 'Đã ẩn bình luận.');
    } catch (err) {
        console.log('Lỗi ẩn bình luận:', err);
        parser.redirectWithMessage(res, '/admin/tin-tuc', 'error', 'Không thể ẩn bình luận.');
    }
};

exports.addCar = async (req, res) => {
    if ((req.headers['content-type'] || '').includes('multipart/form-data')) {
        req.body = await parser.parseMultipartForm(req);
    }

    let {
        dong_xe_id,
        ten_xe,
        duong_dan,
        phien_ban,
        nam_san_xuat,
        gia_ban,
        gia_niem_yet,
        slogan,
        mo_ta_ngan,
        mo_ta_chi_tiet,
        ebook_url,
        brochure_url,
        dong_co,
        hop_so,
        nhien_lieu,
        so_cho_ngoi,
        xuat_xu,
        bao_hanh,
        so_luong_ton,
        anh_dai_dien,
        anh_ngoai_that,
        anh_noi_that,
        danh_sach_anh,
        anh_360,
        danh_sach_mau,
        thong_so
    } = req.body;

    // Build combined thong_so from section fields
    const thong_so_combined = parser.buildSpecsFromSections(req.body) || thong_so;

    if (!dong_xe_id || !ten_xe || !gia_ban) {
        return res.redirect('/admin/xe?error=Vui long nhap dong xe, ten xe va gia ban');
    }

    const baseSlugSource = duong_dan || (phien_ban ? `${ten_xe}-${phien_ban}` : ten_xe);
    const slug = await parser.getUniqueSlug('xe', baseSlugSource);

    let conn = null;
    try {
        await dbInit.ensureCarDetailTables();
        conn = await dbp.getConnection();
        await conn.beginTransaction();

        const [result] = await conn.query(`
            INSERT INTO xe
            (dong_xe_id, ten_xe, duong_dan, phien_ban, nam_san_xuat, gia_ban, gia_niem_yet,
             slogan, mo_ta_ngan, mo_ta_chi_tiet, ebook_url, brochure_url, dong_co, hop_so, nhien_lieu, so_cho_ngoi, xuat_xu,
             bao_hanh, so_luong_ton, trang_thai, anh_360)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'con_hang', ?)
        `, [
            dong_xe_id, ten_xe, slug, phien_ban || null, nam_san_xuat || null, gia_ban,
            gia_niem_yet || gia_ban, slogan || null, mo_ta_ngan || null, mo_ta_chi_tiet || null,
            ebook_url || null, brochure_url || null, dong_co || null,
            hop_so || null, nhien_lieu || 'xang', so_cho_ngoi || null, xuat_xu || null,
            bao_hanh || null, so_luong_ton || 0, anh_360 || null
        ]);

        const carId = result.insertId;
        
        // Save avatar
        if (anh_dai_dien) {
            await conn.query(
                "INSERT INTO anh_xe (xe_id, duong_dan_anh, la_anh_dai_dien, thu_tu, nhom_anh) VALUES (?, ?, TRUE, 1, 'chung')",
                [carId, anh_dai_dien]
            );
        }

        // Save exterior
        const extImages = Array.isArray(req.body.anh_ngoai_that) ? req.body.anh_ngoai_that : [req.body.anh_ngoai_that].filter(Boolean);
        const extCaptions = Array.isArray(req.body.chu_thich_ngoai_that) ? req.body.chu_thich_ngoai_that : [req.body.chu_thich_ngoai_that];
        for (let index = 0; index < extImages.length; index += 1) {
            const caption = extCaptions[index] || null;
            await conn.query(
                "INSERT INTO anh_xe (xe_id, duong_dan_anh, la_anh_dai_dien, thu_tu, nhom_anh, chu_thich) VALUES (?, ?, FALSE, ?, 'ngoai_that', ?)",
                [carId, extImages[index], index + 2, caption]
            );
        }

        // Save interior
        const intImages = Array.isArray(req.body.anh_noi_that) ? req.body.anh_noi_that : [req.body.anh_noi_that].filter(Boolean);
        const intCaptions = Array.isArray(req.body.chu_thich_noi_that) ? req.body.chu_thich_noi_that : [req.body.chu_thich_noi_that];
        for (let index = 0; index < intImages.length; index += 1) {
            const caption = intCaptions[index] || null;
            await conn.query(
                "INSERT INTO anh_xe (xe_id, duong_dan_anh, la_anh_dai_dien, thu_tu, nhom_anh, chu_thich) VALUES (?, ?, FALSE, ?, 'noi_that', ?)",
                [carId, intImages[index], index + extImages.length + 2, caption]
            );
        }

        // Save legacy danh_sach_anh if any
        const extraImages = Array.isArray(danh_sach_anh) ? danh_sach_anh : parser.parseLines(danh_sach_anh);
        const legacyImages = extraImages.filter(Boolean);
        for (let index = 0; index < legacyImages.length; index += 1) {
            await conn.query(
                "INSERT INTO anh_xe (xe_id, duong_dan_anh, la_anh_dai_dien, thu_tu, nhom_anh) VALUES (?, ?, FALSE, ?, 'chung')",
                [carId, legacyImages[index], index + extImages.length + intImages.length + 2]
            );
        }

        const rotateImages = Array.isArray(anh_360) ? anh_360 : parser.parseLines(anh_360);
        for (let index = 0; index < rotateImages.length; index += 1) {
            if (!rotateImages[index]) continue;
            await conn.query(
                "INSERT INTO anh_xe_360 (xe_id, duong_dan_anh, thu_tu, nhom_360) VALUES (?, ?, ?, 'chung')",
                [carId, rotateImages[index], index + 1]
            );
        }

        const rotateImageSets = parser.parseCar360Sets(req.body.danh_sach_bo_anh_360);
        for (const set of rotateImageSets) {
            for (let index = 0; index < set.files.length; index += 1) {
                await conn.query(
                    'INSERT INTO anh_xe_360 (xe_id, duong_dan_anh, thu_tu, nhom_360) VALUES (?, ?, ?, ?)',
                    [carId, set.files[index], index + 1, set.nhom]
                );
            }
        }

        for (const color of parser.parseCarColors(danh_sach_mau)) {
            await conn.query(
                'INSERT INTO mau_xe (xe_id, ten_mau, ma_mau, anh_mau, gia_them, anh_360) VALUES (?, ?, ?, ?, ?, ?)',
                [carId, color.ten_mau, color.ma_mau, color.anh_mau, color.gia_them, color.anh_360]
            );
        }
        for (const spec of parser.parseCarSpecs(thong_so_combined)) {
            await conn.query(
                'INSERT INTO thong_so_ky_thuat (xe_id, ten_thong_so, gia_tri) VALUES (?, ?, ?)',
                [carId, spec.ten_thong_so, spec.gia_tri]
            );
        }
        for (const feature of parser.parseCarFeatures(req.body.dac_diem)) {
            await conn.query(
                'INSERT INTO dac_diem_xe (xe_id, nhom, tieu_de, mo_ta, anh, thu_tu) VALUES (?, ?, ?, ?, ?, ?)',
                [carId, feature.nhom, feature.tieu_de, feature.mo_ta, feature.anh, feature.thu_tu]
            );
        }

        await conn.commit();
        await parser.cleanupOrphanImages();
        res.redirect('/admin/xe?success=Da them xe moi');
    } catch (err) {
        if (conn) await conn.rollback();
        console.log('Loi them xe:', err);
        res.redirect('/admin/xe?error=Khong the them xe');
    } finally {
        if (conn) conn.release();
    }
};

exports.editCar = async (req, res) => {
    if ((req.headers['content-type'] || '').includes('multipart/form-data')) {
        req.body = await parser.parseMultipartForm(req);
    }

    let {
        dong_xe_id,
        ten_xe,
        duong_dan,
        phien_ban,
        nam_san_xuat,
        gia_ban,
        gia_niem_yet,
        slogan,
        mo_ta_ngan,
        mo_ta_chi_tiet,
        ebook_url,
        brochure_url,
        dong_co,
        hop_so,
        nhien_lieu,
        so_cho_ngoi,
        xuat_xu,
        bao_hanh,
        so_luong_ton,
        trang_thai,
        anh_dai_dien,
        anh_ngoai_that,
        anh_noi_that,
        danh_sach_anh,
        current_image,
        anh_360,
        danh_sach_mau,
        thong_so,
        dac_diem,
        replace_lists,
        replace_images
    } = req.body;

    // Build combined thong_so from section fields
    const thong_so_combined = parser.buildSpecsFromSections(req.body) || thong_so;

    if (!dong_xe_id || !ten_xe || !gia_ban) {
        return res.redirect('/admin/xe?error=Vui long nhap du thong tin bat buoc khi sua xe');
    }

    const baseSlugSource = duong_dan || (phien_ban ? `${ten_xe}-${phien_ban}` : ten_xe);
    const slug = await parser.getUniqueSlug('xe', baseSlugSource, req.params.id);

    let conn = null;
    try {
        await dbInit.ensureCarDetailTables();
        conn = await dbp.getConnection();
        await conn.beginTransaction();

        await conn.query(`
            UPDATE xe
            SET dong_xe_id = ?, ten_xe = ?, duong_dan = ?, phien_ban = ?, nam_san_xuat = ?,
                gia_ban = ?, gia_niem_yet = ?, slogan = ?, mo_ta_ngan = ?, mo_ta_chi_tiet = ?,
                ebook_url = ?, brochure_url = ?,
                dong_co = ?, hop_so = ?, nhien_lieu = ?, so_cho_ngoi = ?, xuat_xu = ?,
                bao_hanh = ?, so_luong_ton = ?, trang_thai = ?, anh_360 = ?
            WHERE id = ?
        `, [
            dong_xe_id,
            ten_xe,
            slug,
            phien_ban || null,
            nam_san_xuat || null,
            gia_ban,
            gia_niem_yet || gia_ban,
            slogan || null,
            mo_ta_ngan || null,
            mo_ta_chi_tiet || null,
            ebook_url || null,
            brochure_url || null,
            dong_co || null,
            hop_so || null,
            nhien_lieu || 'xang',
            so_cho_ngoi || null,
            xuat_xu || null,
            bao_hanh || null,
            so_luong_ton || 0,
            trang_thai || 'con_hang',
            anh_360 || null,
            req.params.id
        ]);

        const imageToSave = anh_dai_dien || current_image;
        if (imageToSave) {
            const [existingImages] = await conn.query(
                'SELECT id FROM anh_xe WHERE xe_id = ? AND la_anh_dai_dien = TRUE LIMIT 1',
                [req.params.id]
            );

            if (existingImages.length) {
                await conn.query(
                    'UPDATE anh_xe SET duong_dan_anh = ? WHERE id = ?',
                    [imageToSave, existingImages[0].id]
                );
            } else {
                await conn.query(
                    "INSERT INTO anh_xe (xe_id, duong_dan_anh, la_anh_dai_dien, thu_tu, nhom_anh) VALUES (?, ?, TRUE, 1, 'chung')",
                    [req.params.id, imageToSave]
                );
            }
        }

        // Check if admin chose to clear existing gallery
        if (parser.isChecked(replace_images)) {
            await conn.query("DELETE FROM anh_xe WHERE xe_id = ? AND la_anh_dai_dien = FALSE", [req.params.id]);
        }

        // Update captions for existing images (only run if they weren't deleted)
        if (!parser.isChecked(replace_images)) {
            for (const key of Object.keys(req.body)) {
                if (key.startsWith('chu_thich_anh_')) {
                    const imgId = key.replace('chu_thich_anh_', '');
                    const caption = req.body[key] || null;
                    await conn.query('UPDATE anh_xe SET chu_thich = ? WHERE id = ?', [caption, imgId]);
                }
            }
        }

        // Get max order to append photos
        const [orderRows] = await conn.query(
            'SELECT COALESCE(MAX(thu_tu), 0) AS max_order FROM anh_xe WHERE xe_id = ?',
            [req.params.id]
        );
        let nextOrder = Number(orderRows[0].max_order || 0) + 1;

        // Save new exterior uploads
        const extImages = Array.isArray(req.body.anh_ngoai_that) ? req.body.anh_ngoai_that : [req.body.anh_ngoai_that].filter(Boolean);
        const extCaptions = Array.isArray(req.body.chu_thich_ngoai_that) ? req.body.chu_thich_ngoai_that : [req.body.chu_thich_ngoai_that];
        for (let index = 0; index < extImages.length; index += 1) {
            const caption = extCaptions[index] || null;
            await conn.query(
                "INSERT INTO anh_xe (xe_id, duong_dan_anh, la_anh_dai_dien, thu_tu, nhom_anh, chu_thich) VALUES (?, ?, FALSE, ?, 'ngoai_that', ?)",
                [req.params.id, extImages[index], nextOrder, caption]
            );
            nextOrder += 1;
        }

        // Save new interior uploads
        const intImages = Array.isArray(req.body.anh_noi_that) ? req.body.anh_noi_that : [req.body.anh_noi_that].filter(Boolean);
        const intCaptions = Array.isArray(req.body.chu_thich_noi_that) ? req.body.chu_thich_noi_that : [req.body.chu_thich_noi_that];
        for (let index = 0; index < intImages.length; index += 1) {
            const caption = intCaptions[index] || null;
            await conn.query(
                "INSERT INTO anh_xe (xe_id, duong_dan_anh, la_anh_dai_dien, thu_tu, nhom_anh, chu_thich) VALUES (?, ?, FALSE, ?, 'noi_that', ?)",
                [req.params.id, intImages[index], nextOrder, caption]
            );
            nextOrder += 1;
        }

        // Save legacy danh_sach_anh if any
        const extraImages = Array.isArray(danh_sach_anh) ? danh_sach_anh : parser.parseLines(danh_sach_anh);
        const newExtraImages = extraImages.filter(Boolean);
        for (const imgName of newExtraImages) {
            await conn.query(
                "INSERT INTO anh_xe (xe_id, duong_dan_anh, la_anh_dai_dien, thu_tu, nhom_anh) VALUES (?, ?, FALSE, ?, 'chung')",
                [req.params.id, imgName, nextOrder]
            );
            nextOrder += 1;
        }

        const rotateImages = Array.isArray(anh_360) ? anh_360 : parser.parseLines(anh_360);
        const newRotateFrames = rotateImages.filter(Boolean);
        if (newRotateFrames.length) {
            const [orderRows] = await conn.query(
                'SELECT COALESCE(MAX(thu_tu), 0) AS max_order FROM anh_xe_360 WHERE xe_id = ?',
                [req.params.id]
            );
            let nextOrder = Number(orderRows[0].max_order || 0) + 1;

            for (const frame of newRotateFrames) {
                await conn.query(
                    "INSERT INTO anh_xe_360 (xe_id, duong_dan_anh, thu_tu, nhom_360) VALUES (?, ?, ?, 'chung')",
                    [req.params.id, frame, nextOrder]
                );
                nextOrder += 1;
            }
        }

        // Always update colors, specs, features, and custom 360 sets when editing
        await conn.query("DELETE FROM anh_xe_360 WHERE xe_id = ? AND nhom_360 != 'chung'", [req.params.id]);
        await conn.query('DELETE FROM mau_xe WHERE xe_id = ?', [req.params.id]);
        await conn.query('DELETE FROM thong_so_ky_thuat WHERE xe_id = ?', [req.params.id]);
        await conn.query('DELETE FROM dac_diem_xe WHERE xe_id = ?', [req.params.id]);

        for (const color of parser.parseCarColors(danh_sach_mau)) {
            await conn.query(
                'INSERT INTO mau_xe (xe_id, ten_mau, ma_mau, anh_mau, gia_them, anh_360) VALUES (?, ?, ?, ?, ?, ?)',
                [req.params.id, color.ten_mau, color.ma_mau, color.anh_mau, color.gia_them, color.anh_360]
            );
        }

        const rotateImageSets = parser.parseCar360Sets(req.body.danh_sach_bo_anh_360);
        for (const set of rotateImageSets) {
            for (let index = 0; index < set.files.length; index += 1) {
                await conn.query(
                    'INSERT INTO anh_xe_360 (xe_id, duong_dan_anh, thu_tu, nhom_360) VALUES (?, ?, ?, ?)',
                    [req.params.id, set.files[index], index + 1, set.nhom]
                );
            }
        }
        for (const spec of parser.parseCarSpecs(thong_so_combined)) {
            await conn.query(
                'INSERT INTO thong_so_ky_thuat (xe_id, ten_thong_so, gia_tri) VALUES (?, ?, ?)',
                [req.params.id, spec.ten_thong_so, spec.gia_tri]
            );
        }
        for (const feature of parser.parseCarFeatures(dac_diem)) {
            await conn.query(
                'INSERT INTO dac_diem_xe (xe_id, nhom, tieu_de, mo_ta, anh, thu_tu) VALUES (?, ?, ?, ?, ?, ?)',
                [req.params.id, feature.nhom, feature.tieu_de, feature.mo_ta, feature.anh, feature.thu_tu]
            );
        }

        await conn.commit();
        await parser.cleanupOrphanImages();
        res.redirect('/admin/xe?success=Da cap nhat thong tin xe');
    } catch (err) {
        if (conn) await conn.rollback();
        console.log('Loi sua xe:', err);
        res.redirect('/admin/xe?error=Khong the cap nhat xe');
    } finally {
        if (conn) conn.release();
    }
};

exports.deleteCar = async (req, res) => {
    let conn = null;
    try {
        await dbInit.ensureCarDetailTables();
        conn = await dbp.getConnection();
        await conn.beginTransaction();

        await conn.query('DELETE FROM dac_diem_xe WHERE xe_id = ?', [req.params.id]);
        await conn.query('DELETE FROM anh_xe_360 WHERE xe_id = ?', [req.params.id]);
        await conn.query('DELETE FROM thong_so_ky_thuat WHERE xe_id = ?', [req.params.id]);
        await conn.query('DELETE FROM mau_xe WHERE xe_id = ?', [req.params.id]);
        await conn.query('DELETE FROM anh_xe WHERE xe_id = ?', [req.params.id]);
        await conn.query('DELETE FROM xe WHERE id = ?', [req.params.id]);

        await conn.commit();
        await parser.cleanupOrphanImages();
        res.redirect('/admin/xe?success=Da xoa xe');
    } catch (err) {
        if (conn) await conn.rollback();
        console.log('Loi xoa xe:', err);
        res.redirect('/admin/xe?error=Khong the xoa xe. Co the xe dang duoc lien ket voi don hang hoac du lieu khac');
    } finally {
        if (conn) conn.release();
    }
};

// ===================== QUAN LY BO ANH 360 =====================

exports.getAnh360 = async (req, res) => {
    try {
        await dbInit.ensureBo360SetsTable();
        const [sets] = await dbp.query('SELECT * FROM bo_anh_360 ORDER BY ngay_cap_nhat DESC');
        const imageFiles = parser.listImageFiles();
        res.render('admin/anh360', {
            title: 'Quản lý bộ ảnh 360 độ',
            sets,
            imageFiles,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.log('Loi tai trang anh 360:', err);
        res.status(500).send('Khong the tai trang quan ly anh 360.');
    }
};

exports.addAnh360Set = async (req, res) => {
    if ((req.headers['content-type'] || '').includes('multipart/form-data')) {
        req.body = await parser.parseMultipartForm(req);
    }
    const { ten_bo_anh, danh_sach_anh } = req.body;
    if (!ten_bo_anh || !ten_bo_anh.trim()) {
        return parser.redirectWithMessage(res, '/admin/anh-360', 'error', 'Vui long nhap ten bo anh.');
    }
    try {
        await dbInit.ensureBo360SetsTable();
        await dbp.query(
            'INSERT INTO bo_anh_360 (ten_bo_anh, danh_sach_anh) VALUES (?, ?)',
            [ten_bo_anh.trim(), danh_sach_anh || '']
        );
        await parser.cleanupOrphanImages();
        parser.redirectWithMessage(res, '/admin/anh-360', 'success', 'Da tao bo anh 360 moi.');
    } catch (err) {
        console.log('Loi them bo anh 360:', err);
        parser.redirectWithMessage(res, '/admin/anh-360', 'error', 'Khong the tao bo anh.');
    }
};

exports.editAnh360Set = async (req, res) => {
    if ((req.headers['content-type'] || '').includes('multipart/form-data')) {
        req.body = await parser.parseMultipartForm(req);
    }
    const { ten_bo_anh, danh_sach_anh } = req.body;
    if (!ten_bo_anh || !ten_bo_anh.trim()) {
        return parser.redirectWithMessage(res, '/admin/anh-360', 'error', 'Vui long nhap ten bo anh.');
    }
    try {
        await dbInit.ensureBo360SetsTable();
        await dbp.query(
            'UPDATE bo_anh_360 SET ten_bo_anh = ?, danh_sach_anh = ? WHERE id = ?',
            [ten_bo_anh.trim(), danh_sach_anh || '', req.params.id]
        );
        await parser.cleanupOrphanImages();
        parser.redirectWithMessage(res, '/admin/anh-360', 'success', 'Da cap nhat bo anh 360.');
    } catch (err) {
        console.log('Loi sua bo anh 360:', err);
        parser.redirectWithMessage(res, '/admin/anh-360', 'error', 'Khong the cap nhat bo anh.');
    }
};

exports.deleteAnh360Set = async (req, res) => {
    try {
        await dbInit.ensureBo360SetsTable();
        await dbp.query('DELETE FROM bo_anh_360 WHERE id = ?', [req.params.id]);
        await parser.cleanupOrphanImages();
        parser.redirectWithMessage(res, '/admin/anh-360', 'success', 'Da xoa bo anh 360.');
    } catch (err) {
        console.log('Loi xoa bo anh 360:', err);
        parser.redirectWithMessage(res, '/admin/anh-360', 'error', 'Khong the xoa bo anh.');
    }
};

exports.getAnh360ApiAll = async (req, res) => {
    try {
        await dbInit.ensureBo360SetsTable();
        const [sets] = await dbp.query('SELECT id, ten_bo_anh, danh_sach_anh FROM bo_anh_360 ORDER BY ten_bo_anh ASC');
        res.json(sets);
    } catch (err) {
        res.status(500).json({ error: 'Loi lay danh sach bo anh 360' });
    }
};

// API: Upload nhiều ảnh từ máy tính lên /public/images/
exports.uploadImages360 = async (req, res) => {
    try {
        const parsed = await parser.parseMultipartForm(req);
        // Collect saved file names (may be array or single string)
        let savedFiles = parsed['files'] || parsed['file'] || [];
        if (!Array.isArray(savedFiles)) savedFiles = [savedFiles].filter(Boolean);
        if (!savedFiles.length) {
            return res.status(400).json({ error: 'Khong co file nao duoc upload.' });
        }
        res.json({ files: savedFiles });
    } catch (err) {
        console.log('Loi upload anh 360:', err);
        res.status(500).json({ error: 'Loi upload file: ' + err.message });
    }
};
