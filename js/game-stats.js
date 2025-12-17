// === ОБЩАЯ БИБЛИОТЕКА ДЛЯ СТАТИСТИКИ ИГР ===

window.GameStats = {
    // Обновление общей статистики
    incrementTotalGames: function() {
        let total = parseInt(localStorage.getItem('neuroTotalGames')) || 0;
        localStorage.setItem('neuroTotalGames', total + 1);
    },
    
    // Добавление монет с отслеживанием общего заработка
    addCoins: function(amount) {
        let current = parseInt(localStorage.getItem('neuroCoins')) || 0;
        localStorage.setItem('neuroCoins', current + amount);
        
        let totalEarned = parseInt(localStorage.getItem('neuroTotalCoinsEarned')) || 0;
        localStorage.setItem('neuroTotalCoinsEarned', totalEarned + amount);
    },
    
    // Обновление статистики игры Schulte
    updateSchulte: function(time) {
        this.incrementTotalGames();
        
        let played = parseInt(localStorage.getItem('neuroSchultePlayed')) || 0;
        localStorage.setItem('neuroSchultePlayed', played + 1);
        
        let bestTime = parseFloat(localStorage.getItem('neuroSchulteBestTime')) || 9999;
        if (time < bestTime) {
            localStorage.setItem('neuroSchulteBestTime', time);
        }
        
        this.checkAchievements();
    },
    
    // Обновление статистики игры Decoder
    updateDecoder: function() {
        this.incrementTotalGames();
        
        let played = parseInt(localStorage.getItem('neuroDecoderPlayed')) || 0;
        localStorage.setItem('neuroDecoderPlayed', played + 1);
        
        this.checkAchievements();
    },
    
    // Обновление статистики игры Memory
    updateMemory: function(level) {
        this.incrementTotalGames();
        
        let played = parseInt(localStorage.getItem('neuroMemoryPlayed')) || 0;
        localStorage.setItem('neuroMemoryPlayed', played + 1);
        
        let maxLevel = parseInt(localStorage.getItem('neuroMemoryMaxLevel')) || 0;
        if (level > maxLevel) {
            localStorage.setItem('neuroMemoryMaxLevel', level);
        }
        
        this.checkAchievements();
    },
    
    // Обновление статистики игры Stroop
    updateStroop: function(streak) {
        this.incrementTotalGames();
        
        let played = parseInt(localStorage.getItem('neuroStroopPlayed')) || 0;
        localStorage.setItem('neuroStroopPlayed', played + 1);
        
        let maxStreak = parseInt(localStorage.getItem('neuroStroopStreak')) || 0;
        if (streak > maxStreak) {
            localStorage.setItem('neuroStroopStreak', streak);
        }
        
        this.checkAchievements();
    },
    
    // Обновление статистики игры Math
    updateMath: function(perfectStreak) {
        this.incrementTotalGames();
        
        let played = parseInt(localStorage.getItem('neuroMathPlayed')) || 0;
        localStorage.setItem('neuroMathPlayed', played + 1);
        
        let maxStreak = parseInt(localStorage.getItem('neuroMathPerfectStreak')) || 0;
        if (perfectStreak > maxStreak) {
            localStorage.setItem('neuroMathPerfectStreak', perfectStreak);
        }
        
        this.checkAchievements();
    },
    
    // Проверка достижений
    checkAchievements: function() {
        if (window.AchievementsSystem) {
            const newAchievements = window.AchievementsSystem.check();
            newAchievements.forEach((ach, index) => {
                setTimeout(() => {
                    window.AchievementsSystem.showNotification(ach);
                }, 1000 + (index * 3500)); // Задержка между уведомлениями
            });
        }
    }
};
