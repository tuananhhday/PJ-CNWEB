-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 03, 2026 lúc 06:33 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `showroom_oto`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `anh_xe`
--

CREATE TABLE `anh_xe` (
  `id` int(11) NOT NULL,
  `xe_id` int(11) NOT NULL,
  `duong_dan_anh` varchar(255) NOT NULL,
  `la_anh_dai_dien` tinyint(1) DEFAULT 0,
  `thu_tu` int(11) DEFAULT 0,
  `nhom_anh` varchar(50) DEFAULT 'chung',
  `chu_thich` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `anh_xe`
--

INSERT INTO `anh_xe` (`id`, `xe_id`, `duong_dan_anh`, `la_anh_dai_dien`, `thu_tu`, `nhom_anh`, `chu_thich`) VALUES
(1, 1, '9692fbc6f60052a730b9e88ff79492a8.jpg', 1, 1, 'chung', NULL),
(2, 1, 'tucson-2.jpg', 0, 2, 'chung', NULL),
(3, 2, 'f032a3b9185528c394843c2a6b6779f3.jpg', 1, 1, 'chung', NULL),
(4, 2, 'C:\\Users\\ADMIN\\Downloads\\mercedes C300.jpg', 0, 2, 'chung', NULL),
(5, 3, '56d2d8620426ac4c6a5c16fb6eb4fc25.webp', 1, 1, 'chung', NULL),
(6, 4, 'd8d32b181c1634139fff1fec5eb349cc.webp', 1, 1, 'chung', NULL),
(7, 6, '05cf056b0015ccc745da0853e513b417.webp', 1, 1, 'chung', NULL),
(8, 6, 'b20fc40add2037bd3c1f828f07ea767c.webp', 0, 2, 'chung', NULL),
(9, 6, 'c18439cf235811d37dd91203d2112d43.webp', 0, 3, 'chung', NULL),
(10, 6, '3e5d44ee6ed5f370ec2c6eefe5240c66.webp', 0, 4, 'chung', NULL),
(15, 8, 'e7ba5681930a79e99a4e00f75d0c46bb.png', 1, 1, 'chung', NULL),
(16, 10, '5c1560c7bf703c36d975108051d57ebf.png', 1, 1, 'chung', NULL),
(17, 10, '56d2d8620426ac4c6a5c16fb6eb4fc25.webp', 0, 2, 'chung', NULL),
(20, 10, 'c18439cf235811d37dd91203d2112d43.webp', 0, 5, 'chung', NULL),
(25, 3, 'fec3c80c22cb3e9ae4884c7c6cf442b1.webp', 0, 2, 'ngoai_that', 'Thiết kế đầu xe đặc trưng  Điểm nhấn then chốt phần đầu xe là chữ Ford được thiết kế dạng khối nổi cỡ lớn. Đèn LED ma trận nổi bật trong đêm, cản trước bắt thẳng vào khung xe và tấm hợp kim chắn gầm siêu cứng, tất cả đều như đang sẵn sàng mở đường dẫn lối.'),
(26, 3, '259c00412c6688c5dadab0622d4e042d.webp', 0, 3, 'ngoai_that', 'Hệ thống treo điện tử Fox 2.5  Hệ thống treo đã được phát triển để mang lại sự thoải mái trên đường trường và khả năng lái địa hình tốt hơn ở cả tốc độ cao và thấp.'),
(27, 3, '74c3e0b2f9a82d7db90eb37354ea9112.webp', 0, 4, 'ngoai_that', 'Động cơ 3.0L V6 Twin Turbo EcoBoost  Sở hữu động cơ 3.0L V6 Twin-Turbo EcoBoost, Ranger Raptor mang đến hiệu suất đầy phấn khích, biến mọi cung đường off-road thành sân chơi riêng của bạn.'),
(28, 3, '88756bf63964b3baeddc4bc272385903.webp', 0, 5, 'ngoai_that', 'Vành hợp kim địa hình  Bộ vành hợp kim 17 inch hầm hố dành cho đường địa hình kết hợp với lốp xe BF GoodRich All-Terrain K02 hiệu năng cao danh tiếng. Dù vượt núi đồi hay chạy tốc độ cao, đều đáp ứng trong mọi điều kiện.'),
(29, 12, '5f1b2117fd51135e1cdd3acdc5ed48f1.png', 1, 1, 'chung', NULL),
(30, 12, '56d2d8620426ac4c6a5c16fb6eb4fc25.webp', 0, 2, 'ngoai_that', NULL),
(31, 12, '6eb849f8edc085a3642e065ea1948678.png', 0, 3, 'ngoai_that', NULL),
(32, 12, '5f1b2117fd51135e1cdd3acdc5ed48f1.png', 0, 4, 'ngoai_that', NULL),
(33, 12, '5943721f4138519f4c1a0767d1e81670.png', 0, 5, 'ngoai_that', NULL),
(34, 12, 'dd30e6ce2be734f612e2e094dcaa79de.png', 0, 6, 'ngoai_that', NULL),
(35, 12, 'e7ba5681930a79e99a4e00f75d0c46bb.png', 0, 7, 'ngoai_that', NULL),
(36, 12, 'e2ecc6b2d0e0241bb810260f1f191ef3.png', 0, 8, 'ngoai_that', NULL),
(37, 12, 'b20fc40add2037bd3c1f828f07ea767c.webp', 0, 9, 'noi_that', NULL),
(38, 12, 'c18439cf235811d37dd91203d2112d43.webp', 0, 10, 'noi_that', NULL),
(39, 12, '3e5d44ee6ed5f370ec2c6eefe5240c66.webp', 0, 11, 'noi_that', NULL),
(40, 12, '05cf056b0015ccc745da0853e513b417.webp', 0, 12, 'noi_that', NULL),
(41, 13, '6eb849f8edc085a3642e065ea1948678.png', 1, 1, 'chung', NULL),
(42, 12, '1780372878387-b3i5-5ce86731-6b9d-3cb7-a7f9-fa5d03fa570f.webp', 0, 13, 'chung', NULL),
(43, 12, '05cf056b0015ccc745da0853e513b417.webp', 0, 14, 'chung', NULL),
(44, 13, 'c31bca0e2025e9895ce94b71d0515b6f.jpg', 0, 2, 'ngoai_that', NULL),
(45, 13, '7ced0bad2e75073f933adeac55d8071a.jpg', 0, 3, 'ngoai_that', NULL),
(46, 13, 'f449a6fa55d11c0d495d3a1a13b18c41.jpg', 0, 4, 'ngoai_that', NULL),
(47, 13, 'ade02d3ece789b844c12bef62b2620ba.jpg', 0, 5, 'ngoai_that', NULL),
(48, 13, '33ee5e5a2ce33fd0596b1aaba91ecf16.jpg', 0, 6, 'ngoai_that', NULL),
(49, 13, '240923cb3910caf0eedfb11ddb90e519.jpg', 0, 7, 'ngoai_that', NULL),
(50, 13, '23f0ad13143c6041c7414616d77e15fa.jpg', 0, 8, 'ngoai_that', NULL),
(51, 13, 'd55215cddf0490ee7fb72b857a1a7d51.jpg', 0, 9, 'ngoai_that', NULL),
(52, 13, '012f362c714c317bf0cd1beeabb86a1b.jpg', 0, 10, 'ngoai_that', NULL),
(53, 13, '1e684135df34f11bce6c7173e75904a9.jpg', 0, 11, 'ngoai_that', NULL),
(54, 13, 'a6cac5d59bbfb2cc612fc90fb301e061.jpg', 0, 12, 'ngoai_that', NULL),
(55, 13, '185b26910d05ad602bbacf4168fe6463.jpg', 0, 13, 'ngoai_that', NULL),
(56, 13, '46a998176aaad2c44c2f8102cd8ec9bd.jpg', 0, 14, 'ngoai_that', NULL),
(57, 13, '476b5039b7cdaffbb55981158eef7cd5.jpg', 0, 15, 'ngoai_that', NULL),
(58, 13, '727ed401931f93496a684b14af225e83.jpg', 0, 16, 'ngoai_that', NULL),
(59, 13, '420aa692f89655d2d3dbd551905f247f.jpg', 0, 17, 'ngoai_that', NULL),
(60, 13, 'b8a7f4cc78556ac259f5b703615094fd.jpg', 0, 18, 'ngoai_that', NULL),
(61, 13, '5e6f26f97018eec192f401eb705063db.jpg', 0, 19, 'ngoai_that', NULL),
(62, 13, '2d93221ce9edb34d8bdd9458f9016bf1.jpg', 0, 20, 'ngoai_that', NULL),
(63, 13, '312994c6e69e8f931e06136da2be16fe.jpg', 0, 21, 'ngoai_that', NULL),
(64, 13, '26b75a5e4e8d44fd1186bd9aaf43c574.jpg', 0, 22, 'ngoai_that', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `anh_xe_360`
--

CREATE TABLE `anh_xe_360` (
  `id` int(11) NOT NULL,
  `xe_id` int(11) NOT NULL,
  `duong_dan_anh` varchar(255) NOT NULL,
  `thu_tu` int(11) DEFAULT 0,
  `ngay_tao` datetime DEFAULT current_timestamp(),
  `nhom_360` varchar(100) DEFAULT 'chung'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `anh_xe_360`
--

INSERT INTO `anh_xe_360` (`id`, `xe_id`, `duong_dan_anh`, `thu_tu`, `ngay_tao`, `nhom_360`) VALUES
(1, 6, '1780239976655-i6hq-do-ghe-chinh-dien-o-to-6-huong-oem-ghe-tai-ghe-phu.jpg', 1, '2026-05-31 22:06:16', 'chung'),
(15, 3, 'e63145d7039f5379c4f19dcbc5598e84.png', 1, '2026-06-01 10:44:08', 'chung'),
(16, 3, '21507b60dd972551149485239b3d0c02.png', 2, '2026-06-01 10:44:08', 'chung'),
(17, 3, '60eb56f51b57e43eef4fcc0de21d3cc7.png', 3, '2026-06-01 10:44:08', 'chung'),
(18, 3, '9cc84a36a77b616331c7996e9c9ceb47.png', 4, '2026-06-01 10:44:08', 'chung'),
(19, 3, '55d98435e6fc7f281d30d9275bc58f1d.png', 5, '2026-06-01 10:44:08', 'chung'),
(20, 3, '47dac2eeaec59c7771c8d44a793b98e4.png', 6, '2026-06-01 10:44:08', 'chung'),
(21, 3, 'da278635a0fc321fdda66ef137461bbe.png', 7, '2026-06-01 10:44:08', 'chung'),
(22, 3, '1369201f64fd7244ef3785655d1af4b1.png', 8, '2026-06-01 10:44:08', 'chung'),
(23, 10, 'e63145d7039f5379c4f19dcbc5598e84.png', 1, '2026-06-01 11:47:45', 'chung'),
(24, 10, '21507b60dd972551149485239b3d0c02.png', 2, '2026-06-01 11:47:45', 'chung'),
(25, 10, '60eb56f51b57e43eef4fcc0de21d3cc7.png', 3, '2026-06-01 11:47:45', 'chung'),
(26, 10, '9cc84a36a77b616331c7996e9c9ceb47.png', 4, '2026-06-01 11:47:45', 'chung'),
(27, 10, '55d98435e6fc7f281d30d9275bc58f1d.png', 5, '2026-06-01 11:47:45', 'chung'),
(28, 10, '47dac2eeaec59c7771c8d44a793b98e4.png', 6, '2026-06-01 11:47:45', 'chung'),
(29, 10, 'da278635a0fc321fdda66ef137461bbe.png', 7, '2026-06-01 11:47:45', 'chung'),
(30, 10, '1369201f64fd7244ef3785655d1af4b1.png', 8, '2026-06-01 11:47:45', 'chung'),
(31, 12, 'e63145d7039f5379c4f19dcbc5598e84.png', 1, '2026-06-02 10:19:48', 'chung'),
(32, 12, '21507b60dd972551149485239b3d0c02.png', 2, '2026-06-02 10:19:48', 'chung'),
(33, 12, '60eb56f51b57e43eef4fcc0de21d3cc7.png', 3, '2026-06-02 10:19:48', 'chung'),
(34, 12, '9cc84a36a77b616331c7996e9c9ceb47.png', 4, '2026-06-02 10:19:48', 'chung'),
(35, 12, '55d98435e6fc7f281d30d9275bc58f1d.png', 5, '2026-06-02 10:19:48', 'chung'),
(36, 12, '47dac2eeaec59c7771c8d44a793b98e4.png', 6, '2026-06-02 10:19:48', 'chung'),
(37, 12, 'da278635a0fc321fdda66ef137461bbe.png', 7, '2026-06-02 10:19:48', 'chung'),
(38, 12, '1369201f64fd7244ef3785655d1af4b1.png', 8, '2026-06-02 10:19:48', 'chung'),
(39, 12, '1780373215739-lkl1-01_front.png', 9, '2026-06-02 11:06:55', 'chung'),
(40, 12, '1780373215742-v27e-02_front_left_45.png', 10, '2026-06-02 11:06:55', 'chung'),
(41, 12, '1780373215745-gu1p-03_left_front_90.png', 11, '2026-06-02 11:06:55', 'chung'),
(42, 12, '1780373215749-1oik-04_left_front_135.png', 12, '2026-06-02 11:06:55', 'chung'),
(43, 12, '1780373215752-whtz-05_left_180.png', 13, '2026-06-02 11:06:55', 'chung'),
(44, 12, '1780373215754-lzbe-06_left_rear_135.png', 14, '2026-06-02 11:06:55', 'chung'),
(45, 12, '1780373215761-vm3e-07_rear_left_90.png', 15, '2026-06-02 11:06:55', 'chung'),
(46, 12, '1780373215768-1igi-08_rear_left_45.png', 16, '2026-06-02 11:06:55', 'chung'),
(47, 12, '1780373215772-bzc2-09_rear.png', 17, '2026-06-02 11:06:55', 'chung'),
(48, 12, '1780373215777-l9c1-10_rear_right_45.png', 18, '2026-06-02 11:06:55', 'chung'),
(49, 12, '1780373215782-39kl-11_rear_right_90.png', 19, '2026-06-02 11:06:55', 'chung'),
(50, 12, '1780373215787-4xkb-12_right_rear_135.png', 20, '2026-06-02 11:06:55', 'chung'),
(51, 12, '1780373215791-rj0j-13_right_180.png', 21, '2026-06-02 11:06:55', 'chung'),
(52, 12, '1780373215796-cwx1-14_right_front_135.png', 22, '2026-06-02 11:06:55', 'chung'),
(53, 12, '1780373215800-rxs2-15_right_front_90.png', 23, '2026-06-02 11:06:55', 'chung'),
(54, 12, '1780373215805-j8a8-16_front_right_45.png', 24, '2026-06-02 11:06:55', 'chung'),
(56, 12, '1780375492807-0w9j-01_front.png', 25, '2026-06-02 11:44:52', 'chung'),
(57, 12, '1780375492809-fkad-02_front_left_45.png', 26, '2026-06-02 11:44:52', 'chung'),
(58, 12, '1780375492812-5c5j-03_left_front_90.png', 27, '2026-06-02 11:44:52', 'chung'),
(59, 12, '1780375492815-hk2p-04_left_front_135.png', 28, '2026-06-02 11:44:52', 'chung'),
(60, 12, '1780375492819-3gel-05_left_180.png', 29, '2026-06-02 11:44:52', 'chung'),
(61, 12, '1780375492821-v2v0-06_left_rear_135.png', 30, '2026-06-02 11:44:52', 'chung'),
(62, 12, '1780375492823-fkd0-07_rear_left_90.png', 31, '2026-06-02 11:44:52', 'chung'),
(63, 12, '1780375492826-t1qp-08_rear_left_45.png', 32, '2026-06-02 11:44:52', 'chung'),
(64, 12, '1780375492829-fv9k-09_rear.png', 33, '2026-06-02 11:44:52', 'chung'),
(65, 12, '1780375492832-obvw-10_rear_right_45.png', 34, '2026-06-02 11:44:52', 'chung'),
(66, 12, '1780375492835-1647-11_rear_right_90.png', 35, '2026-06-02 11:44:52', 'chung'),
(67, 12, '1780375492838-atsr-12_right_rear_135.png', 36, '2026-06-02 11:44:52', 'chung'),
(68, 12, '1780375492841-sjbq-13_right_180.png', 37, '2026-06-02 11:44:52', 'chung'),
(69, 12, '1780375492844-drcs-14_right_front_135.png', 38, '2026-06-02 11:44:52', 'chung'),
(70, 12, '1780375492847-owl5-15_right_front_90.png', 39, '2026-06-02 11:44:52', 'chung'),
(71, 12, '1780375492850-sb5d-16_front_right_45.png', 40, '2026-06-02 11:44:52', 'chung'),
(72, 12, '1780375492854-5w87-17_top.png', 41, '2026-06-02 11:44:52', 'chung'),
(74, 12, '3', 42, '2026-06-02 12:20:06', 'chung'),
(75, 3, '2', 9, '2026-06-03 09:09:39', 'chung'),
(76, 12, '3', 43, '2026-06-03 09:42:40', 'chung'),
(77, 12, '3', 44, '2026-06-03 09:44:30', 'chung'),
(78, 12, '3', 45, '2026-06-03 09:52:39', 'chung');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `binh_luan_tin`
--

CREATE TABLE `binh_luan_tin` (
  `id` int(11) NOT NULL,
  `tin_tuc_id` int(11) NOT NULL,
  `ten_nguoi_binh_luan` varchar(120) NOT NULL,
  `email` varchar(160) DEFAULT NULL,
  `noi_dung` text NOT NULL,
  `trang_thai` enum('hien','an') DEFAULT 'hien',
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `binh_luan_tin`
--

INSERT INTO `binh_luan_tin` (`id`, `tin_tuc_id`, `ten_nguoi_binh_luan`, `email`, `noi_dung`, `trang_thai`, `ngay_tao`) VALUES
(2, 5, 'Con của bố tuấn Anh', 'cauha@gmail.com', 'Đẹp quá anh ơi', 'hien', '2026-05-26 15:11:40');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bo_anh_360`
--

CREATE TABLE `bo_anh_360` (
  `id` int(11) NOT NULL,
  `ten_bo_anh` varchar(255) NOT NULL,
  `danh_sach_anh` text DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp(),
  `ngay_cap_nhat` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `bo_anh_360`
--

INSERT INTO `bo_anh_360` (`id`, `ten_bo_anh`, `danh_sach_anh`, `ngay_tao`, `ngay_cap_nhat`) VALUES
(2, 'Ford Ranger Đen', 'b8a7f4cc78556ac259f5b703615094fd.jpg,5e6f26f97018eec192f401eb705063db.jpg,2d93221ce9edb34d8bdd9458f9016bf1.jpg,312994c6e69e8f931e06136da2be16fe.jpg,26b75a5e4e8d44fd1186bd9aaf43c574.jpg', '2026-06-02 12:15:08', '2026-06-03 09:04:04'),
(3, 'VF3 Trắng', '18553f65073c60433c77f77ed7bb4e83.png,fffe3c1d7ae4d09e7dd6392614a1ab89.png,fa5443cc31a7630dff60e4662a210b7b.png,3df11b7c8694ac8850343b96bd7439d0.png,1c2f4c3902f88b40e51af508ddb90ce5.png,82e3f05b98ba55dacb23c8a6152fdb15.png,5771b549430a9e7a359f60d462d3ea2f.png,a618d0ceea73ea8910d31914595d66c3.png,54bccc5df989c120a95c5173c0dd720d.png,d0bcf8ea2f18d0255a88c80b8f88377b.png,fdb2982887bcae896289875735a3dd79.png,ec942bcee7d8b136bc133f92441585ce.png,f071d430105cd3a4c09376609de11bd9.png,2a4d806cb0103d5e8891a0a31fdf2f12.png,a43a43ae1e54b069eb1aee7ef37a0713.png', '2026-06-02 12:17:14', '2026-06-03 09:03:21');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dac_diem_xe`
--

CREATE TABLE `dac_diem_xe` (
  `id` int(11) NOT NULL,
  `xe_id` int(11) NOT NULL,
  `nhom` varchar(80) DEFAULT 'noi_bat',
  `tieu_de` varchar(255) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `anh` varchar(255) DEFAULT NULL,
  `thu_tu` int(11) DEFAULT 0,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `dac_diem_xe`
--

INSERT INTO `dac_diem_xe` (`id`, `xe_id`, `nhom`, `tieu_de`, `mo_ta`, `anh`, `thu_tu`, `ngay_tao`) VALUES
(13, 12, 'ngoai_that', 'Động cơ yếu bỏ mẹ', 'Đừng mua', '5943721f4138519f4c1a0767d1e81670.png', 1, '2026-06-03 09:52:39'),
(14, 12, 'noi_bat', 'Xe sạc pin đừng có đi đổ xăng', 'Động cơ điện mạnh mẽ', '5e6f26f97018eec192f401eb705063db.jpg', 2, '2026-06-03 09:52:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dai_ly`
--

CREATE TABLE `dai_ly` (
  `id` int(11) NOT NULL,
  `ten_dai_ly` varchar(255) NOT NULL,
  `duong_dan` varchar(255) NOT NULL,
  `dia_chi` varchar(500) NOT NULL,
  `thanh_pho` varchar(120) NOT NULL,
  `so_dien_thoai` varchar(40) DEFAULT NULL,
  `email` varchar(160) DEFAULT NULL,
  `gio_lam_viec` varchar(160) DEFAULT NULL,
  `google_map_url` text DEFAULT NULL,
  `mo_ta` text DEFAULT NULL,
  `thu_tu` int(11) DEFAULT 0,
  `trang_thai` enum('hien','an') DEFAULT 'hien',
  `ngay_tao` datetime DEFAULT current_timestamp(),
  `ngay_cap_nhat` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `vung_mien` varchar(120) DEFAULT 'Miền Nam',
  `khu_vuc` varchar(120) DEFAULT NULL,
  `loai_dai_ly` varchar(120) DEFAULT 'Đại lý bán xe',
  `website` varchar(255) DEFAULT NULL,
  `map_embed_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `dai_ly`
--

INSERT INTO `dai_ly` (`id`, `ten_dai_ly`, `duong_dan`, `dia_chi`, `thanh_pho`, `so_dien_thoai`, `email`, `gio_lam_viec`, `google_map_url`, `mo_ta`, `thu_tu`, `trang_thai`, `ngay_tao`, `ngay_cap_nhat`, `vung_mien`, `khu_vuc`, `loai_dai_ly`, `website`, `map_embed_url`) VALUES
(1, 'Showroom Double Anh Hà Nội', 'showroom-double-anh-ha-noi', '12 Trần Duy Hưng, Cầu Giấy', 'Hà Nội', '0900 000 001', 'hanoi@doubleanh.vn', '08:00 - 19:00, Thứ 2 đến Chủ nhật', NULL, 'Đại lý trưng bày xe mới, tư vấn trả góp, đăng ký lái thử và hỗ trợ sau bán hàng tại khu vực miền Bắc.', 1, 'hien', '2026-05-26 14:32:33', '2026-05-26 16:15:55', 'Miền Nam', 'Hà Nội', 'Đại lý bán xe', NULL, NULL),
(2, 'Showroom Double Anh TP. Hồ Chí Minh', 'showroom-double-anh-tp-ho-chi-minh', '88 Nguyễn Văn Trỗi, Phú Nhuận', 'TP. Hồ Chí Minh', '0900 000 002', 'hcm@doubleanh.vn', '08:00 - 19:30, Thứ 2 đến Chủ nhật', NULL, 'Điểm bán xe và chăm sóc khách hàng tại khu vực miền Nam, có khu vực tiếp khách và tư vấn cấu hình xe.', 2, 'hien', '2026-05-26 14:32:33', '2026-05-26 16:15:55', 'Miền Nam', 'TP. Hồ Chí Minh', 'Đại lý bán xe', NULL, NULL),
(3, 'Showroom Tuấn Anh', 'showroom-tuan-anh', 'Xã yên mỹ tỉnh hưng yên', 'Hưng Yên', '0963709396`', 'tanh2811@gmail.com', '8:00h t2-t7', 'https://www.google.com/maps/place/Y%C3%AAn+M%E1%BB%B9,+H%C6%B0ng+Y%C3%AAn,+Vi%E1%BB%87t+Nam/@20.871859,106.0100447,13z/data=!3m1!4b1!4m6!3m5!1s0x3135bb42a0eaabd5:0x64822cdfa3cd3e38!8m2!3d20.883939!4d106.0522616!16s%2Fg%2F11z42gy49n?entry=ttu&g_ep=EgoyMDI2MDUzMS4wIKXMDSoASAFQAw%3D%3D', 'Đẹp nhiều xe', 3, 'hien', '2026-06-02 09:27:18', '2026-06-02 09:27:18', 'Miền Bắc', 'Miền Bắc', 'Đại Lý Top 1', 'http://localhost:3000/trang-chu', 'https://www.google.com/maps/place/Y%C3%AAn+M%E1%BB%B9,+H%C6%B0ng+Y%C3%AAn,+Vi%E1%BB%87t+Nam/@20.871859,106.0100447,13z/data=!3m1!4b1!4m6!3m5!1s0x3135bb42a0eaabd5:0x64822cdfa3cd3e38!8m2!3d20.883939!4d106.0522616!16s%2Fg%2F11z42gy49n?entry=ttu&g_ep=EgoyMDI2MDUzMS4wIKXMDSoASAFQAw%3D%3D');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dong_xe`
--

CREATE TABLE `dong_xe` (
  `id` int(11) NOT NULL,
  `hang_xe_id` int(11) NOT NULL,
  `loai_xe_id` int(11) NOT NULL,
  `ten_dong` varchar(100) NOT NULL,
  `mo_ta` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `dong_xe`
--

INSERT INTO `dong_xe` (`id`, `hang_xe_id`, `loai_xe_id`, `ten_dong`, `mo_ta`) VALUES
(1, 1, 2, 'Tucson', 'Dong xe SUV Hyundai Tucson'),
(2, 1, 2, 'Santa Fe', 'Dong xe SUV Hyundai Santa Fe'),
(3, 2, 1, 'C-Class', 'Dong xe Sedan Mercedes-Benz C-Class'),
(4, 2, 1, 'E-Class', 'Dong xe Sedan Mercedes-Benz E-Class'),
(5, 3, 2, 'Everest', 'Dong xe SUV Ford Everest'),
(6, 4, 6, 'Crossover', NULL),
(7, 4, 3, 'Hatchback', NULL),
(8, 4, 7, 'MPV', NULL),
(9, 4, 8, 'Pickup', NULL),
(10, 4, 4, 'Coupe', NULL),
(11, 4, 9, 'Convertible', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hang_xe`
--

CREATE TABLE `hang_xe` (
  `id` int(11) NOT NULL,
  `ten_hang` varchar(100) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `mo_ta` text DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hang_xe`
--

INSERT INTO `hang_xe` (`id`, `ten_hang`, `logo`, `mo_ta`, `ngay_tao`) VALUES
(1, 'Hyundai', 'hyundai-logo.png', 'Thuong hieu xe Hyundai', '2026-05-04 15:20:46'),
(2, 'Mercedes-Benz', 'mercedes-logo.png', 'Thuong hieu xe Mercedes-Benz', '2026-05-04 15:20:46'),
(3, 'Ford', 'ford-logo.png', 'Thuong hieu xe Ford', '2026-05-04 15:20:46'),
(4, 'Phân loại xe', NULL, NULL, '2026-05-31 22:42:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lich_lai_thu`
--

CREATE TABLE `lich_lai_thu` (
  `id` int(11) NOT NULL,
  `xe_id` int(11) NOT NULL,
  `ho_ten` varchar(160) NOT NULL,
  `email` varchar(160) NOT NULL,
  `so_dien_thoai` varchar(40) NOT NULL,
  `thanh_pho` varchar(160) NOT NULL,
  `dai_ly` varchar(220) NOT NULL,
  `ngay_muon_lai` date DEFAULT NULL,
  `gio_muon_lai` time DEFAULT NULL,
  `dong_y_tiep_thi` tinyint(1) DEFAULT 0,
  `trang_thai` enum('moi','dang_xu_ly','da_xac_nhan','hoan_tat','huy') DEFAULT 'moi',
  `ghi_chu_admin` text DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp(),
  `ngay_cap_nhat` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `lich_su_xu_ly` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `lich_lai_thu`
--

INSERT INTO `lich_lai_thu` (`id`, `xe_id`, `ho_ten`, `email`, `so_dien_thoai`, `thanh_pho`, `dai_ly`, `ngay_muon_lai`, `gio_muon_lai`, `dong_y_tiep_thi`, `trang_thai`, `ghi_chu_admin`, `ngay_tao`, `ngay_cap_nhat`, `lich_su_xu_ly`) VALUES
(1, 6, 'Khach Lai Thu Test', 'laithu@test.com', '0900000002', 'Ho Chi Minh', 'Double Anh - TP.HCM', '2026-06-10', '09:30:00', 0, 'moi', NULL, '2026-05-31 23:12:15', '2026-05-31 23:12:15', NULL),
(2, 6, 'Test Lai Thu Admin', 'admin-laithu@test.com', '0922222222', 'Ha Noi', 'Double Anh - Hà Nội', '2026-06-15', '14:00:00', 1, 'da_xac_nhan', 'Da xac nhan lich test', '2026-05-31 23:16:11', '2026-05-31 23:17:27', NULL),
(3, 6, 'Anh tuấn Anh', 'anh2811@gmail.com', '09328384', 'Hưng Yên', 'Double Anh - Hà Nội', '2026-11-28', '02:23:00', 1, 'moi', NULL, '2026-05-31 23:18:21', '2026-05-31 23:18:21', NULL),
(4, 6, 'Nguyễn Tuấn Anh', 'tuananh2811@gmail.com', '098238238', 'Hưng Yên', 'Double Anh - Hà Nội', '2022-09-22', '14:08:00', 1, 'da_xac_nhan', 'NV tuấn anh xác nhận và cbi liên hệ', '2026-05-31 23:19:03', '2026-06-03 10:36:40', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `like_tin`
--

CREATE TABLE `like_tin` (
  `id` int(11) NOT NULL,
  `tin_tuc_id` int(11) NOT NULL,
  `dia_chi_ip` varchar(64) NOT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `like_tin`
--

INSERT INTO `like_tin` (`id`, `tin_tuc_id`, `dia_chi_ip`, `ngay_tao`) VALUES
(2, 5, '::1', '2026-05-26 15:11:10');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `loai_xe`
--

CREATE TABLE `loai_xe` (
  `id` int(11) NOT NULL,
  `ten_loai` varchar(100) NOT NULL,
  `mo_ta` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `loai_xe`
--

INSERT INTO `loai_xe` (`id`, `ten_loai`, `mo_ta`) VALUES
(1, 'Sedan', 'Dong xe sedan'),
(2, 'SUV', 'Dong xe the thao da dung'),
(3, 'Hatchback', 'Dong xe hatchback'),
(4, 'Coupe', 'Dong xe coupe'),
(5, 'Electric', 'Dong xe dien'),
(6, 'Crossover', NULL),
(7, 'MPV', NULL),
(8, 'Pickup', NULL),
(9, 'Convertible', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `mau_xe`
--

CREATE TABLE `mau_xe` (
  `id` int(11) NOT NULL,
  `xe_id` int(11) NOT NULL,
  `ten_mau` varchar(100) NOT NULL,
  `ma_mau` varchar(20) DEFAULT NULL,
  `anh_mau` varchar(255) DEFAULT NULL,
  `gia_them` decimal(15,2) DEFAULT 0.00,
  `anh_360` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `mau_xe`
--

INSERT INTO `mau_xe` (`id`, `xe_id`, `ten_mau`, `ma_mau`, `anh_mau`, `gia_them`, `anh_360`) VALUES
(1, 1, 'Trang', '#FFFFFF', 'tucson-trang.jpg', 0.00, NULL),
(2, 1, 'Den', '#000000', 'tucson-den.jpg', 0.00, NULL),
(3, 2, 'Trang Polar', '#F5F5F5', 'c300-trang.jpg', 0.00, NULL),
(4, 2, 'Den Obsidian', '#111111', 'c300-den.jpg', 0.00, NULL),
(6, 6, 'vàng', '#ffffff', NULL, 0.00, NULL),
(7, 6, 'trắng', '#ffffff', NULL, 0.00, NULL),
(8, 6, 'đỏ', '#ffffff', NULL, 0.00, NULL),
(54, 3, 'Den', '#111111', 'ford-everest-den.jpg', 0.00, NULL),
(67, 12, 'Đỏ', '#FF0000', '5943721f4138519f4c1a0767d1e81670.png', 9999999.00, NULL),
(68, 12, 'Vàng', '#f0ff1a', 'e2ecc6b2d0e0241bb810260f1f191ef3.png', 99992293.00, NULL),
(69, 12, 'Hồng', '#ffb8b8', '6eb849f8edc085a3642e065ea1948678.png', 99992293.00, NULL),
(70, 12, 'Xám', '#735e5e', '5f1b2117fd51135e1cdd3acdc5ed48f1.png', 99992293.00, NULL),
(71, 12, 'Xanh', '#4e53df', 'dd30e6ce2be734f612e2e094dcaa79de.png', 99992293.00, NULL),
(72, 12, 'Trắng', '#ffffff', 'e7ba5681930a79e99a4e00f75d0c46bb.png', 0.00, '3');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `panel_anh`
--

CREATE TABLE `panel_anh` (
  `id` int(11) NOT NULL,
  `tieu_de` varchar(180) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `duong_dan_anh` varchar(255) NOT NULL,
  `nut_chu` varchar(80) DEFAULT NULL,
  `nut_link` varchar(255) DEFAULT NULL,
  `thu_tu` int(11) DEFAULT 0,
  `trang_thai` enum('hien','an') DEFAULT 'hien',
  `ngay_tao` datetime DEFAULT current_timestamp(),
  `ngay_cap_nhat` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `panel_anh`
--

INSERT INTO `panel_anh` (`id`, `tieu_de`, `mo_ta`, `duong_dan_anh`, `nut_chu`, `nut_link`, `thu_tu`, `trang_thai`, `ngay_tao`, `ngay_cap_nhat`) VALUES
(4, NULL, NULL, 'd8d32b181c1634139fff1fec5eb349cc.webp', NULL, NULL, 2, 'hien', '2026-05-18 13:30:54', '2026-06-03 08:54:28'),
(11, NULL, NULL, 'a1d35d7e3571881dac458761b5c10334.png', NULL, NULL, 0, 'hien', '2026-06-02 09:57:40', '2026-06-03 08:54:29');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thong_so_ky_thuat`
--

CREATE TABLE `thong_so_ky_thuat` (
  `id` int(11) NOT NULL,
  `xe_id` int(11) NOT NULL,
  `ten_thong_so` varchar(100) NOT NULL,
  `gia_tri` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `thong_so_ky_thuat`
--

INSERT INTO `thong_so_ky_thuat` (`id`, `xe_id`, `ten_thong_so`, `gia_tri`) VALUES
(1, 1, 'Cong suat', '180 hp'),
(2, 1, 'Dung tich dong co', '2.0L'),
(3, 1, 'Momen xoan', '265 Nm'),
(4, 1, 'Chieu dai', '4755 mm'),
(5, 2, 'Cong suat', '258 hp'),
(6, 2, 'Dung tich dong co', '2.0L Turbo'),
(7, 2, 'Hop so', 'Tu dong 9 cap'),
(8, 2, 'So cho ngoi', '5'),
(304, 3, 'Dộng cơ & Tính năng Vận hành', '__SECTION__'),
(305, 3, 'Động cơ Xăng EcoBoost Twin-Turbo 3.0L V6 GTDi', '__BULLET__'),
(306, 3, 'Dung tích xi lanh 2956', '__BULLET__'),
(307, 3, 'Công suất cực đại (PS/vòng/phút) 397 (292 KW) / 5650', '__BULLET__'),
(308, 3, 'Mô men xoắn cực đại (Nm/vòng/phút) 583 / 3500', '__BULLET__'),
(309, 3, 'Số tự động 10 cấp điện tử', '__BULLET__'),
(310, 3, 'Gài cầu điện', '__BULLET__'),
(311, 3, 'Trợ lực lái điện', '__BULLET__'),
(312, 3, 'Kiểm soát đường địa hình', '__BULLET__'),
(313, 3, 'Khóa vi sai cầu trước & sau', '__BULLET__'),
(314, 3, 'Lẫy chuyển số thể thao', '__BULLET__'),
(315, 3, 'Hệ thống dẫn động', '__SECTION__'),
(316, 3, 'Hệ thống truyền động Hai cầu chủ động toàn thời gian và bán thời gian 4WD', '__BULLET__'),
(317, 3, 'Kích thước', '__SECTION__'),
(318, 3, 'Dài x Rộng x Cao (mm) 5401 x 2028 x 1922', '__BULLET__'),
(319, 3, 'Khoảng sáng gầm xe (mm) 230', '__BULLET__'),
(320, 3, 'Dung tích thùng nhiên liệu (L) 80', '__BULLET__'),
(321, 3, 'Bánh xe', '__SECTION__'),
(322, 3, 'Mâm xe hợp kim 17 inch với thiết kế đa chấu', '__BULLET__'),
(323, 3, 'Hệ thống giải trí', '__SECTION__'),
(324, 3, 'Màn hình TFT cảm ứng 12 inch trang bị SYNC® 4', '__BULLET__'),
(325, 3, 'Kết nối không dây với Apple CarPlay® và Android AutoTM', '__BULLET__'),
(326, 3, 'Dàn âm thanh 10 loa B&O', '__BULLET__'),
(327, 3, 'Sạc không dây', '__BULLET__'),
(328, 3, 'Ghế ngồi', '__SECTION__'),
(329, 3, 'Ghế da cao cấp', '__BULLET__'),
(330, 3, 'Hệ thống Kiểm soát tốc độ Tự động thích ứng', '__BULLET__'),
(331, 3, 'Hệ thống cảnh báo điểm mù kết hợp cảnh báo có xe cắt ngang', '__BULLET__'),
(332, 3, 'Hệ thống Cảnh báo lệch làn và hỗ trợ duy trì làn đường', '__BULLET__'),
(333, 3, 'Hệ thống Cảnh báo va chạm và Hỗ trợ phanh khẩn cấp khi gặp chướng ngại vật phía trước', '__BULLET__'),
(334, 3, 'Hệ thống Kiểm soát áp suất lốp', '__BULLET__'),
(335, 3, 'Hệ thống Hỗ trợ khởi hành ngang dốc', '__BULLET__'),
(336, 3, 'Hệ thống Cân bằng điện tử', '__BULLET__'),
(337, 3, 'Hệ thống Chống bó cứng phanh & Phân phối lực phanh điện tử', '__BULLET__'),
(338, 3, 'Camera 360°', '__BULLET__'),
(339, 3, 'Cảm biến hỗ trợ đỗ xe trước và sau', '__BULLET__'),
(380, 12, 'Dộng cơ & Tính năng Vận hành', '__SECTION__'),
(381, 12, 'Động cơ điện', '__BULLET__'),
(382, 12, 'Công suất tối đa 32KW', '__BULLET__'),
(383, 12, 'Mô men xoắn cực đại 110NM', '__BULLET__'),
(384, 12, 'Tăng tốc(0-50KM/h)5.3s', '__BULLET__'),
(385, 12, 'Hệ thống dẫn động', '__SECTION__'),
(386, 12, 'Dẫn động cầu trước', '__BULLET__'),
(387, 12, 'Kích thước', '__SECTION__'),
(388, 12, 'Bằng bao diêm', '__BULLET__'),
(389, 12, 'Bánh xe', '__SECTION__'),
(390, 12, 'Bằng cái mâm', '__BULLET__'),
(391, 12, 'Hệ thống giải trí', '__SECTION__'),
(392, 12, 'Màn hình đi kèm theo xe', '__BULLET__'),
(393, 12, 'Cắt bớt các tính năng có trên 1 chiếc ô tô', '__BULLET__'),
(394, 12, 'Ghế ngồi', '__SECTION__'),
(395, 12, '2 chõ ghế không được bọc da', '__BULLET__'),
(396, 12, 'Thông số khác', '__SECTION__'),
(397, 12, 'Trả góp', '__BULLET__'),
(398, 12, 'Được trả góp lên đến 2 năm', '__BULLET__'),
(399, 12, 'Hỗ trợ sạc pin free', '__BULLET__');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tin_tuc`
--

CREATE TABLE `tin_tuc` (
  `id` int(11) NOT NULL,
  `tieu_de` varchar(200) NOT NULL,
  `duong_dan` varchar(220) NOT NULL,
  `anh_dai_dien` varchar(255) DEFAULT NULL,
  `noi_dung` longtext NOT NULL,
  `trang_thai` enum('nhap','hien','an') DEFAULT 'hien',
  `ngay_tao` datetime DEFAULT current_timestamp(),
  `ngay_cap_nhat` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `tac_gia` varchar(120) DEFAULT 'Showroom Double Anh',
  `ghim` tinyint(1) DEFAULT 0,
  `mau_nen` varchar(40) DEFAULT NULL,
  `xem_nhieu` tinyint(1) DEFAULT 0,
  `hien_sidebar` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tin_tuc`
--

INSERT INTO `tin_tuc` (`id`, `tieu_de`, `duong_dan`, `anh_dai_dien`, `noi_dung`, `trang_thai`, `ngay_tao`, `ngay_cap_nhat`, `tac_gia`, `ghim`, `mau_nen`, `xem_nhieu`, `hien_sidebar`) VALUES
(1, 'Showroom Double Anh mở lịch lái thử cuối tuần', 'showroom-double-anh-mo-lich-lai-thu-cuoi-tuan', '30a71fed6654c3c244db86e69726084a.jpg', 'Showroom Double Anh mở lịch lái thử cho các mẫu xe đang có sẵn trong kho. Khách hàng có thể chọn khung giờ, đại lý gần nhất và mẫu xe muốn trải nghiệm.\r\n\r\nĐội ngũ tư vấn sẽ hỗ trợ thông tin giá bán, chi phí lăn bánh, phương án trả góp và các ưu đãi đang áp dụng.', 'hien', '2026-05-26 14:34:30', '2026-06-03 08:54:28', 'Showroom Double Anh', 1, NULL, 0, 1),
(5, 'Siêu phẩm mùa hè 2026', 'sieu-pham-mua-he-2026', '299d9f29c76f9b953a4bd76d707c87d3.jpg', 'Palisade 2026 all new đẳng cấp đến từ nhà huyndai\r\nvới giá ưu đãi duy nhất em Tuấn Anh để cho anh chị \r\n1tỏi7 duy nhất ngày 27-08-2026', 'hien', '2026-05-26 15:10:38', '2026-06-03 08:54:28', 'Tuất Hoàng Anh', 1, NULL, 0, 1),
(6, 'Thách thức giới hạn', 'thach-thuc-gioi-han', 'a1d35d7e3571881dac458761b5c10334.png', 'Everest thách thức mọi cung đường', 'hien', '2026-06-02 09:59:19', '2026-06-03 08:54:29', 'Showroom Double Anh', 1, NULL, 1, 1),
(7, 'Nhân dịp khai trương bên em Showroom Ô tô Double Anh Sale cực  sốc', 'nhan-dip-khai-truong-ben-em-showroom-o-to-double-anh-sale-cuc-soc', '56d2d8620426ac4c6a5c16fb6eb4fc25.webp', 'Nhân dịp khai trương Cty Tuấn Anh muốn gửi đến bà con 1 ưu đãi cực sốc\r\nKhi mua 1 santafe có thể có cô hội bốc thăm trúng thưởng Everest', 'hien', '2026-06-02 13:22:47', '2026-06-03 08:54:28', 'Tuấn Anh', 0, NULL, 1, 1),
(8, 'Test thử cho anh', 'test-thu-cho-anh', 'c18439cf235811d37dd91203d2112d43.webp', '12345', 'hien', '2026-06-02 13:39:17', '2026-06-03 08:54:28', 'Showroom Double Anh', 1, NULL, 0, 0),
(9, 'tin mới 2', 'tin-moi-2', 'e63145d7039f5379c4f19dcbc5598e84.png', '525', 'hien', '2026-06-02 13:45:53', '2026-06-03 08:54:28', 'Showroom Double Anh', 0, NULL, 0, 1),
(10, 'sdbsdj', 'sdbsdj', '3e5d44ee6ed5f370ec2c6eefe5240c66.webp', 'jejdjj', 'hien', '2026-06-02 13:56:16', '2026-06-03 08:54:28', 'Showroom Double Anh', 0, NULL, 0, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `xe`
--

CREATE TABLE `xe` (
  `id` int(11) NOT NULL,
  `dong_xe_id` int(11) NOT NULL,
  `ten_xe` varchar(150) NOT NULL,
  `duong_dan` varchar(180) NOT NULL,
  `phien_ban` varchar(100) DEFAULT NULL,
  `nam_san_xuat` int(11) DEFAULT NULL,
  `gia_ban` decimal(15,2) NOT NULL,
  `gia_niem_yet` decimal(15,2) DEFAULT NULL,
  `tien_coc_mac_dinh` decimal(15,2) DEFAULT 20000000.00,
  `mo_ta_ngan` varchar(255) DEFAULT NULL,
  `mo_ta_chi_tiet` text DEFAULT NULL,
  `dong_co` varchar(100) DEFAULT NULL,
  `hop_so` varchar(100) DEFAULT NULL,
  `nhien_lieu` enum('xang','dau','dien','hybrid') DEFAULT 'xang',
  `so_cho_ngoi` int(11) DEFAULT NULL,
  `xuat_xu` varchar(100) DEFAULT NULL,
  `bao_hanh` varchar(100) DEFAULT NULL,
  `so_luong_ton` int(11) DEFAULT 0,
  `trang_thai` enum('con_hang','het_hang','an') DEFAULT 'con_hang',
  `ngay_tao` datetime DEFAULT current_timestamp(),
  `ngay_cap_nhat` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `slogan` varchar(255) DEFAULT NULL,
  `ebook_url` varchar(500) DEFAULT NULL,
  `brochure_url` varchar(500) DEFAULT NULL,
  `anh_360` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `xe`
--

INSERT INTO `xe` (`id`, `dong_xe_id`, `ten_xe`, `duong_dan`, `phien_ban`, `nam_san_xuat`, `gia_ban`, `gia_niem_yet`, `tien_coc_mac_dinh`, `mo_ta_ngan`, `mo_ta_chi_tiet`, `dong_co`, `hop_so`, `nhien_lieu`, `so_cho_ngoi`, `xuat_xu`, `bao_hanh`, `so_luong_ton`, `trang_thai`, `ngay_tao`, `ngay_cap_nhat`, `slogan`, `ebook_url`, `brochure_url`, `anh_360`) VALUES
(1, 1, 'Hyundai Tucson 2.0 Xang Dac Biet', 'hyundai-tucson-20-xang-dac-biet', 'Dac Biet', 2025, 879000000.00, 899000000.00, 20000000.00, 'SUV hien dai', 'SUV hien dai', '2.0L', 'Tu dong 6 cap', 'xang', 5, 'Viet Nam', '5 nam', 10, 'con_hang', '2026-05-04 15:20:46', '2026-05-11 09:25:43', NULL, NULL, NULL, NULL),
(2, 3, 'Mercedes-Benz C 300 AMG', 'mercedes-benz-c300-amg', 'AMG', 2025, 2199000000.00, 2299000000.00, 20000000.00, 'Sedan hang sang, thiet ke the thao.', 'Mercedes-Benz C 300 AMG mang lai trai nghiem lai sang trong.', '2.0L Turbo', 'Tu dong 9 cap', 'xang', 5, 'Duc', '3 nam', 5, 'con_hang', '2026-05-04 15:20:46', '2026-05-04 15:20:46', NULL, NULL, NULL, NULL),
(3, 9, 'Ford Ranger ', 'ford-ranger-platinum', 'Platinum', 2025, 1545000000.00, 1545000000.00, 20000000.00, 'SUV 7 cho hang sang, manh me va hien dai.', 'Ford Everest Platinum la mau SUV cao cap phu hop gia dinh.', '2.0L Turbo Diesel i4 TDCi', 'tự động 10 cấp (10R60/10R80)', 'dau', 5, 'Thai Lan', '3 nam hoac 100.000 km', 8, 'con_hang', '2026-05-04 15:20:46', '2026-06-03 09:09:39', 'Đẳng cấp tạo nên thương hiệu', NULL, NULL, '2'),
(4, 5, 'Platinum 2026', 'platinum-2026.jpg', 'Platinum', 2026, 2000000000.00, 2000000000.00, 20000000.00, 'Xe xịn lắm', NULL, '3.0 turbo', '9 cấp', 'xang', 7, NULL, NULL, 10, 'con_hang', '2026-05-11 09:21:15', '2026-05-18 13:27:04', NULL, NULL, NULL, NULL),
(6, 1, 'VF6', 'vf6', 'very guts', 2026, 29232932939.00, 29232932939.00, 20000000.00, 'suv', 'aov ', 'điện', '10', 'dien', 9, 'Việt Nam', '3 năm', 3, 'con_hang', '2026-05-18 15:42:23', '2026-05-18 15:42:23', NULL, NULL, NULL, NULL),
(8, 6, 'BMW', 'bmw-new-2022', 'New 2022', 2022, 3492232323.00, 2323294224.00, 20000000.00, NULL, NULL, NULL, NULL, 'xang', NULL, NULL, NULL, 1, 'con_hang', '2026-06-01 10:59:26', '2026-06-02 09:40:02', 'Đẹp thôi rồi', NULL, NULL, NULL),
(10, 9, 'Ford Ranger ', 'ford-ranger-wildtrack', 'WildTrack', 2024, 3493292221.00, 32392323233.00, 20000000.00, 'Pickup mạnh mẽ ', 'Anh em nên mua', '2.0L Turbo Diesel i4 TDCi', 'tự động 10 cấp (10R60/10R80)', 'dau', 7, 'Thái Lan', '3 năm', 4, 'con_hang', '2026-06-01 11:47:45', '2026-06-01 11:47:45', 'Đẳng cấp tạo nên thương hiệu', NULL, NULL, NULL),
(12, 7, 'VF3', 'vf3-sport', 'Sport', 2026, 300022331.00, 300022331.00, 20000000.00, 'Tiếc tiền thì đừng động ', 'Xe này thừa tiền thì mua nhé', 'Động cơ điện', '1 cấp', 'dien', 2, 'Việt Nam', '100.000 KM', 10, 'con_hang', '2026-06-02 10:19:48', '2026-06-03 09:42:40', NULL, NULL, NULL, '3'),
(13, 7, 'VF3', 'vf3-eco', 'Eco', 2025, 239429349.00, 239429349.00, 20000000.00, 'Xe 2 chỗ cho phụ nữ đón con`', 'Đừng mua\r\nVinFast VF 3 là mẫu xe điện mini SUV cỡ nhỏ của VinFast, được thiết kế hướng đến nhu cầu di chuyển trong đô thị với phong cách trẻ trung, cá tính và hiện đại. Xe sở hữu ngoại hình vuông vức, gầm cao, kích thước nhỏ gọn giúp dễ dàng di chuyển và đỗ xe trong các khu vực đông đúc. VF 3 được trang bị động cơ điện vận hành êm ái, tiết kiệm chi phí sử dụng và có khả năng di chuyển khoảng 200 km sau mỗi lần sạc đầy. Với thiết kế 4 chỗ ngồi, nội thất tối giản cùng nhiều tùy chọn màu sắc nổi bật, VF 3 là lựa chọn phù hợp cho người trẻ, gia đình nhỏ hoặc những khách hàng đang tìm kiếm một mẫu xe điện giá hợp lý để sử dụng hằng ngày.', 'Động cơ điện', '1 cấp', 'dien', 2, 'Việt Nam', '1 năm', 33, 'con_hang', '2026-06-02 10:45:59', '2026-06-03 10:01:39', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `yeu_cau_bao_gia`
--

CREATE TABLE `yeu_cau_bao_gia` (
  `id` int(11) NOT NULL,
  `xe_id` int(11) NOT NULL,
  `ho_ten` varchar(160) NOT NULL,
  `email` varchar(160) NOT NULL,
  `so_dien_thoai` varchar(40) NOT NULL,
  `thanh_pho` varchar(160) NOT NULL,
  `noi_dung` text DEFAULT NULL,
  `dong_y_tiep_thi` tinyint(1) DEFAULT 0,
  `trang_thai` enum('moi','dang_xu_ly','da_lien_he','hoan_tat','huy') DEFAULT 'moi',
  `ghi_chu_admin` text DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp(),
  `ngay_cap_nhat` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `lich_su_xu_ly` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `yeu_cau_bao_gia`
--

INSERT INTO `yeu_cau_bao_gia` (`id`, `xe_id`, `ho_ten`, `email`, `so_dien_thoai`, `thanh_pho`, `noi_dung`, `dong_y_tiep_thi`, `trang_thai`, `ghi_chu_admin`, `ngay_tao`, `ngay_cap_nhat`, `lich_su_xu_ly`) VALUES
(1, 6, 'Khach Bao Gia Test', 'baogia@test.com', '0900000001', 'Ho Chi Minh', 'Can bao gia lan banh', 1, 'da_lien_he', 'Da goi test', '2026-05-31 23:12:21', '2026-05-31 23:13:20', NULL),
(2, 6, 'Test Bao Gia Admin', 'admin-baogia@test.com', '0911111111', 'Ha Noi', 'Test admin xu ly bao gia', 1, 'hoan_tat', 'Khách xác nhận ngày 4-6-2025 đến showroom test', '2026-05-31 23:15:50', '2026-06-03 10:44:35', '[{\"ngay\":\"2026-05-31T16:15:50.000Z\",\"trang_thai_cu\":null,\"trang_thai_moi\":\"moi\",\"ghi_chu\":\"Khách gửi yêu cầu báo giá trên website\",\"nguoi_thuc_hien\":\"Khách hàng\"},{\"ngay\":\"2026-06-03 10:43:47\",\"trang_thai_cu\":\"dang_xu_ly\",\"trang_thai_moi\":\"da_lien_he\",\"ghi_chu\":\"Em tuấn anh liên hệ\\r\\n\",\"nguoi_thuc_hien\":\"Admin\"},{\"ngay\":\"2026-06-03 10:44:35\",\"trang_thai_cu\":\"da_lien_he\",\"trang_thai_moi\":\"hoan_tat\",\"ghi_chu\":\"Khách xác nhận ngày 4-6-2025 đến showroom test\",\"nguoi_thuc_hien\":\"Admin\"}]');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `anh_xe`
--
ALTER TABLE `anh_xe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `xe_id` (`xe_id`);

--
-- Chỉ mục cho bảng `anh_xe_360`
--
ALTER TABLE `anh_xe_360`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_anh_xe_360_xe_id` (`xe_id`);

--
-- Chỉ mục cho bảng `binh_luan_tin`
--
ALTER TABLE `binh_luan_tin`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_binh_luan_tin_tin_tuc_id` (`tin_tuc_id`),
  ADD KEY `idx_binh_luan_tin_trang_thai` (`trang_thai`);

--
-- Chỉ mục cho bảng `bo_anh_360`
--
ALTER TABLE `bo_anh_360`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bo_anh_360_ten` (`ten_bo_anh`);

--
-- Chỉ mục cho bảng `dac_diem_xe`
--
ALTER TABLE `dac_diem_xe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_dac_diem_xe_xe_id` (`xe_id`);

--
-- Chỉ mục cho bảng `dai_ly`
--
ALTER TABLE `dai_ly`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `duong_dan` (`duong_dan`),
  ADD KEY `idx_dai_ly_trang_thai` (`trang_thai`),
  ADD KEY `idx_dai_ly_thanh_pho` (`thanh_pho`);

--
-- Chỉ mục cho bảng `dong_xe`
--
ALTER TABLE `dong_xe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hang_xe_id` (`hang_xe_id`),
  ADD KEY `loai_xe_id` (`loai_xe_id`);

--
-- Chỉ mục cho bảng `hang_xe`
--
ALTER TABLE `hang_xe`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ten_hang` (`ten_hang`);

--
-- Chỉ mục cho bảng `lich_lai_thu`
--
ALTER TABLE `lich_lai_thu`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lai_thu_xe_id` (`xe_id`),
  ADD KEY `idx_lai_thu_trang_thai` (`trang_thai`);

--
-- Chỉ mục cho bảng `like_tin`
--
ALTER TABLE `like_tin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_like_tin_ip` (`tin_tuc_id`,`dia_chi_ip`),
  ADD KEY `idx_like_tin_tin_tuc_id` (`tin_tuc_id`);

--
-- Chỉ mục cho bảng `loai_xe`
--
ALTER TABLE `loai_xe`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ten_loai` (`ten_loai`);

--
-- Chỉ mục cho bảng `mau_xe`
--
ALTER TABLE `mau_xe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `xe_id` (`xe_id`);

--
-- Chỉ mục cho bảng `panel_anh`
--
ALTER TABLE `panel_anh`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `thong_so_ky_thuat`
--
ALTER TABLE `thong_so_ky_thuat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `xe_id` (`xe_id`);

--
-- Chỉ mục cho bảng `tin_tuc`
--
ALTER TABLE `tin_tuc`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `duong_dan` (`duong_dan`);

--
-- Chỉ mục cho bảng `xe`
--
ALTER TABLE `xe`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `duong_dan` (`duong_dan`),
  ADD KEY `dong_xe_id` (`dong_xe_id`);

--
-- Chỉ mục cho bảng `yeu_cau_bao_gia`
--
ALTER TABLE `yeu_cau_bao_gia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bao_gia_xe_id` (`xe_id`),
  ADD KEY `idx_bao_gia_trang_thai` (`trang_thai`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `anh_xe`
--
ALTER TABLE `anh_xe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT cho bảng `anh_xe_360`
--
ALTER TABLE `anh_xe_360`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT cho bảng `binh_luan_tin`
--
ALTER TABLE `binh_luan_tin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `bo_anh_360`
--
ALTER TABLE `bo_anh_360`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `dac_diem_xe`
--
ALTER TABLE `dac_diem_xe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `dai_ly`
--
ALTER TABLE `dai_ly`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `dong_xe`
--
ALTER TABLE `dong_xe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `hang_xe`
--
ALTER TABLE `hang_xe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `lich_lai_thu`
--
ALTER TABLE `lich_lai_thu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `like_tin`
--
ALTER TABLE `like_tin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `loai_xe`
--
ALTER TABLE `loai_xe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `mau_xe`
--
ALTER TABLE `mau_xe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT cho bảng `panel_anh`
--
ALTER TABLE `panel_anh`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `thong_so_ky_thuat`
--
ALTER TABLE `thong_so_ky_thuat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=400;

--
-- AUTO_INCREMENT cho bảng `tin_tuc`
--
ALTER TABLE `tin_tuc`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `xe`
--
ALTER TABLE `xe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `yeu_cau_bao_gia`
--
ALTER TABLE `yeu_cau_bao_gia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `anh_xe`
--
ALTER TABLE `anh_xe`
  ADD CONSTRAINT `anh_xe_ibfk_1` FOREIGN KEY (`xe_id`) REFERENCES `xe` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `dong_xe`
--
ALTER TABLE `dong_xe`
  ADD CONSTRAINT `dong_xe_ibfk_1` FOREIGN KEY (`hang_xe_id`) REFERENCES `hang_xe` (`id`),
  ADD CONSTRAINT `dong_xe_ibfk_2` FOREIGN KEY (`loai_xe_id`) REFERENCES `loai_xe` (`id`);

--
-- Các ràng buộc cho bảng `mau_xe`
--
ALTER TABLE `mau_xe`
  ADD CONSTRAINT `mau_xe_ibfk_1` FOREIGN KEY (`xe_id`) REFERENCES `xe` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `thong_so_ky_thuat`
--
ALTER TABLE `thong_so_ky_thuat`
  ADD CONSTRAINT `thong_so_ky_thuat_ibfk_1` FOREIGN KEY (`xe_id`) REFERENCES `xe` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `xe`
--
ALTER TABLE `xe`
  ADD CONSTRAINT `xe_ibfk_1` FOREIGN KEY (`dong_xe_id`) REFERENCES `dong_xe` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
