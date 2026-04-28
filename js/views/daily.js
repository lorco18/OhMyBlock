/**
 * Daily View Renderer
 */
class DailyView {
    constructor(container) {
        this.container = container;
        this.currentDate = null;
        this.listenersAttached = false;
        this.data = {
            events: [],
            tasks: [],
            note: null,
            meals: {}
        };
    }

    async render(date) {
        this.currentDate = date;
        await this.loadData();

        const settings = appState.getSettings();
        const layoutClass = settings.layout === 'horizontal' ? 'layout-horizontal' : '';

        this.container.innerHTML = `
            <div class="daily-view ${layoutClass}">
                ${this.renderSchedule()}
                ${this.renderSections()}
            </div>
        `;

        this.attachEventListeners();
    }

    async loadData() {
        try {
            [this.data.events, this.data.tasks, this.data.note, this.data.meals] = await Promise.all([
                dataStore.getEventsByDate(this.currentDate),
                dataStore.getTasksByDate(this.currentDate),
                dataStore.getNoteByDate(this.currentDate),
                dataStore.getMealsByDate(this.currentDate)
            ]);
        } catch (error) {
            console.error('Failed to load daily data:', error);
            eventBus.emit(EVENTS.ERROR, error);
        }
    }

    renderSchedule() {
        const settings = appState.getSettings();
        const timeSlots = UIUtils.generateTimeSlots(settings.startHour, settings.endHour, settings.interval);

        return `
            <div class="daily-schedule">
                ${timeSlots.map((time) => this.renderTimeSlot(time, this.data.events.find((event) => event.time === time))).join('')}
            </div>
        `;
    }

    renderTimeSlot(time, event = null) {
        const settings = appState.getSettings();
        const id = event?.id || '';
        const text = event?.text || '';
        const important = event?.important || false;
        const completed = event?.completed || false;
        const hasText = text.length > 0;

        return `
            <div class="time-slot ${important ? 'is-highlighted' : ''} ${completed ? 'completed' : ''}" data-time="${time}">
                <div class="time-label">${DateUtils.formatStoredTime(time, settings.timeFormat)}</div>
                <div class="time-content">
                    <button class="icon-btn star ${important ? 'active' : ''}" data-action="toggle-important" data-id="${id}" data-time="${time}" aria-label="Segna come importante">&#9733;</button>
                    <input
                        type="text"
                        class="event-input ${completed ? 'completed' : ''}"
                        placeholder="Aggiungi evento..."
                        value="${UIUtils.escapeHTML(text)}"
                        data-id="${id}"
                        data-time="${time}"
                        aria-label="Evento delle ${time}"
                    />
                    <div class="slot-actions ${hasText ? 'is-visible' : ''}">
                        <button class="icon-btn check ${completed ? 'active' : ''} ${!hasText ? 'hidden' : ''}" data-action="toggle-completed" data-id="${id}" data-time="${time}" aria-label="Segna come completato">&#10003;</button>
                        <button class="icon-btn delete ${!hasText ? 'hidden' : ''}" data-action="delete" data-id="${id}" data-time="${time}" aria-label="Elimina voce">&#128465;</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderSections() {
        return `
            <div class="daily-sections">
                ${this.renderTasks()}
                ${this.renderNotes()}
                ${this.renderMeals()}
            </div>
        `;
    }

    renderTaskItem(task, index) {
        const isFirst = index === 0;
        const isLast = index === this.data.tasks.length - 1;

        return `
            <div class="task-item" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-action="toggle-task" data-id="${task.id}" aria-label="Completa task" />
                <textarea class="task-input ${task.completed ? 'completed' : ''}" placeholder="Nuova task..." data-id="${task.id}" rows="1" aria-label="Testo task">${UIUtils.escapeHTML(task.text)}</textarea>
                <div class="task-controls compact">
                    <button class="task-move-btn" data-action="move-task-up" data-id="${task.id}" ${isFirst ? 'disabled' : ''} aria-label="Sposta task in alto">&#9652;</button>
                    <button class="task-move-btn" data-action="move-task-down" data-id="${task.id}" ${isLast ? 'disabled' : ''} aria-label="Sposta task in basso">&#9662;</button>
                </div>
            </div>
        `;
    }

    renderTasks() {
        return `
            <div class="section-card">
                <h3 class="section-title">Task</h3>
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
                <h3 class="section-title">Note</h3>
                <textarea class="notes-textarea" placeholder="Scrivi le tue note..." data-action="save-note" aria-label="Note del giorno">${UIUtils.escapeHTML(this.data.note?.text || '')}</textarea>
            </div>
        `;
    }

    renderMeals() {
        return `
            <div class="section-card">
                <h3 class="section-title">Pasti</h3>
                <div class="meal-item">
                    <label class="meal-label">Pranzo</label>
                    <input type="text" class="meal-input" placeholder="Cosa cucinerai..." value="${UIUtils.escapeHTML(this.data.meals.lunch || '')}" data-meal-type="lunch" aria-label="Pranzo" />
                </div>
                <div class="meal-item">
                    <label class="meal-label">Merenda</label>
                    <input type="text" class="meal-input" placeholder="Cosa cucinerai..." value="${UIUtils.escapeHTML(this.data.meals.snack || '')}" data-meal-type="snack" aria-label="Merenda" />
                </div>
                <div class="meal-item">
                    <label class="meal-label">Cena</label>
                    <input type="text" class="meal-input" placeholder="Cosa cucinerai..." value="${UIUtils.escapeHTML(this.data.meals.dinner || '')}" data-meal-type="dinner" aria-label="Cena" />
                </div>
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

    getTimeSlot(time) {
        return this.container.querySelector(`.time-slot[data-time="${time}"]`);
    }

    buildPersistableEvent(event, fallbackDate = this.currentDate) {
        return {
            ...event,
            date: event.sourceDate || event.date || fallbackDate
        };
    }

    syncSlotActions(time, id) {
        const slot = this.getTimeSlot(time);
        if (!slot) return null;
        slot.querySelectorAll('[data-action]').forEach((element) => {
            element.dataset.id = id;
        });
        return slot;
    }

    updateSlotActionVisibility(time, hasText) {
        const slot = this.getTimeSlot(time);
        if (!slot) return;

        const actions = slot.querySelector('.slot-actions');
        const checkButton = slot.querySelector('[data-action="toggle-completed"]');
        const deleteButton = slot.querySelector('[data-action="delete"]');

        actions?.classList.toggle('is-visible', hasText);
        checkButton?.classList.toggle('hidden', !hasText);
        deleteButton?.classList.toggle('hidden', !hasText);
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

    upsertEvent(savedEvent) {
        const index = this.data.events.findIndex((event) => event.id === savedEvent.id);
        const materialized = {
            ...savedEvent,
            date: this.currentDate,
            sourceDate: savedEvent.date,
            isRecurringInstance: (savedEvent.recurrence || 'none') !== 'none'
        };

        if (index === -1) {
            this.data.events.push(materialized);
        } else {
            this.data.events[index] = materialized;
        }
    }

    removeEvent(id) {
        this.data.events = this.data.events.filter((event) => event.id !== id);
    }

    upsertTask(savedTask) {
        const index = this.data.tasks.findIndex((task) => task.id === savedTask.id);
        if (index === -1) {
            this.data.tasks.push(savedTask);
        } else {
            this.data.tasks[index] = savedTask;
        }
        this.syncTaskOrders();
    }

    removeTask(id) {
        this.data.tasks = this.data.tasks.filter((task) => task.id !== id);
        this.syncTaskOrders();
    }

    async handleClick(e) {
        const target = e.target;
        const action = target.dataset.action;
        if (!action) return;

        if (action === 'toggle-important') return this.toggleImportant(target.dataset.id, target.dataset.time);
        if (action === 'toggle-completed') return this.toggleCompleted(target.dataset.id, target.dataset.time);
        if (action === 'delete') return this.deleteEvent(target.dataset.id, target.dataset.time);
        if (action === 'toggle-task') return this.toggleTask(target.dataset.id);
        if (action === 'move-task-up') return this.moveTask(target.dataset.id, -1);
        if (action === 'move-task-down') return this.moveTask(target.dataset.id, 1);
        if (action === 'add-task') return this.addTask();
        return undefined;
    }

    handleInput(e) {
        const target = e.target;
        if (target.tagName === 'TEXTAREA') {
            UIUtils.autoResize(target);
        }

        if (target.classList.contains('event-input')) {
            this.updateSlotActionVisibility(target.dataset.time, !!target.value.trim());
            this.debouncedSaveEvent(target);
        } else if (target.classList.contains('task-input')) {
            this.debouncedSaveTask(target);
        } else if (target.classList.contains('notes-textarea')) {
            this.debouncedSaveNote(target);
        } else if (target.classList.contains('meal-input')) {
            this.debouncedSaveMeal(target);
        }
    }

    handleChange(e) {
        if (e.target.classList.contains('task-checkbox')) {
            this.toggleTask(e.target.dataset.id);
        }
    }

    handleKeyDown(e) {
        const target = e.target;
        if (e.key !== 'Enter' || e.shiftKey) return;

        if (target.classList.contains('event-input')) {
            e.preventDefault();
            const currentSlot = target.closest('.time-slot');
            const nextInput = currentSlot?.nextElementSibling?.querySelector('.event-input');
            nextInput?.focus();
            nextInput?.select();
            return;
        }

        if (target.classList.contains('task-input')) {
            e.preventDefault();
            this.focusNextField('.task-input', target);
            return;
        }

        if (target.classList.contains('meal-input')) {
            e.preventDefault();
            this.focusNextField('.meal-input', target);
        }
    }

    focusNextField(selector, currentField) {
        const fields = [...this.container.querySelectorAll(selector)];
        const currentIndex = fields.indexOf(currentField);
        if (currentIndex === -1) return;

        const nextField = fields[currentIndex + 1];
        nextField?.focus();
        if (typeof nextField?.select === 'function') {
            nextField.select();
        }
    }

    debouncedSaveEvent = UIUtils.debounce(async (input) => {
        const text = input.value.trim();
        const time = input.dataset.time;
        const id = input.dataset.id;

        if (!text && id) {
            await dataStore.deleteEvent(id);
            input.dataset.id = '';
            this.removeEvent(id);

            this.syncSlotActions(time, '');
            this.updateSlotActionVisibility(time, false);
            return;
        }

        if (!text) return;

        const existing = this.data.events.find((entry) => entry.id === id) || {};
        const event = this.buildPersistableEvent(existing);
        event.time = time;
        event.text = text;
        event.important = event.important || false;
        event.completed = event.completed || false;
        if (id) event.id = id;

        const saved = await dataStore.saveEvent(event);
        input.dataset.id = saved.id;
        this.upsertEvent(saved);

        const slot = this.syncSlotActions(time, saved.id);
        if (slot) {
            this.updateSlotActionVisibility(time, true);
        }
        eventBus.emit(EVENTS.DATA_CHANGED, { type: 'event', data: saved });
    }, 500);

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
        if (this.data.note) {
            note.id = this.data.note.id;
        }
        const saved = await dataStore.saveNote(note);
        this.data.note = saved;
        eventBus.emit(EVENTS.DATA_CHANGED, { type: 'note', data: saved });
    }, 500);

    debouncedSaveMeal = UIUtils.debounce(async (input) => {
        const text = input.value.trim();
        const mealType = input.dataset.mealType;
        await dataStore.saveMeal(this.currentDate, mealType, text);
        this.data.meals[mealType] = text;
        eventBus.emit(EVENTS.DATA_CHANGED, { type: 'meal', mealType, text });
    }, 500);

    async toggleImportant(id, time) {
        if (!id) return;
        const event = this.data.events.find((entry) => entry.id === id);
        if (!event) return;

        const persistable = this.buildPersistableEvent(event);
        persistable.important = !persistable.important;
        const saved = await dataStore.saveEvent(persistable);
        this.upsertEvent(saved);

        const slot = this.getTimeSlot(time);
        slot?.querySelector('[data-action="toggle-important"]')?.classList.toggle('active');
        slot?.classList.toggle('is-highlighted');
        eventBus.emit(EVENTS.DATA_CHANGED, { type: 'event', data: saved });
    }

    async toggleCompleted(id, time) {
        if (!id) return;
        const event = this.data.events.find((entry) => entry.id === id);
        if (!event) return;

        const persistable = this.buildPersistableEvent(event);
        persistable.completed = !persistable.completed;
        const saved = await dataStore.saveEvent(persistable);
        this.upsertEvent(saved);

        const slot = this.getTimeSlot(time);
        slot?.querySelector('[data-action="toggle-completed"]')?.classList.toggle('active');
        slot?.querySelector('.event-input')?.classList.toggle('completed');
        slot?.classList.toggle('completed');
        eventBus.emit(EVENTS.DATA_CHANGED, { type: 'event', data: saved });
    }

    async deleteEvent(id, time) {
        const slot = this.getTimeSlot(time);
        const input = slot?.querySelector('.event-input');
        const hasText = !!input?.value.trim();

        if (!id && !hasText) {
            if (!UIUtils.confirm(`Eliminare la fascia oraria ${time}?`)) return;
            slot?.remove();
            return;
        }

        if (!id || !UIUtils.confirm('Eliminare il testo di questa voce?')) return;

        await dataStore.deleteEvent(id);
        this.removeEvent(id);
        if (slot) {
            slot.outerHTML = this.renderTimeSlot(time, null);
        }
        eventBus.emit(EVENTS.DATA_DELETED, { type: 'event', id });
    }

    async toggleTask(id) {
        const task = this.data.tasks.find((entry) => entry.id === id);
        if (!task) return;
        task.completed = !task.completed;
        await dataStore.saveTask(task);
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
        this.syncTaskOrders();
        this.refreshTaskList();
        this.container.querySelector(`.task-item[data-id="${saved.id}"] textarea`)?.focus();
        eventBus.emit(EVENTS.DATA_CHANGED, { type: 'task', data: saved });
    }
}
