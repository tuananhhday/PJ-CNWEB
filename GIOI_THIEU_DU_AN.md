# Giới thiệu dự án Showroom Double Anh

## 1. Bài toán

Showroom cần một website để giới thiệu các dòng xe đang phân phối, giúp khách hàng xem thông tin xe, tra cứu hình ảnh, gửi yêu cầu báo giá và đăng ký lái thử trực tuyến. Bên cạnh đó, nhân viên quản trị cần có khu vực admin để cập nhật xe, tin tức, đại lý, ảnh panel trang chủ và các yêu cầu từ khách hàng mà không phải sửa trực tiếp trong mã nguồn.

## 2. Mục tiêu dự án

Dự án xây dựng hệ thống website showroom ô tô với hai phần chính:

- Phần khách hàng: hiển thị trang chủ, danh sách xe, chi tiết xe, tin tức, thông tin showroom, form báo giá và form đăng ký lái thử.
- Phần quản trị: cho phép admin quản lý dữ liệu xe, ảnh 360, panel trang chủ, tin tức, đại lý và yêu cầu tư vấn/lái thử.

Mục tiêu quan trọng là giao diện phải dùng được trên cả desktop và mobile, đặc biệt các nút điều hướng không bị mất khi thu nhỏ màn hình.

## 3. Chức năng chính

### Trang khách hàng

- Trang chủ hiển thị banner/panel, xe nổi bật, danh sách xe, dịch vụ showroom và tin tức.
- Thanh điều hướng có menu dòng xe, mua xe, danh sách xe, tin tức, đại lý, admin, đổi giao diện sáng/tối và tìm kiếm nhanh.
- Danh sách xe cho phép khách xem các mẫu xe đang có tại showroom.
- Trang chi tiết xe hiển thị tên xe, giá, phiên bản, màu sắc, ảnh 360, thư viện ảnh, đặc điểm nổi bật, thông số kỹ thuật, ebook và brochure nếu có.
- Form báo giá và đăng ký lái thử giúp khách gửi thông tin nhu cầu.
- Footer hiển thị hotline, địa chỉ, slogan, dịch vụ và các liên kết hỗ trợ.

### Trang quản trị

- Quản lý xe: thêm, sửa, xóa thông tin xe, thông số, hình ảnh và nội dung liên quan.
- Quản lý ảnh 360: cấu hình bộ ảnh xoay 360 cho xe hoặc màu xe.
- Quản lý panel trang chủ: cập nhật ảnh/video banner trên trang chủ.
- Quản lý tin tức: đăng bài, gắn bài xem nhiều hoặc hiển thị sidebar.
- Quản lý đại lý/showroom: cập nhật thông tin liên hệ và địa chỉ.
- Quản lý yêu cầu: theo dõi khách gửi báo giá hoặc đăng ký lái thử.

## 4. Công nghệ sử dụng

- Node.js và Express.js để xây dựng server web.
- EJS để render giao diện phía server.
- CSS thuần để xây dựng giao diện responsive.
- JavaScript thuần để xử lý slider, menu, tìm kiếm, chọn màu, ảnh 360 và các tương tác trên trang.
- MySQL để lưu trữ dữ liệu showroom.

## 5. Cấu trúc thư mục chính

- `app.js`: cấu hình ứng dụng Express.
- `routes/`: định nghĩa route public và route admin.
- `controllers/`: xử lý nghiệp vụ và lấy dữ liệu từ database.
- `views/`: chứa các file EJS render giao diện.
- `views/partials/`: chứa các thành phần dùng chung như header/nav và footer.
- `public/stylesheets/`: chứa các file CSS.
- `public/javascripts/`: chứa các file JS chạy trên trình duyệt.
- `public/images/`: chứa ảnh xe, ảnh panel, ảnh 360 và logo.
- `database/showroom_oto.sql`: file SQL khởi tạo database.

## 6. Điểm đã chú ý trong giao diện responsive

- Thanh điều hướng public trên mobile được chuyển thành thanh ngang có thể cuộn, giúp các nút truy cập trang không bị biến mất.
- Trang chi tiết xe có override riêng vì còn dùng thêm `showroom.css`, tránh CSS cũ làm mất menu mobile.
- Admin trên mobile chuyển sidebar trái thành thanh menu ngang sticky ở đầu trang, tránh che toàn bộ nội dung.
- Các form và danh sách admin được chuyển về một cột để dễ thao tác trên màn hình nhỏ.

## 7. Hướng phát triển thêm

- Bổ sung phân quyền admin theo vai trò.
- Thêm bộ lọc nâng cao cho danh sách xe theo giá, loại xe, nhiên liệu và số chỗ.
- Tối ưu upload ảnh và nén ảnh tự động.
- Thêm trang thống kê doanh số/yêu cầu khách hàng cho admin.
- Hoàn thiện nội dung chính sách bảo mật, điều khoản sử dụng và thông tin pháp lý.
