const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../config/database');
const dbp = db.promise();

// Predefined spec sections for admin UI
const SPEC_SECTIONS = [
    { key: 'spec_dong_co',    name: 'Dộng cơ & Tính năng Vận hành' },
    { key: 'spec_dan_dong',   name: 'Hệ thống dẫn động' },
    { key: 'spec_kich_thuoc', name: 'Kích thước' },
    { key: 'spec_banh_xe',    name: 'Bánh xe' },
    { key: 'spec_giai_tri',   name: 'Hệ thống giải trí' },
    { key: 'spec_ghe_ngoi',   name: 'Ghế ngồi' },
];

function formatPrice(value) {
    return Number(value || 0).toLocaleString('vi-VN') + ' VND';
}

function listImageFiles() {
    const imageDir = path.join(__dirname, '..', 'public', 'images');
    try {
        return fs.readdirSync(imageDir)
            .filter((file) => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
            .sort((a, b) => a.localeCompare(b));
    } catch (err) {
        console.log('Loi doc thu muc anh:', err);
        return [];
    }
}

function sanitizeFileName(fileName, buffer) {
    const ext = path.extname(fileName).toLowerCase();
    let hashName;
    if (buffer && buffer.length) {
        hashName = crypto.createHash('md5').update(buffer).digest('hex');
    } else {
        const randomStr = Math.random().toString(36).substring(2, 6);
        hashName = `${Date.now()}-${randomStr}`;
    }
    return `${hashName}${ext}`;
}

function splitBuffer(buffer, delimiter) {
    const parts = [];
    let start = 0;
    let index = buffer.indexOf(delimiter, start);

    while (index !== -1) {
        parts.push(buffer.subarray(start, index));
        start = index + delimiter.length;
        index = buffer.indexOf(delimiter, start);
    }

    parts.push(buffer.subarray(start));
    return parts;
}

function parseMultipartForm(req) {
    return new Promise((resolve, reject) => {
        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=(.+)$/);
        if (!boundaryMatch) return resolve(req.body || {});

        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('error', reject);
        req.on('end', () => {
            const body = {};
            const buffer = Buffer.concat(chunks);
            const boundary = Buffer.from(`--${boundaryMatch[1]}`);
            const imageDir = path.join(__dirname, '..', 'public', 'images');

            splitBuffer(buffer, boundary).forEach((rawPart) => {
                let part = rawPart;
                if (part.length < 8) return;
                if (part.subarray(0, 2).toString() === '\r\n') part = part.subarray(2);
                if (part.subarray(part.length - 2).toString() === '\r\n') part = part.subarray(0, part.length - 2);
                if (part.toString('utf8').startsWith('--')) return;

                const separator = Buffer.from('\r\n\r\n');
                const separatorIndex = part.indexOf(separator);
                if (separatorIndex === -1) return;

                const headerText = part.subarray(0, separatorIndex).toString('utf8');
                let value = part.subarray(separatorIndex + separator.length);
                if (value.subarray(value.length - 2).toString() === '\r\n') value = value.subarray(0, value.length - 2);

                const nameMatch = headerText.match(/name="([^"]+)"/);
                if (!nameMatch) return;
                const fieldName = nameMatch[1];
                const fileNameMatch = headerText.match(/filename="([^"]*)"/);

                if (fileNameMatch) {
                    const originalName = fileNameMatch[1];
                    if (!originalName || !value.length) return;
                    const savedName = sanitizeFileName(originalName, value);
                    // Tạo thư mục nếu chưa tồn tại
                    if (!fs.existsSync(imageDir)) {
                        fs.mkdirSync(imageDir, { recursive: true });
                    }
                    const destPath = path.join(imageDir, savedName);
                    if (!fs.existsSync(destPath)) {
                        fs.writeFileSync(destPath, value);
                    }
                    if (body[fieldName]) {
                        body[fieldName] = Array.isArray(body[fieldName])
                            ? [...body[fieldName], savedName]
                            : [body[fieldName], savedName];
                    } else {
                        body[fieldName] = savedName;
                    }
                    return;
                }

                body[fieldName] = value.toString('utf8');
            });

            resolve(body);
        });
    });
}

function parseLines(value) {
    return String(value || '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
}

function parseCarSpecs(value) {
    return parseLines(value).map((line) => {
        // [Section Header] line
        if (line.startsWith('[') && line.endsWith(']')) {
            return {
                ten_thong_so: line.slice(1, -1).trim(),
                gia_tri: '__SECTION__'
            };
        }
        // Key: Value line
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
            return {
                ten_thong_so: line.slice(0, colonIndex).trim(),
                gia_tri: line.slice(colonIndex + 1).trim() || '__BULLET__'
            };
        }
        // Bullet-only line (no colon)
        return {
            ten_thong_so: line.trim(),
            gia_tri: '__BULLET__'
        };
    }).filter((item) => item && item.ten_thong_so);
}

function parseCarColors(value) {
    return parseLines(value).map((line) => {
        const [ten_mau, ma_mau, anh_mau, gia_them, anh_360] = line.split('|').map((part) => (part || '').trim());
        return {
            ten_mau,
            ma_mau: ma_mau || '#ffffff',
            anh_mau: anh_mau || null,
            gia_them: Number(gia_them || 0),
            anh_360: anh_360 || null
        };
    }).filter((item) => item.ten_mau);
}

function parseCarFeatures(value) {
    return parseLines(value).map((line, index) => {
        const [nhom, tieu_de, mo_ta, anh] = line.split('|').map((part) => (part || '').trim());
        return {
            nhom: nhom || 'noi_bat',
            tieu_de,
            mo_ta,
            anh: anh || null,
            thu_tu: index + 1
        };
    }).filter((item) => item.tieu_de);
}

function specsToTextarea(specs = []) {
    return specs.map((spec) => {
        if (spec.gia_tri === '__SECTION__') return `[${spec.ten_thong_so}]`;
        if (spec.gia_tri === '__BULLET__' || !spec.gia_tri) return spec.ten_thong_so;
        return `${spec.ten_thong_so}: ${spec.gia_tri}`;
    }).join('\n');
}

// Convert DB specs array -> { spec_dong_co: 'lines...', spec_dan_dong: '...', spec_khac: '...' }
function specsToSections(specs = []) {
    const nameToKey = {};
    SPEC_SECTIONS.forEach((s) => { nameToKey[s.name] = s.key; });

    const result = {};
    SPEC_SECTIONS.forEach((s) => { result[s.key] = ''; });
    result.spec_khac = '';

    let currentSectionName = null;
    let currentLines = [];

    const flush = () => {
        if (!currentLines.length) return;
        const text = currentLines.join('\n');
        const key = currentSectionName ? nameToKey[currentSectionName] : null;
        if (key) {
            result[key] = result[key] ? result[key] + '\n' + text : text;
        } else {
            const prefix = currentSectionName ? `[${currentSectionName}]\n` : '';
            result.spec_khac = result.spec_khac
                ? result.spec_khac + '\n\n' + prefix + text
                : prefix + text;
        }
        currentLines = [];
    };

    for (const spec of specs) {
        if (spec.gia_tri === '__SECTION__') {
            flush();
            currentSectionName = spec.ten_thong_so;
        } else {
            const line = (spec.gia_tri === '__BULLET__' || !spec.gia_tri)
                ? spec.ten_thong_so
                : `${spec.ten_thong_so}: ${spec.gia_tri}`;
            currentLines.push(line);
        }
    }
    flush();
    return result;
}

// Combine individual section fields from admin form into one thong_so string
function buildSpecsFromSections(body) {
    const parts = [];
    for (const section of SPEC_SECTIONS) {
        const content = String(body[section.key] || '').trim();
        if (content) {
            parts.push(`[${section.name}]\n${content}`);
        }
    }
    const other = String(body.spec_khac || '').trim();
    if (other) {
        // Prepends '[Thông số khác]' if it doesn't already start with a section header to prevent merging into previous section
        if (!other.startsWith('[')) {
            parts.push(`[Thông số khác]\n${other}`);
        } else {
            parts.push(other);
        }
    }
    return parts.join('\n\n');
}

function colorsToTextarea(colors = []) {
    return colors.map((color) => `${color.ten_mau} | ${color.ma_mau || '#ffffff'} | ${color.anh_mau || ''} | ${color.gia_them || 0} | ${color.anh_360 || ''}`).join('\n');
}

function featuresToTextarea(features = []) {
    return features.map((feature) => `${feature.nhom || 'noi_bat'} | ${feature.tieu_de} | ${feature.mo_ta || ''} | ${feature.anh || ''}`).join('\n');
}

function rotateImagesToTextarea(rotateRows = []) {
    const groups = {};
    rotateRows.forEach((row) => {
        const groupName = row.nhom_360 || 'chung';
        if (groupName === 'chung') return;
        groups[groupName] = groups[groupName] || [];
        groups[groupName].push(row.duong_dan_anh);
    });
    return Object.keys(groups).map((name) => {
        return `${name} | ${groups[name].join(', ')}`;
    }).join('\n');
}

function parseCar360Sets(value) {
    return parseLines(value).map((line) => {
        const parts = line.split('|').map((part) => (part || '').trim());
        if (parts.length < 2) return null;
        const nhom = parts[0];
        const files = parts[1].split(',').map((f) => f.trim()).filter(Boolean);
        return { nhom, files };
    }).filter(Boolean);
}

function createSlug(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || `noi-dung-${Date.now().toString(36)}`;
}

function isChecked(value) {
    return value === 'on' || value === '1' || value === 'true' || value === true;
}

function formatDateTime(value) {
    if (!value) return '';
    return new Date(value).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function redirectWithMessage(res, pathName, type, message) {
    res.redirect(`${pathName}?${type}=${encodeURIComponent(message)}`);
}

async function getUniqueSlug(tableName, baseSlug, currentId = null) {
    if (!['dai_ly', 'tin_tuc', 'xe'].includes(tableName)) {
        throw new Error('Bang khong hop le de tao slug');
    }

    let slug = createSlug(baseSlug);
    let index = 2;

    while (true) {
        const [rows] = await dbp.query(
            `SELECT id FROM ${tableName} WHERE duong_dan = ? ${currentId ? 'AND id <> ?' : ''} LIMIT 1`,
            currentId ? [slug, currentId] : [slug]
        );
        if (!rows.length) return slug;
        slug = `${createSlug(baseSlug)}-${index}`;
        index += 1;
    }
}

async function cleanupOrphanImages() {
    try {
        const referenced = new Set();

        const addRefs = (rows, colName) => {
            rows.forEach(r => {
                if (r[colName]) {
                    referenced.add(path.basename(r[colName]).trim());
                }
            });
        };

        const [anhXe] = await dbp.query('SELECT duong_dan_anh FROM anh_xe');
        addRefs(anhXe, 'duong_dan_anh');

        const [anh360] = await dbp.query('SELECT duong_dan_anh FROM anh_xe_360');
        addRefs(anh360, 'duong_dan_anh');

        const [dacDiem] = await dbp.query('SELECT anh FROM dac_diem_xe');
        addRefs(dacDiem, 'anh');

        const [mauXe] = await dbp.query('SELECT anh_mau FROM mau_xe');
        addRefs(mauXe, 'anh_mau');

        const [tinTuc] = await dbp.query('SELECT anh_dai_dien FROM tin_tuc');
        addRefs(tinTuc, 'anh_dai_dien');

        const [panel] = await dbp.query('SELECT duong_dan_anh FROM panel_anh');
        addRefs(panel, 'duong_dan_anh');

        const [bo360] = await dbp.query('SELECT danh_sach_anh FROM bo_anh_360');
        bo360.forEach(r => {
            if (r.danh_sach_anh) {
                r.danh_sach_anh.split(',').forEach(f => {
                    const clean = f.trim();
                    if (clean) referenced.add(path.basename(clean));
                });
            }
        });

        const imageDir = path.join(__dirname, '..', 'public', 'images');
        if (!fs.existsSync(imageDir)) return;

        const files = fs.readdirSync(imageDir);
        for (const file of files) {
            const fullPath = path.join(imageDir, file);
            if (fs.statSync(fullPath).isDirectory()) continue;

            const isHashed = /^[a-fA-F0-9]{32}\.[a-zA-Z0-9]+$/.test(file);
            const isTimestamped = /^\d{13}-/.test(file);

            if (!referenced.has(file) && (isHashed || isTimestamped)) {
                fs.unlinkSync(fullPath);
                console.log(`[Deduplication] Deleted orphan file: ${file}`);
            }
        }
    } catch (err) {
        console.error('Error in cleanupOrphanImages:', err);
    }
}

module.exports = {
    formatPrice,
    listImageFiles,
    sanitizeFileName,
    splitBuffer,
    parseMultipartForm,
    parseLines,
    parseCarSpecs,
    parseCarColors,
    parseCarFeatures,
    specsToTextarea,
    specsToSections,
    buildSpecsFromSections,
    SPEC_SECTIONS,
    colorsToTextarea,
    featuresToTextarea,
    rotateImagesToTextarea,
    parseCar360Sets,
    createSlug,
    isChecked,
    formatDateTime,
    redirectWithMessage,
    getUniqueSlug,
    cleanupOrphanImages
};
