// ===== БАЗА ДАННЫХ ТОВАРОВ =====
const THEMES = [
    { id: 'theme-default', name: 'Стандарт', price: 0, color: '#2196F3' },
    { id: 'theme-hacker', name: 'Хакер', price: 100, color: '#000000' },
    { id: 'theme-unicorn', name: 'Единорог', price: 150, color: '#F3E5F5' },
    { id: 'theme-space', name: 'Космос', price: 200, color: '#0D1b2a' }
];

const SKINS = [
    { id: 'skin-bot', name: 'Наш Робот', price: 0, img: 'mascot.png' },
    { id: 'skin-default', name: 'Обычный', price: 0, img: 'https://img.icons8.com/color/480/bot.png' },
    { id: 'skin-transformer', name: 'Трансформер', price: 100, img: 'https://img.icons8.com/color/480/transformer.png' },
    { id: 'skin-android', name: 'Кибер-Панк', price: 250, img: 'https://img.icons8.com/color/480/android.png' },
    { id: 'skin-retro', name: 'Ретро-Бот', price: 500, img: 'https://img.icons8.com/color/480/retro-robot.png' }
];

// ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
let coins = 0;
let ownedItems = [];
let currentTheme = '';
let currentSkin = '';

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initShop() {
    loadState();
    applyTheme();
    renderShop();
    attachEventListeners();
}

// ===== РАБОТА С ЛОКАЛЬНЫМ ХРАНИЛИЩЕМ =====
function loadState() {
    try {
        coins = parseInt(localStorage.getItem('neuroCoins')) || 0;
        ownedItems = JSON.parse(localStorage.getItem('neuroOwned')) || ['theme-default', 'skin-bot'];
        currentTheme = localStorage.getItem('neuroTheme') || '';
        currentSkin = localStorage.getItem('neuroSkin') || SKINS[0].img;
    } catch (e) {
        console.error('Ошибка загрузки данных:', e);
        // Используем значения по умолчанию
        ownedItems = ['theme-default', 'skin-bot'];
        currentSkin = SKINS[0].img;
    }
}

function saveCoins() {
    localStorage.setItem('neuroCoins', coins);
}

function saveOwnedItems() {
    localStorage.setItem('neuroOwned', JSON.stringify(ownedItems));
}

function saveTheme() {
    localStorage.setItem('neuroTheme', currentTheme);
}

function saveSkin() {
    localStorage.setItem('neuroSkin', currentSkin);
}

// ===== ПРИМЕНЕНИЕ ТЕМЫ =====
function applyTheme() {
    if (currentTheme) {
        document.body.className = currentTheme;
    }
}

// ===== РЕНДЕРИНГ =====
function renderShop() {
    updateBalance();
    renderThemes();
    renderSkins();
}

function updateBalance() {
    const balanceEl = document.getElementById('user-coins');
    if (balanceEl) {
        balanceEl.innerText = coins;
    }
}

function renderThemes() {
    const container = document.getElementById('themes-list');
    if (!container) return;
    
    container.innerHTML = '';
    THEMES.forEach(item => {
        const isEquipped = currentTheme === item.id || (item.id === 'theme-default' && !currentTheme);
        const status = getItemStatus(item.id, item.price, isEquipped);
        
        container.innerHTML += createThemeItemHTML(item, status);
    });
}

function renderSkins() {
    const container = document.getElementById('skins-list');
    if (!container) return;
    
    container.innerHTML = '';
    SKINS.forEach(item => {
        const isEquipped = currentSkin === item.img;
        const status = getItemStatus(item.id, item.price, isEquipped);
        
        container.innerHTML += createSkinItemHTML(item, status);
    });
}

// ===== СОЗДАНИЕ HTML КАРТОЧЕК =====
function createThemeItemHTML(item, status) {
    return `
        <div class="shop-item">
            <div class="color-preview" style="background:${item.color}"></div>
            <div class="item-details" style="margin-left:15px;">
                <span class="item-name">${item.name}</span>
                <span class="item-desc">${item.price > 0 ? item.price + ' монет' : 'Бесплатно'}</span>
            </div>
            <button class="btn-price ${status.class}" 
                    data-id="${item.id}" 
                    data-type="theme" 
                    data-price="${item.price}" 
                    data-value="${item.color}">
                ${status.text}
            </button>
        </div>
    `;
}

function createSkinItemHTML(item, status) {
    return `
        <div class="shop-item">
            <img src="${item.img}" class="item-icon" alt="${item.name}">
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-desc">${item.price > 0 ? item.price + ' монет' : 'Бесплатно'}</span>
            </div>
            <button class="btn-price ${status.class}" 
                    data-id="${item.id}" 
                    data-type="skin" 
                    data-price="${item.price}" 
                    data-value="${item.img}">
                ${status.text}
            </button>
        </div>
    `;
}

// ===== ЛОГИКА СТАТУСОВ =====
function getItemStatus(id, price, isEquipped) {
    if (isEquipped) {
        return { class: 'equipped', text: 'Выбрано' };
    }
    if (ownedItems.includes(id)) {
        return { class: 'owned', text: 'Выбрать' };
    }
    if (coins >= price) {
        return { class: 'buy', text: 'Купить' };
    }
    return { class: 'locked', text: price + ' 💰' };
}

// ===== ОБРАБОТКА СОБЫТИЙ =====
function attachEventListeners() {
    const themesContainer = document.getElementById('themes-list');
    const skinsContainer = document.getElementById('skins-list');
    
    if (themesContainer) {
        themesContainer.addEventListener('click', handleShopClick);
    }
    if (skinsContainer) {
        skinsContainer.addEventListener('click', handleShopClick);
    }
}

function handleShopClick(e) {
    const btn = e.target.closest('.btn-price');
    if (!btn) return;
    
    const { id, type, price, value } = btn.dataset;
    handleItemClick(id, type, Number(price), value);
}

function handleItemClick(id, type, price, value) {
    // Проверка, что предмет уже выбран
    if ((type === 'theme' && currentTheme === id) || 
        (type === 'skin' && currentSkin === value)) {
        return;
    }

    // Если уже куплено - просто экипируем
    if (ownedItems.includes(id)) {
        equipItem(id, type, value);
        return;
    }

    // Покупка
    if (coins >= price) {
        if (confirm(`Купить "${id}" за ${price} монет?`)) {
            purchaseItem(id, price, type, value);
        }
    } else {
        alert("Не хватает монет! Поиграй еще.");
    }
}

// ===== ЛОГИКА ПОКУПКИ И ЭКИПИРОВКИ =====
function purchaseItem(id, price, type, value) {
    coins -= price;
    ownedItems.push(id);
    
    saveCoins();
    saveOwnedItems();
    
    // Эффект конфетти (если библиотека подключена)
    if (typeof confetti === 'function') {
        confetti();
    }
    
    equipItem(id, type, value);
}

function equipItem(id, type, value) {
    if (type === 'theme') {
        currentTheme = id === 'theme-default' ? '' : id;
        document.body.className = currentTheme;
        saveTheme();
    } else if (type === 'skin') {
        currentSkin = value;
        saveSkin();
    }
    
    renderShop();
}

// ===== ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ =====
document.addEventListener('DOMContentLoaded', initShop);
