// ================= БАЗА ДАННЫХ ПРОЕКТА =================

// 1. Каталог товаров (с реалистичными фото)
const productsData = [
    {
        id: "p1",
        title: "Томаты розовые (грунтовые)",
        category: "veg",
        supplier: "Агрокомплекс «Южный»",
        price: "180 ₽/кг",
        minOrder: "10 кг",
        stock: true,
        image: "img/tomati.jpg"
    },
    {
        id: "p2",
        title: "Огурцы среднеплодные",
        category: "veg",
        supplier: "Фермерское хозяйство «Зеленый сад»",
        price: "110 ₽/кг",
        minOrder: "15 кг",
        stock: true,
        image: "img/ogurci.jpg"
    },
    {
        id: "p3",
        title: "Говядина вырезка (охлажденная)",
        category: "meat",
        supplier: "МясоТрейд Тверь",
        price: "890 ₽/кг",
        minOrder: "5 кг",
        stock: true,
        image: "img/govyadina.jpg"
    },
    {
        id: "p4",
        title: "Филе грудки индейки",
        category: "meat",
        supplier: "КФХ «Птичья Гавань»",
        price: "420 ₽/кг",
        minOrder: "10 кг",
        stock: false, // Нет в наличии
        image: "img/filegrudki.jpg"
    },
    {
        id: "p5",
        title: "Лосось филе на коже (Семга)",
        category: "seafood",
        supplier: "Ocean Prime",
        price: "1 450 ₽/кг",
        minOrder: "3 кг",
        stock: true,
        image: "img/lososfile.jpg"
    },
    {
        id: "p6",
        title: "Креветки тигровые 16/20",
        category: "seafood",
        supplier: "Морской Улов",
        price: "950 ₽/упак",
        minOrder: "5 упак",
        stock: true,
        image: "img/krevetki.jpg"
    },
    {
        id: "p7",
        title: "Сливки 33% профессиональные",
        category: "dairy",
        supplier: "МилкПро",
        price: "320 ₽/л",
        minOrder: "6 л",
        stock: true,
        image: "img/slivki.jpg"
    },
    {
        id: "p8",
        title: "Сыр Моцарелла для пиццы (блок)",
        category: "dairy",
        supplier: "Сыроварня «Итальянец»",
        price: "560 ₽/кг",
        minOrder: "10 кг",
        stock: true,
        image: "img/sirmocarela.jpg"
    },
    {
        id: "p9",
        title: "Картофель мытый (сорт Гала)",
        category: "veg",
        supplier: "Агрокомплекс «Южный»",
        price: "45 ₽/кг",
        minOrder: "50 кг",
        stock: true,
        image: "img/potatogala.jpg"
    },
    {
        id: "p10",
        title: "Свиная шея (без кости)",
        category: "meat",
        supplier: "МясоТрейд Тверь",
        price: "480 ₽/кг",
        minOrder: "15 кг",
        stock: true,
        image: "img/pigneck.jpg"
    },
    {
        id: "p11",
        title: "Масло сливочное 82.5% (ГОСТ)",
        category: "dairy",
        supplier: "МилкПро",
        price: "850 ₽/кг",
        minOrder: "5 кг",
        stock: true,
        image: "img/maslo.jpg"
    },
    {
        id: "p12",
        title: "Кальмар неочищенный (тушка)",
        category: "seafood",
        supplier: "Морской Улов",
        price: "380 ₽/кг",
        minOrder: "10 кг",
        stock: false, // Нет в наличии для разнообразия
        image: "img/squid.jpg"
    },
    {
        id: "p13",
        title: "Сыр Творожный (Крем-чиз)",
        category: "dairy",
        supplier: "Сыроварня «Итальянец»",
        price: "420 ₽/кг",
        minOrder: "5 кг",
        stock: true,
        image: "img/creamcheez.jpg"
    },
    {
        id: "p14",
        title: "Мидии в створках (Чили)",
        category: "seafood",
        supplier: "Ocean Prime",
        price: "620 ₽/упак",
        minOrder: "5 упак",
        stock: true,
        image: "img/midii.jpg"
    }
];

// 2. Лента обновлений (Спрос и предложения на главной)
const feedData = [
    {
        type: "request",
        text: "Ресторан «La Bottega» ищет поставщика трюфельного масла (от 5 л/мес). Готовы заключить договор.",
        time: "10 мин назад"
    },
    {
        type: "offer",
        text: "Агрокомплекс «Южный» добавил свежую партию рукколы. Скидка 15% при заказе от 5 кг до конца недели.",
        time: "1 час назад"
    },
    {
        type: "request",
        text: "Сеть кофеен ищет стабильную поставку альтернативного молока (миндальное, кокосовое).",
        time: "2 часа назад"
    },
    {
        type: "offer",
        text: "МясоТрейд: Снижена цена на говяжью вырезку! Теперь 890 ₽/кг. Доставка завтра утром.",
        time: "3 часа назад"
    }
];

// 3. Мониторинг поставок (Текущие заказы)
const trackingData = [
    {
        id: "ORD-9932",
        supplier: "Ocean Prime",
        items: "Лосось филе (5 кг)",
        status: "transit",
        statusName: "В пути",
        eta: "Сегодня, 14:30"
    },
    {
        id: "ORD-9931",
        supplier: "Сыроварня «Итальянец»",
        items: "Моцарелла (20 кг)",
        status: "processing",
        statusName: "В обработке",
        eta: "Завтра, 09:00"
    },
    {
        id: "ORD-9928",
        supplier: "Агрокомплекс «Южный»",
        items: "Томаты, Огурцы, Зелень",
        status: "delivered",
        statusName: "Доставлено",
        eta: "Вчера, 11:15"
    }
];

// 4. История заказов (Для таблицы)
const historyData = [
    { date: "15.05.2026", id: "ORD-9850", supplier: "МилкПро", sum: "12 400 ₽", status: "Выполнен" },
    { date: "12.05.2026", id: "ORD-9812", supplier: "МясоТрейд Тверь", sum: "45 000 ₽", status: "Выполнен" },
    { date: "10.05.2026", id: "ORD-9799", supplier: "КФХ «Птичья Гавань»", sum: "8 200 ₽", status: "Отменен" },
    { date: "05.05.2026", id: "ORD-9745", supplier: "Ocean Prime", sum: "28 500 ₽", status: "Выполнен" }
];

// 5. Входящие заявки для панели ПОСТАВЩИКА
const supplierRequestsData = [
    {
        id: "REQ-101",
        restaurant: "Ресторан «Панорама»",
        items: "Говядина вырезка (охл.)",
        volume: "15 кг / каждую неделю",
        status: "Новая заявка",
        date: "Сегодня"
    },
    {
        id: "REQ-102",
        restaurant: "Сеть бургерных «Мясорубка»",
        items: "Фарш говяжий (жирность 20%)",
        volume: "50 кг / разово",
        status: "Ожидает ответа",
        date: "Вчера"
    }
];