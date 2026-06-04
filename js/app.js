// ================= ОСНОВНОЙ ОБЪЕКТ ПРИЛОЖЕНИЯ =================
const app = {
    state: {
        role: 'restaurant', // 'restaurant' или 'supplier'
        compareList: [],
        currentProduct: null
    },

    // Инициализация
    init() {
        // Отключаем встроенную браузерную "память" скролла
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        // 1. Восстанавливаем сохраненную роль (по умолчанию 'restaurant')
        const savedRole = localStorage.getItem('appRole') || 'restaurant';
        const roleSelect = document.getElementById('role-select');
        if (roleSelect) roleSelect.value = savedRole; // Синхронизируем селектор в шапке

        // 2. Переключаем интерфейс, но НЕ перекидываем на главную (флаг true)
        this.changeRole(savedRole, true); 

        this.render.homeFeed();
        this.render.homeCatalog();
        this.render.catalog();
        this.render.tracking();
        this.render.history();
        this.render.supplierProducts();
        this.render.supplierRequests();
        this.initReveal();

        // 3. Читаем текущий раздел из адресной строки (или открываем главную)
        const currentHash = window.location.hash || '#home';
        this.router.go(currentHash);

        // 4. Поддержка кнопок "Назад/Вперед" в браузере
        window.addEventListener('hashchange', () => {
            this.router.go(window.location.hash || '#home');
        });
    },

    // ================= РОУТИНГ И НАВИГАЦИЯ =================
    router: {
        go(hash) {
            
            // Закрываем мобильное меню при переходе по ссылке
            const menu = document.getElementById('header-menu');
            const icon = document.getElementById('burger-icon');
            if (menu && menu.classList.contains('active')) {
                menu.classList.remove('active');
                if(icon) icon.classList.replace('fa-xmark', 'fa-bars');
            }

            // Записываем раздел в адресную строку браузера
            if (window.location.hash !== hash) {
                window.history.pushState(null, null, hash);
            }

            // Скрываем все страницы
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            
            // Убираем #, если есть, и находим нужную секцию
            const targetId = hash.replace('#', '');
            const targetPage = document.getElementById(targetId);
            
            if (targetPage) {
                targetPage.classList.add('active');
            }

            // Обновляем активный пункт в меню
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('onclick').includes(hash)) {
                    link.classList.add('active');
                }
            });

            // Спец-эффект для страницы аналитики (ИИ-загрузчик)
            if (targetId === 'analytics') {
                document.getElementById('ai-loader').style.display = 'block';
                document.getElementById('analytics-content').classList.add('hidden');
                
                setTimeout(() => {
                    document.getElementById('ai-loader').style.display = 'none';
                    document.getElementById('analytics-content').classList.remove('hidden');
                    app.render.analyticsChart();
                }, 1500);
            }
            
            // Рендер графика для поставщика
            if (targetId === 'supplier-analytics') {
                app.render.supplierChart();
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

// ================= СМЕНА РОЛИ =================
    changeRole(newRole, preventRedirect = false) {
        this.state.role = newRole;
        localStorage.setItem('appRole', newRole); // Запоминаем выбор навсегда
        
        const nav = document.getElementById('main-nav');
        
        if (newRole === 'restaurant') {
            nav.innerHTML = `
                <a onclick="app.router.go('#home')" class="nav-link">Главная</a>
                <a onclick="app.router.go('#catalog')" class="nav-link">Каталог товаров</a>
                <a onclick="app.router.go('#tracking')" class="nav-link">Мониторинг</a>
                <a onclick="app.router.go('#history')" class="nav-link">История</a>
                <a onclick="app.router.go('#analytics')" class="nav-link"><i class="fa-solid fa-wand-magic-sparkles"></i> ИИ-Аналитика</a>
            `;
            if (!preventRedirect) app.ui.notify('Вы переключились на интерфейс Ресторана');
        } else {
            nav.innerHTML = `
                <a onclick="app.router.go('#home')" class="nav-link">Главная</a>
                <a onclick="app.router.go('#supplier-panel')" class="nav-link">Управление поставками</a>
                <a onclick="app.router.go('#supplier-analytics')" class="nav-link">Аналитика продаж</a>
            `;
            if (!preventRedirect) app.ui.notify('Вы переключились на интерфейс Поставщика');
        }
        
        // Перекидываем на главную только при ручном переключении (не при обновлении страницы)
        if (!preventRedirect) {
            this.router.go('#home');
        }
    },

    // ================= ФУНКЦИИ РЕНДЕРИНГА (ОТРИСОВКИ) =================
    render: {
        // Лента на главной
        homeFeed() {
            const container = document.getElementById('home-feed-grid');
            if(!container) return;
            container.innerHTML = feedData.map(item => `
                <div class="feed-item ${item.type}">
                    <div>
                        <div class="product-cat">${item.type === 'request' ? '🔥 Запрос от ресторана' : '📢 Предложение поставщика'}</div>
                        <p style="font-weight:500; margin-top:5px;">${item.text}</p>
                    </div>
                    <span style="font-size:12px; color:#999; white-space:nowrap;"><i class="fa-regular fa-clock"></i> ${item.time}</span>
                </div>
            `).join('');
        },

        // Превью каталога на главной (4 товара)
        homeCatalog() {
            const container = document.getElementById('home-catalog-preview');
            if(!container) return;
            const previewProducts = productsData.slice(0, 4);
            container.innerHTML = previewProducts.map(p => app.templates.productCard(p)).join('');
        },

        // Полный каталог с фильтрацией
        catalog() {
            const container = document.getElementById('main-catalog-grid');
            if(!container) return;
            
            const searchTerm = (document.getElementById('search-input')?.value || '').toLowerCase();
            const category = document.getElementById('category-filter')?.value || 'all';

            const filtered = productsData.filter(p => {
                const matchSearch = p.title.toLowerCase().includes(searchTerm) || p.supplier.toLowerCase().includes(searchTerm);
                const matchCategory = category === 'all' || p.category === category;
                return matchSearch && matchCategory;
            });

            container.innerHTML = filtered.length 
                ? filtered.map(p => app.templates.productCard(p)).join('') 
                : '<p style="grid-column: 1/-1; text-align: center; color: #757575;">Товары не найдены</p>';
        },

        // Мониторинг поставок
        // Мониторинг поставок (с фильтрацией)
        tracking(filterStatus = 'all') {
            const container = document.getElementById('tracking-list');
            if(!container) return;

            // 1. Фильтруем данные из data.js
            const filteredData = filterStatus === 'all' 
                ? trackingData 
                : trackingData.filter(t => t.status === filterStatus);

            // 2. Отрисовываем отфильтрованные карточки
            if (filteredData.length > 0) {
                container.innerHTML = filteredData.map(t => `
                    <div class="tracking-card">
                        <div>
                            <h4 style="margin-bottom:5px;">${t.items} <span style="color:#9e9e9e; font-weight:normal;">#${t.id}</span></h4>
                            <p style="font-size:14px; color:#616161;"><i class="fa-solid fa-truck"></i> Поставщик: ${t.supplier}</p>
                            <p style="font-size:14px; margin-top:5px;"><i class="fa-regular fa-clock"></i> Расчетное время: <strong>${t.eta}</strong></p>
                        </div>
                        <div style="text-align:right;">
                            <span class="status-badge status-${t.status}">${t.statusName}</span><br>
                            <button class="btn btn-outline mt-10" style="padding: 6px 12px; font-size: 13px;" onclick="app.ui.notify('Уведомление поставщику отправлено!')">
                                <i class="fa-regular fa-bell"></i> Уведомить
                            </button>
                        </div>
                    </div>
                `).join('');
            } else {
                // Если заказов с таким статусом нет
                container.innerHTML = '<p style="text-align: center; color: #757575; padding: 20px;">Заказов с таким статусом пока нет.</p>';
            }

            // 3. Переключаем зеленую подсветку у активной кнопки
            document.querySelectorAll('#tracking-filters .tab-btn').forEach(btn => {
                if (btn.getAttribute('data-status') === filterStatus) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        },

        // История заказов (Таблица)
        history() {
            const tbody = document.getElementById('history-table-body');
            if(!tbody) return;
            tbody.innerHTML = historyData.map(h => `
                <tr>
                    <td>${h.date}</td>
                    <td><strong>${h.id}</strong></td>
                    <td>${h.supplier}</td>
                    <td><strong>${h.sum}</strong></td>
                    <td><span style="color: ${h.status==='Отменен'?'#d32f2f':'#388E3C'}; font-weight:600;">${h.status}</span></td>
                    <td><button class="btn btn-outline" style="padding:4px 10px; font-size:12px;" onclick="app.ui.notify('Заказ повторен')">Повторить</button></td>
                </tr>
            `).join('');
        },

        // Товары поставщика
        supplierProducts() {
            const container = document.getElementById('supplier-products-grid');
            if(!container) return;
            container.innerHTML = productsData.slice(0, 3).map(p => `
                <div class="product-card">
                    <img src="${p.image}" class="product-img">
                    <div class="product-info">
                        <h3 class="product-title">${p.title}</h3>
                        <div class="product-price-wrap">
                            <span class="product-price">${p.price}</span>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button class="btn btn-outline w-100"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn btn-outline w-100" style="color:#d32f2f; border-color:#d32f2f;"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `).join('');
        },

        // Входящие заявки (Поставщик)
        supplierRequests() {
            const container = document.getElementById('supplier-requests-list');
            if(!container) return;
            container.innerHTML = supplierRequestsData.map(req => `
                <div class="tracking-card">
                    <div>
                        <h4 style="margin-bottom:5px;">${req.restaurant} <span style="color:#9e9e9e; font-weight:normal;">#${req.id}</span></h4>
                        <p style="font-size:14px;"><strong>Требуется:</strong> ${req.items}</p>
                        <p style="font-size:14px; color:#d97706; margin-top:5px;"><i class="fa-solid fa-box"></i> Объем: ${req.volume}</p>
                    </div>
                    <div style="text-align:right;">
                        <span class="status-badge status-processing">${req.status}</span><br>
                        <div style="display:flex; gap:10px; margin-top:10px;">
                            <button class="btn btn-primary" onclick="app.ui.notify('Заявка принята в работу!')">Принять</button>
                            <button class="btn btn-outline" onclick="app.ui.notify('Вы отклонили заявку')">Отклонить</button>
                        </div>
                    </div>
                </div>
            `).join('');
        },

        // Переключение табов поставщика
        supplierTabs(tabId, btnElement) {
            // 1. Убираем зеленую подсветку у всех кнопок
            document.querySelectorAll('#supplier-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            
            // 2. Подсвечиваем ту кнопку, на которую нажали
            if (btnElement) {
                btnElement.classList.add('active');
            } else if (event && event.target) {
                // Запасной вариант, если this не передался
                event.target.classList.add('active');
            }
            
            // 3. Находим блоки товаров и заявок
            const productsBlock = document.getElementById('sup-products');
            const requestsBlock = document.getElementById('sup-requests');

            // 4. Логика скрытия/показа
            if (tabId === 'all') {
                productsBlock.style.display = 'block';
                requestsBlock.style.display = 'block';
            } else if (tabId === 'products') {
                productsBlock.style.display = 'block';
                requestsBlock.style.display = 'none';
            } else if (tabId === 'requests') {
                productsBlock.style.display = 'none';
                requestsBlock.style.display = 'block';
            }
        },

        // График Ресторана (Chart.js)
        analyticsChart() {
            const ctx = document.getElementById('demandChart');
            if(!ctx) return;
            if(window.myDemandChart) window.myDemandChart.destroy();
            
            window.myDemandChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Нед 1', 'Нед 2', 'Нед 3', 'Нед 4'],
                    datasets: [
                        { label: 'Фактические расходы (₽)', data: [120000, 115000, 130000, 110000], borderColor: '#2196F3', backgroundColor: 'rgba(33, 150, 243, 0.1)', fill: true, tension: 0.4 },
                        { label: 'ИИ-Прогноз оптимизации', data: [115000, 110000, 115000, 100000], borderColor: '#4CAF50', borderDash: [5, 5], tension: 0.4 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        },

        // График Поставщика (Chart.js)
        supplierChart() {
            const ctx = document.getElementById('supplierChart');
            if(!ctx) return;
            if(window.mySupChart) window.mySupChart.destroy();
            
            window.mySupChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Мясо', 'Овощи', 'Молочка', 'Морепродукты'],
                    datasets: [{ label: 'Объем продаж (тыс. ₽)', data: [450, 120, 80, 240], backgroundColor: '#4CAF50', borderRadius: 6 }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    },

    // ================= ШАБЛОНЫ HTML =================
    templates: {
        productCard(p) {
            return `
                <div class="product-card">
                    <img src="${p.image}" class="product-img" alt="${p.title}">
                    <div class="product-info">
                        <div class="product-cat">${p.category === 'meat' ? 'Мясо/Птица' : p.category === 'veg' ? 'Овощи/Фрукты' : p.category === 'dairy' ? 'Молочка' : 'Морепродукты'}</div>
                        <h3 class="product-title">${p.title}</h3>
                        <div class="product-supplier"><i class="fa-solid fa-store"></i> ${p.supplier}</div>
                        <div class="product-price-wrap">
                            <div>
                                <div class="product-price">${p.price}</div>
                                <div class="product-min">Мин: ${p.minOrder}</div>
                            </div>
                            <span style="font-size:12px; font-weight:600; color:${p.stock ? '#4CAF50' : '#F44336'}">
                                ${p.stock ? 'В наличии' : 'Под заказ'}
                            </span>
                        </div>
                        <button class="btn btn-primary w-100" onclick="app.actions.openOrder('${p.id}')">Заказать</button>
                        <button class="btn btn-outline w-100 mt-10" onclick="app.actions.toggleCompare('${p.id}')">
                            <i class="fa-solid fa-code-compare"></i> ${app.state.compareList.includes(p.id) ? 'Убрать из сравнения' : 'К сравнению'}
                        </button>
                    </div>
                </div>
            `;
        }
    },

    // ================= ДЕЙСТВИЯ (АКЦИИ) =================
    actions: {
        openOrder(id) {
            const product = productsData.find(p => p.id === id);
            app.state.currentProduct = product;
            document.getElementById('order-product-name').innerText = `Заказ: ${product.title} (${product.price})`;
            app.ui.openModal('order');
        },
        
        toggleCompare(id) {
            const list = app.state.compareList;
            if (list.includes(id)) {
                app.state.compareList = list.filter(itemId => itemId !== id);
                app.ui.notify('Товар удален из сравнения');
            } else {
                if (list.length >= 3) return app.ui.notify('Максимум 3 товара для сравнения!');
                list.push(id);
                app.ui.notify('Товар добавлен к сравнению');
            }
            document.getElementById('compare-count').innerText = app.state.compareList.length;
            app.render.catalog(); // Перерисовать кнопку
        }
    },

    submitOrder() {
        app.ui.closeModal('order');
        app.ui.notify(`Заказ на "${app.state.currentProduct.title}" успешно оформлен!`);
    },

    // ================= ИНТЕРФЕЙС И УТИЛИТЫ =================
    ui: {
        // Открытие/закрытие мобильного меню
        toggleMenu() {
            const menu = document.getElementById('header-menu');
            const icon = document.getElementById('burger-icon');
            if (menu) {
                menu.classList.toggle('active');
                // Меняем иконку (бургер на крестик и обратно)
                if (menu.classList.contains('active')) {
                    icon.classList.replace('fa-bars', 'fa-xmark');
                } else {
                    icon.classList.replace('fa-xmark', 'fa-bars');
                }
            }
        },

        openModal(id) {
            document.getElementById(`modal-${id}`).classList.add('active');
        },
        closeModal(id) {
            document.getElementById(`modal-${id}`).classList.remove('active');
        },
        openCompareModal() {
            if (app.state.compareList.length < 2) return this.notify('Добавьте минимум 2 товара!');
            
            const items = productsData.filter(p => app.state.compareList.includes(p.id));
            const html = `
                <table class="data-table">
                    <tr>
                        <th>Характеристика</th>
                        ${items.map(i => `<th>${i.title}</th>`).join('')}
                    </tr>
                    <tr>
                        <td>Цена</td>
                        ${items.map(i => `<td style="font-size:18px; font-weight:700; color:#4CAF50;">${i.price}</td>`).join('')}
                    </tr>
                    <tr>
                        <td>Поставщик</td>
                        ${items.map(i => `<td>${i.supplier}</td>`).join('')}
                    </tr>
                    <tr>
                        <td>Мин. партия</td>
                        ${items.map(i => `<td>${i.minOrder}</td>`).join('')}
                    </tr>
                    <tr>
                        <td>Наличие</td>
                        ${items.map(i => `<td>${i.stock ? '<span class="text-green">Да</span>' : '<span style="color:red">Под заказ</span>'}</td>`).join('')}
                    </tr>
                </table>
            `;
            document.getElementById('compare-table-container').innerHTML = html;
            this.openModal('compare');
        },
        notify(text) {
            const notif = document.getElementById('notification');
            document.getElementById('notif-text').innerText = text;
            notif.classList.add('show');
            setTimeout(() => notif.classList.remove('show'), 3000);
        }
    },

    // Анимация при скролле
    initReveal() {
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        reveals.forEach(el => observer.observe(el));
    }
};

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => app.init());