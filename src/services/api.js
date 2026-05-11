import {getByPath} from '../utils/helpers.js';

export async function fetchData(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();

        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response format');
        }

        return data;
    } catch (err) {
        console.error('Failed to fetch data:', err);
        throw err;
    }
}

export function extractCollections(apiData, dataPath = 'data') {
    const rawData = getByPath(dataPath, apiData);
    if (!rawData || !Array.isArray(rawData)) return [];

    return rawData
        .filter(item => item.type === 'collections')
        .map(collection => ({
            id: collection.id,
            title: collection.title,
            products: collection.data.map(transformProduct)
        }));
}

export function extractProducts(apiData, dataPath = 'data', deduplicate = false) {
    const rawData = getByPath(dataPath, apiData);
    if (!rawData || !Array.isArray(rawData)) return [];

    const products = rawData.map(transformProduct);

    if (!deduplicate) return products;

    const seen = new Set();
    return products.filter(product => {
        if (seen.has(product.name)) return false;
        seen.add(product.name);
        return true;
    });
}

export function transformProduct(product) {
    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        oldPrice: product.old_price,
        image: product.preview_image,
        category: product.category_name,
        stockStatus: product.stock_status,
        tags: product.tags || [],
        creditText: product.credit_text,
        isCreditable: product.is_creditable
    };
}