// JS điều hướng dùng chung: xử lý menu mobile, lớp nền đóng menu, ô tìm kiếm nhanh và mega menu.
// File này được dùng trên nhiều trang public nên cần giữ tương thích với trang chủ, danh sách xe và chi tiết xe.
document.addEventListener('DOMContentLoaded', () => {
    // ── Mobile Navigation Drawer ──
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu   = document.querySelector('.nav-menu');
    const siteHeader = document.querySelector('.site-header');

    // Tạo backdrop (lớp phủ tối phía sau drawer)
    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);

    // Tạo nút X đóng bên trong drawer
    const closeBtn = document.createElement('button');
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('aria-label', 'Đóng menu');
    closeBtn.className = 'nav-close-btn';
    closeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>`;
    if (navMenu) navMenu.prepend(closeBtn);

    function openMobileMenu() {
        navMenu?.classList.add('is-open');
        backdrop.classList.add('is-open');
        navToggle?.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        navMenu?.classList.remove('is-open');
        backdrop.classList.remove('is-open');
        navToggle?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    // Nút ≡ mở/đóng
    navToggle?.addEventListener('click', () => {
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        isOpen ? closeMobileMenu() : openMobileMenu();
    });

    // Nút X trong drawer đóng
    closeBtn.addEventListener('click', closeMobileMenu);

    // Backdrop click đóng
    backdrop.addEventListener('click', closeMobileMenu);

    // Phím Escape đóng
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu?.classList.contains('is-open')) {
            closeMobileMenu();
        }
    });

    // Đóng khi click vào một link trong menu (chuyển trang)
    navMenu?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            // Chỉ đóng nếu link dẫn sang trang khác (href không phải #)
            if (!link.getAttribute('href')?.startsWith('#')) {
                closeMobileMenu();
            }
        });
    });


    const searchWrapper = document.getElementById('nav-search-wrapper');
    if (!searchWrapper) return;

    // Khối tìm kiếm trên thanh điều hướng: mở overlay, nhập từ khóa và hiển thị kết quả xe từ API.
    const searchTrigger = document.getElementById('nav-search-trigger');
    const searchOverlay = document.getElementById('nav-search-overlay');
    const searchInput = document.getElementById('nav-search-input');
    const resultsContainer = document.getElementById('nav-search-results');
    const searchClose = document.getElementById('nav-search-close');
    let debounceTimer;

    // Chuẩn hóa đường dẫn ảnh để kết quả tìm kiếm luôn có ảnh, kể cả khi dữ liệu chỉ lưu tên file.
    function getImageSrc(imagePath) {
        if (!imagePath) return '/images/no-car.jpg';
        if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith('/')) return imagePath;
        return `/images/${imagePath}`;
    }

    // Toggle Overlay on Trigger Click
    searchTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = searchOverlay.classList.toggle('is-active');
        if (isActive) {
            searchInput.focus();
        }
    });

    // Close Overlay on Close Button Click
    searchClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSearch();
    });

    // Close Overlay when clicking outside
    document.addEventListener('click', (event) => {
        if (!searchWrapper.contains(event.target)) {
            closeSearch();
        }
    });

    // Close Overlay on Escape Key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeSearch();
        }
    });

    function closeSearch() {
        searchOverlay.classList.remove('is-active');
        searchInput.value = '';
        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('is-active');
    }

    // Live search input handler
    // Chờ 200ms sau khi người dùng dừng gõ rồi mới gọi API, tránh gửi quá nhiều request liên tục.
    searchInput.addEventListener('input', (event) => {
        const query = event.target.value.trim();
        clearTimeout(debounceTimer);

        if (query.length < 1) {
            resultsContainer.innerHTML = '';
            resultsContainer.classList.remove('is-active');
            return;
        }

        debounceTimer = setTimeout(() => {
            fetch(`/api/search-cars?q=${encodeURIComponent(query)}`)
                .then((response) => response.json())
                .then((cars) => {
                    if (cars.length > 0) {
                        resultsContainer.innerHTML = cars.map((car) => `
                            <a href="/xe/${car.duong_dan}" class="search-result-item">
                                <img src="${getImageSrc(car.anh_dai_dien)}" alt="${car.ten_xe}">
                                <span>${car.ten_xe}</span>
                            </a>
                        `).join('');
                        resultsContainer.classList.add('is-active');
                        return;
                    }

                    resultsContainer.innerHTML = '<div class="search-no-results">Không tìm thấy xe nào.</div>';
                    resultsContainer.classList.add('is-active');
                })
                .catch((error) => {
                    console.error('Lỗi tìm kiếm:', error);
                    resultsContainer.classList.remove('is-active');
                });
        }, 200);
    });

    // Prevent closing when clicking inside the overlay panel
    searchOverlay.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Mega Menu Hover / Tab Switch logic
    // Khối mega menu: rê chuột qua loại xe thì nhóm xe preview bên phải đổi theo loại đó.
    // Click vẫn giữ nhiệm vụ chuyển sang trang danh sách xe theo loại.
    const megaTypeBtns = document.querySelectorAll('.mega-type-item-btn');
    const megaCarGroups = document.querySelectorAll('.mega-cars-grid-group');

    if (megaTypeBtns.length > 0 && megaCarGroups.length > 0) {
        megaTypeBtns.forEach(btn => {
            // On hover: switch preview panel only (click still navigates)
            btn.addEventListener('mouseenter', () => {
                const targetType = btn.getAttribute('data-mega-type');
                
                megaTypeBtns.forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');

                megaCarGroups.forEach(group => {
                    if (group.getAttribute('data-mega-group') === targetType) {
                        group.classList.add('is-active');
                    } else {
                        group.classList.remove('is-active');
                    }
                });
            });
        });
    }
});
