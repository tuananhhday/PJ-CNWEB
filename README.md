# Showroom Ô Tô Double Anh - Tài Liệu Tóm Tắt Quá Trình Phát Triển & Hoàn Thiện Dự Án

Tài liệu này tóm tắt toàn bộ hành trình xây dựng, tối ưu hóa cấu trúc mã nguồn (Backend & Frontend) và nâng cấp giao diện người dùng của dự án **Showroom Ô tô Double Anh**.

---

## 1. Tổng Quan Kỹ Thuật Ban Đầu
Dự án được khởi tạo như một ứng dụng web quản lý showroom ô tô toàn diện:
*   **Backend**: Node.js & Express.js framework.
*   **Cơ sở dữ liệu**: MySQL (dữ liệu động tự động tạo bảng khi chạy app).
*   **Giao diện**: Kết xuất phía máy chủ (Server-side rendering) bằng EJS kết hợp với CSS và JavaScript thuần để tương tác.

### Tình trạng cấu trúc trước khi tối ưu:
*   Tệp `app.js` đóng vai trò là một tệp đơn bản (Monolith) khổng lồ chứa gần 1800 dòng lệnh. Tệp này ôm đồm mọi chức năng từ khởi tạo database, xử lý biểu mẫu tải file (multipart parser), định nghĩa hàm tiện ích, cho đến toàn bộ hơn 30 luồng xử lý định tuyến (routes) cho cả phía khách hàng và phía quản trị viên.
*   Tệp `showroom.css` có kích thước hơn 110KB chứa toàn bộ quy tắc giao diện của tất cả các trang, dẫn đến việc tải nhiều mã CSS không dùng tới, làm chậm tốc độ tải trang và gây khó khăn lớn trong việc bảo trì hoặc nâng cấp giao diện.

---

## 2. Nhật Ký Tối Ưu Hóa & Tái Cấu Trúc (Refactoring)

Quá trình nâng cấp được chia làm 4 giai đoạn rõ rệt để đảm bảo tính an toàn cao, không xảy ra xung đột hay lỗi vận hành:

### Giai đoạn 1: Tách nhỏ Backend & Làm gọn app.js
Chúng tôi đã tách tệp đơn bản `app.js` thành các thành phần chuyên biệt theo mô hình MVC thu nhỏ:

1.  **Hộp công cụ tiện ích (`helpers/parserHelper.js`)**:
    *   Chuyển các hàm định dạng giá bán (`formatPrice`), định dạng thời gian (`formatDateTime`), tự động tạo slug bài viết, kiểm tra checkbox.
    *   Bao bọc bộ tải file đa phần (`parseMultipartForm`) an toàn, giúp tách hình ảnh tải lên tự động lưu vào thư mục `/public/images`.
2.  **Khởi tạo Database (`services/dbInit.js`)**:
    *   Độc lập hóa các truy vấn tạo bảng tự động (`ensureDealerTable`, `ensureCarDetailTables`, `ensureNewsTables`, v.v.) và gieo dữ liệu mẫu (seeding) để giữ an toàn cho luồng khởi chạy máy chủ.
3.  **Controllers phân hệ (`controllers/homeController.js` & `controllers/adminController.js`)**:
    *   Tách biệt logic xử lý của trang khách và trang quản trị riêng biệt.
    *   `homeController` chịu trách nhiệm lọc xe, lấy danh sách đại lý, kết xuất chi tiết xe, xử lý gửi đăng ký lái thử & báo giá.
    *   `adminController` xử lý toàn bộ các thao tác nghiệp vụ CRUD (Thêm, Sửa, Xóa) dữ liệu xe, màu sắc, đặc điểm thông số, duyệt yêu cầu của khách.
4.  **Hệ thống định tuyến chuẩn hóa (`routes/index.js` & `routes/admin.js`)**:
    *   Khai báo định tuyến độc lập và liên kết chặt chẽ tới các hàm xử lý tương ứng trong Controller.
5.  **Tệp khởi chạy tinh gọn (`app.js`)**:
    *   Chỉ còn giữ lại khoảng 40 dòng mã sạch sẽ để cấu hình Express, gắn kết Middleware UTF-8 và kết nối 2 bộ định tuyến.

### Giai đoạn 2: Tối ưu hóa hiệu năng nén CSS
Tệp `showroom.css` khổng lồ đã được chia tách thành các tệp CSS chuyên biệt theo từng mục đích trang, giúp trình duyệt chỉ tải đúng lượng mã cần thiết:

*   [base.css](file:///c:/Users/ADMIN/PJCNPM/public/stylesheets/base.css): Chứa các biến thiết kế toàn cục (variables), phông chữ Outfit & Inter, CSS Reset và giao diện dùng chung của navbar và footer.
*   [home.css](file:///c:/Users/ADMIN/PJCNPM/public/stylesheets/home.css): Tập trung giao diện trang chủ, slider banner lớn và danh sách thẻ lưới xe.
*   [car-detail.css](file:///c:/Users/ADMIN/PJCNPM/public/stylesheets/car-detail.css): Tập trung kiểu dáng chi tiết xe, trình xem 360 độ, bảng màu sắc và bảng thông số tab.
*   [forms.css](file:///c:/Users/ADMIN/PJCNPM/public/stylesheets/forms.css): Chứa form đăng ký lái thử, báo giá, các ô nhập liệu, trang đăng nhập/đăng ký và danh sách showroom đại lý liên hệ.
*   [news.css](file:///c:/Users/ADMIN/PJCNPM/public/stylesheets/news.css): Chứa giao diện tạp chí bài viết và chi tiết bình luận tin tức.
*   [admin.css](file:///c:/Users/ADMIN/PJCNPM/public/stylesheets/admin.css): Chứa giao diện trang quản trị, sidebar tối giản, bảng biểu, hộp thoại modal bật lên mượt mà và lưới yêu cầu khách hàng.

---

## 3. Cải Tiến Giao Diện Người Dùng (UI/UX) & Chuyển Động
Thiết kế mới áp dụng phong cách sang trọng, kết hợp sáng - tối hài hòa (Hybrid Theme) đem lại trải nghiệm cao cấp:

1.  **Nâng cấp phông chữ & Biến màu sắc**:
    *   Thay đổi phông chữ mặc định thành **Outfit** (cho các tiêu đề công nghệ cao) và **Inter** (cho phần nội dung dễ đọc).
    *   Xác lập dải màu sắc trực quan: xanh Sky Blue công nghệ (`--primary`), cam neon năng động (`--accent`) làm điểm nhấn, kết hợp nền sáng của Slate-50 và các khu vực tối Slate-900 chuyên nghiệp.
2.  **Tương tác chuyển động vi mô (Micro-interactions)**:
    *   **Thanh điều hướng (Site Header)**: Bổ sung hiệu ứng kính mờ (Glassmorphism) với `backdrop-filter: blur(16px)` và cố định trên đầu trang.
    *   **Thẻ xe (Car Cards)**: Bổ sung hiệu ứng phóng to ảnh thu nhỏ nhẹ nhàng và dịch chuyển thẻ lên trên khi di chuột (`transform: translateY(-6px)`), viền thẻ phát sáng mượt mà.
    *   **Bộ chọn màu sắc xe (Color Swatches)**: Các chấm tròn màu sắc được bao quanh bởi viền phát sáng gradient khi được chọn, hình ảnh xe thay đổi ngay lập tức.
    *   **Trang Admin mượt mà**: Chuyển đổi các biểu mẫu Thêm/Sửa dài thành các hộp thoại Modal nhảy ra nhẹ nhàng bằng chuyển động Slide, lưới quản lý yêu cầu phân bổ trực quan bằng các thẻ trạng thái (Mới, Đang xử lý, Đã hoàn tất).

---

## 4. Hướng Dẫn Tích Hợp Thư Viện Chuyển Động Ngoài
Dự án ưu tiên sử dụng hiệu ứng chuyển động thuần bằng CSS để tối đa hóa hiệu năng tải trang. Tuy nhiên, nếu bạn muốn tích hợp thêm các thư viện chuyển động ngoài để giao diện sinh động hơn nữa, hãy làm theo hướng dẫn dưới đây (đã được ghi chú rõ trong tệp [base.css](file:///c:/Users/ADMIN/PJCNPM/public/stylesheets/base.css)):

### Cách 1: Sử dụng thư viện Animate.css (Dành cho hiệu ứng xuất hiện tức thì)
1.  Nhúng liên kết CDN này vào thẻ `<head>` của các tệp EJS:
    ```html
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
    ```
2.  Thêm các class tương ứng vào phần tử HTML của bạn. Ví dụ:
    ```html
    <h1 class="animate__animated animate__fadeInDown">Nhận báo giá chi tiết</h1>
    ```

### Cách 2: Sử dụng thư viện AOS (Animate On Scroll - Hiệu ứng xuất hiện khi cuộn trang)
1.  Nhúng liên kết CSS vào thẻ `<head>` của tệp EJS:
    ```html
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    ```
2.  Nhúng Script khởi tạo trước thẻ đóng `</body>`:
    ```html
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
        AOS.init({
            duration: 800,  /* Thời gian chạy hiệu ứng: 800ms */
            once: true      /* Chỉ chạy hiệu ứng 1 lần duy nhất khi cuộn */
        });
    </script>
    ```
3.  Khai báo thuộc tính chuyển động trên phần tử mong muốn. Ví dụ:
    ```html
    <article class="home-car-card" data-aos="fade-up"> ... </article>
    ```

---

## 5. Hướng Dẫn Cài Đặt & Chạy Dự Án

> ⚡ Làm theo đúng thứ tự các bước dưới đây để chạy được đầy đủ dữ liệu, không bị ra "bản trống".

### Yêu cầu hệ thống
- **Node.js** >= 16
- **MySQL** >= 8.0 (hoặc MariaDB >= 10.4)
- **npm**

---

### Bước 1: Clone dự án về máy

```bash
git clone https://github.com/tuananhhday/PJ-CNWEB.git
cd PJ-CNWEB
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Import database (⚠️ quan trọng - bước này cho ra đúng dữ liệu)

Mở **phpMyAdmin** (`http://localhost/phpmyadmin`) hoặc dùng terminal:

**Cách A – phpMyAdmin:**
1. Tạo database tên `showroom_oto` (charset: `utf8mb4`)
2. Chọn database `showroom_oto` → tab **Import**
3. Chọn file `database/showroom_oto.sql` → **Go**

**Cách B – Terminal/Command Prompt:**
```bash
# Tạo database trước
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS showroom_oto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import dữ liệu
mysql -u root -p showroom_oto < database/showroom_oto.sql
```

### Bước 4: Cấu hình kết nối database

Tạo file `.env` từ file mẫu:

```bash
copy .env.example .env
```

Mở file `.env` và điền thông tin MySQL của bạn:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=      ← điền password MySQL của bạn vào đây
DB_NAME=showroom_oto
PORT=3000
```

> Nếu MySQL của bạn không có password, để trống `DB_PASSWORD=`

### Bước 5: Khởi chạy server

```bash
npm start
```

Truy cập trang web tại:
- 🏠 **Trang chủ**: `http://localhost:3000/trang-chu`
- 🔧 **Trang quản trị**: `http://localhost:3000/admin`
- 🔍 **Kiểm tra DB**: `http://localhost:3000/test-db`

---

### Tài khoản đăng nhập Admin (mặc định)

| Tài khoản | Mật khẩu |
|-----------|----------|
| `admin`   | `admin123` |

---

### Cấu trúc thư mục

```
PJ-CNWEB/
├── app.js                  # Entry point
├── database/
│   └── showroom_oto.sql    # ← File database đầy đủ dữ liệu
├── .env.example            # Mẫu cấu hình biến môi trường
├── controllers/            # Logic xử lý request
├── routes/                 # Định tuyến URL
├── views/                  # Template EJS
├── public/                 # CSS, JS, hình ảnh
├── services/               # Khởi tạo database tự động
└── config/
    └── database.js         # Kết nối MySQL
```
