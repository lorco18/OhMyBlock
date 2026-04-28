/**
 * Dashboard View Renderer
 */
class StatisticsView {
    constructor(container) {
        this.container = container;
        this.currentDate = null;
        this.data = null;
    }

    async render(date) {
        this.currentDate = date;
        await this.loadData();

        this.container.innerHTML = `
            <div class="dashboard-view">
                <section class="section-card dashboard-hero">
                    <div>
                        <p class="dashboard-eyebrow">Dashboard</p>
                        <h2 class="dashboard-title">${UIUtils.capitalize(DateUtils.formatDayMonth(this.currentDate))}</h2>
                        <p class="dashboard-subtitle">Vista rapida di eventi, task e priorita della giornata e del periodo corrente.</p>
                    </div>
                    <div class="dashboard-hero-stats">
                        ${this.renderHeroStat(this.data.today.totalEvents, 'eventi oggi')}
                        ${this.renderHeroStat(`${this.data.today.completedTasks}/${this.data.today.totalTasks}`, 'task chiuse')}
                        ${this.renderHeroStat(this.data.week.totalEvents, 'eventi settimana')}
                        ${this.renderHeroStat(this.data.month.activeDays, 'giorni attivi mese')}
                    </div>
                </section>

                <div class="dashboard-grid">
                    <section class="section-card dashboard-widget dashboard-widget-wide">
                        <h3 class="section-title">Agenda di oggi</h3>
                        ${this.renderEventList(this.data.today.timedEvents, 'Nessun evento con orario per oggi.')}
                    </section>

                    <section class="section-card dashboard-widget">
                        <h3 class="section-title">Prossimi eventi</h3>
                        ${this.renderEventList(this.data.upcomingEvents, 'Nessun evento imminente nei prossimi giorni.')}
                    </section>

                    <section class="section-card dashboard-widget">
                        <h3 class="section-title">Priorita settimana</h3>
                        ${this.renderEventList(this.data.week.importantOpenEvents, 'Nessun evento importante aperto questa settimana.')}
                    </section>

                    <section class="section-card dashboard-widget">
                        <h3 class="section-title">Task aperte</h3>
                        <div class="dashboard-metric-row">
                            <div class="stat-pill">
                                <strong>${this.data.today.openTasks}</strong>
                                <span>oggi</span>
                            </div>
                            <div class="stat-pill">
                                <strong>${this.data.week.openTasks}</strong>
                                <span>settimana</span>
                            </div>
                        </div>
                        ${this.renderTaskList(this.data.week.nextTasks, 'Nessuna task aperta in settimana.')}
                    </section>

                    <section class="section-card dashboard-widget">
                        <h3 class="section-title">Settimana</h3>
                        <div class="dashboard-metric-row">
                            <div class="stat-pill">
                                <strong>${this.data.week.completionRate}%</strong>
                                <span>completamento task</span>
                            </div>
                            <div class="stat-pill">
                                <strong>${this.data.week.busiestDay.count}</strong>
                                <span>picco eventi</span>
                            </div>
                        </div>
                        <div class="dashboard-inline-note">
                            Giorno piu carico: <strong>${this.data.week.busiestDay.label}</strong>
                        </div>
                    </section>

                    <section class="section-card dashboard-widget">
                        <h3 class="section-title">Mese</h3>
                        <div class="dashboard-metric-row">
                            <div class="stat-pill">
                                <strong>${this.data.month.totalEvents}</strong>
                                <span>eventi totali</span>
                            </div>
                            <div class="stat-pill">
                                <strong>${this.data.month.importantEvents}</strong>
                                <span>importanti</span>
                            </div>
                            <div class="stat-pill">
                                <strong>${this.data.month.richestDay.count}</strong>
                                <span>massimo in un giorno</span>
                            </div>
                        </div>
                        <div class="dashboard-inline-note">
                            Giorno piu pieno: <strong>${this.data.month.richestDay.label}</strong>
                        </div>
                    </section>

                    <section class="section-card dashboard-widget dashboard-widget-wide">
                        <h3 class="section-title">Contesto di oggi</h3>
                        <div class="dashboard-context-grid">
                            <div class="stat-pill">
                                <strong>${this.data.today.noteAvailable ? 'Si' : 'No'}</strong>
                                <span>nota del giorno</span>
                            </div>
                            <div class="stat-pill">
                                <strong>${this.data.today.mealsPlanned}/3</strong>
                                <span>pasti pianificati</span>
                            </div>
                            <div class="stat-pill">
                                <strong>${this.data.today.completedImportant}/${this.data.today.importantEvents}</strong>
                                <span>importanti chiusi</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }

    renderHeroStat(value, label) {
        return `
            <div class="dashboard-hero-stat">
                <strong>${value}</strong>
                <span>${label}</span>
            </div>
        `;
    }

    renderEventList(events, emptyMessage) {
        if (!events.length) {
            return `<p class="dashboard-empty">${emptyMessage}</p>`;
        }

        return `
            <div class="dashboard-list">
                ${events.map((event) => `
                    <div class="dashboard-list-item">
                        <div>
                            <strong>${UIUtils.escapeHTML(event.text)}</strong>
                            <span>${UIUtils.formatDateDisplay(event.date, 'short')}${event.time ? ` - ${DateUtils.formatStoredTime(event.time, appState.getSettings().timeFormat)}` : ''}</span>
                        </div>
                        ${event.important ? '<span class="dashboard-badge">Importante</span>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderTaskList(tasks, emptyMessage) {
        if (!tasks.length) {
            return `<p class="dashboard-empty">${emptyMessage}</p>`;
        }

        return `
            <div class="dashboard-list">
                ${tasks.map((task) => `
                    <div class="dashboard-list-item">
                        <div>
                            <strong>${UIUtils.escapeHTML(task.text || 'Task senza titolo')}</strong>
                            <span>${UIUtils.formatDateDisplay(task.date, 'short')}</span>
                        </div>
                        <span class="dashboard-badge subtle">${DateUtils.isToday(task.date) ? 'Oggi' : UIUtils.capitalize(DateUtils.getDayNameShort(task.date))}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    buildBusiestDay(dates, events) {
        return dates
            .map((date) => ({
                date,
                count: events.filter((event) => event.date === date).length,
                label: UIUtils.capitalize(UIUtils.formatDateDisplay(date, 'short'))
            }))
            .sort((a, b) => b.count - a.count)[0] || { count: 0, label: '-' };
    }

    isUpcomingEvent(event, now) {
        if (!event.time) {
            return DateUtils.isSameOrAfter(event.date, DateUtils.today());
        }

        const dateTime = DateUtils.combineDateTime(event.date, event.time);
        return !!dateTime && dateTime.getTime() >= now.getTime();
    }

    async loadData() {
        const settings = appState.getSettings();
        const today = this.currentDate;
        const weekStart = DateUtils.getWeekStart(today, settings.weekStartsOn);
        const weekEnd = DateUtils.getWeekEnd(today, settings.weekStartsOn);
        const weekDates = DateUtils.getWeekDates(today, settings.weekStartsOn);
        const monthDates = DateUtils.getMonthCalendarDates(today, settings.weekStartsOn)
            .filter((item) => item.isCurrentMonth)
            .map((item) => item.date);
        const monthStart = monthDates[0];
        const monthEnd = monthDates[monthDates.length - 1];
        const upcomingEnd = DateUtils.addDays(today, 10);
        const now = new Date();

        const [todayTasks, todayEvents, todayNote, todayMeals, weekTasks, weekEvents, monthEvents, upcomingEvents] = await Promise.all([
            dataStore.getTasksByDate(today),
            dataStore.getEventsByDate(today),
            dataStore.getNoteByDate(today),
            dataStore.getMealsByDate(today),
            dataStore.getTasksByDateRange(weekStart, weekEnd),
            dataStore.getEventsByDateRange(weekStart, weekEnd),
            dataStore.getEventsByDateRange(monthStart, monthEnd),
            dataStore.getEventsByDateRange(today, upcomingEnd)
        ]);

        const timedTodayEvents = todayEvents.filter((event) => !!event.time);
        const importantOpenWeekEvents = weekEvents.filter((event) => event.important && !event.completed);
        const openWeekTasks = weekTasks.filter((task) => !task.completed);
        const monthCountMap = {};

        monthEvents.forEach((event) => {
            monthCountMap[event.date] = (monthCountMap[event.date] || 0) + 1;
        });

        const richestDay = Object.entries(monthCountMap)
            .map(([date, count]) => ({
                date,
                count,
                label: UIUtils.capitalize(UIUtils.formatDateDisplay(date, 'short'))
            }))
            .sort((a, b) => b.count - a.count)[0] || { count: 0, label: '-' };

        const totalWeekTasks = weekTasks.length;
        const completedWeekTasks = weekTasks.filter((task) => task.completed).length;

        this.data = {
            today: {
                totalTasks: todayTasks.length,
                completedTasks: todayTasks.filter((task) => task.completed).length,
                openTasks: todayTasks.filter((task) => !task.completed).length,
                totalEvents: todayEvents.length,
                importantEvents: todayEvents.filter((event) => event.important).length,
                completedImportant: todayEvents.filter((event) => event.important && event.completed).length,
                timedEvents: timedTodayEvents,
                noteAvailable: !!todayNote?.text?.trim(),
                mealsPlanned: Object.values(todayMeals).filter((value) => (value || '').trim()).length
            },
            week: {
                totalEvents: weekEvents.length,
                openTasks: openWeekTasks.length,
                completionRate: totalWeekTasks ? Math.round((completedWeekTasks / totalWeekTasks) * 100) : 0,
                busiestDay: this.buildBusiestDay(weekDates, weekEvents),
                importantOpenEvents: importantOpenWeekEvents.slice(0, 5),
                nextTasks: openWeekTasks.slice(0, 5)
            },
            month: {
                totalEvents: monthEvents.length,
                importantEvents: monthEvents.filter((event) => event.important).length,
                completedImportant: monthEvents.filter((event) => event.important && event.completed).length,
                richestDay,
                activeDays: Object.keys(monthCountMap).length
            },
            upcomingEvents: upcomingEvents
                .filter((event) => this.isUpcomingEvent(event, now))
                .slice(0, 6)
        };
    }
}
