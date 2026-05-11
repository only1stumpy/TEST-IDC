import {createElement} from "./utils/helpers.js";
import {fetchData, extractCollections, extractProducts} from "./services/api.js";
import {createCarousel} from "./components/Carousel.js";


export async function initWidget(containerId, options = {}){
    const {
        apiUrl = 'https://shop.idc.md/api/v1/shop/main',
        dataPath = 'data',
        dataType = 'collections',
        collectionIds = [6],
        carouselOptions = {},
        deduplicateByName = false
    } = options;

    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found');
        return;
    }

    const loader = createElement('div', 'idc-widget-loader', 'Загрузка...');
    container.appendChild(loader);

    try {
        const data = await fetchData(apiUrl);

        if (!data) {
            throw new Error('Invalid API response');
        }

        let collections = [];

        if (dataType === 'collections') {
            collections = extractCollections(data, dataPath);

            if (collectionIds && collectionIds.length > 0) {
                collections = collections.filter(col =>
                    collectionIds.includes(col.id) && col.products.length > 0
                );
            }
        } else if (dataType === 'products') {
            const products = extractProducts(data, dataPath, deduplicateByName);
            if (products.length > 0) {
                collections = [{
                    id: 1,
                    title: options.title || '',
                    products: products
                }];
            }
        }

        loader.remove();

        if (collections.length === 0) {
            const emptyMessage = createElement('div', 'idc-widget-empty', 'Нет доступных товаров');
            container.appendChild(emptyMessage);
            return;
        }

        collections.forEach(collection => {
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

if (typeof window !== 'undefined') {
    window.IDCWidget = { initWidget };
}