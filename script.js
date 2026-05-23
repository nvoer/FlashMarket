// Находим все вкладки меню
const navItems = document.querySelectorAll('.nav-item');

// Перебираем каждую вкладку и вешаем событие клика
navItems.forEach(item => {
    item.addEventListener('click', function(event) {
        // Отменяем стандартное поведение ссылки (чтобы страница не перезагружалась)
        event.preventDefault();

        // Удаляем класс 'active' у абсолютно всех вкладок
        navItems.forEach(nav => nav.classList.remove('active'));

        // Добавляем класс 'active' только той вкладке, на которую кликнули
        this.classList.add('active');
    });
});