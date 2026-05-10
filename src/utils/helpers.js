// Форматирование raw цены с API
export function formatPrice(price) {
    if (!price && price !== 0) return '—';
    const formatted = price.toLocaleString('ru-RU');
    return `${formatted} RUP`;
}

// Создание элемента цены с разделением числа и валюты
export function createPriceElement(price, className) {
    const container = createElement('div', className);
    if (!price && price !== 0) {
        container.textContent = '—';
        return container;
    }

    const formatted = price.toLocaleString('ru-RU');
    const priceNumber = createElement('span', '', formatted);
    const currency = createElement('span', 'idc-widget-card__currency', ' RUP');

    container.appendChild(priceNumber);
    container.appendChild(currency);

    return container;
}

// Создание DOM элемента с заданными параметрами
export function createElement(tag, className = '', content = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
}