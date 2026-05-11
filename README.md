# IDC Shop Widget

**[🔗 Live Demo](https://only1stumpy.github.io/TEST-IDC/)**

Виджет карусели товаров для встраивания на любую страницу. Получает данные из API shop.idc.md и отображает коллекции товаров в виде интерактивной карусели с поддержкой свайпов, клавиатурной навигации и адаптивной верстки.



## Структура проекта

```
Test_IDC/
├── src/
│   ├── components/
│   │   ├── Carousel.js     # Компонент карусели
│   │   └── ProductCard.js  # Компонент карточки товара
│   ├── services/
│   │   └── api.js          # Запросы к API и трансформация данных
│   ├── styles/
│   │   └── main.css        # Стили виджета
│   ├── utils/
│   │   └── helpers.js      # Вспомогательные функции
│   └── index.js            # Точка входа
├── index.html              # Демо-страница
└── README.md
```

## Архитектура и принципы

Проект построен на ванильном JS без зависимостей, с явным разделением
ответственности (Separation of Concerns):

- `services/api.js` - изолированный слой работы с API: fetch, валидация
  ответа и трансформация данных из формата API во внутренний формат виджета.
  Остальной код ничего не знает о структуре API.
- `components/` - чистые UI-компоненты. `Carousel.js` отвечает только за
  отображение и навигацию, `ProductCard.js` - только за рендер карточки.
  Компоненты не делают запросов и не знают об источнике данных.
- `utils/helpers.js` - переиспользуемые утилиты (`createElement`,
  `formatPrice`) без побочных эффектов.
- `index.js` - точка входа, оркестрирует инициализацию: получает данные,
  фильтрует коллекции, собирает DOM.


## Подключение

```html
<link rel="stylesheet" href="src/styles/main.css">
 
<div id="idc-widget"></div>
 
<script type="module">
    import { initWidget } from './src/index.js';
    initWidget('idc-widget');
</script>
```

## Параметры

### Базовые параметры

```js
initWidget('idc-widget', {
    collectionIds: [6],         // ID коллекций из API (по умолчанию: [6])
    carouselOptions: {
        slidesPerView: 4,       // Слайдов на десктопе (по умолчанию: 4)
        slidesPerViewTablet: 2, // Слайдов на планшете (по умолчанию: 2)
        slidesPerViewMobile: 2, // Слайдов на мобильном (по умолчанию: 2)
    }
});
```

### Гибкая настройка API

Виджет поддерживает работу с любым API endpoint:

**apiUrl** (string) — URL API для загрузки данных  
По умолчанию: `'https://shop.idc.md/api/v1/shop/main'`

**dataPath** (string) — путь к данным в ответе API (например: `'data.items'` или `'products'`)  
По умолчанию: `'data'`

**dataType** (string) — тип данных: `'collections'` или `'products'`  
По умолчанию: `'collections'`

**deduplicateByName** (boolean) — удалять дубликаты товаров по полю `name` (для вариантов одной модели)  
По умолчанию: `false`

**title** (string) — заголовок для режима `dataType: 'products'`

### Примеры

#### Фильтрованный каталог

```js
initWidget('idc-widget', {
    apiUrl: 'https://shop.idc.md/api/v1/shop/categories/smarts?filter[attribute][5g][]=yes',
    dataPath: 'data.products.data',
    dataType: 'products',
    title: 'Телефоны с 5G',
    deduplicateByName: true  // Убрать дубликаты (цветовые варианты)
});
```

#### Несколько виджетов на странице

```js
// Новинки
initWidget('widget-new', {
    collectionIds: [6]
});

// 5G телефоны
initWidget('widget-5g', {
    apiUrl: 'https://shop.idc.md/api/v1/shop/categories/smarts?filter[attribute][5g][]=yes',
    dataPath: 'data.products.data',
    dataType: 'products',
    title: 'Телефоны с 5G'
});
```

## Очистка (destroy)

Если виджет встраивается в SPA или DOM-элемент может быть удалён - вызовите `destroy()` на элементе карусели, чтобы снять все event listener-ы и избежать утечек памяти:

```js
import { initWidget } from './src/index.js';
 
initWidget('idc-widget');
 
// При удалении компонента:
const carousel = document.querySelector('.idc-widget-carousel');
if (carousel && typeof carousel.destroy === 'function') {
    carousel.destroy();
}
```

`destroy()` снимает: клики на кнопки, touch/mouse события свайпа, keydown, resize.
 