# IDC Shop Widget

Виджет карусели товаров для встраивания на любую страницу. Получает данные из API shop.idc.md и отображает коллекции товаров в виде интерактивной карусели.


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

```js
initWidget('idc-widget', {
    collectionIds: [6],         // ID коллекций из API (по умолчанию: [6] — Новинки)
    carouselOptions: {
        slidesPerView: 4,       // Слайдов на десктопе (по умолчанию: 4)
        slidesPerViewTablet: 2, // Слайдов на планшете (по умолчанию: 2)
        slidesPerViewMobile: 2, // Слайдов на мобильном (по умолчанию: 2)
    }
});
```

