// ===== КОНСТАНТЫ =====
const PHRASES = [
    "Привет!", "Как дела?", "Поиграем?", "Я умный!", "Бзз-бзз...", "Хочу монетки!", "Ты супер!", "Заряди меня!"
];

// ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
let coins = 0;
let currentTheme = '';
let equippedItems = {
    body: 'clothes-none',
    accessory: 'acc-none'
};
let audioCtx = null;

// ===== ЭЛЕМЕНТЫ DOM =====
let robotImg = null;
let thoughtBubble = null;
let coinsDisplay = null;
let clothesOverlay = null;
let accessoryOverlay = null;

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initRoom() {
    // Получаем элементы DOM
    robotImg = document.getElementById('robot-img');
    thoughtBubble = document.getElementById('bubble');
    coinsDisplay = document.getElementById('coins');
    clothesOverlay = document.getElementById('clothes-overlay');
    accessoryOverlay = document.getElementById('accessory-overlay');
    
    // Загружаем данные
    loadRoomState();
    
    // Применяем настройки
    applyTheme();
    updateCoinsDisplay();
    updateRobotAppearance();
    
    // Инициализируем аудио
    initAudio();
    
    // Добавляем обработчики событий
    attachEventListeners();
}

// ===== РАБОТА С ЛОКАЛЬНЫМ ХРАНИЛИЩЕМ =====
function loadRoomState() {
    try {
        coins = parseInt(localStorage.getItem('neuroCoins')) || 0;
        currentTheme = localStorage.getItem('neuroTheme') || '';
        
        // Загружаем экипированные предметы
        const savedEquipped = localStorage.getItem('neuroEquipped');
        if (savedEquipped) {
            equippedItems = JSON.parse(savedEquipped);
        }
    } catch (e) {
        console.error('Ошибка загрузки данных комнаты:', e);
        // Используем значения по умолчанию
        equippedItems = { body: 'clothes-none', accessory: 'acc-none' };
    }
}

// ===== ПРИМЕНЕНИЕ НАСТРОЕК =====
function applyTheme() {
    if (currentTheme) {
        document.body.className = currentTheme;
    }
}

function updateCoinsDisplay() {
    if (coinsDisplay) {
        coinsDisplay.innerText = coins;
    }
}

function updateRobotAppearance() {
    // Получаем данные о предметах из shop.js
    const clothesData = getClothesImage(equippedItems.body);
    const accessoryData = getAccessoryImage(equippedItems.accessory);
    
    // Обновляем изображения оверлеев
    if (clothesOverlay) {
        if (clothesData && equippedItems.body !== 'clothes-none') {
            clothesOverlay.src = clothesData;
            clothesOverlay.style.display = 'block';
        } else {
            clothesOverlay.style.display = 'none';
        }
    }
    
    if (accessoryOverlay) {
        if (accessoryData && equippedItems.accessory !== 'acc-none') {
            accessoryOverlay.src = accessoryData;
            accessoryOverlay.style.display = 'block';
        } else {
            accessoryOverlay.style.display = 'none';
        }
    }
}

// Получение URL изображений из данных магазина
function getClothesImage(id) {
    const clothes = [
        { id: 'clothes-none', img: '' },
        { id: 'clothes-tshirt', img: 'https://img.icons8.com/color/96/t-shirt.png' },
        { id: 'clothes-hoodie', img: 'https://img.icons8.com/color/96/hoodie.png' },
        { id: 'clothes-jacket', img: 'https://img.icons8.com/color/96/jacket.png' },
        { id: 'clothes-suit', img: 'https://img.icons8.com/color/96/business-shirt.png' }
    ];
    const item = clothes.find(c => c.id === id);
    return item ? item.img : '';
}

function getAccessoryImage(id) {
    const accessories = [
        { id: 'acc-none', img: '' },
        { id: 'acc-glasses', img: 'https://img.icons8.com/color/96/glasses.png' },
        { id: 'acc-hat', img: 'https://img.icons8.com/color/96/top-hat.png' },
        { id: 'acc-headphones', img: 'https://img.icons8.com/color/96/headphones.png' },
        { id: 'acc-crown', img: 'https://img.icons8.com/color/96/crown.png' },
        { id: 'acc-bow', img: 'https://img.icons8.com/color/96/bow-tie.png' }
    ];
    const item = accessories.find(a => a.id === id);
    return item ? item.img : '';
}

// ===== АУДИО =====
function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Активация звука по первому клику (требование браузеров)
    document.body.addEventListener('click', () => {
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }, { once: true });
}

function playSound(type) {
    if (!audioCtx) return;
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'poke') {
        // Веселый писк
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    }
}

// ===== ВЗАИМОДЕЙСТВИЕ С РОБОТОМ =====
function pokeRobot() {
    playSound('poke');
    
    // Случайная фраза
    const text = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    showThoughtBubble(text);
    
    // Немного конфетти из робота
    if (typeof confetti === 'function') {
        confetti({ 
            particleCount: 5, 
            spread: 40, 
            origin: { y: 0.5 },
            colors: ['#FFC107', '#2196F3'] 
        });
    }
}

function feedRobot() {
    // Пока просто заглушка, но с эффектом
    pokeRobot();
    showThoughtBubble("Ням-ням! ⚡");
}

function showThoughtBubble(text) {
    if (!thoughtBubble) return;
    
    thoughtBubble.innerText = text;
    thoughtBubble.style.opacity = 1;
    
    // Перезапуск анимации облачка
    thoughtBubble.style.animation = 'none';
    thoughtBubble.offsetHeight; /* trigger reflow */
    thoughtBubble.style.animation = 'popIn 0.3s forwards';
}

// ===== НАВИГАЦИЯ =====
function goToShop() {
    window.location.href = 'shop.html';
}

// ===== ОБРАБОТКА СОБЫТИЙ =====
function attachEventListeners() {
    // Клик по роботу
    if (robotImg) {
        robotImg.addEventListener('click', pokeRobot);
    }
    
    // Клик по оверлеям тоже считается как клик по роботу
    if (clothesOverlay) {
        clothesOverlay.addEventListener('click', pokeRobot);
    }
    if (accessoryOverlay) {
        accessoryOverlay.addEventListener('click', pokeRobot);
    }
    
    // Кнопки управления (используем event delegation)
    const roomControls = document.querySelector('.room-controls');
    if (roomControls) {
        roomControls.addEventListener('click', handleControlClick);
    }
}

function handleControlClick(e) {
    const btn = e.target.closest('.room-btn');
    if (!btn) return;
    
    const action = btn.dataset.action;
    
    if (action === 'shop') {
        goToShop();
    } else if (action === 'feed') {
        feedRobot();
    }
}

// ===== ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ =====
document.addEventListener('DOMContentLoaded', initRoom);

// Экспорт для возможного использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { pokeRobot, feedRobot };
}
