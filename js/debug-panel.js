// Debug Panel - встроенная панель отладки
// Для активации нажмите Ctrl+Shift+D или добавьте ?debug=1 к URL

(function() {
  'use strict';

  let debugPanel = null;
  let isVisible = false;
  let updateInterval = null;

  // Проверка активации debug режима
  const urlParams = new URLSearchParams(window.location.search);
  const debugMode = urlParams.get('debug') === '1' || localStorage.getItem('debugMode') === 'true';

  // Создание панели
  function createDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.innerHTML = `
      <style>
        #debug-panel {
          position: fixed;
          bottom: 0;
          right: 0;
          width: 320px;
          max-height: 60vh;
          background: rgba(0, 0, 0, 0.95);
          color: #00ff00;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          padding: 10px;
          border-radius: 8px 0 0 0;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
          z-index: 999999;
          overflow-y: auto;
          transform: translateX(0);
          transition: transform 0.3s ease;
        }

        #debug-panel.hidden {
          transform: translateX(100%);
        }

        #debug-panel::-webkit-scrollbar {
          width: 6px;
        }

        #debug-panel::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        #debug-panel::-webkit-scrollbar-thumb {
          background: #00ff00;
          border-radius: 3px;
        }

        .debug-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 2px solid #00ff00;
        }

        .debug-title {
          font-weight: bold;
          font-size: 14px;
          color: #00ff00;
        }

        .debug-controls {
          display: flex;
          gap: 5px;
        }

        .debug-btn {
          background: #00ff00;
          color: #000;
          border: none;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }

        .debug-btn:hover {
          background: #00cc00;
        }

        .debug-btn:active {
          transform: scale(0.95);
        }

        .debug-section {
          margin-bottom: 12px;
          padding: 8px;
          background: rgba(0, 255, 0, 0.05);
          border-radius: 4px;
          border-left: 3px solid #00ff00;
        }

        .debug-section-title {
          font-weight: bold;
          color: #00ff00;
          margin-bottom: 5px;
          font-size: 12px;
        }

        .debug-row {
          display: flex;
          justify-content: space-between;
          padding: 2px 0;
          font-size: 10px;
        }

        .debug-key {
          color: #999;
        }

        .debug-value {
          color: #00ff00;
          font-weight: bold;
        }

        .debug-toggle {
          position: fixed;
          bottom: 10px;
          right: 10px;
          width: 50px;
          height: 50px;
          background: rgba(0, 255, 0, 0.9);
          color: #000;
          border: none;
          border-radius: 50%;
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
          z-index: 999998;
          box-shadow: 0 4px 15px rgba(0, 255, 0, 0.5);
          transition: all 0.2s;
        }

        .debug-toggle:hover {
          transform: scale(1.1);
          background: rgba(0, 255, 0, 1);
        }

        .debug-toggle:active {
          transform: scale(0.9);
        }

        .debug-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          margin-top: 3px;
          overflow: hidden;
        }

        .debug-bar-fill {
          height: 100%;
          background: #00ff00;
          transition: width 0.3s;
        }

        .debug-warning {
          color: #ff9800;
        }

        .debug-error {
          color: #f44336;
        }

        .debug-success {
          color: #4caf50;
        }

        @media (max-width: 768px) {
          #debug-panel {
            width: 100%;
            max-height: 50vh;
            border-radius: 8px 8px 0 0;
          }
        }
      </style>

      <div class="debug-header">
        <div class="debug-title">🐛 DEBUG</div>
        <div class="debug-controls">
          <button class="debug-btn" onclick="window.debugPanel.refresh()">🔄</button>
          <button class="debug-btn" onclick="window.debugPanel.toggle()">−</button>
        </div>
      </div>

      <div class="debug-section">
        <div class="debug-section-title">⚙️ Система</div>
        <div class="debug-row">
          <span class="debug-key">Страница:</span>
          <span class="debug-value" id="debug-page">-</span>
        </div>
        <div class="debug-row">
          <span class="debug-key">Время:</span>
          <span class="debug-value" id="debug-time">-</span>
        </div>
        <div class="debug-row">
          <span class="debug-key">FPS:</span>
          <span class="debug-value" id="debug-fps">-</span>
        </div>
      </div>

      <div class="debug-section">
        <div class="debug-section-title">💰 Игровые данные</div>
        <div class="debug-row">
          <span class="debug-key">Монеты:</span>
          <span class="debug-value" id="debug-coins">-</span>
        </div>
        <div class="debug-row">
          <span class="debug-key">Уровень:</span>
          <span class="debug-value" id="debug-level">-</span>
        </div>
        <div class="debug-row">
          <span class="debug-key">Всего игр:</span>
          <span class="debug-value" id="debug-games">-</span>
        </div>
      </div>

      <div class="debug-section">
        <div class="debug-section-title">🤖 Робот</div>
        <div class="debug-row">
          <span class="debug-key">Настроение:</span>
          <span class="debug-value" id="debug-mood">-</span>
        </div>
        <div class="debug-bar">
          <div class="debug-bar-fill" id="debug-mood-bar"></div>
        </div>
        <div class="debug-row">
          <span class="debug-key">Энергия:</span>
          <span class="debug-value" id="debug-energy">-</span>
        </div>
        <div class="debug-bar">
          <div class="debug-bar-fill" id="debug-energy-bar"></div>
        </div>
        <div class="debug-row">
          <span class="debug-key">Голод:</span>
          <span class="debug-value" id="debug-hunger">-</span>
        </div>
        <div class="debug-bar">
          <div class="debug-bar-fill" id="debug-hunger-bar"></div>
        </div>
      </div>

      <div class="debug-section">
        <div class="debug-section-title">💾 LocalStorage</div>
        <div class="debug-row">
          <span class="debug-key">Записей:</span>
          <span class="debug-value" id="debug-storage-count">-</span>
        </div>
        <div class="debug-row">
          <span class="debug-key">Размер:</span>
          <span class="debug-value" id="debug-storage-size">-</span>
        </div>
      </div>

      <div class="debug-section">
        <div class="debug-section-title">📊 Производительность</div>
        <div class="debug-row">
          <span class="debug-key">Memory:</span>
          <span class="debug-value" id="debug-memory">-</span>
        </div>
        <div class="debug-row">
          <span class="debug-key">Load Time:</span>
          <span class="debug-value" id="debug-load-time">-</span>
        </div>
      </div>
    `;

    return panel;
  }

  // Создание кнопки переключения
  function createToggleButton() {
    const button = document.createElement('button');
    button.className = 'debug-toggle';
    button.textContent = '🐛';
    button.onclick = () => toggleDebugPanel();
    return button;
  }

  // Переключение видимости панели
  function toggleDebugPanel() {
    isVisible = !isVisible;
    if (debugPanel) {
      debugPanel.classList.toggle('hidden', !isVisible);
    }
  }

  // FPS счетчик
  let fps = 0;
  let frameCount = 0;
  let lastTime = performance.now();

  function calculateFPS() {
    frameCount++;
    const currentTime = performance.now();
    if (currentTime >= lastTime + 1000) {
      fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      frameCount = 0;
      lastTime = currentTime;
    }
    requestAnimationFrame(calculateFPS);
  }

  // Обновление данных панели
  function updateDebugPanel() {
    if (!debugPanel || !isVisible) return;

    // Система
    document.getElementById('debug-page').textContent = document.title || window.location.pathname;
    document.getElementById('debug-time').textContent = new Date().toLocaleTimeString('ru-RU');
    document.getElementById('debug-fps').textContent = fps;

    // Игровые данные
    const coins = localStorage.getItem('neuroCoins') || '0';
    const level = localStorage.getItem('robotLevel') || '1';
    const totalGames = localStorage.getItem('totalGamesPlayed') || '0';
    
    document.getElementById('debug-coins').textContent = coins;
    document.getElementById('debug-level').textContent = level;
    document.getElementById('debug-games').textContent = totalGames;

    // Робот
    const mood = parseInt(localStorage.getItem('robotMood')) || 80;
    const energy = parseInt(localStorage.getItem('robotEnergy')) || 70;
    const hunger = parseInt(localStorage.getItem('robotHunger')) || 60;

    document.getElementById('debug-mood').textContent = mood + '%';
    document.getElementById('debug-mood-bar').style.width = mood + '%';
    
    document.getElementById('debug-energy').textContent = energy + '%';
    document.getElementById('debug-energy-bar').style.width = energy + '%';
    
    document.getElementById('debug-hunger').textContent = hunger + '%';
    document.getElementById('debug-hunger-bar').style.width = hunger + '%';

    // LocalStorage
    const storageCount = localStorage.length;
    let storageSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      storageSize += key.length + (value ? value.length : 0);
    }
    
    document.getElementById('debug-storage-count').textContent = storageCount;
    document.getElementById('debug-storage-size').textContent = (storageSize / 1024).toFixed(2) + ' KB';

    // Производительность
    if (performance.memory) {
      const memory = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
      document.getElementById('debug-memory').textContent = memory + ' MB';
    } else {
      document.getElementById('debug-memory').textContent = 'N/A';
    }

    const loadTime = performance.timing ? 
      (performance.timing.loadEventEnd - performance.timing.navigationStart) : 0;
    document.getElementById('debug-load-time').textContent = loadTime > 0 ? 
      (loadTime / 1000).toFixed(2) + 's' : 'N/A';
  }

  // Инициализация
  function init() {
    if (!debugMode) {
      // Горячая клавиша для активации: Ctrl+Shift+D
      document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
          localStorage.setItem('debugMode', 'true');
          location.reload();
        }
      });
      return;
    }

    // Создание элементов
    debugPanel = createDebugPanel();
    const toggleButton = createToggleButton();

    // Добавление на страницу
    document.body.appendChild(debugPanel);
    document.body.appendChild(toggleButton);

    // Показать панель
    isVisible = true;

    // Запуск FPS счетчика
    calculateFPS();

    // Обновление данных каждую секунду
    updateDebugPanel();
    updateInterval = setInterval(updateDebugPanel, 1000);

    // API для внешнего доступа
    window.debugPanel = {
      toggle: toggleDebugPanel,
      refresh: updateDebugPanel,
      disable: () => {
        localStorage.removeItem('debugMode');
        location.reload();
      },
      log: (message) => {
        console.log('%c[DEBUG]%c ' + message, 'color: #00ff00; font-weight: bold', 'color: inherit');
      }
    };

    console.log('%c🐛 Debug Mode Activated', 'color: #00ff00; font-size: 16px; font-weight: bold');
    console.log('%cДля отключения: window.debugPanel.disable()', 'color: #999');
    console.log('%cГорячие клавиши: Ctrl+Shift+D', 'color: #999');
  }

  // Запуск после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Очистка при выгрузке
  window.addEventListener('beforeunload', () => {
    if (updateInterval) clearInterval(updateInterval);
  });

})();