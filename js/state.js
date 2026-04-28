/**
 * AppState - Global application state manager
 */
class AppState {
    constructor() {
        this.state = {
            currentView: 'daily',
            previousView: 'daily',
            currentDate: DateUtils.today(),
            settings: null,
            search: {
                query: '',
                date: '',
                visible: false,
                type: 'all',
                importantOnly: false,
                todayOnly: false
            },
            isLoading: false
        };

        this.previousSettings = null;
    }

    async init() {
        try {
            await dataStore.init();
            const settings = await dataStore.getSettings();
            const initialView = settings.lastView === 'statistics' ? 'daily' : (settings.lastView || 'daily');
            this.state.settings = settings;
            this.state.currentView = initialView;
            this.state.previousView = this.state.currentView;
            this.state.currentDate = DateUtils.today();
            this.applySettings(settings);
            eventBus.emit(EVENTS.DATA_LOADED);
        } catch (error) {
            console.error('Failed to initialize state:', error);
            eventBus.emit(EVENTS.ERROR, error);
        }
    }

    get() {
        return { ...this.state };
    }

    getCurrentView() {
        return this.state.currentView;
    }

    async setCurrentView(view) {
        if (view === this.state.currentView) return;

        if (this.state.currentView !== 'statistics') {
            this.state.previousView = this.state.currentView;
        }
        this.state.currentView = view;
        if (view !== 'statistics') {
            this.state.settings.lastView = view;
        }
        await dataStore.saveSettings(this.state.settings);
        eventBus.emit(EVENTS.VIEW_CHANGED, view);
    }

    getPreviousView() {
        return this.state.previousView || 'daily';
    }

    getCurrentDate() {
        return this.state.currentDate;
    }

    async setCurrentDate(date) {
        if (date === this.state.currentDate) return;

        this.state.currentDate = date;
        this.state.settings.lastDate = date;
        await dataStore.saveSettings(this.state.settings);
        eventBus.emit(EVENTS.DATE_CHANGED, date);
    }

    async navigatePrevious() {
        const view = this.state.currentView;
        const currentDate = this.state.currentDate;
        const newDate = view === 'daily' || view === 'statistics'
            ? DateUtils.addDays(currentDate, -1)
            : view === 'weekly'
                ? DateUtils.addWeeks(currentDate, -1)
                : DateUtils.addMonths(currentDate, -1);

        await this.setCurrentDate(newDate);
    }

    async navigateNext() {
        const view = this.state.currentView;
        const currentDate = this.state.currentDate;
        const newDate = view === 'daily' || view === 'statistics'
            ? DateUtils.addDays(currentDate, 1)
            : view === 'weekly'
                ? DateUtils.addWeeks(currentDate, 1)
                : DateUtils.addMonths(currentDate, 1);

        await this.setCurrentDate(newDate);
    }

    getSettings() {
        return { ...this.state.settings };
    }

    async updateSettings(updates) {
        this.state.settings = {
            ...this.state.settings,
            ...updates
        };

        await dataStore.saveSettings(this.state.settings);
        this.applySettings(this.state.settings);
        eventBus.emit(EVENTS.SETTINGS_CHANGED, this.state.settings);
    }

    storeCurrentSettings() {
        this.previousSettings = { ...this.state.settings };
    }

    async restoreSettings() {
        if (!this.previousSettings) return;

        this.state.settings = { ...this.previousSettings };
        await dataStore.saveSettings(this.state.settings);
        this.applySettings(this.state.settings);
        eventBus.emit(EVENTS.SETTINGS_CHANGED, this.state.settings);
        this.previousSettings = null;
    }

    applySettings(settings) {
        UIUtils.applyTheme(settings.theme);
        UIUtils.applyFont(settings.font);
        UIUtils.applyPrimaryColor(settings.primaryColor);
        UIUtils.applyDensity(settings.density);
        UIUtils.applyMinimalMode(settings.minimalMode);
        UIUtils.applyPalette(settings.palette);
    }

    getSearch() {
        return { ...this.state.search };
    }

    setSearch(updates) {
        this.state.search = {
            ...this.state.search,
            ...updates
        };
        eventBus.emit(EVENTS.SEARCH_CHANGED, this.getSearch());
    }

    clearSearch() {
        this.setSearch({
            query: '',
            date: ''
        });
    }

    getHeaderTitle() {
        const view = this.state.currentView;
        const date = this.state.currentDate;

        if (view === 'daily') {
            if (DateUtils.isToday(date)) {
                return `Oggi, ${UIUtils.capitalize(DateUtils.formatDayMonth(date))}`;
            }
            return UIUtils.capitalize(DateUtils.formatDayMonth(date));
        }

        if (view === 'weekly') {
            const weekStartsOn = this.state.settings?.weekStartsOn ?? 1;
            const start = DateUtils.getWeekStart(date, weekStartsOn);
            const end = DateUtils.getWeekEnd(date, weekStartsOn);
            return `${UIUtils.formatDateDisplay(start, 'short')} - ${UIUtils.formatDateDisplay(end, 'short')}`;
        }

        if (view === 'monthly') {
            return UIUtils.capitalize(DateUtils.getMonthName(date));
        }

        if (view === 'statistics') {
            return 'Dashboard';
        }

        return '';
    }

    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        eventBus.emit(EVENTS.LOADING, isLoading);
    }
}

const appState = new AppState();
