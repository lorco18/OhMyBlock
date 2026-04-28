/**
 * Monthly View Renderer
 */
class MonthlyView {
    constructor(container) {
        this.container = container;
        this.currentDate = null;
        this.calendarDates = [];
        this.listenersAttached = false;
        this.data = {
            events: []
        };
    }

    /**
     * Render the monthly view
     * @param {string} date 
     */
    async render(date) {
        this.currentDate = date;
        const settings = appState.getSettings();
        this.calendarDates = DateUtils.getMonthCalendarDates(date, settings.weekStartsOn);
        
        // Load data for the month
        await this.loadData();
        
        // Build HTML
        const html = `
            <div class="monthly-view">
                ${this.renderCalendar()}
            </div>
        `;
        
        this.container.innerHTML = html;
        
        // Attach event listeners
        this.attachEventListeners();
    }

    async loadData() {
        try {
            const startDate = this.calendarDates[0].date;
            const endDate = this.calendarDates[this.calendarDates.length - 1].date;

            const events = await dataStore.getEventsByDateRange(startDate, endDate);

            this.data.events = events;
        } catch (error) {
            console.error('Failed to load monthly data:', error);
            eventBus.emit(EVENTS.ERROR, error);
        }
    }

    renderCalendar() {
        return `
            <div class="calendar-grid">
                ${this.renderWeekdays()}
                ${this.renderDays()}
            </div>
        `;
    }

    renderWeekdays() {
        const settings = appState.getSettings();
        const weekdays = DateUtils.getWeekdayLabels(settings.weekStartsOn, 'short');
        
        const weekdaysHTML = weekdays.map(day => {
            return `<div class="weekday-label">${day}</div>`;
        }).join('');
        
        return `
            <div class="calendar-weekdays">
                ${weekdaysHTML}
            </div>
        `;
    }

    renderDays() {
        const daysHTML = this.calendarDates.map(({ date, isCurrentMonth }) => {
            return this.renderDay(date, isCurrentMonth);
        }).join('');
        
        return `
            <div class="calendar-days">
                ${daysHTML}
            </div>
        `;
    }

    renderDay(date, isCurrentMonth) {
        const dayNumber = DateUtils.getDay(date);
        const isToday = DateUtils.isToday(date);
        const events = this.data.events.filter(e => e.date === date);
        
        const otherMonthClass = !isCurrentMonth ? 'other-month' : '';
        const todayClass = isToday ? 'today' : '';
        
        // Separate important and normal events
        const importantEvents = events.filter(e => e.important);
        const normalEvents = events.filter(e => !e.important);
        
        // Show max 2 important events as text
        const visibleImportantEvents = importantEvents.slice(0, 2);
        const remainingImportant = importantEvents.length - visibleImportantEvents.length;
        
        const importantHTML = visibleImportantEvents.map(event => {
            return `
                <div class="day-event-item important">
                    ${UIUtils.escapeHTML(event.text)}
                </div>
            `;
        }).join('');
        
        // Show normal events as dots
        const dotsHTML = normalEvents.length > 0 ? `
            <div class="day-event-dots">
                ${normalEvents.slice(0, 5).map(() => '<div class="event-dot"></div>').join('')}
            </div>
        ` : '';
        
        // More indicator
        const totalHidden = remainingImportant + Math.max(0, normalEvents.length - 5);
        const moreHTML = totalHidden > 0 ? `
            <div class="more-indicator">+${totalHidden}</div>
        ` : '';
        
        return `
            <div class="calendar-day ${otherMonthClass} ${todayClass}" data-date="${date}" data-action="open-day">
                <div class="day-number">${dayNumber}</div>
                <div class="day-events-container">
                    ${importantHTML}
                    ${dotsHTML}
                    ${moreHTML}
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        if (this.listenersAttached) return;

        this.container.addEventListener('click', (e) => this.handleClick(e));
        this.listenersAttached = true;
    }

    async handleClick(e) {
        const dayElement = e.target.closest('[data-action="open-day"]');
        if (!dayElement) return;

        const date = dayElement.dataset.date;
        await appState.setCurrentDate(date);
        await appState.setCurrentView('daily');
    }
}
