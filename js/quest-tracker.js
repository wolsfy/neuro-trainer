/**
 * Helper для отслеживания прогресса заданий в играх
 */

class QuestTracker {
  // Игра завершена
  static gameCompleted() {
    if (window.dailyQuests) {
      window.dailyQuests.updateProgress('games_played', 1);
      console.log('🎯 Quest: +1 game played');
    }
  }
  
  // Получен XP
  static xpEarned(amount) {
    if (window.dailyQuests) {
      window.dailyQuests.updateProgress('xp_earned', amount);
    }
  }
  
  // Потрачена энергия
  static energySpent(amount) {
    if (window.dailyQuests) {
      window.dailyQuests.updateProgress('energy_spent', amount);
    }
  }
  
  // Новый рекорд
  static newRecord() {
    if (window.dailyQuests) {
      window.dailyQuests.updateProgress('new_record', 1);
      console.log('🎯 Quest: New record!');
    }
  }
  
  // Отслеживание получения XP через levelSystem
  static trackXPFromLevelSystem() {
    if (window.levelSystem) {
      const originalAddXP = window.levelSystem.addXP.bind(window.levelSystem);
      window.levelSystem.addXP = function(amount) {
        QuestTracker.xpEarned(amount);
        return originalAddXP(amount);
      };
    }
  }
  
  // Отслеживание трат энергии
  static trackEnergySpending() {
    if (window.energySystem) {
      const originalSpend = window.energySystem.spendEnergy.bind(window.energySystem);
      window.energySystem.spendEnergy = function(game) {
        const result = originalSpend(game);
        if (result) {
          const cost = window.ENERGY_CONFIG.gameCosts[game] || 10;
          QuestTracker.energySpent(cost);
        }
        return result;
      };
    }
  }
}

// Автоматическая интеграция
if (typeof window !== 'undefined') {
  window.QuestTracker = QuestTracker;
  
  // Ждем загрузки систем
  setTimeout(() => {
    QuestTracker.trackXPFromLevelSystem();
    QuestTracker.trackEnergySpending();
    console.log('✅ QuestTracker интегрирован');
  }, 100);
}
