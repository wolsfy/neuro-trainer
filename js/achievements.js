// ===== БАЗА ДАННЫХ ДОСТИЖЕНИЙ =====
const ACHIEVEMENTS = {
    // Базовые достижения
    basic: [
        {
            id: 'first_game',
            name: 'Новичок',
            desc: 'Сыграй первую игру',
            icon: '🎮',
            reward: 50,
            check: (stats) => stats.totalGames >= 1
        },
        {
            id: 'five_games',
            name: 'Энтузиаст',
            desc: 'Сыграй 5 игр',
            icon: '🎯',
            reward: 100,
            check: (stats) => stats.totalGames >= 5
        },
        {
            id: 'ten_games',
            name: 'Постоянный игрок',
            desc: 'Сыграй 10 игр',
            icon: '⚡',
            reward: 150,
            check: (stats) => stats.totalGames >= 10
        },
        {
            id: 'all_games',
            name: 'Исследователь',
            desc: 'Попробуй все игры хотя бы раз',
            icon: '🧭',
            reward: 200,
            check: (stats) => {
                const games = ['schulte', 'decoder', 'memory', 'stroop', 'math'];
                return games.every(game => stats[game + '_played'] > 0);
            }
        }
    ],
    
    // Достижения мастерства
    mastery: [
        {
            id: 'schulte_master',
            name: 'Мастер внимания',
            desc: 'Пройди таблицу Шульте за 30 секунд',
            icon: '🔢',
            reward: 250,
            check: (stats) => stats.schulte_best_time > 0 && stats.schulte_best_time <= 30
        },
        {
            id: 'memory_champion',
            name: 'Чемпион памяти',
            desc: 'Достигни 5 уровня в игре Память',
            icon: '💡',
            reward: 250,
            check: (stats) => stats.memory_max_level >= 5
        },
        {
            id: 'stroop_expert',
            name: 'Эксперт Струпа',
            desc: 'Набери 10 правильных ответов подряд в игре Цвета',
            icon: '🎨',
            reward: 250,
            check: (stats) => stats.stroop_streak >= 10
        },
        {
            id: 'math_wizard',
            name: 'Математический волшебник',
            desc: 'Реши 20 примеров подряд без ошибок',
            icon: '🧮',
            reward: 300,
            check: (stats) => stats.math_perfect_streak >= 20
        },
        {
            id: 'speed_demon',
            name: 'Скоростной демон',
            desc: 'Заработай 1000 монет',
            icon: '💰',
            reward: 500,
            check: (stats) => stats.totalCoinsEarned >= 1000
        }
    ],
    
    // Коллекционер
    collector: [
        {
            id: 'first_theme',
            name: 'Дизайнер',
            desc: 'Купи первую тему оформления',
            icon: '🎨',
            reward: 100,
            check: (stats) => stats.themesOwned >= 2 // 2, потому что одна бесплатная
        },
        {
            id: 'all_themes',
            name: 'Коллекционер тем',
            desc: 'Собери все темы оформления',
            icon: '🌈',
            reward: 300,
            check: (stats) => stats.themesOwned >= 4
        },
        {
            id: 'fashion_icon',
            name: 'Икона стиля',
            desc: 'Купи 3 предмета одежды для робота',
            icon: '👕',
            reward: 200,
            check: (stats) => stats.clothesOwned >= 4 // 4, потому что одна бесплатная
        },
        {
            id: 'full_wardrobe',
            name: 'Полный гардероб',
            desc: 'Собери всю одежду для робота',
            icon: '👔',
            reward: 400,
            check: (stats) => stats.clothesOwned >= 5
        }
    ]
};

// ===== СОСТОЯНИЕ =====
let unlockedAchievements = [];
let stats = {};

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initAchievements() {
    loadData();
    renderAchievements();
    updateStats();
}

// ===== ЗАГРУЗКА ДАННЫХ =====
function loadData() {
    unlockedAchievements = JSON.parse(localStorage.getItem('neuroAchievements')) || [];
    
    // Загрузка статистики
    stats = {
        totalGames: parseInt(localStorage.getItem('neuroTotalGames')) || 0,
        totalCoinsEarned: parseInt(localStorage.getItem('neuroTotalCoinsEarned')) || 0,
        
        // По играм
        schulte_played: parseInt(localStorage.getItem('neuroSchultePlayed')) || 0,
        schulte_best_time: parseFloat(localStorage.getItem('neuroSchulteBestTime')) || 0,
        
        decoder_played: parseInt(localStorage.getItem('neuroDecoderPlayed')) || 0,
        
        memory_played: parseInt(localStorage.getItem('neuroMemoryPlayed')) || 0,
        memory_max_level: parseInt(localStorage.getItem('neuroMemoryMaxLevel')) || 0,
        
        stroop_played: parseInt(localStorage.getItem('neuroStroopPlayed')) || 0,
        stroop_streak: parseInt(localStorage.getItem('neuroStroopStreak')) || 0,
        
        math_played: parseInt(localStorage.getItem('neuroMathPlayed')) || 0,
        math_perfect_streak: parseInt(localStorage.getItem('neuroMathPerfectStreak')) || 0,
        
        // Магазин
        themesOwned: (JSON.parse(localStorage.getItem('neuroOwned')) || []).filter(id => id.startsWith('theme-')).length,
        clothesOwned: (JSON.parse(localStorage.getItem('neuroOwned')) || []).filter(id => id.startsWith('clothes-')).length
    };
}

// ===== РЕНДЕРИНГ =====
function renderAchievements() {
    renderCategory('basic-achievements', ACHIEVEMENTS.basic);
    renderCategory('mastery-achievements', ACHIEVEMENTS.mastery);
    renderCategory('collector-achievements', ACHIEVEMENTS.collector);
}

function renderCategory(containerId, achievements) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    achievements.forEach(achievement => {
        const isUnlocked = unlockedAchievements.includes(achievement.id);
        const canUnlock = !isUnlocked && achievement.check(stats);
        
        container.innerHTML += createAchievementHTML(achievement, isUnlocked, canUnlock);
    });
}

function createAchievementHTML(ach, isUnlocked, canUnlock) {
    return `
        <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}" 
             data-id="${ach.id}" 
             data-can-unlock="${canUnlock}">
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-details">
                <span class="achievement-name">${ach.name}</span>
                <span class="achievement-desc">${ach.desc}</span>
                ${isUnlocked ? '<div class="progress-bar"><div class="progress-fill" style="width: 100%"></div></div>' : ''}
            </div>
            <div class="achievement-reward">+${ach.reward} 💰</div>
        </div>
    `;
}

// ===== ОБНОВЛЕНИЕ СТАТИСТИКИ =====
function updateStats() {
    const totalAchievements = Object.values(ACHIEVEMENTS).flat().length;
    const unlockedCount = unlockedAchievements.length;
    
    document.getElementById('total-count').textContent = totalAchievements;
    document.getElementById('unlocked-count').textContent = unlockedCount;
}

// ===== ПРОВЕРКА И РАЗБЛОКИРОВКА =====
function checkNewAchievements() {
    const allAchievements = Object.values(ACHIEVEMENTS).flat();
    const newUnlocks = [];
    
    allAchievements.forEach(achievement => {
        if (!unlockedAchievements.includes(achievement.id) && achievement.check(stats)) {
            newUnlocks.push(achievement);
            unlockedAchievements.push(achievement.id);
            
            // Выдача награды
            let coins = parseInt(localStorage.getItem('neuroCoins')) || 0;
            coins += achievement.reward;
            localStorage.setItem('neuroCoins', coins);
        }
    });
    
    if (newUnlocks.length > 0) {
        localStorage.setItem('neuroAchievements', JSON.stringify(unlockedAchievements));
        return newUnlocks;
    }
    
    return [];
}

// ===== ЭКСПОРТ ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ СКРИПТАХ =====
window.AchievementsSystem = {
    check: checkNewAchievements,
    showNotification: function(achievement) {
        // Уведомление о разблокировке
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: white;
            padding: 20px 30px;
            border-radius: 16px;
            font-weight: bold;
            box-shadow: 0 8px 24px rgba(255, 215, 0, 0.5);
            z-index: 10000;
            animation: slideDown 0.5s;
            display: flex;
            align-items: center;
            gap: 15px;
        `;
        notification.innerHTML = `
            <div style="font-size: 2rem;">${achievement.icon}</div>
            <div>
                <div style="font-size: 1.2rem;">Достижение разблокировано!</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">${achievement.name}</div>
                <div style="font-size: 0.8rem; opacity: 0.8;">+${achievement.reward} 💰</div>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Анимация появления
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-20px)';
            notification.style.transition = 'all 0.5s';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
};

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', initAchievements);
