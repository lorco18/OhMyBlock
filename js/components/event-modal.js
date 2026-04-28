/**
 * Event Modal Component
 */
class EventModalComponent {
    constructor() {
        this.modal = document.getElementById('event-modal');
        this.cancelBtn = document.getElementById('event-cancel');
        this.saveBtn = document.getElementById('event-save');
        this.deleteBtn = document.getElementById('event-delete');
        this.title = document.getElementById('event-modal-title');
        this.textInput = document.getElementById('event-text');
        this.timeInput = document.getElementById('event-time');
        this.recurrenceInput = document.getElementById('event-recurrence');
        this.untilGroup = document.getElementById('event-until-group');
        this.untilInput = document.getElementById('event-until');

        this.currentDate = null;
        this.currentEvent = null;

        this.init();
    }

    init() {
        this.cancelBtn.addEventListener('click', () => this.close());
        this.saveBtn.addEventListener('click', () => this.save());
        this.deleteBtn.addEventListener('click', () => this.delete());
        this.recurrenceInput.addEventListener('change', () => this.syncRecurrenceUI());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        this.textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.save();
            }
        });
    }

    open(date) {
        this.currentDate = date;
        this.currentEvent = null;
        this.title.textContent = 'Nuovo evento';
        this.saveBtn.textContent = 'Aggiungi';
        this.deleteBtn.classList.add('hidden');
        this.textInput.value = '';
        this.timeInput.value = '';
        this.recurrenceInput.value = 'none';
        this.untilInput.value = '';
        this.syncRecurrenceUI();
        this.show();
    }

    openForEdit(event) {
        this.currentDate = event.sourceDate || event.date;
        this.currentEvent = { ...event, date: event.sourceDate || event.date };
        this.title.textContent = 'Modifica evento';
        this.saveBtn.textContent = 'Salva';
        this.deleteBtn.classList.remove('hidden');
        this.textInput.value = event.text || '';
        this.timeInput.value = event.time || '';
        this.recurrenceInput.value = event.recurrence || 'none';
        this.untilInput.value = event.recurrenceUntil || '';
        this.syncRecurrenceUI();
        this.show();
    }

    syncRecurrenceUI() {
        this.untilGroup.classList.toggle('hidden', this.recurrenceInput.value === 'none');
    }

    show() {
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        window.setTimeout(() => this.textInput.focus(), 100);
    }

    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        this.currentDate = null;
        this.currentEvent = null;
    }

    buildEventPayload() {
        const text = this.textInput.value.trim();
        if (!text) {
            this.textInput.focus();
            return null;
        }

        return {
            ...(this.currentEvent || {}),
            date: this.currentDate,
            time: this.timeInput.value || null,
            text,
            recurrence: this.recurrenceInput.value,
            recurrenceUntil: this.recurrenceInput.value === 'none' ? null : (this.untilInput.value || null),
            important: this.currentEvent?.important || false,
            completed: this.currentEvent?.completed || false
        };
    }

    async save() {
        const event = this.buildEventPayload();
        if (!event) return;

        try {
            const saved = await dataStore.saveEvent(event);
            eventBus.emit(EVENTS.DATA_CHANGED, { type: 'event', data: saved });
            this.close();
        } catch (error) {
            console.error('Failed to save event:', error);
            eventBus.emit(EVENTS.ERROR, error);
        }
    }

    async delete() {
        if (!this.currentEvent?.id) return;
        if (!UIUtils.confirm('Eliminare questo evento?')) return;

        try {
            await dataStore.deleteEvent(this.currentEvent.id);
            eventBus.emit(EVENTS.DATA_DELETED, { type: 'event', id: this.currentEvent.id });
            eventBus.emit(EVENTS.DATA_CHANGED, { type: 'event' });
            this.close();
        } catch (error) {
            console.error('Failed to delete event:', error);
            eventBus.emit(EVENTS.ERROR, error);
        }
    }
}

let eventModalComponent;
