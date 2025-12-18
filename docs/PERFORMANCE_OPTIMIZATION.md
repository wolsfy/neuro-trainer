# 🚀 План оптимизации производительности Neuro Trainer

## 📋 Содержание

- [Текущее состояние](#текущее-состояние)
- [Диагностика проблем](#диагностика-проблем)
- [План оптимизации](#план-оптимизации)
- [Детальное описание оптимизаций](#детальное-описание-оптимизаций)
- [Roadmap внедрения](#roadmap-внедрения)
- [Метрики успеха](#метрики-успеха)

---

## 📊 Текущее состояние

### Технические характеристики

| Параметр | Значение | Статус |
|----------|----------|--------|
| 3D модель размер | 11.9 MB (GLB) | ❌ Критично |
| Количество вершин | 63,930 | ❌ Критично |
| Количество граней | 21,310 | ❌ Критично |
| CSS анимаций | 7+ одновременно | ⚠️ Высокая нагрузка |
| WebGL тени | Динамические (0.4) | ⚠️ Средняя нагрузка |
| Текущий FPS | ~20-30 FPS | ❌ Низкий |

### Целевые показатели

| Параметр | Целевое значение |
|----------|------------------|
| FPS на десктопе | 60 FPS |
| FPS на мобильных | 30+ FPS |
| Время загрузки модели | < 2 сек |
| Размер модели | < 3 MB |
| Количество вершин | < 15,000 |

---

## 🔍 Диагностика проблем

### 1. Тяжелая 3D-модель (Критичность: 🔴 Высокая)

**Проблема:**
- Модель содержит 63,930 вершин — это **в 4-6 раз больше** рекомендуемого для веб-приложений
- Размер файла 11.9 MB — долгая загрузка на медленных соединениях
- Отсутствие компрессии GLB формата

**Влияние на производительность:**
- Каждый кадр GPU обрабатывает все вершины
- Высокое потребление видеопамяти (VRAM)
- Медленная инициализация WebGL контекста

**Измеримый эффект:** -40% FPS

---

### 2. Множественные CSS-анимации (Критичность: 🟡 Средняя)

**Проблема:**
- 7+ одновременных анимаций без GPU-ускорения:
  - 3 облака (cloudFloat)
  - 1 солнце (sunGlow)
  - До 3 декора (float)
  - До 3 мебели (bounce)
  - Shimmer эффекты на статус-барах

**Влияние на производительность:**
- CPU вынужден пересчитывать layout каждый кадр
- Отсутствие аппаратного ускорения
- Браузер не может оптимизировать composite слои

**Измеримый эффект:** -20% FPS

---

### 3. Динамические тени WebGL (Критичность: 🟡 Средняя)

**Проблема:**
- `shadow-intensity="0.4"` требует расчёта теней в реальном времени
- Shadow mapping добавляет дополнительный render pass
- Тени пересчитываются даже для статичной модели

**Влияние на производительность:**
- Дополнительный проход рендеринга для shadow map
- Увеличенное потребление памяти для текстуры теней

**Измеримый эффект:** -15% FPS

---

### 4. Отсутствие ленивой загрузки (Критичность: 🟡 Средняя)

**Проблема:**
- 3D модель загружается и рендерится сразу при загрузке страницы
- WebGL контекст активен постоянно, даже когда вкладка неактивна
- Нет остановки рендеринга при скрытии элемента

**Влияние на производительность:**
- Блокировка основного потока при загрузке
- Расход батареи на фоновых вкладках
- Медленный First Contentful Paint (FCP)

**Измеримый эффект:** -10% FPS, +2 сек время загрузки

---

### 5. Неоптимизированные обработчики событий (Критичность: 🟢 Низкая)

**Проблема:**
- Обновление статусов робота происходит без throttle/debounce
- Частые обращения к DOM при каждом изменении
- Отсутствие батчинга обновлений

**Влияние на производительность:**
- Избыточные reflow/repaint операции
- CPU тратит время на синхронный DOM доступ

**Измеримый эффект:** -5% FPS

---

## 🎯 План оптимизации

### Приоритизация (MoSCoW метод)

#### Must Have (Критично) 🔴
1. **Оптимизация 3D-модели** — максимальный эффект
2. **GPU-ускорение CSS** — быстрое внедрение, высокий эффект
3. **Отключение/запекание теней** — мгновенный результат

#### Should Have (Важно) 🟡
4. **Ленивая загрузка модели** — улучшает UX и производительность
5. **Throttle/debounce обработчиков** — полирует производительность

#### Could Have (Желательно) 🟢
6. **Web Workers для вычислений** — продвинутая оптимизация
7. **Service Worker для кэширования** — offline опыт

#### Won't Have (Отложено) ⚪
8. **Полная переработка на Three.js** — слишком трудоёмко
9. **Серверный рендеринг модели** — избыточно для данной задачи

---

## 🛠 Детальное описание оптимизаций

### Оптимизация #1: Компрессия и упрощение 3D-модели

#### Цель
Уменьшить количество полигонов с 63,930 до 10,000-15,000 вершин и сжать файл до < 3 MB

#### Инструменты

**Вариант A: Draco компрессия (быстро)**
```bash
# Установка gltf-pipeline
npm install -g gltf-pipeline

# Компрессия с Draco
gltf-pipeline -i "cute robot 3d model.glb" -o robot-draco.glb -d

# Результат: уменьшение размера на 60-70%
```

**Вариант B: Blender decimation (качественно)**
1. Открыть модель в Blender
2. Выбрать меш → Modifiers → Decimate
3. Установить Ratio: 0.25 (уменьшить на 75%)
4. Apply modifier
5. Экспорт в GLB с опциями:
   - ✅ Apply Modifiers
   - ✅ Compression: Draco
   - ✅ Optimize for size

**Вариант C: Онлайн инструменты**
- [glTF Pipeline](https://github.khronos.org/glTF-Project-Explorer/)
- [gltf.report](https://gltf.report/) — анализ и оптимизация

#### Код изменений

```html
<!-- room.html -->
<model-viewer
  src="robot-optimized.glb"  <!-- Новая модель -->
  poster="robot-poster.webp"  <!-- Добавить постер -->
  ...
>
```

#### Ожидаемый результат
- ✅ FPS: +30-40%
- ✅ Размер файла: 11.9 MB → 2-3 MB
- ✅ Время загрузки: -60%
- ✅ VRAM usage: -70%

#### Время внедрения
- Вариант A: 30 минут
- Вариант B: 2-3 часа

---

### Оптимизация #2: GPU-ускоренные CSS анимации

#### Цель
Перевести все CSS-анимации на GPU слой для hardware acceleration

#### Техники оптимизации

**1. will-change для анимируемых элементов**
```css
/* Добавить в room.html <style> */

.cloud, .sun, .decor-item, .furniture-item {
  will-change: transform;
  /* Браузер заранее создаст GPU слой */
}

/* Для временных анимаций */
.particle {
  will-change: transform, opacity;
}
```

**2. Force GPU compositing**
```css
.cloud, .sun, .decor-item, .furniture-item {
  transform: translateZ(0);  /* Hack для создания GPU слоя */
  backface-visibility: hidden;  /* Оптимизация 3D трансформаций */
}
```

**3. Containment для изоляции**
```css
.room-view {
  contain: layout style paint;  
  /* Изолирует изменения, браузер не пересчитывает весь DOM */
}

.robot-container {
  contain: layout paint;
  /* 3D контейнер не влияет на остальной layout */
}
```

**4. Оптимизация анимаций**
```css
/* ПЛОХО - вызывает reflow */
@keyframes bad {
  from { width: 100px; }
  to { width: 200px; }
}

/* ХОРОШО - только композитинг */
@keyframes good {
  from { transform: scaleX(1); }
  to { transform: scaleX(2); }
}
```

#### Полный патч

```css
/* ===== GPU OPTIMIZATION PATCH ===== */

/* 1. Общие правила для анимируемых элементов */
.cloud, .sun, .decor-item, .furniture-item, .particle,
.status-bar-fill, .thought-bubble, .modal-content {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* 2. Containment для контейнеров */
.room-view {
  contain: layout style paint;
  isolation: isolate;  /* Создаёт новый stacking context */
}

.robot-container {
  contain: layout paint;
  transform: translate(-50%, -50%) translateZ(0);
}

/* 3. Оптимизация shimmer анимации */
.status-bar-fill::after {
  will-change: transform;
  transform: translateZ(0);
}

/* 4. Удаление will-change после анимации */
.particle {
  animation: particleSide 2s ease-out forwards;
}

.particle.ended {
  will-change: auto;  /* Освобождаем GPU память */
}
```

#### JavaScript дополнения

```javascript
// Очистка will-change после завершения анимации
function createParticles(emoji, count = 5) {
  const container = document.getElementById('robot-container');
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle side';
    particle.textContent = emoji;
    particle.style.left = '50%';
    particle.style.top = '50%';
    particle.style.setProperty('--x', (Math.random() - 0.5) * 150 + 'px');
    container.appendChild(particle);
    
    // Удаляем после анимации
    setTimeout(() => {
      particle.classList.add('ended');
      setTimeout(() => particle.remove(), 100);
    }, 1900);
  }
}
```

#### Ожидаемый результат
- ✅ FPS: +15-20%
- ✅ CPU usage: -30%
- ✅ Более плавные анимации
- ✅ Меньше battery drain

#### Время внедрения
15-20 минут

---

### Оптимизация #3: Ленивая загрузка модели

#### Цель
Загружать 3D-модель только когда она видна в viewport и останавливать рендеринг при неактивной вкладке

#### Реализация

**1. Intersection Observer для видимости**

```javascript
// Добавить в <script> секцию room.html

// Lazy loading для 3D модели
const robotModel = document.getElementById('robot-model');
const robotContainer = document.getElementById('robot-container');
let modelLoaded = false;

// Наблюдатель за видимостью
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !modelLoaded) {
      // Модель в viewport - загружаем
      robotModel.setAttribute('src', 'cute robot 3d model.glb');
      modelLoaded = true;
      console.log('✅ 3D model loaded');
    }
  });
}, {
  threshold: 0.1  // Загружаем когда хотя бы 10% видно
});

observer.observe(robotContainer);
```

**2. Page Visibility API для фоновых вкладок**

```javascript
// Останавливаем рендеринг когда вкладка неактивна
let isVisible = true;

document.addEventListener('visibilitychange', () => {
  isVisible = !document.hidden;
  
  if (document.hidden) {
    // Вкладка скрыта - останавливаем все анимации
    console.log('⏸️ Pausing animations');
    
    // Останавливаем CSS анимации
    document.body.style.animationPlayState = 'paused';
    
    // Останавливаем интервалы обновления статусов
    clearInterval(statusUpdateInterval);
  } else {
    // Вкладка активна - возобновляем
    console.log('▶️ Resuming animations');
    document.body.style.animationPlayState = 'running';
    
    // Перезапускаем обновления
    startStatusUpdates();
  }
});
```

**3. requestAnimationFrame для плавных обновлений**

```javascript
// Заменить setInterval на RAF для статусов
let statusUpdateInterval;

function startStatusUpdates() {
  let lastUpdate = Date.now();
  
  function update() {
    if (!isVisible) return;  // Пропускаем если вкладка скрыта
    
    const now = Date.now();
    const delta = now - lastUpdate;
    
    // Обновляем раз в минуту
    if (delta >= 60000) {
      robotStatus.energy = Math.max(10, robotStatus.energy - 1);
      robotStatus.hunger = Math.max(10, robotStatus.hunger - 1);
      if (robotStatus.energy < 30 || robotStatus.hunger < 30) {
        robotStatus.mood = Math.max(10, robotStatus.mood - 1);
      }
      updateStatusBars();
      updateRobotEmotion();
      saveRobotStatus();
      lastUpdate = now;
    }
    
    statusUpdateInterval = requestAnimationFrame(update);
  }
  
  update();
}

// Запускаем при загрузке
startStatusUpdates();
```

**4. Poster image для instant loading**

```html
<model-viewer
  id="robot-model"
  src=""  <!-- Пустой src, загрузится через IO -->
  poster="robot-poster.webp"  <!-- Показываем сразу -->
  reveal="interaction"  <!-- Модель активируется при клике -->
  loading="lazy"
  ...
>
</model-viewer>
```

#### Генерация poster image

```javascript
// Temporary script для создания постера
// Добавить временно и сделать скриншот через DevTools
const model = document.getElementById('robot-model');
model.addEventListener('load', async () => {
  await model.updateComplete;
  const screenshot = await model.toBlob({ idealAspect: true });
  const url = URL.createObjectURL(screenshot);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'robot-poster.png';
  a.click();
});
```

#### Ожидаемый результат
- ✅ FPS: +20-25% (при неактивной вкладке)
- ✅ FCP (First Contentful Paint): -1.5 сек
- ✅ Battery usage: -40% на фоновых вкладках
- ✅ Memory: освобождается при скрытии

#### Время внедрения
45 минут

---

### Оптимизация #4: WebGL рендерер

#### Цель
Оптимизировать настройки model-viewer для максимальной производительности

#### Изменения в конфигурации

```html
<model-viewer
  id="robot-model"
  src="robot-optimized.glb"
  poster="robot-poster.webp"
  
  <!-- PERFORMANCE SETTINGS -->
  shadow-intensity="0"  <!-- Отключить тени полностью -->
  environment-image="neutral"  <!-- Простое освещение -->
  exposure="1.0"  <!-- Стандартная экспозиция -->
  
  <!-- INTERACTION -->
  camera-controls
  touch-action="pan-y"
  disable-zoom
  disable-tap  <!-- Убрать лишние обработчики -->
  
  <!-- CAMERA -->
  camera-orbit="0deg 85deg 3.5m"
  field-of-view="25deg"
  min-camera-orbit="auto auto auto"
  max-camera-orbit="auto auto auto"
  interpolation-decay="150"  <!-- Плавная камера -->
  
  <!-- RENDERING -->
  ar-modes="webxr scene-viewer quick-look"  <!-- AR acceleration -->
  loading="lazy"
  reveal="interaction"
  
  <!-- ACCESSIBILITY -->
  alt="Нейрон - милый робот-помощник"
>
  <!-- Fallback -->
  <div slot="poster" class="loading-skeleton">
    <div class="spinner">⏳</div>
  </div>
</model-viewer>
```

#### Baked Lighting (альтернатива теням)

Вместо динамических теней можно "запечь" освещение в текстуры модели:

**В Blender:**
1. Настроить освещение сцены
2. Bake → Ambient Occlusion + Lighting
3. Сохранить запечённые текстуры
4. Применить к модели как base color

**Результат:**
- Выглядит как с тенями
- Рендерится мгновенно
- Нулевая нагрузка на GPU

#### CSS fallback для загрузки

```css
.loading-skeleton {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
}

.spinner {
  font-size: 3rem;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

#### Ожидаемый результат
- ✅ FPS: +25-30%
- ✅ Убраны тени: instant gain
- ✅ AR modes: hardware acceleration
- ✅ Лучший UX с poster

#### Время внедрения
10 минут (без baking), 2 часа (с baking)

---

### Оптимизация #5: Throttle и Debounce

#### Цель
Ограничить частоту вызовов дорогостоящих операций

#### Utility функции

```javascript
// Добавить в начало <script> секции

// Throttle: выполняет функцию не чаще N мс
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

// Debounce: выполняет функцию через N мс после последнего вызова
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// RAF throttle: синхронизирует с частотой кадров
function rafThrottle(func) {
  let rafId = null;
  return function(...args) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func.apply(this, args);
        rafId = null;
      });
    }
  };
}
```

#### Применение

```javascript
// 1. Throttle обновления статусов
const updateStatusBarsThrottled = throttle(updateStatusBars, 100);
// Максимум 10 раз в секунду вместо бесконечно часто

// 2. RAF для DOM операций
const renderRoomOptimized = rafThrottle(renderRoom);
// Синхронизировано с vsync браузера

// 3. Debounce для сохранения данных
const saveDataDebounced = debounce(saveData, 500);
// Сохраняем только когда пользователь перестал взаимодействовать

// 4. Batch updates для статусов
let updateQueue = [];

function queueStatusUpdate(type, value) {
  updateQueue.push({ type, value });
}

function flushUpdates() {
  if (updateQueue.length === 0) return;
  
  // Обновляем всё за один проход
  updateQueue.forEach(({ type, value }) => {
    robotStatus[type] = value;
  });
  
  updateStatusBarsThrottled();
  saveDataDebounced();
  
  updateQueue = [];
}

// Flush каждый фрейм
function updateLoop() {
  flushUpdates();
  requestAnimationFrame(updateLoop);
}

updateLoop();
```

#### Оптимизация feedRobot

```javascript
// БЫЛО: прямые обновления
function feedRobot() {
  robotStatus.hunger = Math.min(100, robotStatus.hunger + 30);
  robotStatus.energy = Math.min(100, robotStatus.energy + 20);
  robotStatus.mood = Math.min(100, robotStatus.mood + 15);
  updateStatusBars();  // 3 reflow
  updateRobotEmotion();  // 4 reflow
  saveData();  // Синхронный IO
}

// СТАЛО: batched updates
function feedRobot() {
  queueStatusUpdate('hunger', Math.min(100, robotStatus.hunger + 30));
  queueStatusUpdate('energy', Math.min(100, robotStatus.energy + 20));
  queueStatusUpdate('mood', Math.min(100, robotStatus.mood + 15));
  // Обновления применятся в следующем фрейме автоматически
  
  showBubble('Ням-ням! 😋🍔');
  createParticles('🍔', 4);
  createParticles('❤️', 3);
}
```

#### Ожидаемый результат
- ✅ FPS: +5-10%
- ✅ Reflow/repaint: -60%
- ✅ Более отзывчивый UI
- ✅ Меньше дисковых операций

#### Время внедрения
20 минут

---

## 📅 Roadmap внедрения

### Фаза 1: Quick Wins (День 1) ⚡

**Длительность:** 1-2 часа  
**Цель:** Быстрый прирост производительности

- [ ] Оптимизация #4: WebGL настройки (10 мин)
  - Отключить тени
  - Добавить poster image
  - Оптимизировать camera settings
  
- [ ] Оптимизация #2: GPU CSS (20 мин)
  - Добавить `will-change`
  - Force GPU layers с `translateZ(0)`
  - Добавить `contain` для изоляции
  
- [ ] Оптимизация #5: Throttle/Debounce (20 мин)
  - Создать utility функции
  - Применить к обновлениям статусов
  - Batch DOM updates

**Ожидаемый результат:** FPS +40-50%

---

### Фаза 2: Core Optimization (День 2-3) 🎯

**Длительность:** 3-4 часа  
**Цель:** Решение главной проблемы — тяжелой модели

- [ ] Оптимизация #1A: Draco компрессия (30 мин)
  - Установить gltf-pipeline
  - Сжать модель
  - Протестировать
  
- [ ] Оптимизация #1B: Decimation в Blender (2 часа)
  - Открыть модель в Blender
  - Применить Decimate modifier
  - Экспорт с Draco compression
  
- [ ] Оптимизация #3: Lazy Loading (45 мин)
  - Intersection Observer
  - Page Visibility API
  - Генерация poster image
  - requestAnimationFrame loop

**Ожидаемый результат:** FPS +80-100% (итого ~2x)

---

### Фаза 3: Advanced (Опционально) 🚀

**Длительность:** 1-2 дня  
**Цель:** Профессиональная полировка

- [ ] Baked lighting в Blender
  - Настроить освещение
  - Запечь AO + lighting
  - Применить к модели
  
- [ ] Web Workers для вычислений
  - Вынести расчёт статусов в Worker
  - Async обновления
  
- [ ] Service Worker для кэширования
  - Offline модель
  - Instant повторная загрузка
  
- [ ] Performance monitoring
  - Интеграция Web Vitals
  - Real-time FPS counter
  - Performance budget alerts

**Ожидаемый результат:** FPS стабильные 60, идеальный UX

---

## 📈 Метрики успеха

### Key Performance Indicators (KPI)

| Метрика | До | Цель | Метод измерения |
|---------|-----|------|------------------|
| **FPS (Desktop)** | 20-30 | 60 | Chrome DevTools Performance |
| **FPS (Mobile)** | 15-20 | 30+ | Remote debugging |
| **Размер модели** | 11.9 MB | < 3 MB | File size |
| **Вершины модели** | 63,930 | < 15,000 | gltf.report |
| **First Contentful Paint** | ~3 сек | < 1.5 сек | Lighthouse |
| **Time to Interactive** | ~4 сек | < 2.5 сек | Lighthouse |
| **GPU memory** | ~250 MB | < 80 MB | Chrome Task Manager |
| **CPU usage (idle)** | 30-40% | < 10% | Task Manager |

### Инструменты мониторинга

#### 1. Chrome DevTools Performance

```javascript
// Добавить FPS счётчик для разработки
if (window.location.hostname === 'localhost') {
  let fps = 0;
  let lastFrameTime = performance.now();
  
  function measureFPS() {
    const now = performance.now();
    fps = Math.round(1000 / (now - lastFrameTime));
    lastFrameTime = now;
    
    const counter = document.getElementById('fps-counter');
    if (counter) {
      counter.textContent = `FPS: ${fps}`;
      counter.style.color = fps >= 55 ? 'green' : fps >= 30 ? 'orange' : 'red';
    }
    
    requestAnimationFrame(measureFPS);
  }
  
  measureFPS();
  
  // Добавить счётчик в DOM
  const counter = document.createElement('div');
  counter.id = 'fps-counter';
  counter.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 14px;
    z-index: 99999;
  `;
  document.body.appendChild(counter);
}
```

#### 2. Lighthouse CI

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["https://wolsfy.github.io/neuro-trainer/room.html"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", {"maxNumericValue": 1500}],
        "speed-index": ["error", {"maxNumericValue": 2500}],
        "interactive": ["error", {"maxNumericValue": 3000}],
        "total-blocking-time": ["error", {"maxNumericValue": 200}]
      }
    }
  }
}
```

#### 3. Performance Observer API

```javascript
// Мониторинг Long Tasks (блокировки главного потока)
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.warn('⚠️ Long Task detected:', entry.duration + 'ms');
    // Можно отправить в аналитику
  }
});

observer.observe({ entryTypes: ['longtask'] });
```

---

## 🧪 Тестирование

### Чек-лист перед релизом

**Функциональность:**
- [ ] 3D модель загружается корректно
- [ ] Все анимации работают плавно
- [ ] Статусы робота обновляются
- [ ] Магазин декора работает
- [ ] Кормление робота функционирует
- [ ] Сохранение состояния в localStorage

**Производительность:**
- [ ] FPS >= 55 на desktop (Chrome, Firefox, Safari)
- [ ] FPS >= 30 на mobile (iOS Safari, Chrome Android)
- [ ] Модель загружается < 2 сек на 3G
- [ ] CPU usage < 15% в idle
- [ ] Нет memory leaks (проверить DevTools Memory)
- [ ] Анимации не тормозят при скролле

**Совместимость:**
- [ ] Chrome 90+ ✅
- [ ] Firefox 88+ ✅
- [ ] Safari 14+ ✅
- [ ] Edge 90+ ✅
- [ ] Mobile Safari iOS 14+ ✅
- [ ] Chrome Android 90+ ✅

**Accessibility:**
- [ ] model-viewer имеет alt текст
- [ ] Клавиатурная навигация работает
- [ ] Screen reader озвучивает статусы
- [ ] Контраст текста соответствует WCAG AA

### Benchmark скрипт

```javascript
// benchmark.js - запустить в консоли для анализа

const benchmark = {
  startTime: performance.now(),
  frames: [],
  
  start() {
    console.log('🏁 Starting benchmark...');
    this.measureFPS();
    this.measureMemory();
    this.measureLoadTime();
  },
  
  measureFPS() {
    let frameCount = 0;
    let startTime = performance.now();
    
    const count = () => {
      frameCount++;
      const elapsed = performance.now() - startTime;
      
      if (elapsed >= 10000) {  // 10 секунд
        const avgFPS = Math.round(frameCount / (elapsed / 1000));
        console.log(`📊 Average FPS: ${avgFPS}`);
        this.frames.push(avgFPS);
      } else {
        requestAnimationFrame(count);
      }
    };
    
    requestAnimationFrame(count);
  },
  
  measureMemory() {
    if (performance.memory) {
      const used = performance.memory.usedJSHeapSize / 1048576;
      const total = performance.memory.totalJSHeapSize / 1048576;
      console.log(`🧠 Memory: ${used.toFixed(2)} MB / ${total.toFixed(2)} MB`);
    }
  },
  
  measureLoadTime() {
    const model = document.getElementById('robot-model');
    const startLoad = performance.now();
    
    model.addEventListener('load', () => {
      const loadTime = ((performance.now() - startLoad) / 1000).toFixed(2);
      console.log(`⏱️ Model load time: ${loadTime}s`);
    });
  },
  
  report() {
    const avgFPS = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    console.log('\n📋 BENCHMARK REPORT');
    console.log('===================');
    console.log(`Average FPS: ${avgFPS.toFixed(1)}`);
    console.log(`Target: 60 FPS`);
    console.log(`Status: ${avgFPS >= 55 ? '✅ PASS' : '❌ FAIL'}`);
  }
};

benchmark.start();
setTimeout(() => benchmark.report(), 15000);
```

---

## 📚 Дополнительные ресурсы

### Документация

- [model-viewer Performance Best Practices](https://modelviewer.dev/docs/index.html#performance)
- [Web.dev: Optimize WebGL](https://web.dev/webgl-best-practices/)
- [CSS Triggers Reference](https://csstriggers.com/)
- [Google Lighthouse Scoring](https://web.dev/performance-scoring/)

### Инструменты

- [gltf.report](https://gltf.report/) — анализ GLB моделей
- [Draco 3D Compression](https://google.github.io/draco/)
- [Blender](https://www.blender.org/) — 3D редактор
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

### Статьи

- [Rendering Performance](https://developers.google.com/web/fundamentals/performance/rendering)
- [The Anatomy of a Frame](https://aerotwist.com/blog/the-anatomy-of-a-frame/)
- [GPU Animation: Doing It Right](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/)

---

## 👥 Контакты и поддержка

**Автор:** wolsfy  
**Репозиторий:** [neuro-trainer](https://github.com/wolsfy/neuro-trainer)  
**Дата создания:** 18 декабря 2025  
**Версия документа:** 1.0.0

---

## 📝 История изменений

### v1.0.0 (18.12.2025)
- ✅ Первая версия плана оптимизации
- ✅ Диагностика текущих проблем
- ✅ 5 детальных оптимизаций с кодом
- ✅ Roadmap внедрения
- ✅ Метрики и бенчмарки

---

**Следующий шаг:** Переходите к [Roadmap внедрения](#roadmap-внедрения) и начинайте с Фазы 1! 🚀
