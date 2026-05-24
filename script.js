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

            const filterValue = this.getAttribute('data-value');
            console.log("Выбран фильтр:", filterValue);
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
        console.log("Отображение Gifts: Список");
    });

    viewGridBtn.addEventListener('click', () => {
        viewListBtn.classList.remove('active');
        viewGridBtn.classList.add('active');
        console.log("Отображение Gifts: Сетка");
    });
}