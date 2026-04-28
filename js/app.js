/**
 * Main Application
 */
class CalendarApp {
    constructor() {
        this.container = document.getElementById('app-content');
        this.views = {
            daily: new DailyView(this.container),
            weekly: new WeeklyView(this.container),
            monthly: new MonthlyView(this.container),
            statistics: new StatisticsView(this.container)
        };
        this.currentView = null;
        this.currentDate = null;
        this.reminderInterval = null;
    }

    async init() {
        try {
            await appState.init();

            headerComponent = new HeaderComponent();
            settingsComponent = new SettingsComponent();
            eventModalComponent = new EventModalComponent();
            quickAddComponent = new QuickAddComponent();
            appLockComponent = new AppLockComponent();

            quickAddComponent.init();
            appLockComponent.init();

            if ('serviceWorker' in navigator) {
                try {
                    await navigator.serviceWorker.register('sw.js');
                } catch (error) {
                    console.error('Service Worker registration failed:', error);
                }
            }

            this.subscribeToEvents();
            this.bindMobileEnhancements();
            this.bindLockLifecycle();
            this.startReminderLoop();
            await this.renderCurrentView();
            await appLockComponent.ensureUnlocked();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Errore durante l\'inizializzazione dell\'app');
        }
    }

    subscribeToEvents() {
        eventBus.on(EVENTS.VIEW_CHANGED, () => this.renderCurrentView());
        eventBus.on(EVENTS.DATE_CHANGED, () => this.renderCurrentView());
        eventBus.on(EVENTS.SEARCH_CHANGED, () => this.renderCurrentView(true));

        eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
            const currentView = appState.getCurrentView();
            const shouldRerender = payload?.type === 'import'
                || payload?.type === 'ics-import'
                || currentView === 'monthly'
                || currentView === 'weekly'
                || currentView === 'statistics'
                || !!appState.getSearch().query
                || !!appState.getSearch().date;

            if (shouldRerender) {
                this.renderCurrentView(true);
            }
        });

        eventBus.on(EVENTS.SETTINGS_CHANGED, () => {
            this.startReminderLoop();
            this.renderCurrentView(true);
        });
    }

    bindMobileEnhancements() {
        UIUtils.bindHorizontalSwipe(this.container, {
            onSwipeLeft: () => appState.navigateNext(),
            onSwipeRight: () => appState.navigatePrevious()
        });

        this.container.addEventListener('click', (event) => this.handleContainerClick(event));

        document.addEventListener('focusin', (event) => {
            const target = event.target;
            if (target.matches('input, textarea, select')) {
                UIUtils.ensureVisibleOnMobile(target);
            }
        });
    }

    bindLockLifecycle() {
        let shouldRelock = false;

        document.addEventListener('visibilitychange', () => {
            const settings = appState.getSettings();
            if (!settings || settings.lockMethod === 'none') return;

            if (document.hidden) {
                shouldRelock = true;
                return;
            }

            if (shouldRelock) {
                shouldRelock = false;
                appLockComponent.ensureUnlocked();
            }
        });
    }

    startReminderLoop() {
        window.clearInterval(this.reminderInterval);

        const settings = appState.getSettings();
        if (!('Notification' in window) || !settings.notificationsEnabled || Notification.permission !== 'granted') {
            return;
        }

        this.checkReminders();
        this.reminderInterval = window.setInterval(() => this.checkReminders(), 60000);
    }

    async checkReminders() {
        const settings = appState.getSettings();
        if (!('Notification' in window) || !settings.notificationsEnabled || Notification.permission !== 'granted') return;

        const today = DateUtils.today();
        const events = await dataStore.getEventsByDate(today);
        const now = new Date();

        events
            .filter((event) => event.important && event.time)
            .forEach((event) => {
                const eventDate = DateUtils.combineDateTime(today, event.time);
                if (!eventDate) return;

                const diffMinutes = Math.round((eventDate.getTime() - now.getTime()) / 60000);
                const reminderKey = `reminder:${event.id}:${today}:${event.time}:${settings.reminderMinutes}`;

                if (diffMinutes < 0 || diffMinutes > settings.reminderMinutes) return;
                if (localStorage.getItem(reminderKey)) return;

                new Notification('Promemoria evento', {
                    body: `${event.text} alle ${DateUtils.formatStoredTime(event.time, settings.timeFormat)}`,
                    tag: reminderKey
                });
                localStorage.setItem(reminderKey, 'sent');
            });
    }

    async renderCurrentView(force = false) {
        const viewName = appState.getCurrentView();
        const date = appState.getCurrentDate();

        if (!force && this.currentView === viewName && this.currentDate === date) {
            return;
        }

        this.currentView = viewName;
        this.currentDate = date;
        const view = this.views[viewName];

        try {
            appState.setLoading(true);
            await view.render(date);
            await this.renderSearchResults();
        } catch (error) {
            console.error(`Failed to render ${viewName} view:`, error);
            this.showError(`Errore nel caricamento della vista ${viewName}`);
        } finally {
            appState.setLoading(false);
        }
    }

    async renderSearchResults() {
        const search = appState.getSearch();
        const hasAdvancedFilters = search.type !== 'all' || search.importantOnly || search.todayOnly;
        if (!search.query && !search.date && !hasAdvancedFilters) {
            this.container.querySelector('.search-results-card')?.remove();
            return;
        }

        const results = await dataStore.searchAll(search);
        const total = results.events.length + results.tasks.length + results.notes.length;

        const section = document.createElement('section');
        section.className = 'search-results-card section-card';
        section.setAttribute('aria-live', 'polite');
        section.innerHTML = `
            <h3 class="section-title">Risultati ricerca</h3>
            <p class="search-results-summary">${total} risultati trovati</p>
            ${this.renderSearchGroup('Eventi', 'event', results.events, (event) => ({
                meta: `${UIUtils.formatDateDisplay(event.date, 'short')}${event.time ? ` - ${DateUtils.formatStoredTime(event.time, appState.getSettings().timeFormat)}` : ''}`,
                text: event.text
            }))}
            ${this.renderSearchGroup('Task', 'task', results.tasks, (task) => ({
                meta: UIUtils.formatDateDisplay(task.date, 'short'),
                text: task.text
            }))}
            ${this.renderSearchGroup('Note', 'note', results.notes, (note) => ({
                meta: UIUtils.formatDateDisplay(note.date, 'short'),
                text: note.text
            }))}
        `;

        this.container.prepend(section);
    }

    renderSearchGroup(title, entityType, items, formatter) {
        if (!items.length) return '';
        const query = appState.getSearch().query;

        return `
            <div class="search-group">
                <h4 class="search-group-title">${title}</h4>
                <div class="search-group-list">
                    ${items.slice(0, 8).map((item) => {
                        const payload = formatter(item);
                        return `
                            <button class="search-result-item" data-action="open-search-result" data-entity-type="${entityType}" data-date="${item.date}" type="button">
                                <span class="search-result-meta">${payload.meta}</span>
                                <span class="search-result-text">${UIUtils.highlightMatch(payload.text, query)}</span>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    async handleContainerClick(event) {
        const result = event.target.closest('[data-action="open-search-result"]');
        if (!result) return;

        const date = result.dataset.date;
        if (!date) return;

        await appState.setCurrentDate(date);
        if (appState.getCurrentView() === 'monthly' || appState.getCurrentView() === 'statistics') {
            await appState.setCurrentView('daily');
            return;
        }

        this.renderCurrentView(true);
    }

    showError(message) {
        this.container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--danger);">
                <h2>Errore</h2>
                <p>${message}</p>
            </div>
        `;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new CalendarApp();
        app.init();
    });
} else {
    const app = new CalendarApp();
    app.init();
}
