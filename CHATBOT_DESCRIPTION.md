# Tài Liệu Mô Tả Kiến Trúc & Tính Năng Chatbot AI Showroom Double Anh

Tài liệu này mô tả chi tiết thiết kế kỹ thuật, nguyên lý hoạt động, tập quy tắc nghiệp vụ và các công cụ kết nối cơ sở dữ liệu của trợ lý ảo thông minh tích hợp trên website Showroom Double Anh.

---

## 1. Kiến Trúc Thiết Kế (Architecture)

Chatbot được thiết kế theo mô hình **AI Agent sử dụng kỹ thuật Function Calling (Gọi hàm hành động)** kết hợp với Mô hình ngôn ngữ lớn (LLM).

```
+--------------+           +--------------+           +----------------+           +------------+
|  Khách hàng  |           | Chatbox (UI) |           | Node.js Server |           | Gemini LLM |
+-------+------+           +------+-------+           +-------+--------+           +-----+------+
        |                         |                           |                          |
        |----(1) Gửi câu hỏi----->|                           |                          |
        |    & Hình ảnh           |----(2) POST /chat ------->|                          |
        |                         |    (History & Msg)        |----(3) startChat &------>|
        |                         |                           |    sendMessage           |
        |                         |                           |                          |  -- VÒNG LẶP --
        |                         |                           |                          | (Tối đa 5 lần)
        |                         |                           |<---(4) Yêu cầu gọi hàm---|
        |                         |                           |    (ví dụ: lookup_cars)  |
        |                         |                           |                          |
        |                         |                           |----(5) Chạy SQL------> [MySQL DB]
        |                         |                           |                       /
        |                         |                           |<---(6) Trả JSON------/
        |                         |                           |
        |                         |                           |----(7) Tool Response---->|
        |                         |                           |                          |  --------------
        |                         |                           |                          |
        |                         |                           |<---(8) Văn bản phản hồi--|
        |                         |<---(9) JSON {text} -------|
        |<---(10) Bong bóng chat--|
```

### Điểm khác biệt so với RAG (Retrieval-Augmented Generation):
* **RAG truyền thống**: Thường cắt nhỏ văn bản, tìm kiếm vector tương tự rồi đưa vào prompt. Cách này dễ gây ra hiện tượng **ảo giác (hallucination)** khi xử lý số liệu lớn, bảng biểu hoặc thông số động.
* **Function Calling**: LLM đóng vai trò như một **bộ não điều phối**. Khi cần dữ liệu, nó sẽ tự động ra lệnh cho backend chạy các hàm JavaScript tương tác trực tiếp với database MySQL. Kết quả trả về cho khách hàng đảm bảo chính xác 100% theo thời gian thực (giá xe, thông số kỹ thuật, số lượng tồn kho).

---

## 2. Các Mô Hình Sử Dụng (LLM Models)
Hệ thống tự động phát hiện loại khóa API trong file `.env` và hỗ trợ cơ chế chuyển đổi dự phòng (Fallback) khi gặp lỗi:

* **Sử dụng trực tiếp Google SDK (Gemini API Key)**:
  * Mô hình ưu tiên: `gemini-2.5-flash` và `gemini-2.0-flash` (Có tốc độ phản hồi cực nhanh, hỗ trợ đa phương thức nhận diện hình ảnh tốt).
  * Dự phòng: `gemini-1.5-flash-latest`, `gemini-1.5-flash`.
* **Sử dụng qua OpenRouter SDK (API Key dạng `sk-...`)**:
  * Tự động duyệt qua danh sách mô hình miễn phí/giá rẻ: `meta-llama/llama-3.3-70b-instruct:free` -> `google/gemma-4-31b-it:free` -> `google/gemini-2.5-flash-lite` -> `google/gemini-2.5-flash`.

---

## 3. Các Tính Năng Chatbot Có Thể Thực Hiện

1. **Tìm kiếm & Chọn lọc xe**: Lọc xe theo khoảng giá, loại nhiên liệu (Xăng, Dầu, Điện, Hybrid), phân khúc kiểu dáng (Sedan, SUV, Pickup, Hatchback).
2. **Tra cứu thông số & Bảng giá**: Hiển thị chi tiết thông số kỹ thuật động cơ, kích thước, hộp số, màu sắc kèm giá bán tăng thêm và chính sách bảo hành của từng phiên bản xe.
3. **Nhận diện hình ảnh đa phương thức (Multimodal)**: Phân tích ảnh chụp xe do người dùng tải lên để nhận diện thương hiệu, kiểu xe và đưa ra tư vấn.
4. **Đặt lịch hẹn lái thử xe**: Thu thập thông tin từ cuộc trò chuyện và đặt trực tiếp lịch hẹn lái thử xe vào MySQL.
5. **Đăng ký nhận báo giá lăn bánh**: Lưu thông tin đăng ký báo giá của khách hàng trực tiếp vào hệ thống quản lý admin.
6. **Tra cứu Showroom & Tin tức**: Cung cấp vị trí, Hotline liên hệ của các đại lý gần nhất và cập nhật các chương trình khuyến mãi/khai trương mới nhất.

---

## 4. Các Tập Quy Tắc Nghiêm Ngặt (Strict System Instructions)

Để đảm bảo chatbot hoạt động an toàn và giữ vững hình ảnh thương hiệu showroom, trợ lý ảo tuân thủ nghiêm ngặt 10 quy tắc sau trong prompt hệ thống:

1. **Giới hạn phạm vi tư vấn**: Chỉ trả lời các nội dung về xe cộ, dịch vụ showroom Double Anh. **Tuyệt đối từ chối** lịch sự bằng tiếng Việt đối với các câu hỏi ngoài lề (nấu ăn, lập trình, làm thơ, giải toán, câu hỏi triết học...).
2. **Không tự bịa thông tin**: Nếu database không tìm thấy dòng xe hoặc showroom tương ứng, chatbot phải báo không tìm thấy, không được tự ý bịa giá bán hoặc địa chỉ.
3. **Định dạng bảng Markdown**: Toàn bộ bảng thông số kỹ thuật và bảng giá xe phải được hiển thị dưới dạng bảng Markdown sạch sẽ, dễ đọc.
4. **Định dạng tiền tệ**: Giá xe dạng số thô (ví dụ: `1545000000.00`) phải được chuyển đổi sang dạng dễ đọc như *"1.545.000.000 VNĐ"* hoặc *"1 tỷ 545 triệu VNĐ"*.
5. **Chủ động thu thập thông tin đặt lịch/báo giá**: Khi khách hàng muốn lái thử hoặc báo giá, chatbot sẽ lần lượt hỏi đầy đủ: Họ tên, Số điện thoại, Email, Thành phố, Tên xe trước khi kích hoạt hàm lưu trữ.

---

## 5. Chi Tiết Các Hàm & Công Cụ (Tools & MySQL Mapping)

Chatbot được tích hợp 6 công cụ JavaScript tương tác trực tiếp với MySQL Database:

### 1. `lookup_cars`
* **Mục đích**: Lọc và hiển thị danh sách xe đang có sẵn.
* **Tham số**: `ten_xe` (Tên xe), `gia_min` (Giá bán tối thiểu), `gia_max` (Giá bán tối đa), `loai_xe` (Phân khúc), `nhien_lieu` (Xăng, dầu, điện, hybrid).
* **MySQL Query**:
  ```sql
  SELECT xe.id, xe.ten_xe, xe.phien_ban, xe.gia_ban, xe.hop_so, xe.nhien_lieu, loai_xe.ten_loai AS loai_xe
  FROM xe
  INNER JOIN dong_xe ON xe.dong_xe_id = dong_xe.id
  INNER JOIN loai_xe ON dong_xe.loai_xe_id = loai_xe.id
  WHERE xe.trang_thai = 'con_hang' AND [filters]
  LIMIT 10;
  ```

### 2. `get_car_details`
* **Mục đích**: Lấy thông tin thông số và màu sắc chi tiết của một dòng xe cụ thể.
* **Tham số**: `ten_xe` (Tên xe cần xem chi tiết).
* **MySQL Queries**:
  * *Truy vấn thông tin chung*: Lấy công suất, xuất xứ, bảo hành từ bảng `xe`.
  * *Truy vấn thông số*: Lấy các dòng thông số kỹ thuật thực tế từ bảng `thong_so_ky_thuat` (lọc bỏ các thẻ layout rác).
  * *Truy vấn màu sắc*: Lấy danh sách tên màu, mã màu HEX, và giá bán thêm từ bảng `mau_xe`.

### 3. `get_showroom_locations`
* **Mục đích**: Trả về danh sách showroom để khách hàng lựa chọn địa điểm liên hệ hoặc đăng ký lái thử.
* **MySQL Query**:
  ```sql
  SELECT ten_dai_ly, dia_chi, thanh_pho, so_dien_thoai, email, gio_lam_viec
  FROM dai_ly WHERE trang_thai = 'hien' ORDER BY thu_tu ASC;
  ```

### 4. `get_latest_news`
* **Mục đích**: Lấy thông tin các tin tức, sự kiện khuyến mãi mới nhất.
* **MySQL Query**:
  ```sql
  SELECT tieu_de, duong_dan, noi_dung, ngay_tao FROM tin_tuc 
  WHERE trang_thai = 'hien' ORDER BY ghim DESC, ngay_tao DESC LIMIT 5;
  ```

### 5. `create_quote_request`
* **Mục đích**: Đăng ký yêu cầu nhận báo giá lăn bánh của khách hàng.
* **Tham số**: `ten_xe`, `ho_ten`, `email`, `so_dien_thoai`, `thanh_pho`, `noi_dung`.
* **MySQL Query**:
  ```sql
  INSERT INTO yeu_cau_bao_gia (xe_id, ho_ten, email, so_dien_thoai, thanh_pho, noi_dung, trang_thai) 
  VALUES (?, ?, ?, ?, ?, ?, 'moi');
  ```
  *(Sử dụng thuật toán so khớp mờ - fuzzy matching để tìm đúng `xe_id` của xe khách hàng đang quan tâm).*

### 6. `create_test_drive_request`
* **Mục đích**: Đăng ký lịch hẹn lái thử xe cho khách hàng tại các showroom đại lý.
* **Tham số**: `ten_xe`, `ho_ten`, `email`, `so_dien_thoai`, `thanh_pho`, `dai_ly`, `ngay_muon_lai` (YYYY-MM-DD), `gio_muon_lai` (HH:MM).
* **MySQL Query**:
  ```sql
  INSERT INTO lich_lai_thu (xe_id, ho_ten, email, so_dien_thoai, thanh_pho, dai_ly, ngay_muon_lai, gio_muon_lai, trang_thai) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'moi');
  ```
