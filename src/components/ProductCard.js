import { formatPrice, createElement, createPriceElement } from '../utils/helpers.js'

const STOCK_STATUS = {
    IN_STOCK: 'IN_STOCK',
    LOW_STOCK: 'LOW_STOCK',
}

// Создание DOM элемента карточки товара
export function createProductCard(product) {
    const card = createElement('a', 'idc-widget-product-card');
    card.href = `https://shop.idc.md/product/${product.slug}`;

    // Предотвращаем переход по ссылке при свайпе
    card.addEventListener('click', (e) => {
        if (card.dataset.swiping === 'true') {
            e.preventDefault();
        }
    });

    const imageContainer = createElement('div', 'idc-widget-card__image-container');
    const image = createElement('img', 'idc-widget-card__image');
    image.src = product.image;
    image.alt = product.name;
    image.loading = 'lazy';
    image.onerror = function() {
        this.style.display = 'none';
        const placeholder = createElement('div', 'idc-widget-card__image-placeholder', '📦');
        placeholder.style.cssText = 'display: flex; align-items: center; justify-content: center; font-size: 48px; opacity: 0.3; height: 100%;';
        imageContainer.appendChild(placeholder);
    };
    imageContainer.appendChild(image);

    if (product.tags && product.tags.length > 0) {
        const tagsContainer = createElement('div', 'idc-widget-card__tags');
        product.tags.forEach(tag => {
            const tagEl = createElement('span', 'idc-widget-card__tag', tag.label);
            tagEl.style.backgroundColor = tag.color;
            tagEl.style.color = tag.text_color;
            tagsContainer.appendChild(tagEl);
        });
        imageContainer.appendChild(tagsContainer);
    }

    const content = createElement('div', 'idc-widget-card__content');

    // Надпись статуса наличия
    const stockStatus = createElement('div', 'idc-widget-card__stock');
    if (product.stockStatus === STOCK_STATUS.IN_STOCK) {
        stockStatus.textContent = 'В наличии';
        stockStatus.classList.add('idc-widget-card__stock--in-stock');
    } else if (product.stockStatus === STOCK_STATUS.LOW_STOCK) {
        stockStatus.textContent = 'Мало';
        stockStatus.classList.add('idc-widget-card__stock--low-stock');
    }

    const category = createElement('div', 'idc-widget-card__category', product.category);
    const name = createElement('h3', 'idc-widget-card__name', product.name);

    const priceContainer = createElement('div', 'idc-widget-card__price-container');

    if (product.oldPrice && product.oldPrice > 0) {
        const oldPrice = createPriceElement(product.oldPrice, 'idc-widget-card__old-price');
        priceContainer.appendChild(oldPrice);
    }

    const price = createPriceElement(product.price, 'idc-widget-card__price');
    priceContainer.appendChild(price);

    content.appendChild(stockStatus);
    content.appendChild(category);
    content.appendChild(name);
    if (product.creditText) {
        const credit = createElement('div', 'idc-widget-card__credit', product.creditText);
        content.appendChild(credit);
    }
    content.appendChild(priceContainer);

    card.appendChild(imageContainer);
    card.appendChild(content);

    return card;
}