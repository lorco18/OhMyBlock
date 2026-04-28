/**
 * Quick Add Component
 */
class QuickAddComponent {
    constructor() {
        this.modal = document.getElementById('quick-add-modal');
        this.triggerBtn = document.getElementById('quick-add-trigger');
        this.cancelBtn = document.getElementById('quick-add-cancel');
        this.saveBtn = document.getElementById('quick-add-save');
        this.input = document.getElementById('quick-add-input');
        this.typeInput = document.getElementById('quick-add-type');
        this.dateInput = document.getElementById('quick-add-date');
        this.timeInput = document.getElementById('quick-add-time');
        this.importantInput = document.getElementById('quick-add-important');
    }

    init() {
        this.triggerBtn.addEventListener('click', () => this.open());
        this.cancelBtn.addEventListener('click', () => this.close());
        this.saveBtn.addEventListener('click', () => this.save());
        this.typeInput.addEventListener('change', () => this.syncTypeUI());

        this.input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.save();
            }
        });

        this.modal.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.close();
            }
        });
    }

    open() {
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.input.value = '';
        this.typeInput.value = 'event';
        this.dateInput.value = appState.getCurrentDate();
        this.timeInput.value = '';
        this.importantInput.checked = false;
        this.syncTypeUI();
        window.setTimeout(() => this.input.focus(), 60);
    }

    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    syncTypeUI() {
        const isEvent = this.typeInput.value === 'event';
        this.timeInput.disabled = !isEvent;
        this.importantInput.disabled = !isEvent;

        if (!isEvent) {
            this.timeInput.value = '';
            this.importantInput.checked = false;
        }
    }

    buildPayload() {
        const text = this.input.value.trim();
        if (!text) {
            this.input.focus();
            return null;
        }

        return {
            type: this.typeInput.value,
            text,
            date: this.dateInput.value || appState.getCurrentDate(),
            time: this.typeInput.value === 'event' ? (this.timeInput.value || null) : null,
            important: this.typeInput.value === 'event' ? this.importantInput.checked : false
        };
    }

    async save() {
        const payload = this.buildPayload();
        if (!payload) return;

        try {
            if (payload.type === 'task') {
                const tasks = await dataStore.getTasksByDate(payload.date);
                await dataStore.saveTask({
                    date: payload.date,
                    text: payload.text,
                    completed: false,
                    order: tasks.length
                });
                eventBus.emit(EVENTS.DATA_CHANGED, { type: 'task' });
            } else if (payload.type === 'note') {
                const existingNote = await dataStore.getNoteByDate(payload.date);
                await dataStore.saveNote({
                    id: existingNote?.id,
                    date: payload.date,
                    text: payload.text
                });
                eventBus.emit(EVENTS.DATA_CHANGED, { type: 'note' });
            } else {
                await dataStore.saveEvent({
                    date: payload.date,
                    time: payload.time,
                    text: payload.text,
                    recurrence: 'none',
                    recurrenceUntil: null,
                    important: payload.important,
                    completed: false
                });
                eventBus.emit(EVENTS.DATA_CHANGED, { type: 'event' });
            }

            await appState.setCurrentDate(payload.date);
            this.close();
        } catch (error) {
            console.error('Failed to quick add item:', error);
            eventBus.emit(EVENTS.ERROR, error);
        }
    }
}

let quickAddComponent;
