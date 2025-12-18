/**
 * Система уровней и прогресса
 * XP, уровни, титулы и звания
 */

const TITLES = [
  { level: 1, name: 'Новичок', icon: '🌱' },
  { level: 5, name: 'Ученик', icon: '🎓' },
  { level: 10, name: 'Адепт', icon: '⭐' },
  { level: 15, name: 'Эксперт', icon: '💪' },
  { level: 20, name: 'Мастер', icon: '🏆' },
  { level: 30, name: 'Виртуоз', icon: '✨' },
  { level: 40, name: 'Гений', icon: '🧠' },
  { level: 50, name: 'Легенда', icon: '🔥' },
  { level: 75, name: 'Божество', icon: '⚡' },
  { level: 100, name: 'Бессмертный', icon: '👑' }
];

class LevelSystem {
  constructor() {
    this.xp = 0;
    this.level = 1;
    this.totalXP = 0;
    this.loadProgress();
  }
  
  loadProgress() {
    this.totalXP = parseInt(localStorage.getItem('neuroTotalXP')) || 0;
    this.calculateLevel();
  }
  
  saveProgress() {
    localStorage.setItem('neuroTotalXP', this.totalXP);
  }
  
  // Формула: XP = 100 * level^1.5
  xpForLevel(level) {
    return Math.floor(100 * Math.pow(level, 1.5));
  }
  
  calculateLevel() {
    let accumulated = 0;
    let lvl = 1;
    
    while (accumulated + this.xpForLevel(lvl) <= this.totalXP) {
      accumulated += this.xpForLevel(lvl);
      lvl++;
    }
    
    this.level = lvl;
    this.xp = this.totalXP - accumulated;
  }
  
  addXP(amount) {
    const oldLevel = this.level;
    this.totalXP += amount;
    this.xp += amount;
    
    const xpNeeded = this.xpForLevel(this.level);
    let leveledUp = false;
    
    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      leveledUp = true;
    }
    
    this.saveProgress();
    
    if (leveledUp) {
      return { leveledUp: true, oldLevel, newLevel: this.level };
    }
    
    return { leveledUp: false, xpGained: amount };
  }
  
  getProgress() {
    const xpNeeded = this.xpForLevel(this.level);
    return {
      level: this.level,
      xp: this.xp,
      xpNeeded: xpNeeded,
      percentage: Math.floor((this.xp / xpNeeded) * 100),
      totalXP: this.totalXP
    };
  }
  
  getCurrentTitle() {
    let title = TITLES[0];
    for (let i = 0; i < TITLES.length; i++) {
      if (this.level >= TITLES[i].level) {
        title = TITLES[i];
      } else {
        break;
      }
    }
    return title;
  }
  
  getNextTitle() {
    for (let i = 0; i < TITLES.length; i++) {
      if (this.level < TITLES[i].level) {
        return TITLES[i];
      }
    }
    return null;
  }
  
  getAllTitles() {
    return TITLES;
  }
}

// XP за различные действия
const XP_REWARDS = {
  gameComplete: 50,
  schulte5x5: 60,
  schulte3x3: 40,
  memoryLevel: 30,
  stroopPoint: 2,
  mathCorrect: 3,
  decoderSymbol: 5,
  newRecord: 100,
  achievement: 150,
  dailyLogin: 20,
  perfectGame: 200
};

// Уведомление о получении XP
function showXPNotification(amount, x = null, y = null) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    ${x !== null ? 'left: ' + x + 'px;' : 'left: 50%;'}
    ${y !== null ? 'top: ' + y + 'px;' : 'top: 50%;'}
    ${x === null ? 'transform: translateX(-50%);' : ''}
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    font-weight: bold;
    font-size: 1.2rem;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.5);
    z-index: 10000;
    animation: xpPop 1s forwards;
    pointer-events: none;
  `;
  notification.innerHTML = `+${amount} XP ✨`;
  document.body.appendChild(notification);
  
  if (!document.getElementById('xp-anim-style')) {
    const style = document.createElement('style');
    style.id = 'xp-anim-style';
    style.textContent = `
      @keyframes xpPop {
        0% { opacity: 0; transform: translateY(0) scale(0.5); }
        20% { opacity: 1; transform: translateY(-30px) scale(1.2); }
        80% { opacity: 1; transform: translateY(-60px) scale(1); }
        100% { opacity: 0; transform: translateY(-80px) scale(0.8); }
      }
    `;
    document.head.appendChild(style);
  }
  
  setTimeout(() => notification.remove(), 1000);
}

// Уведомление о повышении уровня
function showLevelUpNotification(oldLevel, newLevel) {
  const title = window.levelSystem.getCurrentTitle();
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #f093fb, #f5576c);
    color: white;
    padding: 30px 40px;
    border-radius: 20px;
    font-weight: bold;
    box-shadow: 0 8px 32px rgba(245, 87, 108, 0.6);
    z-index: 10001;
    text-align: center;
    animation: levelUpAnim 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  `;
  notification.innerHTML = `
    <div style="font-size: 3rem; margin-bottom: 10px;">🎉</div>
    <div style="font-size: 1.8rem; margin-bottom: 5px;">Новый уровень!</div>
    <div style="font-size: 2.5rem; margin: 10px 0;">${newLevel}</div>
    <div style="font-size: 1.2rem; opacity: 0.9;">${title.icon} ${title.name}</div>
  `;
  document.body.appendChild(notification);
  
  if (!document.getElementById('levelup-anim-style')) {
    const style = document.createElement('style');
    style.id = 'levelup-anim-style';
    style.textContent = `
      @keyframes levelUpAnim {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1); }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Конфетти
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
    notification.style.transition = 'all 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Глобальная инициализация
if (typeof window !== 'undefined') {
  window.levelSystem = new LevelSystem();
  window.XP_REWARDS = XP_REWARDS;
  window.showXPNotification = showXPNotification;
  window.showLevelUpNotification = showLevelUpNotification;
  
  console.log('✅ LevelSystem инициализирован');
  console.log(`🎮 Уровень: ${window.levelSystem.level}, XP: ${window.levelSystem.xp}/${window.levelSystem.xpForLevel(window.levelSystem.level)}`);
}
