const db = require('../config/database');
const dbp = db.promise();

async function ensureColumn(tableName, columnName, definition) {
    const [columns] = await dbp.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
            AND COLUMN_NAME = ?
        LIMIT 1
    `, [tableName, columnName]);

    if (!columns.length) {
        try {
            await dbp.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
        } catch (err) {
            if (err.code !== 'ER_DUP_FIELDNAME') throw err;
        }
    }
}

async function ensureDealerTable() {
    await dbp.query(`
        CREATE TABLE IF NOT EXISTS dai_ly (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ten_dai_ly VARCHAR(255) NOT NULL,
            duong_dan VARCHAR(255) NOT NULL UNIQUE,
            dia_chi VARCHAR(500) NOT NULL,
            thanh_pho VARCHAR(120) NOT NULL,
            so_dien_thoai VARCHAR(40),
            email VARCHAR(160),
            gio_lam_viec VARCHAR(160),
            google_map_url TEXT,
            mo_ta TEXT,
            thu_tu INT DEFAULT 0,
            trang_thai ENUM('hien', 'an') DEFAULT 'hien',
            ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
            ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_dai_ly_trang_thai (trang_thai),
            INDEX idx_dai_ly_thanh_pho (thanh_pho)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    await ensureColumn('dai_ly', 'vung_mien', "VARCHAR(120) DEFAULT 'Miền Nam'");
    await ensureColumn('dai_ly', 'khu_vuc', 'VARCHAR(120)');
    await ensureColumn('dai_ly', 'loai_dai_ly', "VARCHAR(120) DEFAULT 'Đại lý bán xe'");
    await ensureColumn('dai_ly', 'website', 'VARCHAR(255)');
    await ensureColumn('dai_ly', 'map_embed_url', 'TEXT');
    
    await dbp.query(`
        UPDATE dai_ly
        SET
            vung_mien = COALESCE(NULLIF(vung_mien, ''), 'Miền Nam'),
            khu_vuc = COALESCE(NULLIF(khu_vuc, ''), thanh_pho),
            loai_dai_ly = COALESCE(NULLIF(loai_dai_ly, ''), 'Đại lý bán xe')
    `);

    const [rows] = await dbp.query('SELECT COUNT(*) AS total FROM dai_ly');
    if (Number(rows[0].total) === 0) {
        await dbp.query(`
            INSERT INTO dai_ly
            (ten_dai_ly, duong_dan, dia_chi, thanh_pho, vung_mien, khu_vuc, loai_dai_ly, so_dien_thoai, email, website, gio_lam_viec, google_map_url, map_embed_url, mo_ta, thu_tu, trang_thai)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'hien'),
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2, 'hien')
        `, [
            'Showroom Double Anh Hà Nội',
            'showroom-double-anh-ha-noi',
            '12 Trần Duy Hưng, Cầu Giấy',
            'Hà Nội',
            'Miền Bắc',
            'Hà Nội',
            'Đại lý bán xe',
            '0900 000 001',
            'hanoi@doubleanh.vn',
            'https://doubleanh.vn',
            '08:00 - 19:00, Thứ 2 đến Chủ nhật',
            'https://www.google.com/maps?q=12%20Tran%20Duy%20Hung%20Ha%20Noi&output=embed',
            'https://www.google.com/maps?q=12%20Tran%20Duy%20Hung%20Ha%20Noi&output=embed',
            'Đại lý trưng bày xe mới, tư vấn trả góp, đăng ký lái thử và hỗ trợ sau bán hàng tại khu vực miền Bắc.',
            'Showroom Double Anh TP. Hồ Chí Minh',
            'showroom-double-anh-tp-ho-chi-minh',
            '88 Nguyễn Văn Trỗi, Phú Nhuận',
            'TP. Hồ Chí Minh',
            'Miền Nam',
            'TP. Hồ Chí Minh',
            'Đại lý bán xe',
            '0900 000 002',
            'hcm@doubleanh.vn',
            'https://doubleanh.vn',
            '08:00 - 19:30, Thứ 2 đến Chủ nhật',
            'https://www.google.com/maps?q=88%20Nguyen%20Van%20Troi%20Phu%20Nhuan%20Ho%20Chi%20Minh&output=embed',
            'https://www.google.com/maps?q=88%20Nguyen%20Van%20Troi%20Phu%20Nhuan%20Ho%20Chi%20Minh&output=embed',
            'Điểm bán xe và chăm sóc khách hàng tại khu vực miền Nam, có khu vực tiếp khách và tư vấn cấu hình xe.'
        ]);
    }
}

async function ensureCar360Table() {
    await dbp.query(`
        CREATE TABLE IF NOT EXISTS anh_xe_360 (
            id INT AUTO_INCREMENT PRIMARY KEY,
            xe_id INT NOT NULL,
            duong_dan_anh VARCHAR(255) NOT NULL,
            thu_tu INT DEFAULT 0,
            ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_anh_xe_360_xe_id (xe_id)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
}

async function ensureCarDetailTables() {
    await ensureCar360Table();
    await ensureColumn('anh_xe_360', 'nhom_360', "VARCHAR(100) DEFAULT 'chung'");
    await ensureColumn('xe', 'slogan', 'VARCHAR(255)');
    await ensureColumn('xe', 'ebook_url', 'VARCHAR(500)');
    await ensureColumn('xe', 'brochure_url', 'VARCHAR(500)');
    await ensureColumn('xe', 'anh_360', 'VARCHAR(255) DEFAULT NULL');
    await ensureColumn('anh_xe', 'nhom_anh', "VARCHAR(50) DEFAULT 'chung'");
    await ensureColumn('anh_xe', 'chu_thich', "VARCHAR(500) DEFAULT NULL");
    await ensureColumn('mau_xe', 'anh_360', 'TEXT DEFAULT NULL');

    // Đảm bảo cột mô tả ngắn có dung lượng không giới hạn
    try {
        await dbp.query('ALTER TABLE xe MODIFY COLUMN mo_ta_ngan TEXT DEFAULT NULL');
    } catch (err) {
        console.log('Bypass mo_ta_ngan column type adjustment:', err.message);
    }

    await dbp.query(`
        CREATE TABLE IF NOT EXISTS dac_diem_xe (
            id INT AUTO_INCREMENT PRIMARY KEY,
            xe_id INT NOT NULL,
            nhom VARCHAR(80) DEFAULT 'noi_bat',
            tieu_de VARCHAR(255) NOT NULL,
            mo_ta TEXT,
            anh VARCHAR(255),
            thu_tu INT DEFAULT 0,
            ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_dac_diem_xe_xe_id (xe_id)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
}

async function ensureVehicleTypeOptions() {
    const vehicleTypes = [
        'Sedan',
        'SUV',
        'Crossover',
        'Hatchback',
        'MPV',
        'Pickup',
        'Coupe',
        'Convertible'
    ];

    const [brandRows] = await dbp.query('SELECT id FROM hang_xe WHERE ten_hang = ? LIMIT 1', ['Phân loại xe']);
    let categoryBrandId = brandRows[0]?.id;
    if (!categoryBrandId) {
        const [brandResult] = await dbp.query('INSERT INTO hang_xe (ten_hang) VALUES (?)', ['Phân loại xe']);
        categoryBrandId = brandResult.insertId;
    }

    for (const typeName of vehicleTypes) {
        const [typeRows] = await dbp.query('SELECT id FROM loai_xe WHERE ten_loai = ? LIMIT 1', [typeName]);
        let typeId = typeRows[0]?.id;
        if (!typeId) {
            const [typeResult] = await dbp.query('INSERT INTO loai_xe (ten_loai) VALUES (?)', [typeName]);
            typeId = typeResult.insertId;
        }

        const [modelRows] = await dbp.query('SELECT id FROM dong_xe WHERE loai_xe_id = ? LIMIT 1', [typeId]);
        if (!modelRows.length) {
            await dbp.query(
                'INSERT INTO dong_xe (hang_xe_id, loai_xe_id, ten_dong) VALUES (?, ?, ?)',
                [categoryBrandId, typeId, typeName]
            );
        }
    }
}

async function ensureCustomerRequestTables() {
    await dbp.query(`
        CREATE TABLE IF NOT EXISTS yeu_cau_bao_gia (
            id INT AUTO_INCREMENT PRIMARY KEY,
            xe_id INT NOT NULL,
            ho_ten VARCHAR(160) NOT NULL,
            email VARCHAR(160) NOT NULL,
            so_dien_thoai VARCHAR(40) NOT NULL,
            thanh_pho VARCHAR(160) NOT NULL,
            noi_dung TEXT,
            dong_y_tiep_thi TINYINT(1) DEFAULT 0,
            trang_thai ENUM('moi', 'dang_xu_ly', 'da_lien_he', 'hoan_tat', 'huy') DEFAULT 'moi',
            ghi_chu_admin TEXT,
            ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
            ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_bao_gia_xe_id (xe_id),
            INDEX idx_bao_gia_trang_thai (trang_thai)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    await ensureColumn('yeu_cau_bao_gia', 'xe_id', 'INT NOT NULL');
    await ensureColumn('yeu_cau_bao_gia', 'ho_ten', 'VARCHAR(160) NOT NULL');
    await ensureColumn('yeu_cau_bao_gia', 'email', 'VARCHAR(160) NOT NULL');
    await ensureColumn('yeu_cau_bao_gia', 'so_dien_thoai', 'VARCHAR(40) NOT NULL');
    await ensureColumn('yeu_cau_bao_gia', 'thanh_pho', 'VARCHAR(160) NOT NULL');
    await ensureColumn('yeu_cau_bao_gia', 'noi_dung', 'TEXT');
    await ensureColumn('yeu_cau_bao_gia', 'dong_y_tiep_thi', 'TINYINT(1) DEFAULT 0');
    await ensureColumn('yeu_cau_bao_gia', 'trang_thai', "ENUM('moi', 'dang_xu_ly', 'da_lien_he', 'hoan_tat', 'huy') DEFAULT 'moi'");
    await ensureColumn('yeu_cau_bao_gia', 'ghi_chu_admin', 'TEXT');
    await ensureColumn('yeu_cau_bao_gia', 'lich_su_xu_ly', 'TEXT DEFAULT NULL');
    await ensureColumn('yeu_cau_bao_gia', 'ngay_tao', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    await ensureColumn('yeu_cau_bao_gia', 'ngay_cap_nhat', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    await dbp.query(`
        CREATE TABLE IF NOT EXISTS lich_lai_thu (
            id INT AUTO_INCREMENT PRIMARY KEY,
            xe_id INT NOT NULL,
            ho_ten VARCHAR(160) NOT NULL,
            email VARCHAR(160) NOT NULL,
            so_dien_thoai VARCHAR(40) NOT NULL,
            thanh_pho VARCHAR(160) NOT NULL,
            dai_ly VARCHAR(220) NOT NULL,
            ngay_muon_lai DATE,
            gio_muon_lai TIME,
            dong_y_tiep_thi TINYINT(1) DEFAULT 0,
            trang_thai ENUM('moi', 'dang_xu_ly', 'da_xac_nhan', 'hoan_tat', 'huy') DEFAULT 'moi',
            ghi_chu_admin TEXT,
            ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
            ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_lai_thu_xe_id (xe_id),
            INDEX idx_lai_thu_trang_thai (trang_thai)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    await ensureColumn('lich_lai_thu', 'xe_id', 'INT NOT NULL');
    await ensureColumn('lich_lai_thu', 'ho_ten', 'VARCHAR(160) NOT NULL');
    await ensureColumn('lich_lai_thu', 'email', 'VARCHAR(160) NOT NULL');
    await ensureColumn('lich_lai_thu', 'so_dien_thoai', 'VARCHAR(40) NOT NULL');
    await ensureColumn('lich_lai_thu', 'thanh_pho', 'VARCHAR(160) NOT NULL');
    await ensureColumn('lich_lai_thu', 'dai_ly', 'VARCHAR(220) NOT NULL');
    await ensureColumn('lich_lai_thu', 'ngay_muon_lai', 'DATE');
    await ensureColumn('lich_lai_thu', 'gio_muon_lai', 'TIME');
    await ensureColumn('lich_lai_thu', 'dong_y_tiep_thi', 'TINYINT(1) DEFAULT 0');
    await ensureColumn('lich_lai_thu', 'trang_thai', "ENUM('moi', 'dang_xu_ly', 'da_xac_nhan', 'hoan_tat', 'huy') DEFAULT 'moi'");
    await ensureColumn('lich_lai_thu', 'ghi_chu_admin', 'TEXT');
    await ensureColumn('lich_lai_thu', 'lich_su_xu_ly', 'TEXT DEFAULT NULL');
    await ensureColumn('lich_lai_thu', 'ngay_tao', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    await ensureColumn('lich_lai_thu', 'ngay_cap_nhat', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
}

async function ensureNewsTables() {
    await dbp.query(`
        CREATE TABLE IF NOT EXISTS tin_tuc (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tieu_de VARCHAR(255) NOT NULL,
            duong_dan VARCHAR(255) NOT NULL UNIQUE,
            noi_dung LONGTEXT NOT NULL,
            anh_dai_dien VARCHAR(255),
            tac_gia VARCHAR(120) DEFAULT 'Showroom Double Anh',
            ghim TINYINT(1) DEFAULT 0,
            trang_thai ENUM('nhap', 'hien', 'an') DEFAULT 'hien',
            ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
            ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_tin_tuc_trang_thai (trang_thai),
            INDEX idx_tin_tuc_ghim (ghim)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    await ensureColumn('tin_tuc', 'duong_dan', 'VARCHAR(255)');
    await ensureColumn('tin_tuc', 'noi_dung', 'LONGTEXT');
    await ensureColumn('tin_tuc', 'anh_dai_dien', 'VARCHAR(255)');
    await ensureColumn('tin_tuc', 'tac_gia', "VARCHAR(120) DEFAULT 'Showroom Double Anh'");
    await ensureColumn('tin_tuc', 'mau_nen', 'VARCHAR(40)');
    await ensureColumn('tin_tuc', 'xem_nhieu', 'TINYINT(1) DEFAULT 0');
    await ensureColumn('tin_tuc', 'hien_sidebar', 'TINYINT(1) DEFAULT 0');
    await ensureColumn('tin_tuc', 'ghim', 'TINYINT(1) DEFAULT 0');
    await ensureColumn('tin_tuc', 'trang_thai', "ENUM('nhap', 'hien', 'an') DEFAULT 'hien'");
    await ensureColumn('tin_tuc', 'ngay_tao', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    await ensureColumn('tin_tuc', 'ngay_cap_nhat', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    try {
        await dbp.query(`
            ALTER TABLE tin_tuc
            MODIFY COLUMN trang_thai ENUM('nhap', 'da_dang', 'hien', 'an') DEFAULT 'hien'
        `);
        await dbp.query(`
            UPDATE tin_tuc
            SET trang_thai = 'hien'
            WHERE trang_thai = 'da_dang' OR trang_thai = ''
        `);
        await dbp.query(`
            ALTER TABLE tin_tuc
            MODIFY COLUMN trang_thai ENUM('nhap', 'hien', 'an') DEFAULT 'hien'
        `);
        // Modify column type for existing tables
        await dbp.query(`
            ALTER TABLE tin_tuc
            MODIFY COLUMN noi_dung LONGTEXT NOT NULL
        `);
    } catch (err) {
        console.log('Tin tuc schema update non-critical bypass:', err.message);
    }

    await dbp.query(`
        CREATE TABLE IF NOT EXISTS like_tin (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tin_tuc_id INT NOT NULL,
            dia_chi_ip VARCHAR(64) NOT NULL,
            ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_like_tin_ip (tin_tuc_id, dia_chi_ip),
            INDEX idx_like_tin_tin_tuc_id (tin_tuc_id)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    await dbp.query(`
        CREATE TABLE IF NOT EXISTS binh_luan_tin (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tin_tuc_id INT NOT NULL,
            ten_nguoi_binh_luan VARCHAR(120) NOT NULL,
            email VARCHAR(160),
            noi_dung TEXT NOT NULL,
            trang_thai ENUM('hien', 'an') DEFAULT 'hien',
            ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_binh_luan_tin_tin_tuc_id (tin_tuc_id),
            INDEX idx_binh_luan_tin_trang_thai (trang_thai)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    const [posts] = await dbp.query('SELECT COUNT(*) AS total FROM tin_tuc');
    if (Number(posts[0].total) === 0) {
        await dbp.query(`
            INSERT INTO tin_tuc (tieu_de, duong_dan, noi_dung, anh_dai_dien, tac_gia, ghim, trang_thai)
            VALUES (?, ?, ?, ?, ?, 1, 'hien')
        `, [
            'Showroom Double Anh mở lịch lái thử cuối tuần',
            'showroom-double-anh-mo-lich-lai-thu-cuoi-tuan',
            'Showroom Double Anh mở lịch lái thử cho các mẫu xe đang có sẵn trong kho. Khách hàng có thể chọn khung giờ, đại lý gần nhất và mẫu xe muốn trải nghiệm.\n\nĐội ngũ tư vấn sẽ hỗ trợ thông tin giá bán, chi phí lăn bánh, phương án trả góp và các ưu đãi đang áp dụng.',
            'panel2.jpg',
            'Showroom Double Anh'
        ]);
    }
}

async function ensurePanelTable() {
    await dbp.query(`
        CREATE TABLE IF NOT EXISTS panel_anh (
            id INT AUTO_INCREMENT PRIMARY KEY,
            duong_dan_anh VARCHAR(255) NOT NULL,
            thu_tu INT DEFAULT 0,
            trang_thai ENUM('hien', 'an') DEFAULT 'hien',
            ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
            ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
}

async function ensureBo360SetsTable() {
    await dbp.query(`
        CREATE TABLE IF NOT EXISTS bo_anh_360 (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ten_bo_anh VARCHAR(255) NOT NULL,
            danh_sach_anh TEXT,
            ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
            ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_bo_anh_360_ten (ten_bo_anh)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
}

module.exports = {
    ensureColumn,
    ensureDealerTable,
    ensureCar360Table,
    ensureCarDetailTables,
    ensureVehicleTypeOptions,
    ensureCustomerRequestTables,
    ensureNewsTables,
    ensurePanelTable,
    ensureBo360SetsTable
};
