const slides = Array.from(document.querySelectorAll('[data-slide]'));
const prevButton = document.querySelector('[data-prev]');
const nextButton = document.querySelector('[data-next]');
const dotButtons = Array.from(document.querySelectorAll('[data-goto]'));
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navActions = document.querySelector('.nav-actions');
const featureCards = Array.from(document.querySelectorAll('[data-feature-car]'));
const featureTabs = Array.from(document.querySelectorAll('[data-feature-filter]'));
const featurePrev = document.querySelector('[data-feature-prev]');
const featureNext = document.querySelector('[data-feature-next]');
const featureCurrent = document.querySelector('[data-feature-current]');
const featureTotal = document.querySelector('[data-feature-total]');

let activeSlide = 0;
let slideTimer = null;
const slideDelay = 5000;

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

navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu?.classList.toggle('is-open', !expanded);
    navActions?.classList.toggle('is-open', !expanded);
});

showSlide(0);
restartSlider();

let activeFeatureType = featureTabs[0]?.dataset.featureFilter || '';
let activeFeatureIndex = 0;

function getVisibleFeatureCards() {
    return featureCards.filter((card) => card.dataset.featureType === activeFeatureType);
}

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

featurePrev?.addEventListener('click', () => {
    showFeatureCar(activeFeatureIndex - 1);
});

featureNext?.addEventListener('click', () => {
    showFeatureCar(activeFeatureIndex + 1);
});

showFeatureCar(0);
