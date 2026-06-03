document.addEventListener('click', (event) => {
    const shareButton = event.target.closest('[data-share-url]');
    if (!shareButton) return;

    const url = new URL(shareButton.dataset.shareUrl, window.location.origin).href;

    if (navigator.share) {
        navigator.share({ url }).catch(() => {});
        return;
    }

    navigator.clipboard.writeText(url).then(() => {
        shareButton.textContent = 'Đã sao chép';
        setTimeout(() => {
            shareButton.textContent = 'Chia sẻ';
        }, 1600);
    });
});
