// Находим элементы навигации и контейнеры контента
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const dropdowns = document.querySelectorAll('.dropdown-wrapper');

// Функция для закрытия всех открытых выпадающих списков
function closeAllDropdowns() {
    dropdowns.forEach(d => d.classList.remove('is-open'));
}

// Функция для активации нужной вкладки по её ID
function switchTab(tabId) {
    // Убираем активный класс у всех кнопок меню
    navItems.forEach(nav => nav.classList.remove('active'));
    // Скрываем все вкладки контента
    tabContents.forEach(content => content.classList.remove('active'));

    if (tabId === 'tab-usernames') {
        const targetBtn = document.getElementById('tab-usernames');
        const targetContent = document.getElementById('content-usernames');
        if(targetBtn) targetBtn.classList.add('active');
        if(targetContent) targetContent.classList.add('active');
    } else if (tabId === 'tab-gifts') {
        const targetBtn = document.getElementById('tab-gifts');
        const targetContent = document.getElementById('content-gifts');
        if(targetBtn) targetBtn.classList.add('active');
        if(targetContent) targetContent.classList.add('active');
    }
    
    closeAllDropdowns(); // Теперь функция существует выше и не вызывает ошибку
}

// Функция, которая смотрит на адресную строку и включает нужную вкладку
function handleRouting() {
    const path = window.location.pathname;

    if (path === '/gifts') {
        switchTab('tab-gifts');
    } else {
        // По умолчанию или если `/usernames` — включаем юзернеймы
        switchTab('tab-usernames');
    }
}

// Вешаем события клика на вкладки
navItems.forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault(); // Отменяем стандартный переход по ссылке

        if (this.id === 'tab-usernames') {
            window.history.pushState({}, '', '/usernames'); // Меняем адрес на /usernames
            switchTab('tab-usernames');
        } else if (this.id === 'tab-gifts') {
            window.history.pushState({}, '', '/gifts');     // Меняем адрес на /gifts
            switchTab('tab-gifts');
        }
    });
});

// Слушаем событие «Назад/Вперед» в браузере, чтобы вкладки переключались корректно
window.addEventListener('popstate', handleRouting);

// Вызываем проверку роута сразу при загрузке страницы
document.addEventListener('DOMContentLoaded', handleRouting);


/* ЛОГИКА РАБОТЫ ВЫПАДАЮЩИХ СПИСКОВ */
dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-control');
    const items = dropdown.querySelectorAll('.dropdown-item');
    const selectedText = dropdown.querySelector('.selected-text');

    trigger.addEventListener('click', function(event) {
        event.stopPropagation();
        if (dropdown.classList.contains('is-open')) {
            dropdown.classList.remove('is-open');
        } else {
            closeAllDropdowns(); // Закрываем остальные
            dropdown.classList.add('is-open');
        }
    });

    items.forEach(item => {
        item.addEventListener('click', function() {
            selectedText.textContent = this.textContent;

            items.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            dropdown.classList.remove('is-open');

            const filterValue = this.getAttribute('data-value');
            console.log("Выбран фильтр:", filterValue);
        });
    });
});

document.addEventListener('click', closeAllDropdowns);


/* ПЕРЕКЛЮЧАТЕЛЬ СЕТКИ / СПИСКА ДЛЯ ВКЛАДКИ GIFTS */
const viewListBtn = document.getElementById('view-list-btn');
const viewGridBtn = document.getElementById('view-grid-btn');

if(viewListBtn && viewGridBtn) {
    viewListBtn.addEventListener('click', () => {
        viewGridBtn.classList.remove('active');
        viewListBtn.classList.add('active');
        console.log("Отображение Gifts: Список");
    });

    viewGridBtn.addEventListener('click', () => {
        viewListBtn.classList.remove('active');
        viewGridBtn.classList.add('active');
        console.log("Отображение Gifts: Сетка");
    });
}