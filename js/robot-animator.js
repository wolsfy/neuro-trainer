/**
 * Система анимации робота-талисмана
 * Используется в комнате и на главной странице
 */

class RobotAnimator {
  constructor(robotElement, bubbleElement) {
    this.robot = robotElement;
    this.bubble = bubbleElement;
    this.currentEmotion = 'idle';
    this.isAnimating = false;
    
    this.emotions = {
      idle: {
        phrases: ['👋 Привет!', '🤖 Я тут!', '✨ Давай поиграем!'],
        animation: 'bounce',
        sound: 'happy'
      },
      happy: {
        phrases: ['🎉 Отлично!', '⭐ Ты молодец!', '🏆 Упех!', '🚀 Продолжай!'],
        animation: 'jump',
        sound: 'success'
      },
      excited: {
        phrases: ['🤩 Вау!', '💥 Невероятно!', '🌟 Потрясающе!', '🔥 Ты супер!'],
        animation: 'shake',
        sound: 'wow'
      },
      thinking: {
        phrases: ['🤔 Хмм...', '💡 Думаю...', '❓ Интересно!'],
        animation: 'tilt',
        sound: 'thinking'
      },
      encourage: {
        phrases: ['💪 Попробуй ещё!', '🎯 Почти!', '❤️ Не сдавайся!', '✨ У тебя получится!'],
        animation: 'wave',
        sound: 'encourage'
      },
      proud: {
        phrases: ['🏅 Горжусь тобой!', '⭐ Новый рекорд!', '🎖️ Легенда!'],
        animation: 'wiggle',
        sound: 'proud'
      }
    };
    
    this.init();
  }
  
  init() {
    // Периодические случайные фразы
    setInterval(() => {
      if (!this.isAnimating) {
        this.showEmotion('idle');
      }
    }, 10000);
    
    // Клик по роботу
    if (this.robot) {
      this.robot.addEventListener('click', () => {
        this.onRobotClick();
      });
    }
  }
  
  showEmotion(emotion) {
    if (!this.emotions[emotion]) emotion = 'idle';
    
    this.isAnimating = true;
    this.currentEmotion = emotion;
    
    const emotionData = this.emotions[emotion];
    const phrase = emotionData.phrases[Math.floor(Math.random() * emotionData.phrases.length)];
    
    // Показываем облачко
    if (this.bubble) {
      this.bubble.textContent = phrase;
      this.bubble.style.animation = 'none';
      setTimeout(() => {
        this.bubble.style.animation = 'popIn 0.5s forwards';
      }, 10);
    }
    
    // Анимируем робота
    this.playAnimation(emotionData.animation);
    
    // Звук
    this.playSound(emotionData.sound);
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 2000);
  }
  
  playAnimation(animationType) {
    if (!this.robot) return;
    
    // Удаляем старые классы
    this.robot.className = this.robot.className.replace(/robot-anim-\w+/g, '').trim();
    
    // Добавляем новую анимацию
    this.robot.classList.add(`robot-anim-${animationType}`);
    
    // Убираем класс после анимации
    setTimeout(() => {
      this.robot.classList.remove(`robot-anim-${animationType}`);
    }, 1000);
  }
  
  playSound(soundType) {
    if (typeof window.AudioContext === 'undefined') return;
    
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    switch(soundType) {
      case 'happy':
      case 'success':
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
        break;
      
      case 'wow':
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
        break;
      
      case 'thinking':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
        break;
      
      case 'encourage':
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.setValueAtTime(700, audioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
        break;
      
      case 'proud':
        osc.frequency.setValueAtTime(700, audioCtx.currentTime);
        osc.frequency.setValueAtTime(900, audioCtx.currentTime + 0.08);
        osc.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.16);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
        break;
    }
  }
  
  onRobotClick() {
    const emotions = ['happy', 'excited', 'thinking'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    this.showEmotion(randomEmotion);
    
    // Конфетти
    if (typeof confetti !== 'undefined') {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }
  
  // Публичные методы для игр
  celebrate() {
    this.showEmotion('excited');
  }
  
  encourageUser() {
    this.showEmotion('encourage');
  }
  
  showProud() {
    this.showEmotion('proud');
  }
  
  greet() {
    this.showEmotion('idle');
  }
}

// Глобальный экземпляр
window.RobotAnimator = RobotAnimator;
