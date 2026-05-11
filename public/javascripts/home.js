let index = 0;

const images = [
    "/images/ford-everest.jpg",
    "/images/ford-everest.jpg",
    "/images/ford-everest.jpg"
];

const banner = document.querySelector('.hero-home img');

if (banner) {
    setInterval(() => {
        index = (index + 1) % images.length;
        banner.src = images[index];
    }, 3000);
}
