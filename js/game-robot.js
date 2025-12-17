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
      bottom: 80px;
      right: -120px;
      width: 80px;
      height: 80px;
      z-index: 999;
      transition: right 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;
    
    this.robot = document.createElement('img');
    const savedClothes = localStorage.getItem('neuroClothes') || 'clothes-none';
    const clothesMap = {
      'clothes-none': 'mascot.png',
      'clothes-tshirt': 'robot-tshirt.png',
      'clothes-hoodie': 'robot-hoodie.png',
      'clothes-jacket': 'robot-jacket.png',
      'clothes-suit': 'robot-suit.png'
    };
    this.robot.src = '../' + (clothesMap[savedClothes] || 'mascot.png');
    this.robot.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
    `;
    
    this.bubble = document.createElement('div');
    this.bubble.style.cssText = `
      position: absolute;
      bottom: 100%;
      right: 0;
      background: white;
      padding: 8px 15px;
      border-radius: 15px;
      border-bottom-right-radius: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-size: 0.9rem;
      font-weight: bold;
      color: #333;
      white-space: nowrap;
      margin-bottom: 5px;
      opacity: 0;
      transition: all 0.3s;
    `;
    
    this.container.appendChild(this.bubble);
    this.container.appendChild(this.robot);
    document.body.appendChild(this.container);
  }
  
  show(message) {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.container.style.right = '20px';
    this.bubble.textContent = message;
    setTimeout(() => this.bubble.style.opacity = '1', 100);
    this.hideTimeout = setTimeout(() => this.hide(), 3000);
  }
  
  hide() {
    this.bubble.style.opacity = '0';
    setTimeout(() => this.container.style.right = '-120px', 300);
  }
  
  onGameStart() {
    const msg = this.reactions.gameStart[Math.floor(Math.random() * this.reactions.gameStart.length)];
    this.show(msg);
  }
  
  onCorrect() {
    const msg = this.reactions.correct[Math.floor(Math.random() * this.reactions.correct.length)];
    this.show(msg);
  }
  
  onWrong() {
    const msg = this.reactions.wrong[Math.floor(Math.random() * this.reactions.wrong.length)];
    this.show(msg);
  }
  
  onCombo(count) {
    const msg = this.reactions.combo[Math.floor(Math.random() * this.reactions.combo.length)];
    this.show(msg + ` x${count}`);
  }
  
  onLevelUp() {
    const msg = this.reactions.levelUp[Math.floor(Math.random() * this.reactions.levelUp.length)];
    this.show(msg);
  }
  
  onNewRecord() {
    const msg = this.reactions.newRecord[Math.floor(Math.random() * this.reactions.newRecord.length)];
    this.show(msg);
  }
  
  onGameOver() {
    const msg = this.reactions.gameOver[Math.floor(Math.random() * this.reactions.gameOver.length)];
    this.show(msg);
  }
  
  encourage() {
    const msg = this.reactions.encourage[Math.floor(Math.random() * this.reactions.encourage.length)];
    this.show(msg);
  }
}

if (typeof window !== 'undefined') {
  window.gameRobot = new GameRobot();
}
