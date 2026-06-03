// JS trang chủ: điều khiển slider banner lớn và khu vực xe nổi bật.
// File này chỉ xử lý tương tác phía trình duyệt, dữ liệu xe/panel đã được EJS render sẵn ra HTML.

// Khối lấy phần tử HTML: gom các slide, nút chuyển banner, tab lọc xe và nút chuyển xe nổi bật.
const slides = Array.from(document.querySelectorAll('[data-slide]'));
const prevButton = document.querySelector('[data-prev]');
const nextButton = document.querySelector('[data-next]');
const dotButtons = Array.from(document.querySelectorAll('[data-goto]'));
const featureCards = Array.from(document.querySelectorAll('[data-feature-car]'));
const featureTabs = Array.from(document.querySelectorAll('[data-feature-filter]'));
const featurePrev = document.querySelector('[data-feature-prev]');
const featureNext = document.querySelector('[data-feature-next]');
const featureCurrent = document.querySelector('[data-feature-current]');
const featureTotal = document.querySelector('[data-feature-total]');

let activeSlide = 0;
let slideTimer = null;
const slideDelay = 5000;

// Hiển thị một banner theo vị trí index, đồng thời cập nhật trạng thái chấm điều hướng.
// Công thức chia dư giúp bấm lùi ở slide đầu sẽ quay về slide cuối.
function showSlide(index) {
    if (!slides.length) return;

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dotButtons.forEach((button) => {
        button.classList.toggle('is-active', Number(button.dataset.goto) === activeSlide);
    });
}

// Khởi động lại chế độ tự chạy banner sau mỗi lần người dùng bấm nút/chấm.
// Việc reset timer giúp người dùng có đủ thời gian xem slide vừa chọn.
function restartSlider() {
    if (slides.length <= 1) return;
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = setInterval(() => showSlide(activeSlide + 1), slideDelay);
}

prevButton?.addEventListener('click', () => {
    showSlide(activeSlide - 1);
    restartSlider();
});

nextButton?.addEventListener('click', () => {
    showSlide(activeSlide + 1);
    restartSlider();
});

dotButtons.forEach((button) => {
    button.addEventListener('click', () => {
        showSlide(Number(button.dataset.goto));
        restartSlider();
    });
});
showSlide(0);
restartSlider();

// Khối xe nổi bật: lưu loại xe đang chọn và vị trí xe đang hiện trong loại đó.
let activeFeatureType = featureTabs[0]?.dataset.featureFilter || '';
let activeFeatureIndex = 0;

// Lọc ra các thẻ xe thuộc đúng nhóm người dùng đang chọn ở tab.
function getVisibleFeatureCards() {
    return featureCards.filter((card) => card.dataset.featureType === activeFeatureType);
}

// Hiển thị xe nổi bật theo index trong nhóm hiện tại và cập nhật bộ đếm 1 / tổng số.
function showFeatureCar(index) {
    if (!featureCards.length) return;

    const visibleCards = getVisibleFeatureCards();
    if (!visibleCards.length) return;

    activeFeatureIndex = (index + visibleCards.length) % visibleCards.length;
    const activeCard = visibleCards[activeFeatureIndex];

    featureCards.forEach((card) => {
        card.classList.toggle('is-active', card === activeCard);
    });

    if (featureCurrent) {
        featureCurrent.textContent = String(activeFeatureIndex + 1);
    }

    if (featureTotal) {
        featureTotal.textContent = String(visibleCards.length);
    }
}

// Khi đổi tab loại xe, reset về xe đầu tiên của nhóm mới để giao diện luôn có nội dung hợp lệ.
featureTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        activeFeatureType = tab.dataset.featureFilter;
        activeFeatureIndex = 0;

        featureTabs.forEach((item) => {
            item.classList.toggle('is-active', item === tab);
        });

        showFeatureCar(0);
    });
});

// Hai nút mũi tên chỉ xoay vòng trong nhóm xe đang lọc, không nhảy sang nhóm khác.
featurePrev?.addEventListener('click', () => {
    showFeatureCar(activeFeatureIndex - 1);
});

featureNext?.addEventListener('click', () => {
    showFeatureCar(activeFeatureIndex + 1);
});

showFeatureCar(0);
