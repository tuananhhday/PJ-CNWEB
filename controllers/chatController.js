const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/database');
const dbp = db.promise();
const https = require('https');

// Khởi tạo Gemini API Client (cho Google SDK)
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey.startsWith('sk-') ? '' : apiKey);

const SYSTEM_INSTRUCTION = `
Bạn là Trợ lý ảo thông minh, lịch sự và chuyên nghiệp của "Showroom Ô tô Double Anh" (Hệ thống phân phối xe ô tô nhập khẩu chính hãng cao cấp tại Việt Nam).
Nhiệm vụ của bạn là tư vấn cho khách hàng về thông tin xe cộ, thông số kỹ thuật, phiên bản xe, giá bán, màu sắc xe và thông tin liên hệ của các showroom đại lý.

QUY TẮC NGHIÊM NGẶT:
1. Bạn CHỈ được trả lời các câu hỏi liên quan đến chủ đề xe cộ, ô tô, giá xe, showroom, chính sách mua xe, dịch vụ lái thử, báo giá và tin tức của Double Anh Showroom.
2. Nếu khách hàng hỏi bất kỳ câu hỏi nào ngoài phạm vi này (ví dụ: hỏi về thời tiết, công thức nấu ăn, viết code lập trình, làm thơ, giải toán, câu hỏi triết học...), bạn phải từ chối một cách lịch sự bằng tiếng Việt:
   "Xin lỗi quý khách, tôi là trợ lý ảo chuyên tư vấn xe của Showroom Double Anh nên chỉ hỗ trợ giải đáp các câu hỏi liên quan đến xe cộ và dịch vụ của showroom. Rất mong quý khách thông cảm!"
3. Sử dụng các công cụ (Functions) được cung cấp để tra cứu dữ liệu thực tế từ database MySQL. Không được tự bịa ra thông tin thông số kỹ thuật, giá bán hoặc địa chỉ showroom nếu không tìm thấy trong database.
4. Khi hiển thị bảng thông số kỹ thuật hoặc bảng giá, hãy định dạng dưới dạng bảng Markdown sạch sẽ để hiển thị đẹp mắt trên chatbox.
5. Giá bán của xe trong database được lưu dưới dạng số (ví dụ: 879000000.00). Khi hiển thị cho khách hàng, hãy định dạng lại cho dễ đọc (ví dụ: "879.000.000 VNĐ" hoặc "879 triệu VNĐ").
6. Bạn CÓ khả năng nhận diện hình ảnh về xe cộ do người dùng gửi lên. Khi người dùng gửi hình ảnh xe, hãy phân tích kỹ kiểu dáng, thiết kế, logo để nhận diện thương hiệu, tên xe và đưa ra lời tư vấn phù hợp.
7. Khi khách hàng hỏi về tin tức, chương trình ưu đãi, sự kiện hoặc khuyến mãi mới nhất của showroom, bạn PHẢI sử dụng công cụ 'get_latest_news' để lấy dữ liệu thực tế từ database và tóm tắt giới thiệu cho họ. Không được trả lời chung chung hoặc chỉ đưa link tự xem.
8. Khi khách hàng có nhu cầu nhận báo giá xe (ví dụ: 'báo giá cho tôi', 'tôi muốn nhận báo giá lăn bánh'), hãy chủ động thu thập đủ các thông tin từ khách hàng: Họ tên, Số điện thoại, Email, Tỉnh/thành phố và dòng xe khách thích. Khi đã đầy đủ thông tin này, hãy gọi ngay công cụ 'create_quote_request' để lưu yêu cầu vào hệ thống và thông báo mã yêu cầu thành công cho khách hàng.
9. Khi khách hàng muốn đăng ký lái thử xe (ví dụ: 'đăng ký lái thử', 'tôi muốn chạy thử xe này'), hãy chủ động thu thập đủ các thông tin: Họ tên, Số điện thoại, Email, Tỉnh/thành phố, Showroom đại lý đăng ký lái thử (hướng dẫn họ chọn showroom phù hợp từ get_showroom_locations), Ngày muốn lái (định dạng YYYY-MM-DD), Giờ muốn lái (định dạng HH:MM) và dòng xe muốn lái. Khi đã đầy đủ thông tin, hãy gọi công cụ 'create_test_drive_request' để lưu lịch hẹn và báo mã lịch cho khách.
10. Luôn giữ thái độ thân thiện, chào hỏi lễ phép bằng tiếng Việt.
`;

// Định nghĩa các công cụ gọi hàm cho Google SDK
const chatTools = [
    {
        functionDeclarations: [
            {
                name: 'lookup_cars',
                description: 'Tìm kiếm danh sách các dòng xe ô tô đang bán tại showroom dựa trên tên xe, loại xe (SUV, Sedan, MPV...), nhiên liệu và khoảng giá bán (tối thiểu/tối đa).',
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        ten_xe: { type: 'STRING', description: 'Tên xe hoặc dòng xe cần tìm kiếm (ví dụ: "Tucson", "VF3", "Everest")' },
                        gia_min: { type: 'NUMBER', description: 'Giá bán tối thiểu tính bằng VNĐ (ví dụ: 500000000)' },
                        gia_max: { type: 'NUMBER', description: 'Giá bán tối đa tính bằng VNĐ (ví dụ: 1500000000)' },
                        loai_xe: { type: 'STRING', description: 'Loại xe hay phân khúc xe (ví dụ: "Sedan", "SUV", "Electric", "Hatchback", "Pickup")' },
                        nhien_lieu: { type: 'STRING', description: 'Nhiên liệu của xe, chỉ chấp nhận một trong các giá trị: "xang", "dau", "dien", "hybrid"' }
                    }
                }
            },
            {
                name: 'get_car_details',
                description: 'Lấy thông số kỹ thuật chi tiết, màu sắc có sẵn kèm giá của từng màu và chính sách bảo hành của một chiếc xe cụ thể dựa theo tên xe.',
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        ten_xe: { type: 'STRING', description: 'Tên đầy đủ hoặc dòng xe của xe cần lấy chi tiết (ví dụ: "VF3", "Hyundai Tucson", "C 300 AMG")' }
                    },
                    required: ['ten_xe']
                }
            },
            {
                name: 'get_showroom_locations',
                description: 'Lấy danh sách địa chỉ, hotline, giờ mở cửa, email liên hệ của tất cả các chi nhánh đại lý showroom Double Anh toàn quốc.',
                parameters: {
                    type: 'OBJECT',
                    properties: {}
                }
            },
            {
                name: 'get_latest_news',
                description: 'Lấy danh sách các tin tức, sự kiện và chương trình khuyến mãi mới nhất của Showroom Double Anh.',
                parameters: {
                    type: 'OBJECT',
                    properties: {}
                }
            },
            {
                name: 'create_quote_request',
                description: 'Tạo yêu cầu báo giá xe cho khách hàng. Cần hỏi đầy đủ thông tin khách hàng: họ tên, số điện thoại, email, tỉnh/thành phố và tên xe quan tâm trước khi gọi hàm.',
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        ten_xe: { type: 'STRING', description: 'Tên xe hoặc dòng xe khách hàng muốn báo giá (ví dụ: "VF3", "Tucson")' },
                        ho_ten: { type: 'STRING', description: 'Họ tên đầy đủ của khách hàng' },
                        email: { type: 'STRING', description: 'Địa chỉ email của khách hàng' },
                        so_dien_thoai: { type: 'STRING', description: 'Số điện thoại liên hệ' },
                        thanh_pho: { type: 'STRING', description: 'Tỉnh/thành phố khách hàng đang sinh sống' },
                        noi_dung: { type: 'STRING', description: 'Ghi chú thêm (ví dụ: yêu cầu trả góp, màu sắc xe quan tâm)' }
                    },
                    required: ['ten_xe', 'ho_ten', 'email', 'so_dien_thoai', 'thanh_pho']
                }
            },
            {
                name: 'create_test_drive_request',
                description: 'Đăng ký lịch lái thử xe cho khách hàng. Cần hỏi đầy đủ thông tin: họ tên, số điện thoại, email, tỉnh/thành phố, showroom đăng ký, ngày muốn lái thử (định dạng YYYY-MM-DD), giờ muốn lái thử (định dạng HH:MM) và tên xe muốn lái thử.',
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        ten_xe: { type: 'STRING', description: 'Tên xe muốn đăng ký lái thử' },
                        ho_ten: { type: 'STRING', description: 'Họ tên đầy đủ của khách hàng' },
                        email: { type: 'STRING', description: 'Địa chỉ email của khách hàng' },
                        so_dien_thoai: { type: 'STRING', description: 'Số điện thoại liên hệ' },
                        thanh_pho: { type: 'STRING', description: 'Tỉnh/thành phố khách hàng đang sinh sống' },
                        dai_ly: { type: 'STRING', description: 'Tên showroom đại lý đăng ký lái thử (lấy từ get_showroom_locations)' },
                        ngay_muon_lai: { type: 'STRING', description: 'Ngày muốn lái thử xe, định dạng YYYY-MM-DD (ví dụ: "2026-06-10")' },
                        gio_muon_lai: { type: 'STRING', description: 'Giờ muốn lái thử xe, định dạng HH:MM (ví dụ: "09:30")' }
                    },
                    required: ['ten_xe', 'ho_ten', 'email', 'so_dien_thoai', 'thanh_pho', 'dai_ly', 'ngay_muon_lai', 'gio_muon_lai']
                }
            }
        ]
    }
];

// Định nghĩa các công cụ gọi hàm cho OpenRouter (Định dạng OpenAI)
const openRouterTools = [
    {
        type: 'function',
        function: {
            name: 'lookup_cars',
            description: 'Tìm kiếm danh sách các dòng xe ô tô đang bán tại showroom dựa trên tên xe, loại xe (SUV, Sedan, MPV...), nhiên liệu và khoảng giá bán (tối thiểu/tối đa).',
            parameters: {
                type: 'object',
                properties: {
                    ten_xe: { type: 'string', description: 'Tên xe hoặc dòng xe cần tìm kiếm (ví dụ: "Tucson", "VF3", "Everest")' },
                    gia_min: { type: 'number', description: 'Giá bán tối thiểu tính bằng VNĐ (ví dụ: 500000000)' },
                    gia_max: { type: 'number', description: 'Giá bán tối đa tính bằng VNĐ (ví dụ: 1500000000)' },
                    loai_xe: { type: 'string', description: 'Loại xe hay phân khúc xe (ví dụ: "Sedan", "SUV", "Electric", "Hatchback", "Pickup")' },
                    nhien_lieu: { type: 'string', enum: ['xang', 'dau', 'dien', 'hybrid'] }
                }
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_car_details',
            description: 'Lấy thông số kỹ thuật chi tiết, màu sắc có sẵn kèm giá của từng màu và chính sách bảo hành của một chiếc xe cụ thể dựa theo tên xe.',
            parameters: {
                type: 'object',
                properties: {
                    ten_xe: { type: 'string', description: 'Tên đầy đủ hoặc dòng xe của xe cần lấy chi tiết (ví dụ: "VF3", "Hyundai Tucson", "C 300 AMG")' }
                },
                required: ['ten_xe']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_showroom_locations',
            description: 'Lấy danh sách địa chỉ, hotline, giờ mở cửa, email liên hệ của tất cả các chi nhánh đại lý showroom Double Anh toàn quốc.',
            parameters: {
                type: 'object',
                properties: {}
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_latest_news',
            description: 'Lấy danh sách các tin tức, sự kiện và chương trình khuyến mãi mới nhất của Showroom Double Anh.',
            parameters: {
                type: 'object',
                properties: {}
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'create_quote_request',
            description: 'Tạo yêu cầu báo giá xe cho khách hàng. Cần hỏi đầy đủ thông tin khách hàng: họ tên, số điện thoại, email, tỉnh/thành phố và tên xe quan tâm trước khi gọi hàm.',
            parameters: {
                type: 'object',
                properties: {
                    ten_xe: { type: 'string', description: 'Tên xe hoặc dòng xe khách hàng muốn báo giá (ví dụ: "VF3", "Tucson")' },
                    ho_ten: { type: 'string', description: 'Họ tên đầy đủ của khách hàng' },
                    email: { type: 'string', description: 'Địa chỉ email của khách hàng' },
                    so_dien_thoai: { type: 'string', description: 'Số điện thoại liên hệ' },
                    thanh_pho: { type: 'string', description: 'Tỉnh/thành phố khách hàng đang sinh sống' },
                    noi_dung: { type: 'string', description: 'Ghi chú thêm (ví dụ: yêu cầu trả góp, màu sắc xe quan tâm)' }
                },
                required: ['ten_xe', 'ho_ten', 'email', 'so_dien_thoai', 'thanh_pho']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'create_test_drive_request',
            description: 'Đăng ký lịch lái thử xe cho khách hàng. Cần hỏi đầy đủ thông tin: họ tên, số điện thoại, email, tỉnh/thành phố, showroom đăng ký, ngày muốn lái thử (định dạng YYYY-MM-DD), giờ muốn lái thử (định dạng HH:MM) và tên xe muốn lái thử.',
            parameters: {
                type: 'object',
                properties: {
                    ten_xe: { type: 'string', description: 'Tên xe muốn đăng ký lái thử' },
                    ho_ten: { type: 'string', description: 'Họ tên đầy đủ của khách hàng' },
                    email: { type: 'string', description: 'Địa chỉ email của khách hàng' },
                    so_dien_thoai: { type: 'string', description: 'Số điện thoại liên hệ' },
                    thanh_pho: { type: 'string', description: 'Tỉnh/thành phố khách hàng đang sinh sống' },
                    dai_ly: { type: 'string', description: 'Tên showroom đại lý đăng ký lái thử (lấy từ get_showroom_locations)' },
                    ngay_muon_lai: { type: 'string', description: 'Ngày muốn lái thử xe, định dạng YYYY-MM-DD (ví dụ: "2026-06-10")' },
                    gio_muon_lai: { type: 'string', description: 'Giờ muốn lái thử xe, định dạng HH:MM (ví dụ: "09:30")' }
                },
                required: ['ten_xe', 'ho_ten', 'email', 'so_dien_thoai', 'thanh_pho', 'dai_ly', 'ngay_muon_lai', 'gio_muon_lai']
            }
        }
    }
];

// Hàm thực thi tìm kiếm xe trong MySQL
async function executeLookupCars(args) {
    const { ten_xe, gia_min, gia_max, loai_xe, nhien_lieu } = args;
    let sql = `
        SELECT 
            xe.id, 
            xe.ten_xe, 
            xe.phien_ban, 
            xe.gia_ban, 
            xe.hop_so, 
            xe.nhien_lieu, 
            xe.so_cho_ngoi, 
            xe.trang_thai,
            loai_xe.ten_loai AS loai_xe,
            hang_xe.ten_hang AS hang_xe
        FROM xe
        INNER JOIN dong_xe ON xe.dong_xe_id = dong_xe.id
        INNER JOIN hang_xe ON dong_xe.hang_xe_id = hang_xe.id
        INNER JOIN loai_xe ON dong_xe.loai_xe_id = loai_xe.id
        WHERE xe.trang_thai = 'con_hang'
    `;
    const params = [];

    if (ten_xe) {
        sql += " AND (xe.ten_xe LIKE ? OR xe.mo_ta_ngan LIKE ?)";
        params.push(`%${ten_xe}%`, `%${ten_xe}%`);
    }
    if (gia_min) {
        sql += " AND xe.gia_ban >= ?";
        params.push(Number(gia_min));
    }
    if (gia_max) {
        sql += " AND xe.gia_ban <= ?";
        params.push(Number(gia_max));
    }
    if (loai_xe) {
        sql += " AND loai_xe.ten_loai LIKE ?";
        params.push(`%${loai_xe}%`);
    }
    if (nhien_lieu) {
        sql += " AND xe.nhien_lieu = ?";
        params.push(nhien_lieu.toLowerCase());
    }

    sql += " ORDER BY xe.gia_ban ASC LIMIT 10";

    const [rows] = await dbp.query(sql, params);
    return rows;
}

// Hàm thực thi lấy chi tiết xe từ MySQL
async function executeGetCarDetails(args) {
    const { ten_xe } = args;
    
    // Tìm kiếm xe
    const [cars] = await dbp.query(`
        SELECT 
            xe.id, xe.ten_xe, xe.phien_ban, xe.gia_ban, xe.gia_niem_yet, 
            xe.nam_san_xuat, xe.mo_ta_ngan, xe.mo_ta_chi_tiet, 
            xe.dong_co, xe.hop_so, xe.nhien_lieu, xe.so_cho_ngoi, 
            xe.xuat_xu, xe.bao_hanh, xe.slogan, xe.so_luong_ton,
            loai_xe.ten_loai AS loai_xe
        FROM xe
        INNER JOIN dong_xe ON xe.dong_xe_id = dong_xe.id
        INNER JOIN loai_xe ON dong_xe.loai_xe_id = loai_xe.id
        WHERE (xe.ten_xe LIKE ? OR xe.phien_ban LIKE ?) AND xe.trang_thai = 'con_hang'
        LIMIT 3
    `, [`%${ten_xe}%`, `%${ten_xe}%`]);

    if (!cars.length) {
        return { message: `Không tìm thấy xe nào khớp với từ khóa "${ten_xe}".` };
    }

    const details = [];
    for (const car of cars) {
        // Lấy thông số kỹ thuật (lọc bỏ các thẻ section/bullet rác)
        const [specs] = await dbp.query(`
            SELECT ten_thong_so, gia_tri 
            FROM thong_so_ky_thuat 
            WHERE xe_id = ? AND gia_tri NOT IN ('__SECTION__', '__BULLET__')
            LIMIT 15
        `, [car.id]);

        // Lấy màu sắc
        const [colors] = await dbp.query(`
            SELECT ten_mau, ma_mau, gia_them 
            FROM mau_xe 
            WHERE xe_id = ?
        `, [car.id]);

        details.push({
            thong_tin_chung: {
                id: car.id,
                ten_xe: car.ten_xe,
                phien_ban: car.phien_ban,
                gia_ban: car.gia_ban,
                gia_niem_yet: car.gia_niem_yet,
                nam_san_xuat: car.nam_san_xuat,
                slogan: car.slogan,
                mo_ta: car.mo_ta_ngan || car.mo_ta_chi_tiet,
                dong_co: car.dong_co,
                hop_so: car.hop_so,
                nhien_lieu: car.nhien_lieu,
                so_cho_ngoi: car.so_cho_ngoi,
                xuat_xu: car.xuat_xu,
                bao_hanh: car.bao_hanh,
                so_luong_ton: car.so_luong_ton
            },
            mau_sac_co_san: colors.map(c => ({
                ten_mau: c.ten_mau,
                ma_mau: c.ma_mau,
                gia_them: c.gia_them > 0 ? `+${c.gia_them.toLocaleString('vi-VN')} VNĐ` : 'Không thêm phí'
            })),
            thong_so_ky_thuat: specs
        });
    }

    return details;
}

// Hàm lấy vị trí các showroom từ MySQL
async function executeGetShowroomLocations() {
    const [rows] = await dbp.query(`
        SELECT ten_dai_ly, dia_chi, thanh_pho, so_dien_thoai, email, gio_lam_viec, vung_mien, loai_dai_ly, mo_ta
        FROM dai_ly
        WHERE trang_thai = 'hien'
        ORDER BY thu_tu ASC
    `);
    return rows;
}

// Hàm lấy tin tức khuyến mãi mới nhất từ MySQL
async function executeGetLatestNews() {
    const [rows] = await dbp.query(`
        SELECT tieu_de, duong_dan, noi_dung, ngay_tao, tac_gia
        FROM tin_tuc
        WHERE trang_thai = 'hien'
        ORDER BY ghim DESC, ngay_tao DESC
        LIMIT 5
    `);
    return rows;
}

// Hàm tạo yêu cầu báo giá
async function executeCreateQuoteRequest(args) {
    const { ten_xe, ho_ten, email, so_dien_thoai, thanh_pho, noi_dung } = args;
    
    // Lấy toàn bộ xe đang bán
    const [allCars] = await dbp.query(`
        SELECT id, ten_xe, phien_ban FROM xe WHERE trang_thai = 'con_hang'
    `);
    
    // Tìm xe phù hợp nhất bằng fuzzy matching
    let matchedCar = null;
    if (allCars.length > 0) {
        const normalizedInput = (ten_xe || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        // 1. Thử khớp cả tên và phiên bản
        for (const car of allCars) {
            const normalizedCarName = car.ten_xe.toLowerCase().replace(/[^a-z0-9]/g, '');
            const normalizedVersion = (car.phien_ban || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalizedInput.includes(normalizedCarName) && normalizedVersion && normalizedInput.includes(normalizedVersion)) {
                matchedCar = car;
                break;
            }
        }
        // 2. Dự phòng: chỉ khớp tên xe
        if (!matchedCar) {
            for (const car of allCars) {
                const normalizedCarName = car.ten_xe.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (normalizedInput.includes(normalizedCarName) || normalizedCarName.includes(normalizedInput)) {
                    matchedCar = car;
                    break;
                }
            }
        }
        // 3. Dự phòng cuối: khớp phiên bản
        if (!matchedCar) {
            for (const car of allCars) {
                const normalizedVersion = (car.phien_ban || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                if (normalizedVersion && (normalizedInput.includes(normalizedVersion) || normalizedVersion.includes(normalizedInput))) {
                    matchedCar = car;
                    break;
                }
            }
        }
    }
    
    if (!matchedCar) {
        return { error: `Không tìm thấy xe nào khớp với tên "${ten_xe}" để tạo yêu cầu báo giá.` };
    }
    
    const xe_id = matchedCar.id;
    const [result] = await dbp.query(`
        INSERT INTO yeu_cau_bao_gia (xe_id, ho_ten, email, so_dien_thoai, thanh_pho, noi_dung, trang_thai)
        VALUES (?, ?, ?, ?, ?, ?, 'moi')
    `, [xe_id, ho_ten, email, so_dien_thoai, thanh_pho, noi_dung || 'Yêu cầu từ Chatbot AI']);
    
    return { 
        success: true, 
        message: `Tạo yêu cầu báo giá thành công cho xe ${matchedCar.ten_xe} - Phiên bản ${matchedCar.phien_ban}. Mã yêu cầu: #BG-${result.insertId}.` 
    };
}

// Hàm đăng ký lịch lái thử
async function executeCreateTestDriveRequest(args) {
    const { ten_xe, ho_ten, email, so_dien_thoai, thanh_pho, dai_ly, ngay_muon_lai, gio_muon_lai } = args;
    
    // Lấy toàn bộ xe đang bán
    const [allCars] = await dbp.query(`
        SELECT id, ten_xe, phien_ban FROM xe WHERE trang_thai = 'con_hang'
    `);
    
    // Tìm xe phù hợp nhất bằng fuzzy matching
    let matchedCar = null;
    if (allCars.length > 0) {
        const normalizedInput = (ten_xe || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        // 1. Thử khớp cả tên và phiên bản
        for (const car of allCars) {
            const normalizedCarName = car.ten_xe.toLowerCase().replace(/[^a-z0-9]/g, '');
            const normalizedVersion = (car.phien_ban || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalizedInput.includes(normalizedCarName) && normalizedVersion && normalizedInput.includes(normalizedVersion)) {
                matchedCar = car;
                break;
            }
        }
        // 2. Dự phòng: chỉ khớp tên xe
        if (!matchedCar) {
            for (const car of allCars) {
                const normalizedCarName = car.ten_xe.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (normalizedInput.includes(normalizedCarName) || normalizedCarName.includes(normalizedInput)) {
                    matchedCar = car;
                    break;
                }
            }
        }
        // 3. Dự phòng cuối: khớp phiên bản
        if (!matchedCar) {
            for (const car of allCars) {
                const normalizedVersion = (car.phien_ban || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                if (normalizedVersion && (normalizedInput.includes(normalizedVersion) || normalizedVersion.includes(normalizedInput))) {
                    matchedCar = car;
                    break;
                }
            }
        }
    }
    
    if (!matchedCar) {
        return { error: `Không tìm thấy xe nào khớp với tên "${ten_xe}" để đăng ký lái thử.` };
    }
    
    const xe_id = matchedCar.id;
    const [result] = await dbp.query(`
        INSERT INTO lich_lai_thu (xe_id, ho_ten, email, so_dien_thoai, thanh_pho, dai_ly, ngay_muon_lai, gio_muon_lai, trang_thai)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'moi')
    `, [xe_id, ho_ten, email, so_dien_thoai, thanh_pho, dai_ly, ngay_muon_lai, gio_muon_lai]);
    
    return { 
        success: true, 
        message: `Đăng ký lịch lái thử xe ${matchedCar.ten_xe} thành công tại showroom ${dai_ly} vào ngày ${ngay_muon_lai} lúc ${gio_muon_lai}. Mã lịch hẹn: #LT-${result.insertId}.` 
    };
}

// ============================================================================
// Nền tảng 1: Hỗ trợ gọi API Google Generative AI (cho Key AI Studio)
// ============================================================================
async function getGeminiResponse(modelName, messageParts, formattedHistory) {
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: chatTools
    });

    const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            maxOutputTokens: 1000
        }
    });

    let result = await chat.sendMessage(messageParts);
    let response = result.response;

    let loopCount = 0;
    const maxLoops = 5;

    while (loopCount < maxLoops) {
        let functionCalls = [];
        if (typeof response.functionCalls === 'function') {
            functionCalls = response.functionCalls();
        } else if (response.functionCalls) {
            functionCalls = response.functionCalls;
        }

        if (!functionCalls || functionCalls.length === 0) {
            break;
        }

        console.log(`[AI Agent - ${modelName}] Gemini yêu cầu gọi các hàm:`, JSON.stringify(functionCalls));
        const toolResponseParts = [];

        for (const call of functionCalls) {
            const { name, args } = call;
            let functionResult;

            try {
                if (name === 'lookup_cars') {
                    functionResult = await executeLookupCars(args);
                } else if (name === 'get_car_details') {
                    functionResult = await executeGetCarDetails(args);
                } else if (name === 'get_showroom_locations') {
                    functionResult = await executeGetShowroomLocations();
                } else if (name === 'get_latest_news') {
                    functionResult = await executeGetLatestNews();
                } else if (name === 'create_quote_request') {
                    functionResult = await executeCreateQuoteRequest(args);
                } else if (name === 'create_test_drive_request') {
                    functionResult = await executeCreateTestDriveRequest(args);
                } else {
                    functionResult = { error: `Hàm '${name}' không được hỗ trợ.` };
                }
            } catch (dbErr) {
                console.error(`[AI Agent] Lỗi DB khi thực thi hàm ${name}:`, dbErr);
                functionResult = { error: 'Lỗi truy vấn cơ sở dữ liệu.' };
            }

            toolResponseParts.push({
                functionResponse: {
                    name: name,
                    response: { result: functionResult }
                }
            });
        }

        console.log(`[AI Agent - ${modelName}] Gửi trả kết quả truy vấn SQL về cho Gemini...`);
        result = await chat.sendMessage(toolResponseParts);
        response = result.response;
        loopCount++;
    }

    return response.text();
}

// ============================================================================
// Nền tảng 2: Hỗ trợ gọi API OpenRouter (Định dạng OpenAI qua HTTPS POST)
// ============================================================================
function postHttps(url, headers, body) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const options = {
            hostname: u.hostname,
            path: u.pathname,
            method: 'POST',
            headers: {
                ...headers,
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(options, (res) => {
            res.setEncoding('utf8');
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Phản hồi từ server không phải JSON hợp lệ'));
                    }
                } else {
                    reject(new Error(`Server lỗi status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(body);
        req.end();
    });
}

async function getOpenRouterResponse(modelName, messageParts, history) {
    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Double Anh Showroom'
    };

    // Chuyển đổi dữ liệu sang định dạng OpenAI
    const messages = [
        { role: 'system', content: SYSTEM_INSTRUCTION }
    ];

    // Lịch sử chat
    (history || []).forEach(item => {
        messages.push({
            role: item.role === 'model' ? 'assistant' : 'user',
            content: item.parts[0].text
        });
    });

    // Lượt chat hiện tại (Multimodal)
    const currentContent = [];
    messageParts.forEach(part => {
        if (part.text) {
            currentContent.push({ type: 'text', text: part.text });
        }
        if (part.inlineData) {
            currentContent.push({
                type: 'image_url',
                image_url: {
                    url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
                }
            });
        }
    });

    messages.push({
        role: 'user',
        content: currentContent.length === 1 && currentContent[0].type === 'text'
            ? currentContent[0].text
            : currentContent
    });

    let activeMessages = [...messages];
    let loopCount = 0;
    const maxLoops = 5;

    while (loopCount < maxLoops) {
        const body = JSON.stringify({
            model: modelName,
            messages: activeMessages,
            tools: openRouterTools,
            temperature: 0.2,
            max_tokens: 1000
        });

        console.log(`[OpenRouter - ${modelName}] Gửi request lên OpenRouter...`);
        const result = await postHttps('https://openrouter.ai/api/v1/chat/completions', headers, body);
        
        if (!result.choices || result.choices.length === 0) {
            throw new Error('Không nhận được phản hồi từ OpenRouter');
        }

        const choice = result.choices[0];
        const message = choice.message;

        // Lưu tin nhắn của AI vào lịch sử để chuẩn bị cho lượt gọi tiếp theo (nếu có function call)
        activeMessages.push(message);

        if (message.tool_calls && message.tool_calls.length > 0) {
            console.log(`[OpenRouter AI Agent] Yêu cầu gọi các hàm:`, JSON.stringify(message.tool_calls));
            
            for (const toolCall of message.tool_calls) {
                const name = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments || '{}');
                let functionResult;

                try {
                    if (name === 'lookup_cars') {
                        functionResult = await executeLookupCars(args);
                    } else if (name === 'get_car_details') {
                        functionResult = await executeGetCarDetails(args);
                    } else if (name === 'get_showroom_locations') {
                        functionResult = await executeGetShowroomLocations();
                    } else if (name === 'get_latest_news') {
                        functionResult = await executeGetLatestNews();
                    } else if (name === 'create_quote_request') {
                        functionResult = await executeCreateQuoteRequest(args);
                    } else if (name === 'create_test_drive_request') {
                        functionResult = await executeCreateTestDriveRequest(args);
                    } else {
                        functionResult = { error: `Hàm '${name}' không được hỗ trợ.` };
                    }
                } catch (dbErr) {
                    console.error(`[AI Agent] Lỗi DB khi thực thi hàm ${name}:`, dbErr);
                    functionResult = { error: 'Lỗi truy vấn cơ sở dữ liệu.' };
                }

                // Gửi phản hồi của hàm (tool response)
                activeMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    name: name,
                    content: JSON.stringify({ result: functionResult })
                });
            }

            loopCount++;
        } else {
            // Không còn function call nào nữa, trả về kết quả text cuối cùng
            return message.content;
        }
    }

    throw new Error('Vượt quá số lượng vòng lặp gọi hàm tối đa trên OpenRouter');
}

// ============================================================================
// Controller chính điều phối các luồng Chat
// ============================================================================
exports.handleChat = async (req, res) => {
    const { messageParts, history } = req.body;

    if (!apiKey) {
        console.error('Lỗi: GEMINI_API_KEY chưa được thiết lập trong file .env');
        return res.status(500).json({ error: 'Chưa cấu hình API Key cho Chatbot.' });
    }

    if (!messageParts || !Array.isArray(messageParts)) {
        return res.status(400).json({ error: 'Dữ liệu tin nhắn không hợp lệ.' });
    }

    const is_openrouter = apiKey.startsWith('sk-');

    try {
        let replyText = null;
        let lastError = null;

        if (is_openrouter) {
            // Danh sách model thử nghiệm trên OpenRouter (Ưu tiên các bản Free trước, tự động fallback)
            const openRouterModels = [
                'meta-llama/llama-3.3-70b-instruct:free',
                'google/gemma-4-31b-it:free',
                'google/gemini-2.5-flash-lite',
                'google/gemini-2.5-flash'
            ];

            for (const modelName of openRouterModels) {
                try {
                    console.log(`[OpenRouter AI Agent] Đang thử sử dụng mô hình ${modelName}...`);
                    replyText = await getOpenRouterResponse(modelName, messageParts, history);
                    lastError = null;
                    console.log(`[OpenRouter AI Agent] Gọi mô hình ${modelName} thành công!`);
                    break;
                } catch (err) {
                    lastError = err;
                    console.warn(`[OpenRouter AI Agent] Gọi mô hình ${modelName} thất bại:`, err.message);
                }
            }
        } else {
            // Luồng gọi trực tiếp qua SDK Google Generative AI
            let formattedHistory = (history || []).map(item => ({
                role: item.role === 'model' ? 'model' : 'user',
                parts: item.parts.map(p => ({ text: p.text }))
            }));

            while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
                formattedHistory.shift();
            }

            const googleModels = [
                'gemini-2.5-flash', 
                'gemini-2.0-flash', 
                'gemini-1.5-flash-latest', 
                'gemini-1.5-flash'
            ];

            for (const modelName of googleModels) {
                try {
                    console.log(`[Google SDK AI Agent] Đang thử sử dụng mô hình ${modelName}...`);
                    replyText = await getGeminiResponse(modelName, messageParts, formattedHistory);
                    lastError = null;
                    console.log(`[Google SDK AI Agent] Gọi mô hình ${modelName} thành công!`);
                    break;
                } catch (err) {
                    lastError = err;
                    console.warn(`[Google SDK AI Agent] Gọi mô hình ${modelName} thất bại:`, err.message);
                }
            }
        }

        if (lastError) {
            throw lastError;
        }

        res.json({ text: replyText });

    } catch (error) {
        console.error('Lỗi nghiêm trọng khi xử lý chat:', error);
        res.status(500).json({ error: 'Lỗi trong quá trình xử lý ngôn ngữ tự nhiên của AI. Vui lòng thử lại sau.' });
    }
};
