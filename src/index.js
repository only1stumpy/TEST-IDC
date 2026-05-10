import {createElement} from "./utils/helpers.js";
import {fetchShopMain, extractCollections} from "./services/api.js";
import {createCarousel} from "./components/Carousel.js";


export async function initWidget(containerId, options = {}){
    const {
        collectionIds = [6],
        carouselOptions = {}
    } = options;

    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found');
        return;
    }

    const loader = createElement('div', 'idc-widget-loader', 'Загрузка...');
    container.appendChild(loader);

    try {
        const data = await fetchShopMain();
        const collections = extractCollections(data);

        loader.remove();

        const filteredCollections = collections.filter(col =>
            collectionIds.includes(col.id) && col.products.length > 0
        );

        if (filteredCollections.length === 0) {
            const emptyMessage = createElement('div', 'idc-widget-empty', 'Нет доступных товаров');
            container.appendChild(emptyMessage);
            return;
        }

        filteredCollections.forEach(collection => {
            const section = createElement('div', 'idc-widget-section');


            const carousel = createCarousel(collection.products, collection.title, carouselOptions);

            section.appendChild(carousel);
            container.appendChild(section);
        });

    } catch(e) {
        loader.remove();
        const errorMessage = createElement('div', 'idc-widget-error', 'Ошибка загрузки данных');
        container.appendChild(errorMessage);
        console.error('Widget initialization error:', e);
    }
}

// Экспорт в глобальную область для использования без сборщика
if (typeof window !== 'undefined') {
    window.IDCWidget = { initWidget };
}