const STORAGE_KEY = 'flashmarket-listings-v2';

let listings = [];
let searchQuery = '';

/* ═══════════════════════════════════════
   ВАЛИДАЦИЯ USERNAME
   Правила: только англ буквы/цифры, первый — буква,
   мин 5, макс 32, без @
═══════════════════════════════════════ */
function validateUsername(val) {
    if (!val) return 'Username is required';
    if (!/^[a-zA-Z]/.test(val)) return 'Must start with a letter (a–z)';
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(val)) return 'Only English letters and digits allowed';
    if (val.length < 5) return 'Minimum 5 characters';
    if (val.length > 32) return 'Maximum 32 characters';
    return '';
}

/* Блокируем ввод недопустимых символов в реальном времени */
function attachUsernameFilter(input, hintEl) {
    input.addEventListener('input', function () {
        // Убираем всё кроме латиницы и цифр
        let val = this.value.replace(/[^a-zA-Z0-9]/g, '');
        if (this.value !== val) this.value = val;
        hintEl.textContent = val.length > 0 ? validateUsername(val) : '';
    });
}

/* ═══════════════════════════════════════
   STORAGE
═══════════════════════════════════════ */
async function loadListings() {
    try {
        const result = await window.storage.get(STORAGE_KEY, true);
        if (result && result.value) listings = JSON.parse(result.value);
    } catch (e) {
        listings = [];
    }
    renderListings();
    // Обновляем таймеры каждую минуту
    setInterval(renderListings, 60000);
}

async function saveListings() {
    try {
        await window.storage.set(STORAGE_KEY, JSON.stringify(listings), true);
    } catch (e) {
        console.error('Storage error:', e);
    }
}

/* ═══════════════════════════════════════
   ФОРМАТИРОВАНИЕ ВРЕМЕНИ
═══════════════════════════════════════ */
function formatCountdown(endsAt) {
    const diff = Math.max(0, endsAt - Date.now());
    if (diff === 0) return 'Ended';
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    let parts = [];
    if (d > 0) parts.push(d + ' day' + (d !== 1 ? 's' : ''));
    if (h > 0) parts.push(h + ' hour' + (h !== 1 ? 's' : ''));
    if (m > 0 || parts.length === 0) parts.push(m + ' minute' + (m !== 1 ? 's' : ''));
    return parts.join(' ');
}

function formatEndDate(endsAt) {
    const d = new Date(endsAt);
    const day = d.getDate();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const mon = months[d.getMonth()];
    const year = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${mon} ${year} at ${hh}:${mm}`;
}

function formatStars(n) {
    return Number(n).toLocaleString('en-US');
}

// Примерный курс: 1 Star ≈ $0.013 (TON ~$5, 1 TON = ~385 Stars)
function starsToUsd(stars) {
    return (stars * 0.013).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/* ═══════════════════════════════════════
   РЕНДЕР СПИСКА ЛОТОВ
═══════════════════════════════════════ */
function renderListings() {
    const grid = document.getElementById('listings-grid');

    let filtered = listings;
    if (searchQuery) {
        filtered = listings.filter(l =>
            l.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-title">${searchQuery ? 'Nothing found' : 'No listings yet'}</div>
                ${searchQuery ? 'Try a different search term' : 'Be the first to list a username — click SELL above'}
            </div>`;
        return;
    }

    grid.innerHTML = filtered.map(listing => {
        const countdown = formatCountdown(listing.endsAt);
        const endDate = formatEndDate(listing.endsAt);
        const stars = formatStars(listing.price);
        const usd = starsToUsd(listing.price);
        const isResale = listing.seller && listing.seller !== listing.username;

        return `
        <div class="listing-row">
            <div class="row-username-col">
                <div class="row-username">
                    @${listing.username}
                    ${isResale ? '<span class="resale-badge">Resale</span>' : ''}
                </div>
                <a class="row-link" href="https://t.me/${listing.username}" target="_blank">${listing.username}.t.me</a>
            </div>
            <div class="row-bid-col">
                <div class="row-bid-stars">
                    <svg class="ton-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L3 7.5V9L12 22L21 9V7.5L12 2Z" fill="#3B9BE8"/>
                        <path d="M12 2L3 7.5L12 13L21 7.5L12 2Z" fill="#6AB4F0"/>
                        <path d="M12 13V22L21 9L12 13Z" fill="#2B7FCC"/>
                        <path d="M12 13V22L3 9L12 13Z" fill="#4AAAE8"/>
                    </svg>
                    ${stars}
                </div>
                <div class="row-bid-usd">~ $${usd}</div>
            </div>
            <div class="row-ends-col">
                <div class="row-ends-countdown">${countdown}</div>
                <div class="row-ends-date">${endDate}</div>
            </div>
            <div class="row-arrow">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
        </div>`;
    }).join('');
}

/* ═══════════════════════════════════════
   TOAST
═══════════════════════════════════════ */
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-text').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ═══════════════════════════════════════
   TABS
═══════════════════════════════════════ */
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        navItems.forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        tabContents.forEach(c => c.classList.remove('active'));
        const target = this.id === 'tab-usernames' ? 'content-usernames' : 'content-gifts';
        document.getElementById(target).classList.add('active');
        closeAllDropdowns();
    });
});

/* ═══════════════════════════════════════
   DROPDOWNS
═══════════════════════════════════════ */
const dropdowns = document.querySelectorAll('.dropdown-wrapper');

function closeAllDropdowns() {
    dropdowns.forEach(d => d.classList.remove('is-open'));
}

dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-control');
    const items = dropdown.querySelectorAll('.dropdown-item');
    const selectedText = dropdown.querySelector('.selected-text');

    trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        const wasOpen = dropdown.classList.contains('is-open');
        closeAllDropdowns();
        if (!wasOpen) dropdown.classList.add('is-open');
    });

    items.forEach(item => {
        item.addEventListener('click', function() {
            selectedText.textContent = this.textContent;
            items.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            dropdown.classList.remove('is-open');
        });
    });
});

document.addEventListener('click', closeAllDropdowns);

/* ═══════════════════════════════════════
   VIEW SWITCHERS
═══════════════════════════════════════ */
document.getElementById('view-list-btn').addEventListener('click', () => {
    document.getElementById('view-grid-btn').classList.remove('active');
    document.getElementById('view-list-btn').classList.add('active');
});

document.getElementById('view-grid-btn').addEventListener('click', () => {
    document.getElementById('view-list-btn').classList.remove('active');
    document.getElementById('view-grid-btn').classList.add('active');
});

/* ═══════════════════════════════════════
   SEARCH
═══════════════════════════════════════ */
document.getElementById('search-input').addEventListener('input', function() {
    searchQuery = this.value.trim();
    renderListings();
});

/* ═══════════════════════════════════════
   МОДАЛЬНОЕ ОКНО SELL
═══════════════════════════════════════ */
const sellBtn = document.getElementById('sell-btn');
const sellOverlay = document.getElementById('sell-overlay');
const sellModal = document.getElementById('sell-modal');
const sellModalCancel = document.getElementById('sell-modal-cancel');
const sellModalSubmit = document.getElementById('sell-modal-submit');

const inputUsername = document.getElementById('input-username');
const inputSeller = document.getElementById('input-seller');
const usernameHint = document.getElementById('username-hint');
const sellerHint = document.getElementById('seller-hint');

attachUsernameFilter(inputUsername, usernameHint);
attachUsernameFilter(inputSeller, sellerHint);

function openSellModal() {
    sellOverlay.classList.add('active');
    sellModal.classList.add('active');
    closeAllDropdowns();
    inputUsername.focus();
}

function closeSellModal() {
    sellOverlay.classList.remove('active');
    sellModal.classList.remove('active');
}

sellBtn.addEventListener('click', e => { e.stopPropagation(); openSellModal(); });
sellModalCancel.addEventListener('click', closeSellModal);
sellOverlay.addEventListener('click', closeSellModal);

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sellModal.classList.contains('active')) closeSellModal();
});

/* Кнопки ▲ ▼ цены */
document.getElementById('price-up').addEventListener('click', () => {
    const inp = document.getElementById('input-price');
    inp.value = (parseInt(inp.value) || 0) + 100;
});

document.getElementById('price-down').addEventListener('click', () => {
    const inp = document.getElementById('input-price');
    inp.value = Math.max(1, (parseInt(inp.value) || 0) - 100);
});

/* Сабмит */
sellModalSubmit.addEventListener('click', async function() {
    const usernameVal = inputUsername.value.trim();
    const sellerVal = inputSeller.value.trim();
    const price = document.getElementById('input-price').value.trim();
    const durationSec = parseInt(
        document.getElementById('duration-dropdown').querySelector('.dropdown-item.active').getAttribute('data-value')
    );

    // Валидация username продаваемого
    const unErr = validateUsername(usernameVal);
    if (unErr) {
        usernameHint.textContent = unErr;
        inputUsername.style.borderColor = '#e24b4a';
        inputUsername.focus();
        setTimeout(() => { inputUsername.style.borderColor = ''; }, 1500);
        return;
    }

    // Валидация seller
    const selErr = validateUsername(sellerVal);
    if (selErr) {
        sellerHint.textContent = selErr;
        inputSeller.style.borderColor = '#e24b4a';
        inputSeller.focus();
        setTimeout(() => { inputSeller.style.borderColor = ''; }, 1500);
        return;
    }

    if (!price || Number(price) < 1) {
        const inp = document.getElementById('input-price');
        inp.style.borderColor = '#e24b4a';
        inp.focus();
        setTimeout(() => { inp.style.borderColor = ''; }, 1500);
        return;
    }

    const now = Date.now();
    const listing = {
        id: now + Math.random(),
        username: usernameVal.toLowerCase(),
        seller: sellerVal.toLowerCase(),
        price: Number(price),
        endsAt: now + durationSec * 1000,
        createdAt: now
    };

    listings.unshift(listing);
    await saveListings();
    renderListings();

    inputUsername.value = '';
    inputSeller.value = '';
    document.getElementById('input-price').value = '';
    usernameHint.textContent = '';
    sellerHint.textContent = '';

    closeSellModal();
    showToast('✓ Listed! Visible to everyone.');
});

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
loadListings();