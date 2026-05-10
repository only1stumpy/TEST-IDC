const API_URL = 'https://shop.idc.md/api/v1/shop/main'


// Fetch данных с API
export async function fetchShopMain() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('Failed to fetch shop data:', err);
        return null;
    }
}

// Извлекаем коллекции из данных API
export function extractCollections(apiData) {
    if (!apiData || !apiData.data) return [];

    return apiData.data
        .filter(item => item.type === 'collections')
        .map(collection => ({
            id: collection.id,
            title: collection.title,
            products: collection.data.map(transformProduct)
        }))
}


// Трансформируем данные товара из форрмата API в формат виджета
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