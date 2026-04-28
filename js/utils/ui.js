/**
 * UI utility functions
 */
const UIUtils = {
    paletteMap: {
        custom: null,
        ocean: '#007AFF',
        forest: '#2D8A4E',
        sunset: '#E76F51',
        slate: '#4F5D75'
    },

    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    confirm(message) {
        return window.confirm(message);
    },

    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    },

    ensureVisibleOnMobile(element) {
        if (!element || window.innerWidth > 767) return;
        window.setTimeout(() => {
            element.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 150);
    },

    bindHorizontalSwipe(element, { onSwipeLeft, onSwipeRight, threshold = 60 }) {
        let startX = 0;
        let startY = 0;

        element.addEventListener('touchstart', (event) => {
            const target = event.target;
            if (target.closest('input, textarea, select, button, .modal-content')) return;
            startX = event.changedTouches[0].clientX;
            startY = event.changedTouches[0].clientY;
        }, { passive: true });

        element.addEventListener('touchend', (event) => {
            if (!startX && !startY) return;
            const endX = event.changedTouches[0].clientX;
            const endY = event.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;

            startX = 0;
            startY = 0;

            if (Math.abs(deltaX) < threshold || Math.abs(deltaY) > 50) return;

            if (deltaX < 0 && onSwipeLeft) {
                onSwipeLeft();
            } else if (deltaX > 0 && onSwipeRight) {
                onSwipeRight();
            }
        }, { passive: true });
    },

    formatDateDisplay(dateStr, format = 'full') {
        const date = DateUtils.parseDate(dateStr);

        if (format === 'full') {
            return date.toLocaleDateString('it-IT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }

        if (format === 'short') {
            return date.toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'short'
            });
        }

        return date.toLocaleDateString('it-IT');
    },

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    },

    applyFont(font) {
        document.body.setAttribute('data-font', font);
    },

    applyPrimaryColor(color) {
        document.documentElement.style.setProperty('--primary-color', color);
    },

    applyDensity(density) {
        document.documentElement.setAttribute('data-density', density || 'cozy');
    },

    applyMinimalMode(enabled) {
        document.documentElement.setAttribute('data-minimal', enabled ? 'true' : 'false');
    },

    applyPalette(palette) {
        document.documentElement.setAttribute('data-palette', palette || 'custom');
    },

    getPaletteColor(palette) {
        return this.paletteMap[palette] || null;
    },

    generateTimeSlots(startHour, endHour, interval) {
        const slots = [];
        const totalMinutes = (endHour - startHour) * 60;

        for (let i = 0; i <= totalMinutes; i += interval) {
            const hour = startHour + Math.floor(i / 60);
            const minute = i % 60;
            slots.push(DateUtils.formatTime(hour, minute));
        }

        return slots;
    },

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    normalizeSearchText(text) {
        return (text || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    },

    highlightMatch(text, query) {
        const safeText = this.escapeHTML(text || '');
        const safeQuery = query?.trim();
        if (!safeQuery) return safeText;

        const escapedQuery = safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'ig');
        return safeText.replace(regex, '<mark>$1</mark>');
    }
};
