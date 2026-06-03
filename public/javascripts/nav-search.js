document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Menu Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navActions = document.querySelector('.nav-actions');
    const siteHeader = document.querySelector('.site-header');

    function openMobileMenu() {
        navToggle?.setAttribute('aria-expanded', 'true');
        navMenu?.classList.add('is-open');
        navActions?.classList.add('is-open');
        // Khoá cuộn trang khi menu mở
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        navToggle?.setAttribute('aria-expanded', 'false');
        navMenu?.classList.remove('is-open');
        navActions?.classList.remove('is-open');
        // Cho phép cuộn lại
        document.body.style.overflow = '';
    }

    navToggle?.addEventListener('click', () => {
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Đóng menu khi nhấn phím Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu?.classList.contains('is-open')) {
            closeMobileMenu();
        }
    });

    // Đóng menu khi click bên ngoài header (vùng overlay)
    document.addEventListener('click', (e) => {
        if (navMenu?.classList.contains('is-open') && siteHeader && !siteHeader.contains(e.target)) {
            closeMobileMenu();
        }
    });

    const searchWrapper = document.getElementById('nav-search-wrapper');
    if (!searchWrapper) return;

    const searchTrigger = document.getElementById('nav-search-trigger');
    const searchOverlay = document.getElementById('nav-search-overlay');
    const searchInput = document.getElementById('nav-search-input');
    const resultsContainer = document.getElementById('nav-search-results');
    const searchClose = document.getElementById('nav-search-close');
    let debounceTimer;

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
