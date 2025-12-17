// ===== БАЗА ДАННЫХ ТОВАРОВ =====
const THEMES = [
    { id: 'theme-default', name: 'Стандарт', price: 0, color: '#2196F3' },
    { id: 'theme-hacker', name: 'Хакер', price: 100, color: '#000000' },
    { id: 'theme-unicorn', name: 'Единорог', price: 150, color: '#F3E5F5' },
    { id: 'theme-space', name: 'Космос', price: 200, color: '#0D1b2a' }
];

// Одежда для робота
const CLOTHES = [
    { 
        id: 'clothes-none', 
        name: 'Без одежды', 
        price: 0, 
        img: 'mascot.png', 
        emoji: '🤖'
    },
    { 
        id: 'clothes-tshirt', 
        name: 'Футболка', 
        price: 50, 
        img: 'robot-tshirt.png', 
        emoji: '👕'
    },
    { 
        id: 'clothes-hoodie', 
        name: 'Худи', 
        price: 100, 
        img: 'robot-hoodie.png', 
        emoji: '🧥'
    },
    { 
        id: 'clothes-jacket', 
        name: 'Куртка', 
        price: 150, 
        img: 'robot-jacket.png', 
        emoji: '🦺'
    },
    { 
        id: 'clothes-suit', 
        name: 'Костюм', 
        price: 300, 
        img: 'robot-suit.png', 
        emoji: '👔'
    }
];

// Аксессуары для робота
const ACCESSORIES = [
    { 
        id: 'acc-none', 
        name: 'Без аксессуаров', 
        price: 0, 
        img: '', 
        emoji: '❌'
    },
    { 
        id: 'acc-glasses', 
        name: 'Очки', 
        price: 75, 
        img: 'robot-glasses.png', 
        emoji: '👓'
    },
    { 
        id: 'acc-hat', 
        name: 'Шляпа', 
        price: 100, 
        img: '', 
        emoji: '🎩'
    },
    { 
        id: 'acc-headphones', 
        name: 'Наушники', 
        price: 125, 
        img: '', 
        emoji: '🎧'
    },
    { 
        id: 'acc-crown', 
        name: 'Корона', 
        price: 200, 
        img: '', 
        emoji: '👑'
    },
    { 
        id: 'acc-bow', 
        name: 'Бантик', 
        price: 150, 
        img: '', 
        emoji: '🎀'
    }
];

// ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
let coins = 0;
let ownedItems = [];
let currentTheme = '';
let equippedClothes = 'clothes-none';
let equippedAccessory = 'acc-none';

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
        ownedItems = JSON.parse(localStorage.getItem('neuroOwned')) || ['theme-default', 'clothes-none', 'acc-none'];
        currentTheme = localStorage.getItem('neuroTheme') || '';
        equippedClothes = localStorage.getItem('neuroClothes') || 'clothes-none';
        equippedAccessory = localStorage.getItem('neuroAccessory') || 'acc-none';
    } catch (e) {
        console.error('Ошибка загрузки данных:', e);
        ownedItems = ['theme-default', 'clothes-none', 'acc-none'];
        equippedClothes = 'clothes-none';
        equippedAccessory = 'acc-none';
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

function saveClothes() {
    localStorage.setItem('neuroClothes', equippedClothes);
}

function saveAccessory() {
    localStorage.setItem('neuroAccessory', equippedAccessory);
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
    renderClothes();
    renderAccessories();
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

function renderClothes() {
    const container = document.getElementById('clothes-list');
    if (!container) return;
    
    container.innerHTML = '';
    CLOTHES.forEach(item => {
        const isEquipped = equippedClothes === item.id;
        const status = getItemStatus(item.id, item.price, isEquipped);
        
        container.innerHTML += createItemHTML(item, status, 'clothes');
    });
}

function renderAccessories() {
    const container = document.getElementById('accessories-list');
    if (!container) return;
    
    container.innerHTML = '';
    ACCESSORIES.forEach(item => {
        const isEquipped = equippedAccessory === item.id;
        const status = getItemStatus(item.id, item.price, isEquipped);
        
        container.innerHTML += createItemHTML(item, status, 'accessory');
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
                    data-price="${item.price}">
                ${status.text}
            </button>
        </div>
    `;
}

function createItemHTML(item, status, type) {
    return `
        <div class="shop-item">
            <div class="item-icon" style="font-size: 3rem;">${item.emoji}</div>
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-desc">${item.price > 0 ? item.price + ' монет' : 'Бесплатно'}</span>
            </div>
            <button class="btn-price ${status.class}" 
                    data-id="${item.id}" 
                    data-type="${type}" 
                    data-price="${item.price}">
                ${status.text}
            </button>
        </div>
    `;
}

// ===== ЛОГИКА СТАТУСОВ =====
function getItemStatus(id, price, isEquipped) {
    if (isEquipped) {
        return { class: 'equipped', text: 'Надето' };
    }
    if (ownedItems.includes(id)) {
        return { class: 'owned', text: 'Надеть' };
    }
    if (coins >= price) {
        return { class: 'buy', text: 'Купить' };
    }
    return { class: 'locked', text: price + ' 💰' };
}

// ===== ОБРАБОТКА СОБЫТИЙ =====
function attachEventListeners() {
    const themesContainer = document.getElementById('themes-list');
    const clothesContainer = document.getElementById('clothes-list');
    const accessoriesContainer = document.getElementById('accessories-list');
    
    if (themesContainer) {
        themesContainer.addEventListener('click', handleShopClick);
    }
    if (clothesContainer) {
        clothesContainer.addEventListener('click', handleShopClick);
    }
    if (accessoriesContainer) {
        accessoriesContainer.addEventListener('click', handleShopClick);
    }
}

function handleShopClick(e) {
    const btn = e.target.closest('.btn-price');
    if (!btn) return;
    
    const { id, type, price } = btn.dataset;
    handleItemClick(id, type, Number(price));
}

function handleItemClick(id, type, price) {
    // Проверка, что предмет уже экипирован
    if (type === 'theme' && currentTheme === id) return;
    if (type === 'clothes' && equippedClothes === id) return;
    if (type === 'accessory' && equippedAccessory === id) return;

    // Если уже куплено - просто экипируем
    if (ownedItems.includes(id)) {
        equipItem(id, type);
        return;
    }

    // Покупка
    if (coins >= price) {
        const itemName = getItemName(id, type);
        if (confirm(`Купить "${itemName}" за ${price} монет?`)) {
            purchaseItem(id, price, type);
        }
    } else {
        alert("Не хватает монет! Поиграй еще.");
    }
}

function getItemName(id, type) {
    let allItems = [];
    if (type === 'theme') allItems = THEMES;
    else if (type === 'clothes') allItems = CLOTHES;
    else if (type === 'accessory') allItems = ACCESSORIES;
    
    const item = allItems.find(i => i.id === id);
    return item ? item.name : id;
}

// ===== ЛОГИКА ПОКУПКИ И ЭКИПИРОВКИ =====
function purchaseItem(id, price, type) {
    coins -= price;
    ownedItems.push(id);
    
    saveCoins();
    saveOwnedItems();
    
    // Эффект конфетти (если библиотека подключена)
    if (typeof confetti === 'function') {
        confetti();
    }
    
    equipItem(id, type);
}

function equipItem(id, type) {
    if (type === 'theme') {
        currentTheme = id === 'theme-default' ? '' : id;
        document.body.className = currentTheme;
        saveTheme();
    } else if (type === 'clothes') {
        equippedClothes = id;
        saveClothes();
    } else if (type === 'accessory') {
        equippedAccessory = id;
        saveAccessory();
    }
    
    renderShop();
}

// ===== ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ =====
document.addEventListener('DOMContentLoaded', initShop);
