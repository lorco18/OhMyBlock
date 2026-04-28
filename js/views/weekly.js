/**
 * Weekly View Renderer
 */
class WeeklyView {
    constructor(container) {
        this.container = container;
        this.currentDate = null;
        this.weekDates = [];
        this.listenersAttached = false;
        this.data = {
            events: [],
            tasks: [],
            weekTasks: [],
            notes: {}
        };
    }

    async render(date) {
        this.currentDate = date;
        const settings = appState.getSettings();
        this.weekDates = DateUtils.getWeekDates(date, settings.weekStartsOn);
        await this.loadData();

        const layoutClass = settings.layout === 'horizontal' ? 'layout-horizontal' : '';

        this.container.innerHTML = `
            <div class="weekly-view ${layoutClass}">
                ${this.renderMobileStrip()}
                ${this.renderDays()}
                ${this.renderSections()}
            </div>
        `;

        this.attachEventListeners();
    }

    async loadData() {
        try {
            const startDate = this.weekDates[0];
            const endDate = this.weekDates[6];
            const [events, tasks, weekTasks, notes] = await Promise.all([
                dataStore.getEventsByDateRange(startDate, endDate),
                dataStore.getTasksByDate(this.currentDate),
                dataStore.getTasksByDateRange(startDate, endDate),
                Promise.all(this.weekDates.map(async (date) => [date, await dataStore.getNoteByDate(date)]))
            ]);

            this.data.events = events;
            this.data.tasks = tasks;
            this.data.weekTasks = weekTasks;
            this.data.notes = notes.reduce((result, [date, note]) => {
                if (note) result[date] = note;
                return result;
            }, {});
        } catch (error) {
            console.error('Failed to load weekly data:', error);
            eventBus.emit(EVENTS.ERROR, error);
        }
    }

    renderDays() {
        return `
            <div class="weekly-days">
                ${this.weekDates.map((date) => this.renderDay(date)).join('')}
            </div>
        `;
    }

    renderMobileStrip() {
        return `
            <div class="weekly-mobile-strip" aria-label="Selezione giorno settimana">
                ${this.weekDates.map((date) => {
                    const isSelected = date === this.currentDate;
                    return `
                        <button
                            class="weekly-day-pill ${isSelected ? 'active' : ''}"
                            data-action="select-day"
                            data-date="${date}"
                            type="button"
                            aria-pressed="${isSelected ? 'true' : 'false'}"
                        >
                            <span>${UIUtils.capitalize(DateUtils.getDayNameShort(date))}</span>
                            <strong>${DateUtils.getDay(date)}</strong>
                        </button>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderDay(date) {
        const dayName = UIUtils.capitalize(DateUtils.getDayNameShort(date));
        const dayDate = DateUtils.getDay(date);
        const isToday = DateUtils.isToday(date);
        const events = this.data.events.filter((event) => event.date === date);

        return `
            <div class="day-card ${date === this.currentDate ? 'is-selected' : ''}" data-date="${date}">
                <div class="day-header">
                    <div>
                        <span class="day-name ${isToday ? 'today' : ''}">${dayName}</span>
                        <span class="day-date">${dayDate}</span>
                    </div>
                    <button class="add-event-btn" data-action="add-event" data-date="${date}" aria-label="Aggiungi evento a ${dayName}">+</button>
                </div>
                <div class="day-events">
                    ${events.length > 0 ? events.map((event) => this.renderEvent(event)).join('') : '<div class="empty-day">Nessun evento</div>'}
                </div>
            </div>
        `;
    }

    renderEvent(event) {
        const recurrenceLabel = event.recurrence && event.recurrence !== 'none' ? ' ricorrente' : '';
        const settings = appState.getSettings();
        return `
            <div class="event-item" data-action="edit-event" data-id="${event.id}" tabindex="0" role="button" aria-label="Modifica evento ${UIUtils.escapeHTML(event.text)}${recurrenceLabel}">
                <div class="event-time">${event.time ? DateUtils.formatStoredTime(event.time, settings.timeFormat) : '--:--'}</div>
                <div class="event-text ${event.important ? 'important' : ''} ${event.completed ? 'completed' : ''}">
                    ${UIUtils.escapeHTML(event.text)}
                </div>
            </div>
        `;
    }

    renderTaskItem(task, index) {
        const isFirst = index === 0;
        const isLast = index === this.data.tasks.length - 1;

        return `
            <div class="task-item" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-action="toggle-task" data-id="${task.id}" aria-label="Completa task" />
                <textarea class="task-input ${task.completed ? 'completed' : ''}" placeholder="Nuova task..." data-id="${task.id}" rows="1" aria-label="Task settimana">${UIUtils.escapeHTML(task.text)}</textarea>
                <div class="task-controls compact">
                    <button class="task-move-btn" data-action="move-task-up" data-id="${task.id}" ${isFirst ? 'disabled' : ''} aria-label="Sposta task in alto">&#9652;</button>
                    <button class="task-move-btn" data-action="move-task-down" data-id="${task.id}" ${isLast ? 'disabled' : ''} aria-label="Sposta task in basso">&#9662;</button>
                </div>
            </div>
        `;
    }

    renderSections() {
        return `
            <div class="weekly-sections">
                ${this.renderTasks()}
                ${this.renderNotes()}
            </div>
        `;
    }

    renderTasks() {
        return `
            <div class="section-card">
                <h3 class="section-title">Task settimana</h3>
                <div class="task-list">
                    ${this.data.tasks.map((task, index) => this.renderTaskItem(task, index)).join('')}
                    <div class="task-add" data-action="add-task">Nuova task</div>
                </div>
            </div>
        `;
    }

    renderNotes() {
        return `
            <div class="section-card">
                <h3 class="section-title">Note settimana</h3>
                <textarea class="notes-textarea" placeholder="Scrivi le tue note..." data-action="save-note" aria-label="Note settimana">${UIUtils.escapeHTML(this.data.notes[this.currentDate]?.text || '')}</textarea>
            </div>
        `;
    }

    attachEventListeners() {
        if (this.listenersAttached) return;

        this.container.addEventListener('click', (e) => this.handleClick(e));
        this.container.addEventListener('input', (e) => this.handleInput(e));
        this.container.addEventListener('change', (e) => this.handleChange(e));
        this.container.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.listenersAttached = true;
    }

    syncTaskOrders() {
        this.data.tasks = this.data.tasks.map((task, index) => ({ ...task, order: index }));
    }

    async persistTaskOrder() {
        this.syncTaskOrders();
        await Promise.all(this.data.tasks.map((task) => dataStore.saveTask(task)));
    }

    refreshTaskList() {
        const taskList = this.container.querySelector('.task-list');
        if (!taskList) return;

        taskList.innerHTML = `
            ${this.data.tasks.map((task, index) => this.renderTaskItem(task, index)).join('')}
            <div class="task-add" data-action="add-task">Nuova task</div>
        `;
    }

    upsertTask(savedTask) {
        const index = this.data.tasks.findIndex((task) => task.id === savedTask.id);
        if (index === -1) {
            this.data.tasks.push(savedTask);
        } else {
            this.data.tasks[index] = savedTask;
        }

        const weekIndex = this.data.weekTasks.findIndex((task) => task.id === savedTask.id);
        if (weekIndex === -1) {
            this.data.weekTasks.push(savedTask);
        } else {
            this.data.weekTasks[weekIndex] = savedTask;
        }

        this.syncTaskOrders();
    }

    removeTask(id) {
        this.data.tasks = this.data.tasks.filter((task) => task.id !== id);
        this.data.weekTasks = this.data.weekTasks.filter((task) => task.id !== id);
        this.syncTaskOrders();
    }

    async handleClick(e) {
        const target = e.target.closest('[data-action]');
        const action = target?.dataset.action;
        if (!action) return;

        if (action === 'add-event') return eventModalComponent.open(target.dataset.date);
        if (action === 'select-day') return appState.setCurrentDate(target.dataset.date);

        if (action === 'edit-event') {
            const event = this.data.events.find((entry) => entry.id === target.dataset.id);
            if (event) eventModalComponent.openForEdit(event);
            return;
        }

        if (action === 'toggle-task') return this.toggleTask(target.dataset.id);
        if (action === 'move-task-up') return this.moveTask(target.dataset.id, -1);
        if (action === 'move-task-down') return this.moveTask(target.dataset.id, 1);
        if (action === 'add-task') return this.addTask();
        return undefined;
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey && e.target.classList.contains('task-input')) {
            e.preventDefault();
            this.focusNextTaskField(e.target);
            return;
        }

        const eventItem = e.target.closest('[data-action="edit-event"]');
        if (!eventItem) return;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const event = this.data.events.find((entry) => entry.id === eventItem.dataset.id);
            if (event) eventModalComponent.openForEdit(event);
        }
    }

    focusNextTaskField(currentField) {
        const fields = [...this.container.querySelectorAll('.task-input')];
        const currentIndex = fields.indexOf(currentField);
        if (currentIndex === -1) return;

        const nextField = fields[currentIndex + 1];
        nextField?.focus();
        if (typeof nextField?.select === 'function') {
            nextField.select();
        }
    }

    handleInput(e) {
        const target = e.target;
        if (target.tagName === 'TEXTAREA') {
            UIUtils.autoResize(target);
        }

        if (target.classList.contains('task-input')) {
            this.debouncedSaveTask(target);
        } else if (target.classList.contains('notes-textarea')) {
            this.debouncedSaveNote(target);
        }
    }

    handleChange(e) {
        if (e.target.classList.contains('task-checkbox')) {
            this.toggleTask(e.target.dataset.id);
        }
    }

    debouncedSaveTask = UIUtils.debounce(async (textarea) => {
        const text = textarea.value.trim();
        const id = textarea.dataset.id;

        if (!text && id) {
            await dataStore.deleteTask(id);
            this.removeTask(id);
            await this.persistTaskOrder();
            this.refreshTaskList();
            return;
        }

        if (!text) return;

        const task = this.data.tasks.find((entry) => entry.id === id) || {};
        task.date = this.currentDate;
        task.text = text;
        task.completed = task.completed || false;
        task.order = typeof task.order === 'number' ? task.order : this.data.tasks.length;
        if (id) task.id = id;

        const saved = await dataStore.saveTask(task);
        textarea.dataset.id = saved.id;
        this.upsertTask(saved);
        eventBus.emit(EVENTS.DATA_CHANGED, { type: 'task', data: saved });
    }, 500);

    debouncedSaveNote = UIUtils.debounce(async (textarea) => {
        const note = {
            date: this.currentDate,
            text: textarea.value.trim()
        };

        if (this.data.notes[this.currentDate]) {
            note.id = this.data.notes[this.currentDate].id;
        }

        const saved = await dataStore.saveNote(note);
        this.data.notes[this.currentDate] = saved;
        eventBus.emit(EVENTS.DATA_CHANGED, { type: 'note', data: saved });
    }, 500);

    async toggleTask(id) {
        const task = this.data.tasks.find((entry) => entry.id === id);
        if (!task) return;

        task.completed = !task.completed;
        await dataStore.saveTask(task);
        this.data.weekTasks = this.data.weekTasks.map((item) => item.id === task.id ? task : item);
        this.container.querySelector(`.task-item[data-id="${id}"] .task-input`)?.classList.toggle('completed');
        eventBus.emit(EVENTS.DATA_CHANGED, { type: 'task', data: task });
    }

    async moveTask(id, direction) {
        const currentIndex = this.data.tasks.findIndex((task) => task.id === id);
        const nextIndex = currentIndex + direction;
        if (currentIndex === -1 || nextIndex < 0 || nextIndex >= this.data.tasks.length) return;

        const [task] = this.data.tasks.splice(currentIndex, 1);
        this.data.tasks.splice(nextIndex, 0, task);
        await this.persistTaskOrder();
        this.refreshTaskList();
        eventBus.emit(EVENTS.DATA_CHANGED, { type: 'task-order' });
    }

    async addTask() {
        const saved = await dataStore.saveTask({
            date: this.currentDate,
            text: '',
            completed: false,
            order: this.data.tasks.length
        });

        this.data.tasks.push(saved);
        this.data.weekTasks.push(saved);
        this.syncTaskOrders();
        this.refreshTaskList();
        this.container.querySelector(`.task-item[data-id="${saved.id}"] textarea`)?.focus();
        eventBus.emit(EVENTS.DATA_CHANGED, { type: 'task', data: saved });
    }
}
