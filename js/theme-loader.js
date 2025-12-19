/**
 * Универсальная система тем для всех страниц
 * Автоматически загружает и применяет активную тему при загрузке страницы
 */

// Темы оформления (синхронизировано с shop.js)
const themes = [
    {
        id: 'theme-default',
        name: 'Стандарт',
        color: '#2196F3',
        vars: {
            primary: '#2196F3',
            accent: '#FF9800',
            success: '#4CAF50',
            danger: '#F44336',
            text: '#333',
            bg: '#f5f5f5',
            'card-bg': '#fff'
        }
    },
    {
        id: 'theme-hacker',
        name: 'Хакер',
        color: '#000',
        vars: {
            primary: '#00FF00',
            accent: '#39FF14',
            success: '#00FF00',
            danger: '#FF0040',
            text: '#00FF00',
            bg: '#0a0a0a',
            'card-bg': '#1a1a1a'
        }
    },
    {
        id: 'theme-unicorn',
        name: 'Единорог',
        color: '#E1BEE7',
        vars: {
            primary: '#9C27B0',
            accent: '#E91E63',
            success: '#4CAF50',
            danger: '#F44336',
            text: '#4A148C',
            bg: '#F3E5F5',
            'card-bg': '#fff'
        }
    },
    {
        id: 'theme-space',
        name: 'Космос',
        color: '#1A237E',
        vars: {
            primary: '#3F51B5',
            accent: '#FF4081',
            success: '#00BCD4',
            danger: '#F44336',
            text: '#E8EAF6',
            bg: '#1A237E',
            'card-bg': '#283593'
        }
    }
];

/**
 * Получить текущую активную тему
 */
function getActiveTheme() {
    const activeThemeId = localStorage.getItem('neuroTheme') || '';
    
    // Если тема не установлена или пустая строка - используем стандартную
    if (!activeThemeId || activeThemeId === 'theme-default') {
        return themes[0]; // Стандарт
    }
    
    return themes.find(t => t.id === activeThemeId) || themes[0];
}

/**
 * Применить тему к странице
 */
function applyTheme(theme) {
    const root = document.documentElement;
    
    // Применяем CSS переменные
    for (const [key, value] of Object.entries(theme.vars)) {
        root.style.setProperty(`--${key}`, value);
    }
    
    // Добавляем класс темы на body (для совместимости с shop.js)
    document.body.classList.remove('theme-default', 'theme-hacker', 'theme-unicorn', 'theme-space');
    if (theme.id && theme.id !== 'theme-default') {
        document.body.classList.add(theme.id);
    }
    
    console.log(`🎨 Тема применена: ${theme.name}`);
}

/**
 * Инициализация темы при загрузке страницы
 */
function initTheme() {
    const theme = getActiveTheme();
    applyTheme(theme);
}

// Автоматическая инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}

// Экспортируем для использования в других скриптах
window.themeSystem = {
    themes,
    getActiveTheme,
    applyTheme,
    initTheme
};
