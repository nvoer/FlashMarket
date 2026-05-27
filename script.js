// Инициализация подключения к базе данных Supabase
const supabaseUrl = 'https://ihhvdhnapbleboabakhc.supabase.co'; // <--- Замените на свое
const supabaseKey = 'sb_publishable_9MqWCNuRQ1reF5cyMnahNA_4_-LtTcG';    // <--- Замените на свое
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Ссылка на контейнер сетки лотов
const lotsGrid = document.getElementById('usernames-grid');

// Находим элементы навигации и контейнеры контента
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

navItems.forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault();

        // Переключаем активный класс у кнопок меню
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        // Скрываем все вкладки контента
        tabContents.forEach(content => content.classList.remove('active'));

        // Показываем нужный контент в зависимости от кликнутой вкладки
        if (this.id === 'tab-usernames') {
            document.getElementById('content-usernames').classList.add('active');
        } else if (this.id === 'tab-gifts') {
            document.getElementById('content-gifts').classList.add('active');
        }
        
        closeAllDropdowns(); // Закрываем открытые меню при переключении
    });
});

/* ЛОГИКА РАБОТЫ ВЫПАДАЮЩИХ СПИСКОВ */
const dropdowns = document.querySelectorAll('.dropdown-wrapper');

dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-control');
    const items = dropdown.querySelectorAll('.dropdown-item');
    const selectedText = dropdown.querySelector('.selected-text');

    // Клик по кнопке открывает/закрывает текущий дропдаун
    trigger.addEventListener('click', function(e) {
        e.stopPropagation(); 
        
        if (dropdown.classList.contains('is-open')) {
            dropdown.classList.remove('is-open');
        } else {
            closeAllDropdowns(); // Закрываем остальные
            dropdown.classList.add('is-open');
        }
    });

    // Выбор пункта меню
    items.forEach(item => {
        item.addEventListener('click', function() {
            selectedText.textContent = this.textContent;

            items.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            dropdown.classList.remove('is-open');
        });
    });
});

function closeAllDropdowns() {
    dropdowns.forEach(d => d.classList.remove('is-open'));
}

document.addEventListener('click', closeAllDropdowns);

/* ПЕРЕКЛЮЧАТЕЛЬ СЕТКИ / СПИСКА ДЛЯ ВКЛАДКИ GIFTS */
const viewListBtn = document.getElementById('view-list-btn');
const viewGridBtn = document.getElementById('view-grid-btn');

if(viewListBtn && viewGridBtn) {
    viewListBtn.addEventListener('click', () => {
        viewGridBtn.classList.remove('active');
        viewListBtn.classList.add('active');
    });

    viewGridBtn.addEventListener('click', () => {
        viewListBtn.classList.remove('active');
        viewGridBtn.classList.add('active');
    });
}

/* ═══════════════════════════════════════
   МОДАЛЬНОЕ ОКНО SELL
   ═══════════════════════════════════════ */

const sellButton = document.querySelector('.sell-button');
const sellOverlay = document.getElementById('sell-overlay');
const sellModal = document.getElementById('sell-modal');
const sellModalClose = document.getElementById('sell-modal-close');
const sellModalCancel = document.getElementById('sell-modal-cancel');
const sellModalSubmit = document.getElementById('sell-modal-submit');

function openSellModal() {
    sellOverlay.classList.add('active');
    sellModal.classList.add('active');
    closeAllDropdowns();
}

function closeSellModal() {
    sellOverlay.classList.remove('active');
    sellModal.classList.remove('active');
}

if (sellButton) {
    sellButton.addEventListener('click', function(e) {
        e.stopPropagation();
        openSellModal();
    });
}

if (sellModalClose) {
    sellModalClose.addEventListener('click', closeSellModal);
}

if (sellModalCancel) {
    sellModalCancel.addEventListener('click', closeSellModal);
}

if (sellOverlay) {
    sellOverlay.addEventListener('click', closeSellModal);
}

// Закрытие по клавише Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sellModal.classList.contains('active')) {
        closeSellModal();
    }
});

/* ЛОГИКА КАСТОМНЫХ СТРЕЛОК У ИНПУТА ЦЕНЫ */
const priceInput = document.getElementById('price-input');
const btnUp = document.querySelector('.up-btn');
const btnDown = document.querySelector('.down-btn');

if (priceInput && btnUp && btnDown) {
    btnUp.addEventListener('click', () => {
        let currentValue = parseFloat(priceInput.value) || 0;
        priceInput.value = (currentValue + 0.1).toFixed(2);
    });

    btnDown.addEventListener('click', () => {
        let currentValue = parseFloat(priceInput.value) || 0;
        if (currentValue > 0) {
            priceInput.value = Math.max(0, currentValue - 0.1).toFixed(2);
        }
    });
}

/* Функция получения всех лотов из базы данных Supabase */
async function fetchAndDisplayLots() {
    if (!lotsGrid) return;

    const { data: lots, error } = await supabase
        .from('lots')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Ошибка при загрузке лотов:', error);
        return;
    }

    lotsGrid.innerHTML = ''; // Очищаем контейнер

    lots.forEach(lot => {
        const card = document.createElement('div');
        card.className = 'lot-card';
        card.innerHTML = `
            <div class="lot-username">${lot.username.startsWith('@') ? lot.username : '@' + lot.username}</div>
            <div class="lot-details">
                <div class="lot-info-block">
                    <span class="lot-label">Price</span>
                    <span class="lot-price">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        ${parseFloat(lot.price).toLocaleString()}
                    </span>
                </div>
                <div class="lot-info-block" style="align-items: flex-end;">
                    <span class="lot-label">Duration</span>
                    <span class="lot-duration">${lot.duration}</span>
                </div>
            </div>
        `;
        lotsGrid.appendChild(card);
    });
}

/* Кнопка List for Sale - сохранение в БД */
if (sellModalSubmit) {
    sellModalSubmit.addEventListener('click', async function() {
        const usernameInput = document.querySelector('.sell-form-input[placeholder="@username"]');
        const sellDropdown = document.querySelector('.sell-dropdown');
        
        const durationText = sellDropdown && sellDropdown.querySelector('.selected-text') 
            ? sellDropdown.querySelector('.selected-text').textContent 
            : '24 hours';

        const username = usernameInput ? usernameInput.value.trim() : '';
        const price = priceInput ? priceInput.value.trim() : '';

        if (!username || !price) {
            alert('Please, fill in all fields!');
            return;
        }

        sellModalSubmit.textContent = 'Listing...';
        sellModalSubmit.disabled = true;

        const { error } = await supabase
            .from('lots')
            .insert([
                { 
                    username: username, 
                    price: parseFloat(price), 
                    duration: durationText 
                }
            ]);

        sellModalSubmit.textContent = 'List for Sale';
        sellModalSubmit.disabled = false;

        if (error) {
            console.error('Ошибка сохранения:', error);
            alert('Error listing your item.');
        } else {
            if (usernameInput) usernameInput.value = '';
            if (priceInput) priceInput.value = '';
            
            closeSellModal();
            await fetchAndDisplayLots();
        }
    });
}

// Загружаем лоты при старте страницы
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayLots();
});