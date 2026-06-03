document.addEventListener('DOMContentLoaded', () => {
    const viewer = document.getElementById('car-360-viewer');
    const mainImage = document.querySelector('[data-car-image]');
    const progress = document.querySelector('[data-360-progress]');
    let frameUrls = Array.isArray(window.car360Frames) ? window.car360Frames.filter(Boolean) : [];
    const thumbs = [...document.querySelectorAll('.detail-thumbs button[data-image]')];
    const colorButtons = [...document.querySelectorAll('.color-list button')];

    if (!viewer || !mainImage) return;

    frameUrls.forEach((src) => {
        const image = new Image();
        image.src = src;
    });

    let activeFrame = 0;
    let dragStartX = 0;
    let dragLastX = 0;
    let isDragging = false;
    let staticColorMode = false;
    const dragSensitivity = 14;

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

    function setActiveThumb(index) {
        thumbs.forEach((thumb) => thumb.classList.remove('is-active'));
    }

    function updateProgress(index) {
        if (!progress || frameUrls.length <= 1) return;
        const percent = ((index + 1) / frameUrls.length) * 100;
        progress.style.width = `${percent}%`;
    }

    function showFrame(index) {
        if (!frameUrls.length) return;
        activeFrame = (index + frameUrls.length) % frameUrls.length;
        mainImage.src = frameUrls[activeFrame];
        setActiveThumb(activeFrame);
        updateProgress(activeFrame);
    }

    function getPointerX(event) {
        return event.touches ? event.touches[0].clientX : event.clientX;
    }

    function startDrag(event) {
        if (staticColorMode || frameUrls.length < 2) return;
        isDragging = true;
        dragStartX = getPointerX(event);
        dragLastX = dragStartX;
        viewer.classList.add('is-dragging');
        event.preventDefault();
    }

    function moveDrag(event) {
        if (!isDragging || staticColorMode) return;
        const currentX = getPointerX(event);
        const diff = currentX - dragLastX;

        if (Math.abs(diff) >= dragSensitivity) {
            showFrame(activeFrame + (diff > 0 ? -1 : 1));
            dragLastX = currentX;
        }
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        viewer.classList.remove('is-dragging');
    }

    viewer.addEventListener('mousedown', startDrag);
    viewer.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('touchmove', moveDrag, { passive: true });
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
    window.addEventListener('mouseleave', endDrag);

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

    if (frameUrls.length > 1) {
        viewer.setAttribute('tabindex', '0');
        viewer.setAttribute('role', 'application');
        viewer.setAttribute('aria-label', 'Trình xem xe 360 độ, kéo ngang hoặc dùng phím mũi tên để xoay xe');
    }

    if (frameUrls.length) {
        showFrame(0);
    }
});
