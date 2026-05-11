import {createElement} from '../utils/helpers.js';
import {createProductCard} from './ProductCard.js';

// Создание карусели с навигацией и свайпами
export function createCarousel(products, title = '', options = {}) {
    const {
        slidesPerView = 4,
        slidesPerViewTablet = 2,
        slidesPerViewMobile = 2
    } = options;

    const carousel = createElement('div', 'idc-widget-carousel');
    const track = createElement('div', 'idc-widget-carousel__track');
    const slidesContainer = createElement('div', 'idc-widget-carousel__slides');

    // Состояние карусели
    let currentPage = 0;
    let currentSlidesPerView = slidesPerView;

    // Массив для хранения обработчиков событий
    const eventListeners = [];

    // Кеш для оптимизации touchMove
    let cachedSlideElements = null;
    let cachedDimensions = null;

    // Создание
    products.forEach(product => {
        const slide = createElement('div', 'idc-widget-carousel__slide');
        const card = createProductCard(product);
        slide.appendChild(card);
        slidesContainer.appendChild(slide);
    });

    track.appendChild(slidesContainer);

    // Кнопка назад
    const prevBtn = createElement('button', 'idc-widget-carousel__btn idc-widget-carousel__btn--prev');
    prevBtn.innerHTML = '&#8249;';
    prevBtn.setAttribute('aria-label', 'Назад');

    // Кнопка вперед
    const nextBtn = createElement('button', 'idc-widget-carousel__btn idc-widget-carousel__btn--next');
    nextBtn.innerHTML = '&#8250;';
    nextBtn.setAttribute('aria-label', 'Вперед');

    function setSlidesPerView() {
        const width = window.innerWidth;
        if (width < 768) {
            currentSlidesPerView = slidesPerViewMobile;
        } else if (width < 1024) {
            currentSlidesPerView = slidesPerViewTablet;
        } else {
            currentSlidesPerView = slidesPerView;
        }
        // Сбрасываем кеш при изменении размера
        cachedSlideElements = null;
        cachedDimensions = null;
        updateCarousel();
    }

    function getMaxPage() {
        return Math.max(0, Math.ceil(products.length / currentSlidesPerView) - 1);
    }

    function updateCarousel() {
        const maxPage = getMaxPage();
        currentPage = Math.min(currentPage, maxPage);

        // Каждая страница сдвигается на количество слайдов * ширину одного слайда
        const slideWidth = 100 / currentSlidesPerView;
        const offset = -(currentPage * slideWidth * currentSlidesPerView);
        slidesContainer.style.transform = `translateX(${offset}%)`;

        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage >= maxPage;

        updateCounter();
    }

    function goToPrev() {
        if (currentPage > 0) {
            currentPage--;
            updateCarousel();
        }
    }

    function goToNext() {
        const maxPage = getMaxPage();
        if (currentPage < maxPage) {
            currentPage++;
            updateCarousel();
        }
    }

    prevBtn.addEventListener('click', goToPrev);
    nextBtn.addEventListener('click', goToNext);
    eventListeners.push(
        { element: prevBtn, event: 'click', handler: goToPrev },
        { element: nextBtn, event: 'click', handler: goToNext }
    );

    // Переменные для обработки свайпов
    let touchStartX = 0;
    let touchCurrentX = 0;
    let isDragging = false;
    let startTransform = 0;
    let lastTouchMoveTime = 0;
    let hasMoved = false;

    const touchStartHandler = (e) => {
        e.preventDefault();
        touchStartX = e.touches ? e.touches[0].clientX : e.clientX;
        touchCurrentX = touchStartX;
        isDragging = true;
        hasMoved = false;

        const currentTransform = slidesContainer.style.transform;
        const match = currentTransform.match(/translateX\(([^)]+)%\)/);
        startTransform = match ? parseFloat(match[1]) : 0;

        slidesContainer.style.transition = 'none';

        // Кешируем карточки для оптимизации
        if (!cachedSlideElements) {
            cachedSlideElements = slidesContainer.querySelectorAll('.idc-widget-product-card');
        }

        // Помечаем все карточки что начался свайп
        cachedSlideElements.forEach(card => card.dataset.swiping = 'false');
    };

    const touchMoveHandler = (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const now = Date.now();
        if (now - lastTouchMoveTime < 16) return;
        lastTouchMoveTime = now;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        touchCurrentX = clientX;
        const diff = clientX - touchStartX;

        if (Math.abs(diff) > 5 && !hasMoved) {
            hasMoved = true;
            // Помечаем все карточки что идет свайп
            if (cachedSlideElements) {
                cachedSlideElements.forEach(card => card.dataset.swiping = 'true');
            }
        }

        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            // Кешируем размеры для оптимизации
            if (!cachedDimensions) {
                const slideElements = slidesContainer.querySelectorAll('.idc-widget-carousel__slide');
                if (slideElements.length > 0) {
                    const firstSlide = slideElements[0];
                    const slideWidthPx = firstSlide.offsetWidth;
                    const gapPx = parseFloat(window.getComputedStyle(slidesContainer).gap) || 0;
                    const totalWidthPx = (slideWidthPx * products.length) + (gapPx * (products.length - 1));
                    const containerWidthPx = slidesContainer.parentElement.offsetWidth;
                    const maxScrollPx = Math.max(0, totalWidthPx - containerWidthPx);

                    cachedDimensions = {
                        trackWidth: track.offsetWidth,
                        minTransform: -(maxScrollPx / containerWidthPx * 100),
                        maxTransform: 0
                    };
                }
            }

            if (cachedDimensions) {
                const percentDiff = (diff / cachedDimensions.trackWidth) * 100;
                const newTransform = startTransform + percentDiff;
                const clampedTransform = Math.max(
                    cachedDimensions.minTransform,
                    Math.min(cachedDimensions.maxTransform, newTransform)
                );
                slidesContainer.style.transform = `translateX(${clampedTransform}%)`;
            }
        } else {
            // На десктопе - показываем небольшую визуальную обратную связь, но не двигаем далеко
            const trackWidth = track.offsetWidth;
            const percentDiff = (diff / trackWidth) * 100;
            // Ограничиваем движение до 20% для визуального feedback
            const limitedDiff = Math.max(-20, Math.min(20, percentDiff));
            const newTransform = startTransform + limitedDiff;

            // Проверяем границы
            const maxPage = getMaxPage();
            const slideWidth = 100 / currentSlidesPerView;
            const minTransform = -(maxPage * slideWidth * currentSlidesPerView);
            const maxTransform = 0;
            const clampedTransform = Math.max(minTransform, Math.min(maxTransform, newTransform));

            slidesContainer.style.transform = `translateX(${clampedTransform}%)`;
        }
    };

    const touchEndHandler = (e) => {
        if (!isDragging) return;

        isDragging = false;
        slidesContainer.style.transition = 'transform 0.4s ease-in-out';

        const diff = touchCurrentX - touchStartX;
        const swipeThreshold = 50;

        // На десктопе (с кнопками) - переключаем страницы
        // На мобилке - свободный скролл, просто возвращаемся к текущей позиции
        const isMobile = window.innerWidth < 768;

        if (!isMobile && hasMoved && Math.abs(diff) > swipeThreshold) {
            if (diff < 0) {
                goToNext();
            } else {
                goToPrev();
            }
        } else {
            // Оставляем текущую позицию (свободный скролл)
            const currentTransform = slidesContainer.style.transform;
            const match = currentTransform.match(/translateX\(([^)]+)%\)/);
            if (match) {
                slidesContainer.style.transform = `translateX(${match[1]}%)`;
            }
        }

        // Сбрасываем флаг свайпа после небольшой задержки
        setTimeout(() => {
            if (cachedSlideElements) {
                cachedSlideElements.forEach(card => card.dataset.swiping = 'false');
            }
            hasMoved = false;
        }, 100);
    };

    const touchCancelHandler = () => {
        if (isDragging) {
            isDragging = false;
            hasMoved = false;
            // Сбрасываем кеш при отмене
            cachedDimensions = null;
        }
    };

    track.addEventListener('touchstart', touchStartHandler);
    track.addEventListener('touchmove', touchMoveHandler);
    track.addEventListener('touchend', touchEndHandler);
    track.addEventListener('touchcancel', touchCancelHandler);

    track.addEventListener('mousedown', touchStartHandler);
    track.addEventListener('mousemove', touchMoveHandler);
    track.addEventListener('mouseup', touchEndHandler);
    track.addEventListener('mouseleave', touchCancelHandler);

    eventListeners.push(
        { element: track, event: 'touchstart', handler: touchStartHandler },
        { element: track, event: 'touchmove', handler: touchMoveHandler },
        { element: track, event: 'touchend', handler: touchEndHandler },
        { element: track, event: 'touchcancel', handler: touchCancelHandler },
        { element: track, event: 'mousedown', handler: touchStartHandler },
        { element: track, event: 'mousemove', handler: touchMoveHandler },
        { element: track, event: 'mouseup', handler: touchEndHandler },
        { element: track, event: 'mouseleave', handler: touchCancelHandler }
    );

    // Сборка карусели
    const header = createElement('div', 'idc-widget-carousel__header');
    const titleEl = createElement('h2', 'idc-widget-section__title', title);
    const controls = createElement('div', 'idc-widget-carousel__controls');

    // Счётчик страниц
    const counter = createElement('span', 'idc-widget-carousel__counter');

    function updateCounter() {
        const maxPage = getMaxPage();
        const currentPageNum = currentPage + 1;
        const totalPages = maxPage + 1;
        counter.textContent = `${currentPageNum}/${totalPages}`;
    }

    controls.appendChild(prevBtn);
    controls.appendChild(counter);
    controls.appendChild(nextBtn);
    header.appendChild(titleEl);
    header.appendChild(controls);

    carousel.appendChild(header);
    carousel.appendChild(track);

    // Инициализация карусели
    setSlidesPerView();
    updateCounter();

    // Управление с клавиатуры
    carousel.setAttribute('tabindex', '0');
    const keydownHandler = (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goToPrev();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            goToNext();
        }
    };
    carousel.addEventListener('keydown', keydownHandler);
    eventListeners.push({ element: carousel, event: 'keydown', handler: keydownHandler });

    // Debounce для resize
    let resizeTimeout;
    const debouncedResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setSlidesPerView, 150);
    };

    window.addEventListener('resize', debouncedResize);
    eventListeners.push({ element: window, event: 'resize', handler: debouncedResize });

    // Функция очистки для удаления всех обработчиков
    carousel.destroy = () => {
        clearTimeout(resizeTimeout);
        eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        eventListeners.length = 0;
        cachedSlideElements = null;
        cachedDimensions = null;
    };

    return carousel;
}