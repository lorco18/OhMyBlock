/**
 * Header Component
 */
class HeaderComponent {
    constructor() {
        this.viewOrder = ['daily', 'weekly', 'monthly'];
        this.elements = {
            leftBtn: document.getElementById('header-left'),
            rightBtn: document.getElementById('header-right-btn'),
            header: document.getElementById('app-header'),
            center: document.getElementById('header-center'),
            title: document.getElementById('header-title'),
            rightGroup: document.getElementById('header-right'),
            layoutToggle: document.getElementById('layout-toggle'),
            settingsBtn: document.getElementById('settings-btn'),
            statsBtn: document.getElementById('stats-btn'),
            searchBtn: document.getElementById('search-btn'),
            searchPanel: document.getElementById('search-panel'),
            searchChips: document.getElementById('search-chips'),
            searchQuery: document.getElementById('search-query'),
            searchDate: document.getElementById('search-date'),
            searchClear: document.getElementById('search-clear')
        };

        this.init();
    }

    init() {
        this.elements.leftBtn.addEventListener('click', () => this.handlePrevious());
        this.elements.rightBtn.addEventListener('click', () => this.handleNext());
        this.elements.center.addEventListener('click', () => this.toggleTitleExpand());
        this.elements.layoutToggle.addEventListener('click', () => this.handleLayoutToggle());
        this.elements.settingsBtn.addEventListener('click', () => this.handleSettings());
        this.elements.statsBtn.addEventListener('click', () => this.handleStats());
        this.elements.searchBtn.addEventListener('click', () => this.toggleSearch());
        this.elements.searchQuery.addEventListener('input', () => this.handleSearchChange());
        this.elements.searchDate.addEventListener('change', () => this.handleSearchChange());
        this.elements.searchClear.addEventListener('click', () => this.clearSearch());
        this.elements.searchChips.addEventListener('click', (event) => this.handleChipClick(event));

        eventBus.on(EVENTS.VIEW_CHANGED, () => this.updateHeader());
        eventBus.on(EVENTS.DATE_CHANGED, () => this.updateTitle());
        eventBus.on(EVENTS.DATA_LOADED, () => this.syncSearchUI());
        eventBus.on(EVENTS.SEARCH_CHANGED, () => this.syncSearchUI());

        this.elements.center.setAttribute('role', 'button');
        this.elements.center.setAttribute('tabindex', '0');
        this.elements.center.setAttribute('aria-expanded', 'false');
        this.elements.center.setAttribute('aria-label', 'Espandi titolo data');
        this.elements.center.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.toggleTitleExpand();
            }
        });
    }

    updateTitle() {
        this.collapseTitleExpand();
        this.elements.title.textContent = appState.getHeaderTitle();
    }

    updateHeader() {
        this.updateTitle();
        this.updateLayoutIcon();
        const isStats = appState.getCurrentView() === 'statistics';
        this.elements.statsBtn.classList.toggle('active', isStats);
    }

    toggleTitleExpand() {
        const canExpand = appState.getCurrentView() === 'daily';
        if (!canExpand) return;

        const expanded = this.elements.header.classList.toggle('title-expanded');
        this.elements.center.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }

    collapseTitleExpand() {
        this.elements.header.classList.remove('title-expanded');
        this.elements.center.setAttribute('aria-expanded', 'false');
    }

    syncSearchUI() {
        const search = appState.getSearch();
        this.elements.searchQuery.value = search.query || '';
        this.elements.searchDate.value = search.date || '';
        this.elements.searchPanel.classList.remove('hidden');
        this.elements.searchPanel.classList.toggle('is-open', search.visible);
        this.elements.searchPanel.setAttribute('aria-hidden', search.visible ? 'false' : 'true');
        this.elements.searchBtn.classList.toggle('active', search.visible || !!search.query || !!search.date);
        document.body.classList.toggle('search-open', search.visible);
        this.elements.searchChips.querySelectorAll('.search-chip').forEach((chip) => {
            const chipType = chip.dataset.chip;
            const isActive = chipType === 'all'
                ? search.type === 'all' && !search.importantOnly && !search.todayOnly
                : chipType === 'important'
                    ? search.importantOnly
                    : chipType === 'today'
                        ? search.todayOnly
                        : search.type === chipType;
            chip.classList.toggle('active', isActive);
        });
    }

    async handlePrevious() {
        this.collapseTitleExpand();
        await appState.navigatePrevious();
    }

    async handleNext() {
        this.collapseTitleExpand();
        await appState.navigateNext();
    }

    handleLayoutToggle() {
        this.collapseTitleExpand();
        const currentView = appState.getCurrentView();
        if (currentView === 'statistics') {
            appState.setCurrentView(appState.getPreviousView());
            return;
        }
        const currentIndex = this.viewOrder.indexOf(currentView);
        const nextIndex = (currentIndex + 1) % this.viewOrder.length;
        appState.setCurrentView(this.viewOrder[nextIndex]);
    }

    handleSettings() {
        this.collapseTitleExpand();
        eventBus.emit(EVENTS.SETTINGS_OPENED);
    }

    handleStats() {
        this.collapseTitleExpand();
        if (appState.getCurrentView() === 'statistics') {
            appState.setCurrentView(appState.getPreviousView());
            return;
        }

        appState.setCurrentView('statistics');
    }

    toggleSearch() {
        this.collapseTitleExpand();
        const search = appState.getSearch();
        appState.setSearch({ visible: !search.visible });

        if (!search.visible) {
            window.setTimeout(() => this.elements.searchQuery.focus(), 50);
        }
    }

    handleSearchChange() {
        appState.setSearch({
            query: this.elements.searchQuery.value,
            date: this.elements.searchDate.value,
            visible: true
        });
    }

    handleChipClick(event) {
        const chip = event.target.closest('.search-chip');
        if (!chip) return;

        const chipType = chip.dataset.chip;
        const updates = {
            visible: true,
            type: 'all',
            importantOnly: false,
            todayOnly: false
        };

        if (chipType === 'events' || chipType === 'tasks' || chipType === 'notes') {
            updates.type = chipType;
        }

        if (chipType === 'important') {
            updates.type = 'important';
            updates.importantOnly = true;
        }

        if (chipType === 'today') {
            updates.todayOnly = true;
        }

        appState.setSearch(updates);
    }

    clearSearch() {
        this.collapseTitleExpand();
        appState.setSearch({
            query: '',
            date: '',
            visible: false,
            type: 'all',
            importantOnly: false,
            todayOnly: false
        });
    }

    updateLayoutIcon() {
        const view = appState.getCurrentView();
        const svg = this.elements.layoutToggle.querySelector('svg');

        if (view === 'daily') {
            svg.innerHTML = '<rect x="4.25" y="4.25" width="15.5" height="15.5" rx="2.4"></rect>';
            return;
        }

        if (view === 'weekly') {
            svg.innerHTML = `
                <rect x="4.25" y="4.25" width="6.75" height="15.5" rx="2"></rect>
                <rect x="13" y="4.25" width="6.75" height="15.5" rx="2"></rect>
            `;
            return;
        }

        svg.innerHTML = `
            <rect x="4" y="4" width="6.5" height="6.5" rx="1.8"></rect>
            <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"></rect>
            <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"></rect>
            <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"></rect>
        `;
    }
}

let headerComponent;
