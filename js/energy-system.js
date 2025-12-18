/**
 * Система энергии
 * Энергия нужна для входа в игры
 * Автоматическое пополнение со временем
 */

const ENERGY_CONFIG = {
  maxEnergy: 100,
  regenRate: 1, // +1 энергия каждые X минут
  regenMinutes: 5, // 5 минут на 1 энергию
  refillCost: 50, // стоимость полного пополнения
  gameCosts: {
    schulte: 10,
    memory: 15,
    stroop: 20,
    math: 20,
    decoder: 15
  }
};

class EnergySystem {
  constructor() {
    this.energy = ENERGY_CONFIG.maxEnergy;
    this.lastUpdateTime = Date.now();
    this.loadEnergy();
    this.startRegeneration();
  }
  
  loadEnergy() {
    const saved = localStorage.getItem('neuroEnergy');
    const savedTime = localStorage.getItem('neuroEnergyTime');
    
    if (saved !== null && savedTime !== null) {
      this.energy = parseInt(saved);
      this.lastUpdateTime = parseInt(savedTime);
      this.regenerate();
    } else {
      this.energy = ENERGY_CONFIG.maxEnergy;
      this.lastUpdateTime = Date.now();
      this.saveEnergy();
    }
  }
  
  saveEnergy() {
    localStorage.setItem('neuroEnergy', this.energy);
    localStorage.setItem('neuroEnergyTime', this.lastUpdateTime);
  }
  
  regenerate() {
    if (this.energy >= ENERGY_CONFIG.maxEnergy) {
      this.energy = ENERGY_CONFIG.maxEnergy;
      this.saveEnergy();
      return;
    }
    
    const now = Date.now();
    const elapsed = now - this.lastUpdateTime;
    const minutesElapsed = elapsed / (1000 * 60);
    const regenAmount = Math.floor(minutesElapsed / ENERGY_CONFIG.regenMinutes) * ENERGY_CONFIG.regenRate;
    
    if (regenAmount > 0) {
      this.energy = Math.min(this.energy + regenAmount, ENERGY_CONFIG.maxEnergy);
      this.lastUpdateTime = now - (elapsed % (ENERGY_CONFIG.regenMinutes * 60 * 1000));
      this.saveEnergy();
    }
  }
  
  startRegeneration() {
    setInterval(() => {
      this.regenerate();
      this.updateDisplay();
    }, 60000); // каждую минуту
  }
  
  getEnergy() {
    this.regenerate();
    return this.energy;
  }
  
  canPlay(game) {
    this.regenerate();
    const cost = ENERGY_CONFIG.gameCosts[game] || 10;
    return this.energy >= cost;
  }
  
  spendEnergy(game) {
    const cost = ENERGY_CONFIG.gameCosts[game] || 10;
    if (this.energy >= cost) {
      this.energy -= cost;
      this.lastUpdateTime = Date.now();
      this.saveEnergy();
      return true;
    }
    return false;
  }
  
  refillEnergy() {
    const coins = parseInt(localStorage.getItem('neuroCoins')) || 0;
    if (coins >= ENERGY_CONFIG.refillCost) {
      localStorage.setItem('neuroCoins', coins - ENERGY_CONFIG.refillCost);
      this.energy = ENERGY_CONFIG.maxEnergy;
      this.lastUpdateTime = Date.now();
      this.saveEnergy();
      return true;
    }
    return false;
  }
  
  getTimeToNextRegen() {
    if (this.energy >= ENERGY_CONFIG.maxEnergy) return null;
    
    const now = Date.now();
    const elapsed = now - this.lastUpdateTime;
    const msPerRegen = ENERGY_CONFIG.regenMinutes * 60 * 1000;
    const msToNext = msPerRegen - (elapsed % msPerRegen);
    
    const minutes = Math.floor(msToNext / 60000);
    const seconds = Math.floor((msToNext % 60000) / 1000);
    
    return { minutes, seconds, total: msToNext };
  }
  
  updateDisplay() {
    const energyEl = document.getElementById('energy-value');
    const energyBar = document.getElementById('energy-bar-fill');
    const timeEl = document.getElementById('energy-time');
    
    if (energyEl) {
      energyEl.textContent = this.energy;
    }
    
    if (energyBar) {
      const percentage = (this.energy / ENERGY_CONFIG.maxEnergy) * 100;
      energyBar.style.width = percentage + '%';
    }
    
    if (timeEl && this.energy < ENERGY_CONFIG.maxEnergy) {
      const time = this.getTimeToNextRegen();
      if (time) {
        timeEl.textContent = `+1 через ${time.minutes}:${time.seconds.toString().padStart(2, '0')}`;
        timeEl.style.display = 'block';
      }
    } else if (timeEl) {
      timeEl.style.display = 'none';
    }
  }
}

// Проверка энергии перед игрой
function checkEnergyBeforeGame(gameName) {
  if (!window.energySystem) return true;
  
  const cost = ENERGY_CONFIG.gameCosts[gameName] || 10;
  
  if (!window.energySystem.canPlay(gameName)) {
    const current = window.energySystem.getEnergy();
    const time = window.energySystem.getTimeToNextRegen();
    
    let msg = `⚡ Недостаточно энергии!\n\n`;
    msg += `У вас: ${current}/${ENERGY_CONFIG.maxEnergy}\n`;
    msg += `Нужно: ${cost}\n\n`;
    
    if (time) {
      msg += `⏰ +1 энергия через ${time.minutes}:${time.seconds.toString().padStart(2, '0')}\n\n`;
    }
    
    msg += `💰 Полное пополнение: ${ENERGY_CONFIG.refillCost} монет`;
    
    if (confirm(msg + '\n\nПополнить энергию?')) {
      if (window.energySystem.refillEnergy()) {
        alert('✅ Энергия пополнена!');
        if (typeof updateCoinsDisplay === 'function') updateCoinsDisplay();
        window.energySystem.updateDisplay();
        return true;
      } else {
        alert('❌ Недостаточно монет!');
        return false;
      }
    }
    return false;
  }
  
  return true;
}

// Списание энергии при старте игры
function consumeEnergyForGame(gameName) {
  if (!window.energySystem) return;
  
  if (window.energySystem.spendEnergy(gameName)) {
    console.log(`⚡ Потрачено ${ENERGY_CONFIG.gameCosts[gameName]} энергии на ${gameName}`);
    window.energySystem.updateDisplay();
  }
}

// Уведомление о пополнении энергии
function showEnergyRefillNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #4CAF50, #45a049);
    color: white;
    padding: 20px 30px;
    border-radius: 16px;
    font-weight: bold;
    font-size: 1.3rem;
    box-shadow: 0 8px 24px rgba(76, 175, 80, 0.5);
    z-index: 10001;
    animation: energyPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  `;
  notification.innerHTML = '⚡ Энергия пополнена!';
  document.body.appendChild(notification);
  
  if (!document.getElementById('energy-pop-anim')) {
    const style = document.createElement('style');
    style.id = 'energy-pop-anim';
    style.textContent = `
      @keyframes energyPop {
        0% { transform: translate(-50%, -50%) scale(0); }
        100% { transform: translate(-50%, -50%) scale(1); }
      }
    `;
    document.head.appendChild(style);
  }
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Глобальная инициализация
if (typeof window !== 'undefined') {
  window.energySystem = new EnergySystem();
  window.ENERGY_CONFIG = ENERGY_CONFIG;
  window.checkEnergyBeforeGame = checkEnergyBeforeGame;
  window.consumeEnergyForGame = consumeEnergyForGame;
  window.showEnergyRefillNotification = showEnergyRefillNotification;
  
  console.log('✅ EnergySystem инициализирован');
  console.log(`⚡ Энергия: ${window.energySystem.energy}/${ENERGY_CONFIG.maxEnergy}`);
}
