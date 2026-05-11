export function getByPath(path, obj) {
    if (!path || !obj) return undefined;

    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result === null || result === undefined) return undefined;
        result = result[key];
    }

    return result;
}

export function formatPrice(price) {
    if (!price && price !== 0) return '—';
    const formatted = price.toLocaleString('ru-RU');
    return `${formatted} RUP`;
}

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

export function createElement(tag, className = '', content = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
}