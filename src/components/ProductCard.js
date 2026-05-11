import { formatPrice, createElement, createPriceElement } from '../utils/helpers.js'

const STOCK_STATUS = {
    IN_STOCK: 'IN_STOCK',
    LOW_STOCK: 'LOW_STOCK',
    OUT_OF_STOCK: 'OUT_OF_STOCK',
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

    if (product.stockStatus === STOCK_STATUS.IN_STOCK) {
        const stockStatus = createElement('div', 'idc-widget-card__stock idc-widget-card__stock--in-stock', 'В наличии');
        content.appendChild(stockStatus);
    } else if (product.stockStatus === STOCK_STATUS.LOW_STOCK) {
        const stockStatus = createElement('div', 'idc-widget-card__stock idc-widget-card__stock--low-stock', 'Мало');
        content.appendChild(stockStatus);
    } else if (product.stockStatus === STOCK_STATUS.OUT_OF_STOCK) {
        const stockStatus = createElement('div', 'idc-widget-card__stock idc-widget-card__stock--out-of-stock', 'Нет в наличии');
        content.appendChild(stockStatus);
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