// ===== КОНСТАНТЫ =====
const PHRASES = [
    "Привет!", "Как дела?", "Поиграем?", "Я умный!", "Бзз-бзз...", "Хочу монетки!", "Ты супер!", "Заряди меня!"
];

// Данные об одежде (полные изображения роботов)
const CLOTHES_IMAGES = {
    'clothes-none': 'mascot.png',
    'clothes-tshirt': 'robot-tshirt.png',
    'clothes-hoodie': 'robot-hoodie.png',
    'clothes-jacket': 'robot-jacket.png',
    'clothes-suit': 'robot-suit.png'
};

// Данные об аксессуарах (пока пусто, можно добавить позже)
const ACCESSORY_IMAGES = {
    'acc-none': '',
    'acc-glasses': 'robot-glasses.png',
    'acc-hat': '',
    'acc-headphones': '',
    'acc-crown': '',
    'acc-bow': ''
};

// ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
let coins = 0;
let currentTheme = '';
let equippedClothes = 'clothes-none';
let equippedAccessory = 'acc-none';
let audioCtx = null;

// ===== ЭЛЕМЕНТЫ DOM =====
let robotImg = null;
let thoughtBubble = null;
let coinsDisplay = null;

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initRoom() {
    // Получаем элементы DOM
    robotImg = document.getElementById('robot-img');
    thoughtBubble = document.getElementById('bubble');
    coinsDisplay = document.getElementById('coins');
    
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
        equippedClothes = localStorage.getItem('neuroClothes') || 'clothes-none';
        equippedAccessory = localStorage.getItem('neuroAccessory') || 'acc-none';
    } catch (e) {
        console.error('Ошибка загрузки данных комнаты:', e);
        equippedClothes = 'clothes-none';
        equippedAccessory = 'acc-none';
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
    if (!robotImg) return;
    
    // Получаем изображение робота в одежде
    const clothesImage = CLOTHES_IMAGES[equippedClothes] || 'mascot.png';
    
    // Если есть изображение с аксессуаром - используем его
    // Пока у нас нет комбинированных изображений, просто отображаем одежду
    robotImg.src = clothesImage;
    
    // Если изображение не загрузилось, возвращаемся к дефолтному
    robotImg.onerror = function() {
        console.warn('Не удалось загрузить:', clothesImage);
        robotImg.src = 'mascot.png';
    };
}

// ===== АУДИО =====
function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Активация звука по первому клику
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
    
    // Кнопки управления
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
