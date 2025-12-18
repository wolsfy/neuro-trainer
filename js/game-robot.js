/**
 * Компактная версия робота для игр
 * Появляется в углу экрана и реагирует на события
 */

class GameRobot {
  constructor() {
    this.container = null;
    this.robot = null;
    this.bubble = null;
    this.isVisible = false;
    this.hideTimeout = null;
    
    this.reactions = {
      gameStart: ['🎮 Поехали!', '✨ Давай!', '🚀 Вперёд!'],
      correct: ['✅ Да!', '🎉 Отлично!', '⭐ Точно!', '👍 Супер!'],
      wrong: ['😅 Почти!', '💪 Ещё раз!', '❤️ Попробуй!'],
      combo: ['🔥 Комбо!', '⚡ Зажигаешь!', '🚀 Летишь!'],
      levelUp: ['🎆 Новый уровень!', '🏆 Растёшь!', '⬆️ Выше!'],
      newRecord: ['🏅 Рекорд!', '🥇 Невероятно!', '⭐ Легенда!'],
      gameOver: ['😊 Хорошо!', '👏 Молодец!', '🎉 Отлично!'],
      encourage: ['💪 Ты сможешь!', '❤️ Не сдавайся!', '✨ Ещё раз!']
    };
    
    this.init();
  }
  
  init() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: -150px;
      width: 100px;
      height: 100px;
      z-index: 9999;
      transition: right 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      pointer-events: none;
    `;
    
    this.robot = document.createElement('img');
    
    // Определяем путь к изображению
    const isInGamesFolder = window.location.pathname.includes('/games/');
    const basePath = isInGamesFolder ? '../' : '';
    
    const savedClothes = localStorage.getItem('neuroClothes') || 'clothes-none';
    const clothesMap = {
      'clothes-none': 'mascot.png',
      'clothes-tshirt': 'robot-tshirt.png',
      'clothes-hoodie': 'robot-hoodie.png',
      'clothes-jacket': 'robot-jacket.png',
      'clothes-suit': 'robot-suit.png'
    };
    
    this.robot.src = basePath + (clothesMap[savedClothes] || 'mascot.png');
    this.robot.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));
      animation: robotFloat 3s ease-in-out infinite;
    `;
    
    // Добавляем CSS анимацию парения
    if (!document.getElementById('robot-float-style')) {
      const style = document.createElement('style');
      style.id = 'robot-float-style';
      style.textContent = `
        @keyframes robotFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `;
      document.head.appendChild(style);
    }
    
    this.bubble = document.createElement('div');
    this.bubble.style.cssText = `
      position: absolute;
      bottom: 110%;
      right: 0;
      background: white;
      padding: 10px 16px;
      border-radius: 18px;
      border-bottom-right-radius: 3px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      font-size: 1rem;
      font-weight: bold;
      color: #333;
      white-space: nowrap;
      margin-bottom: 8px;
      opacity: 0;
      transform: scale(0.8) translateY(10px);
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      pointer-events: auto;
    `;
    
    this.container.appendChild(this.bubble);
    this.container.appendChild(this.robot);
    document.body.appendChild(this.container);
    
    console.log('🤖 GameRobot инициализирован');
  }
  
  show(message) {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    
    console.log('🤖 Робот говорит:', message);
    
    this.container.style.right = '20px';
    this.isVisible = true;
    
    this.bubble.textContent = message;
    setTimeout(() => {
      this.bubble.style.opacity = '1';
      this.bubble.style.transform = 'scale(1) translateY(0)';
    }, 100);
    
    this.hideTimeout = setTimeout(() => this.hide(), 3000);
  }
  
  hide() {
    this.bubble.style.opacity = '0';
    this.bubble.style.transform = 'scale(0.8) translateY(10px)';
    setTimeout(() => {
      this.container.style.right = '-150px';
      this.isVisible = false;
    }, 300);
  }
  
  getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  // Публичные методы
  onGameStart() {
    this.show(this.getRandom(this.reactions.gameStart));
  }
  
  onCorrect() {
    this.show(this.getRandom(this.reactions.correct));
  }
  
  onWrong() {
    this.show(this.getRandom(this.reactions.wrong));
  }
  
  onCombo(count) {
    this.show(this.getRandom(this.reactions.combo) + ` x${count}`);
  }
  
  onLevelUp() {
    this.show(this.getRandom(this.reactions.levelUp));
  }
  
  onNewRecord() {
    this.show(this.getRandom(this.reactions.newRecord));
  }
  
  onGameOver() {
    this.show(this.getRandom(this.reactions.gameOver));
  }
  
  encourage() {
    this.show(this.getRandom(this.reactions.encourage));
  }
}

// Глобальный экземпляр
if (typeof window !== 'undefined') {
  window.gameRobot = new GameRobot();
  console.log('✅ window.gameRobot готов к использованию');
}
