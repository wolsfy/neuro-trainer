/**
 * Система ежедневных заданий
 * Обновление в 00:00 каждый день
 * Streak-система для ежедневных посещений
 */

const QUEST_TEMPLATES = [
  {
    id: 'play_games',
    name: 'Сыграй 3 игры',
    icon: '🎮',
    description: 'Заверши 3 любые игры',
    target: 3,
    current: 0,
    type: 'games_played',
    rewards: { coins: 50, xp: 100 }
  },
  {
    id: 'earn_xp',
    name: 'Заработай 50 XP',
    icon: '✨',
    description: 'Получи 50 опыта',
    target: 50,
    current: 0,
    type: 'xp_earned',
    rewards: { coins: 30, xp: 0 }
  },
  {
    id: 'spend_energy',
    name: 'Потрать 50 энергии',
    icon: '⚡',
    description: 'Используй 50 энергии',
    target: 50,
    current: 0,
    type: 'energy_spent',
    rewards: { coins: 25, xp: 50 }
  },
  {
    id: 'new_record',
    name: 'Побей рекорд',
    icon: '🏆',
    description: 'Установи новый рекорд в любой игре',
    target: 1,
    current: 0,
    type: 'new_record',
    rewards: { coins: 100, xp: 200 }
  }
];

const STREAK_REWARDS = [
  { day: 3, coins: 30, xp: 50, bonus: '🔥 3 дня' },
  { day: 7, coins: 100, xp: 150, bonus: '⭐ 7 дней' },
  { day: 14, coins: 250, xp: 300, bonus: '🎉 14 дней' },
  { day: 30, coins: 500, xp: 1000, bonus: '👑 30 дней' }
];

class DailyQuestsSystem {
  constructor() {
    this.quests = [];
    this.streak = 0;
    this.lastVisit = null;
    this.todayVisited = false;
    this.loadProgress();
    this.checkDailyReset();
  }
  
  loadProgress() {
    const saved = localStorage.getItem('neuroDailyQuests');
    const savedStreak = localStorage.getItem('neuroStreak');
    const savedLastVisit = localStorage.getItem('neuroLastVisit');
    
    if (saved) {
      this.quests = JSON.parse(saved);
    } else {
      this.resetQuests();
    }
    
    this.streak = parseInt(savedStreak) || 0;
    this.lastVisit = savedLastVisit ? new Date(savedLastVisit) : null;
  }
  
  saveProgress() {
    localStorage.setItem('neuroDailyQuests', JSON.stringify(this.quests));
    localStorage.setItem('neuroStreak', this.streak);
    localStorage.setItem('neuroLastVisit', new Date().toISOString());
  }
  
  checkDailyReset() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (!this.lastVisit) {
      // Первое посещение
      this.streak = 1;
      this.lastVisit = now;
      this.todayVisited = true;
      this.saveProgress();
      return;
    }
    
    const lastVisitDate = new Date(
      this.lastVisit.getFullYear(),
      this.lastVisit.getMonth(),
      this.lastVisit.getDate()
    );
    
    const daysDiff = Math.floor((today - lastVisitDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Сегодня уже заходил
      this.todayVisited = true;
    } else if (daysDiff === 1) {
      // Вчера заходил, продолжаем streak
      this.streak++;
      this.lastVisit = now;
      this.todayVisited = true;
      this.resetQuests();
      this.checkStreakReward();
      this.saveProgress();
    } else {
      // Пропустил день - сброс streak
      this.streak = 1;
      this.lastVisit = now;
      this.todayVisited = true;
      this.resetQuests();
      this.saveProgress();
    }
  }
  
  resetQuests() {
    this.quests = QUEST_TEMPLATES.map(q => ({...q, current: 0, completed: false}));
    this.saveProgress();
  }
  
  checkStreakReward() {
    const reward = STREAK_REWARDS.find(r => r.day === this.streak);
    if (reward) {
      this.giveReward(reward.coins, reward.xp);
      this.showStreakNotification(reward);
    }
  }
  
  updateProgress(type, amount = 1) {
    let updated = false;
    
    this.quests.forEach(quest => {
      if (quest.type === type && !quest.completed) {
        quest.current = Math.min(quest.current + amount, quest.target);
        
        if (quest.current >= quest.target) {
          quest.completed = true;
          this.completeQuest(quest);
        }
        updated = true;
      }
    });
    
    if (updated) {
      this.saveProgress();
      this.updateDisplay();
    }
  }
  
  completeQuest(quest) {
    this.giveReward(quest.rewards.coins, quest.rewards.xp);
    this.showQuestCompleteNotification(quest);
  }
  
  giveReward(coins, xp) {
    // Монеты
    if (coins > 0) {
      let currentCoins = parseInt(localStorage.getItem('neuroCoins')) || 0;
      localStorage.setItem('neuroCoins', currentCoins + coins);
      if (typeof updateCoinsDisplay === 'function') updateCoinsDisplay();
    }
    
    // XP
    if (xp > 0 && window.levelSystem) {
      const result = window.levelSystem.addXP(xp);
      if (result.leveledUp) {
        setTimeout(() => window.showLevelUpNotification(result.oldLevel, result.newLevel), 800);
      }
    }
  }
  
  getQuests() {
    return this.quests;
  }
  
  getStreak() {
    return this.streak;
  }
  
  getNextStreakReward() {
    return STREAK_REWARDS.find(r => r.day > this.streak);
  }
  
  getAllCompleted() {
    return this.quests.every(q => q.completed);
  }
  
  showQuestCompleteNotification(quest) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      padding: 25px 35px;
      border-radius: 20px;
      font-weight: bold;
      box-shadow: 0 8px 32px rgba(76, 175, 80, 0.6);
      z-index: 10002;
      text-align: center;
      animation: questPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;
    notification.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 10px;">✅</div>
      <div style="font-size: 1.4rem; margin-bottom: 10px;">Задание выполнено!</div>
      <div style="font-size: 1.1rem; margin-bottom: 15px;">${quest.icon} ${quest.name}</div>
      <div style="font-size: 1rem; opacity: 0.9;">
        ${quest.rewards.coins > 0 ? '+' + quest.rewards.coins + ' 💰' : ''}
        ${quest.rewards.xp > 0 ? ' +' + quest.rewards.xp + ' XP' : ''}
      </div>
    `;
    document.body.appendChild(notification);
    
    if (!document.getElementById('quest-pop-anim')) {
      const style = document.createElement('style');
      style.id = 'quest-pop-anim';
      style.textContent = `
        @keyframes questPop {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    
    if (typeof confetti !== 'undefined') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  showStreakNotification(reward) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #FF9800, #F57C00);
      color: white;
      padding: 30px 40px;
      border-radius: 20px;
      font-weight: bold;
      box-shadow: 0 8px 32px rgba(255, 152, 0, 0.6);
      z-index: 10003;
      text-align: center;
      animation: streakPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;
    notification.innerHTML = `
      <div style="font-size: 4rem; margin-bottom: 10px;">🔥</div>
      <div style="font-size: 1.6rem; margin-bottom: 10px;">${reward.bonus}</div>
      <div style="font-size: 1.2rem; margin-bottom: 15px;">Серия посещений!</div>
      <div style="font-size: 1.1rem; opacity: 0.95;">
        +${reward.coins} 💰 +${reward.xp} XP
      </div>
    `;
    document.body.appendChild(notification);
    
    if (!document.getElementById('streak-pop-anim')) {
      const style = document.createElement('style');
      style.id = 'streak-pop-anim';
      style.textContent = `
        @keyframes streakPop {
          0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    
    if (typeof confetti !== 'undefined') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }
  
  updateDisplay() {
    // Обновляется в quests.html
  }
}

// Глобальная инициализация
if (typeof window !== 'undefined') {
  window.dailyQuests = new DailyQuestsSystem();
  
  console.log('✅ DailyQuestsSystem инициализирован');
  console.log(`🔥 Streak: ${window.dailyQuests.streak} дней`);
  console.log(`🎯 Заданий выполнено: ${window.dailyQuests.quests.filter(q => q.completed).length}/${window.dailyQuests.quests.length}`);
}
