// JS trang chi tiết xe: điều khiển ảnh 360, chọn màu, ảnh thumbnail và phím mũi tên.
// Dữ liệu frame 360 được truyền từ EJS qua window.car360Frames ở cuối trang chi tiết.
document.addEventListener('DOMContentLoaded', () => {
    // Khối lấy phần tử HTML chính: viewer là vùng xoay xe, mainImage là ảnh đang hiển thị.
    const viewer = document.getElementById('car-360-viewer');
    const mainImage = document.querySelector('[data-car-image]');
    const progress = document.querySelector('[data-360-progress]');
    let frameUrls = Array.isArray(window.car360Frames) ? window.car360Frames.filter(Boolean) : [];
    const thumbs = [...document.querySelectorAll('.detail-thumbs button[data-image]')];
    const colorButtons = [...document.querySelectorAll('.color-list button')];

    if (!viewer || !mainImage) return;

    // Tải trước toàn bộ frame 360 để khi kéo xoay xe ảnh đổi mượt hơn, hạn chế nhấp nháy.
    frameUrls.forEach((src) => {
        const image = new Image();
        image.src = src;
    });

    let activeFrame = 0;
    let dragStartX = 0;
    let dragLastX = 0;
    let hasDragged = false;
    let isDragging = false;
    let staticColorMode = false;
    const dragSensitivity = 14;

    // Hàm public cho EJS inline script gọi khi người dùng chọn màu có bộ ảnh 360 riêng.
    // Nếu màu không có đủ frame 360 thì viewer chuyển sang chế độ ảnh tĩnh.
    window.update360Frames = function(newFrames) {
        frameUrls = Array.isArray(newFrames) ? newFrames.filter(Boolean) : [];
        if (frameUrls.length > 0) {
            frameUrls.forEach((src) => {
                const img = new Image();
                img.src = src;
            });
            staticColorMode = false;
            viewer.classList.remove('is-static-color');
            if (frameUrls.length > 1) {
                viewer.classList.add('is-ready');
            } else {
                viewer.classList.remove('is-ready');
            }
            const progressContainer = viewer.querySelector('.viewer-360-progress');
            if (progressContainer) {
                progressContainer.style.display = frameUrls.length > 1 ? 'block' : 'none';
            }
            showFrame(0);
        } else {
            staticColorMode = true;
            viewer.classList.add('is-static-color');
            viewer.classList.remove('is-ready');
            const progressContainer = viewer.querySelector('.viewer-360-progress');
            if (progressContainer) {
                progressContainer.style.display = 'none';
            }
        }
    };

    // Đánh dấu thumbnail đang chọn. Hiện tại ảnh 360 dùng frame động nên chỉ reset trạng thái cũ.
    function setActiveThumb(index) {
        thumbs.forEach((thumb) => thumb.classList.remove('is-active'));
    }

    // Cập nhật thanh tiến trình nhỏ bên dưới viewer để người dùng biết đang ở frame nào.
    function updateProgress(index) {
        if (!progress || frameUrls.length <= 1) return;
        const percent = ((index + 1) / frameUrls.length) * 100;
        progress.style.width = `${percent}%`;
    }

    // Đổi ảnh chính sang frame 360 tương ứng. Index được xoay vòng để kéo liên tục không bị dừng.
    function showFrame(index) {
        if (!frameUrls.length) return;
        activeFrame = (index + frameUrls.length) % frameUrls.length;
        mainImage.src = frameUrls[activeFrame];
        setActiveThumb(activeFrame);
        updateProgress(activeFrame);
    }

    // Chuẩn hóa tọa độ X cho cả chuột và cảm ứng trên mobile.
    function getPointerX(event) {
        return event.touches ? event.touches[0].clientX : event.clientX;
    }

    // Bắt đầu thao tác kéo xoay xe, chỉ chạy khi có từ 2 frame trở lên.
    function startDrag(event) {
        if (staticColorMode || frameUrls.length < 2) return;
        isDragging = true;
        dragStartX = getPointerX(event);
        dragLastX = dragStartX;
        hasDragged = false;
        viewer.classList.add('is-dragging');
        if (event.pointerId && viewer.setPointerCapture) {
            viewer.setPointerCapture(event.pointerId);
        }
        event.preventDefault();
    }

    // Khi kéo ngang đủ xa, chuyển frame theo hướng kéo để tạo cảm giác xoay xe.
    function moveDrag(event) {
        if (!isDragging || staticColorMode) return;
        if (event.cancelable) event.preventDefault();
        const currentX = getPointerX(event);
        const diff = currentX - dragLastX;

        if (Math.abs(diff) >= dragSensitivity) {
            showFrame(activeFrame + (diff > 0 ? -1 : 1));
            dragLastX = currentX;
            hasDragged = true;
        }
    }

    // Kết thúc kéo và trả viewer về trạng thái bình thường.
    function endDrag(event) {
        if (!isDragging) return;
        isDragging = false;
        viewer.classList.remove('is-dragging');
        if (event && event.pointerId && viewer.releasePointerCapture) {
            try {
                viewer.releasePointerCapture(event.pointerId);
            } catch (err) {
                // Pointer may already be released by the browser.
            }
        }
    }

    if (window.PointerEvent) {
        viewer.addEventListener('pointerdown', startDrag);
        viewer.addEventListener('pointermove', moveDrag);
        viewer.addEventListener('pointerup', endDrag);
        viewer.addEventListener('pointercancel', endDrag);
        viewer.addEventListener('lostpointercapture', endDrag);
    } else {
        viewer.addEventListener('mousedown', startDrag);
        viewer.addEventListener('touchstart', startDrag, { passive: false });
        window.addEventListener('mousemove', moveDrag);
        window.addEventListener('touchmove', moveDrag, { passive: false });
        window.addEventListener('mouseup', endDrag);
        window.addEventListener('touchend', endDrag);
        window.addEventListener('mouseleave', endDrag);
    }

    viewer.addEventListener('click', () => {
        if (staticColorMode || frameUrls.length < 2 || hasDragged) return;
        showFrame(activeFrame + 1);
    });

    // Cho phép dùng bàn phím mũi tên trái/phải để xem 360, hỗ trợ người dùng không dùng chuột.
    viewer.addEventListener('keydown', (event) => {
        if (staticColorMode || frameUrls.length < 2) return;
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            showFrame(activeFrame - 1);
        }
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            showFrame(activeFrame + 1);
        }
    });

    // Thumbnail cho phép nhảy sang một ảnh cụ thể trong thư viện chi tiết xe.
    // Khi chọn thumbnail, thanh tiến trình 360 được reset vì đây là ảnh tĩnh.
    thumbs.forEach((button) => {
        button.addEventListener('click', () => {
            const imageUrl = button.dataset.image;
            if (!imageUrl) return;

            staticColorMode = !frameUrls.length;
            viewer.classList.remove('is-static-color');
            mainImage.src = imageUrl;
            thumbs.forEach((thumb) => thumb.classList.toggle('is-active', thumb === button));
            if (progress) progress.style.width = '0%';
        });
    });

    // Nút màu xe đổi ảnh preview, đồng thời kích hoạt trạng thái màu đang chọn.
    // Trường hợp màu có bộ 360 riêng sẽ được script inline trong EJS gọi update360Frames.
    colorButtons.forEach((button, index) => {
        if (index === 0) button.classList.add('is-active');

        button.addEventListener('click', () => {
            colorButtons.forEach((item) => item.classList.remove('is-active'));
            button.classList.add('is-active');

            const imageUrl = button.dataset.image;
            if (imageUrl) {
                staticColorMode = true;
                mainImage.src = imageUrl;
                viewer.classList.add('is-static-color');
                thumbs.forEach((thumb) => thumb.classList.remove('is-active'));
                if (progress) progress.style.width = '0%';
                return;
            }

            if (!frameUrls.length) {
                staticColorMode = true;
                return;
            }

            staticColorMode = false;
            viewer.classList.remove('is-static-color');
            showFrame(activeFrame);
        });
    });

    // Thiết lập thuộc tính hỗ trợ truy cập cho viewer khi có ảnh 360 thật.
    if (frameUrls.length > 1) {
        viewer.setAttribute('tabindex', '0');
        viewer.setAttribute('role', 'application');
        viewer.setAttribute('aria-label', 'Trình xem xe 360 độ, kéo ngang hoặc dùng phím mũi tên để xoay xe');
    }

    if (frameUrls.length) {
        showFrame(0);
    }
});
