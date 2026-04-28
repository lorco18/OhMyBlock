/**
 * DataStore - IndexedDB wrapper for calendar data
 */
class DataStore {
    constructor() {
        this.dbName = 'calendarDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains('events')) {
                    const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
                    eventsStore.createIndex('date', 'date', { unique: false });
                    eventsStore.createIndex('dateTime', ['date', 'time'], { unique: false });
                    eventsStore.createIndex('important', 'important', { unique: false });
                }

                if (!db.objectStoreNames.contains('tasks')) {
                    const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
                    tasksStore.createIndex('date', 'date', { unique: false });
                    tasksStore.createIndex('dateOrder', ['date', 'order'], { unique: false });
                }

                if (!db.objectStoreNames.contains('notes')) {
                    const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
                    notesStore.createIndex('date', 'date', { unique: false });
                }

                if (!db.objectStoreNames.contains('meals')) {
                    const mealsStore = db.createObjectStore('meals', { keyPath: 'id' });
                    mealsStore.createIndex('date', 'date', { unique: false });
                    mealsStore.createIndex('dateMealType', ['date', 'mealType'], { unique: false });
                }

                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'id' });
                }
            };
        });
    }

    getDefaultSettings() {
        return {
            id: 'user-settings',
            startHour: 8,
            endHour: 20,
            interval: 30,
            weekStartsOn: 1,
            timeFormat: '24h',
            primaryColor: '#007AFF',
            palette: 'custom',
            font: 'Inter',
            theme: 'light',
            layout: 'vertical',
            density: 'cozy',
            minimalMode: false,
            notificationsEnabled: false,
            reminderMinutes: 15,
            lockMethod: 'none',
            lockPinHash: '',
            biometricCredentialId: '',
            lastView: 'daily',
            lastDate: DateUtils.today()
        };
    }

    requestToPromise(request, transform = (result) => result) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(transform(request.result));
            request.onerror = () => reject(request.error);
        });
    }

    transactionDone(transaction) {
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error || new Error('Transaction aborted'));
        });
    }

    async getSettings() {
        const transaction = this.db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        return this.requestToPromise(store.get('user-settings'), (result) => ({
            ...this.getDefaultSettings(),
            ...(result || {}),
            id: 'user-settings'
        }));
    }

    async saveSettings(settings) {
        const transaction = this.db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        const normalized = {
            ...this.getDefaultSettings(),
            ...settings,
            id: 'user-settings'
        };
        return this.requestToPromise(store.put(normalized), () => normalized);
    }

    async getAllFromStore(storeName) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return this.requestToPromise(store.getAll(), (result) => result || []);
    }

    normalizeEvent(event) {
        return {
            important: false,
            completed: false,
            recurrence: 'none',
            recurrenceUntil: null,
            ...event,
            type: 'event'
        };
    }

    eventOccursOnDate(event, date) {
        const recurrence = event.recurrence || 'none';
        if (recurrence === 'none') {
            return event.date === date;
        }

        if (DateUtils.isBefore(date, event.date)) return false;
        if (event.recurrenceUntil && DateUtils.isAfter(date, event.recurrenceUntil)) return false;

        if (recurrence === 'daily') {
            return true;
        }

        if (recurrence === 'weekly') {
            return DateUtils.diffDays(event.date, date) % 7 === 0;
        }

        if (recurrence === 'monthly') {
            return DateUtils.getDay(event.date) === DateUtils.getDay(date);
        }

        return false;
    }

    materializeEventForDate(event, date) {
        return {
            ...this.normalizeEvent(event),
            date,
            sourceDate: event.date,
            isRecurringInstance: (event.recurrence || 'none') !== 'none'
        };
    }

    sortEvents(events) {
        return [...events].sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            if (!a.time) return 1;
            if (!b.time) return -1;
            return a.time.localeCompare(b.time);
        });
    }

    async getEventsByDate(date) {
        const events = await this.getAllFromStore('events');
        return this.sortEvents(
            events
                .map((event) => this.normalizeEvent(event))
                .filter((event) => this.eventOccursOnDate(event, date))
                .map((event) => this.materializeEventForDate(event, date))
        );
    }

    async getEventsByDateRange(startDate, endDate) {
        const events = await this.getAllFromStore('events');
        const dates = [];
        for (let current = startDate; DateUtils.isSameOrBefore(current, endDate); current = DateUtils.addDays(current, 1)) {
            dates.push(current);
        }

        const expanded = [];
        events.map((event) => this.normalizeEvent(event)).forEach((event) => {
            dates.forEach((date) => {
                if (this.eventOccursOnDate(event, date)) {
                    expanded.push(this.materializeEventForDate(event, date));
                }
            });
        });

        return this.sortEvents(expanded);
    }

    async saveEvent(event) {
        const { sourceDate, isRecurringInstance, ...eventData } = event;
        const normalized = this.normalizeEvent(eventData);
        if (!normalized.id) {
            normalized.id = UIUtils.generateId();
        }

        const transaction = this.db.transaction(['events'], 'readwrite');
        const store = transaction.objectStore('events');
        return this.requestToPromise(store.put(normalized), () => normalized);
    }

    async deleteEvent(id) {
        const transaction = this.db.transaction(['events'], 'readwrite');
        const store = transaction.objectStore('events');
        return this.requestToPromise(store.delete(id), () => undefined);
    }

    async getTasksByDate(date) {
        const transaction = this.db.transaction(['tasks'], 'readonly');
        const store = transaction.objectStore('tasks');
        const index = store.index('date');
        return this.requestToPromise(index.getAll(date), (result) => (result || []).sort((a, b) => a.order - b.order));
    }

    async getTasksByDateRange(startDate, endDate) {
        const tasks = await this.getAllFromStore('tasks');
        return tasks
            .filter((task) => DateUtils.isSameOrAfter(task.date, startDate) && DateUtils.isSameOrBefore(task.date, endDate))
            .sort((a, b) => {
                const dateCompare = a.date.localeCompare(b.date);
                return dateCompare !== 0 ? dateCompare : a.order - b.order;
            });
    }

    async saveTask(task) {
        const normalized = {
            completed: false,
            ...task,
            type: 'task'
        };
        if (!normalized.id) {
            normalized.id = UIUtils.generateId();
        }

        const transaction = this.db.transaction(['tasks'], 'readwrite');
        const store = transaction.objectStore('tasks');
        return this.requestToPromise(store.put(normalized), () => normalized);
    }

    async deleteTask(id) {
        const transaction = this.db.transaction(['tasks'], 'readwrite');
        const store = transaction.objectStore('tasks');
        return this.requestToPromise(store.delete(id), () => undefined);
    }

    async getNoteByDate(date) {
        const transaction = this.db.transaction(['notes'], 'readonly');
        const store = transaction.objectStore('notes');
        const index = store.index('date');
        return this.requestToPromise(index.get(date), (result) => result || null);
    }

    async getNotesByDateRange(startDate, endDate) {
        const notes = await this.getAllFromStore('notes');
        return notes.filter((note) => DateUtils.isSameOrAfter(note.date, startDate) && DateUtils.isSameOrBefore(note.date, endDate));
    }

    async saveNote(note) {
        const normalized = {
            ...note,
            type: 'note'
        };
        if (!normalized.id) {
            normalized.id = UIUtils.generateId();
        }

        const transaction = this.db.transaction(['notes'], 'readwrite');
        const store = transaction.objectStore('notes');
        return this.requestToPromise(store.put(normalized), () => normalized);
    }

    async getMealsByDate(date) {
        const transaction = this.db.transaction(['meals'], 'readonly');
        const store = transaction.objectStore('meals');
        const index = store.index('date');
        return this.requestToPromise(index.getAll(date), (result) => {
            const meals = result || [];
            return {
                lunch: meals.find((meal) => meal.mealType === 'lunch')?.text || '',
                snack: meals.find((meal) => meal.mealType === 'snack')?.text || '',
                dinner: meals.find((meal) => meal.mealType === 'dinner')?.text || ''
            };
        });
    }

    async saveMeal(date, mealType, text) {
        const transaction = this.db.transaction(['meals'], 'readwrite');
        const store = transaction.objectStore('meals');
        const index = store.index('dateMealType');
        const getRequest = index.get([date, mealType]);

        return new Promise((resolve, reject) => {
            getRequest.onsuccess = () => {
                const existing = getRequest.result;
                const meal = {
                    id: existing?.id || UIUtils.generateId(),
                    date,
                    mealType,
                    text,
                    type: 'meal'
                };

                const putRequest = store.put(meal);
                putRequest.onsuccess = () => resolve(meal);
                putRequest.onerror = () => reject(putRequest.error);
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async searchAll({ query = '', date = '', type = 'all', importantOnly = false, todayOnly = false } = {}) {
        const normalizedQuery = UIUtils.normalizeSearchText(query);
        const effectiveDate = todayOnly && !date ? DateUtils.today() : date;
        const [events, tasks, notes] = await Promise.all([
            this.getAllFromStore('events'),
            this.getAllFromStore('tasks'),
            this.getAllFromStore('notes')
        ]);

        const eventMatches = [];
        const datesToSearch = effectiveDate ? [effectiveDate] : null;

        events.map((event) => this.normalizeEvent(event)).forEach((event) => {
            const candidateDates = datesToSearch || [event.date];
            candidateDates.forEach((candidateDate) => {
                if (!this.eventOccursOnDate(event, candidateDate)) return;
                const materialized = this.materializeEventForDate(event, candidateDate);
                const haystack = UIUtils.normalizeSearchText(`${materialized.text} ${materialized.date} ${materialized.time || ''}`);
                if (importantOnly && !materialized.important) return;
                if (!normalizedQuery || haystack.includes(normalizedQuery)) {
                    eventMatches.push(materialized);
                }
            });
        });

        const filteredTasks = tasks.filter((task) => {
            if (effectiveDate && task.date !== effectiveDate) return false;
            if (importantOnly) return false;
            return !normalizedQuery || UIUtils.normalizeSearchText(`${task.text} ${task.date}`).includes(normalizedQuery);
        });

        const filteredNotes = notes.filter((note) => {
            if (effectiveDate && note.date !== effectiveDate) return false;
            if (importantOnly) return false;
            return !normalizedQuery || UIUtils.normalizeSearchText(`${note.text} ${note.date}`).includes(normalizedQuery);
        });

        const typedEvents = type === 'all' || type === 'events' || type === 'important'
            ? this.sortEvents(eventMatches)
            : [];
        const typedTasks = type === 'all' || type === 'tasks'
            ? filteredTasks.sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order)
            : [];
        const typedNotes = type === 'all' || type === 'notes'
            ? filteredNotes.sort((a, b) => a.date.localeCompare(b.date))
            : [];

        return {
            events: typedEvents,
            tasks: typedTasks,
            notes: typedNotes
        };
    }

    escapeIcsText(value) {
        return String(value || '')
            .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/,/g, '\\,')
            .replace(/;/g, '\\;');
    }

    formatIcsDate(date, time) {
        const normalizedDate = date.replace(/-/g, '');
        if (!time) {
            return {
                params: ';VALUE=DATE',
                value: normalizedDate
            };
        }

        return {
            params: '',
            value: `${normalizedDate}T${time.replace(':', '')}00`
        };
    }

    formatIcsTimestamp(date = new Date()) {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    }

    parseIcsDate(value) {
        const raw = value.trim();
        if (/^\d{8}$/.test(raw)) {
            return {
                date: `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`,
                time: null
            };
        }

        const match = raw.match(/^(\d{8})T(\d{2})(\d{2})/);
        if (!match) return null;
        return {
            date: `${match[1].slice(0, 4)}-${match[1].slice(4, 6)}-${match[1].slice(6, 8)}`,
            time: `${match[2]}:${match[3]}`
        };
    }

    async exportIcs() {
        const events = await this.getAllFromStore('events');
        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//OhMyBlock//Calendar//IT',
            'CALSCALE:GREGORIAN',
            'X-WR-CALNAME:OhMyBlock'
        ];

        events.map((event) => this.normalizeEvent(event)).forEach((event) => {
            const start = this.formatIcsDate(event.date, event.time);
            lines.push('BEGIN:VEVENT');
            lines.push(`UID:${event.id}@ohmyblock`);
            lines.push(`DTSTAMP:${this.formatIcsTimestamp()}`);
            lines.push(`DTSTART${start.params}:${start.value}`);
            lines.push(`SUMMARY:${this.escapeIcsText(event.text)}`);
            if (event.important) {
                lines.push('CATEGORIES:IMPORTANT');
            }
            lines.push('END:VEVENT');
        });

        lines.push('END:VCALENDAR');
        return `${lines.join('\r\n')}\r\n`;
    }

    async importIcs(content) {
        const entries = content.split('BEGIN:VEVENT').slice(1);
        let imported = 0;

        for (const entry of entries) {
            const summaryMatch = entry.match(/SUMMARY:(.+)/);
            const startMatch = entry.match(/DTSTART(?:;VALUE=DATE)?:(.+)|DTSTART;[^:]+:(.+)/);
            const rawStart = startMatch?.[1] || startMatch?.[2];
            if (!summaryMatch || !rawStart) continue;

            const parsedStart = this.parseIcsDate(rawStart);
            if (!parsedStart) continue;

            await this.saveEvent({
                date: parsedStart.date,
                time: parsedStart.time,
                text: summaryMatch[1].replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, '\n'),
                important: /CATEGORIES:IMPORTANT/.test(entry),
                completed: false,
                recurrence: 'none',
                recurrenceUntil: null
            });
            imported += 1;
        }

        return imported;
    }

    async exportBackup() {
        const [events, tasks, notes, meals, settings] = await Promise.all([
            this.getAllFromStore('events'),
            this.getAllFromStore('tasks'),
            this.getAllFromStore('notes'),
            this.getAllFromStore('meals'),
            this.getSettings()
        ]);

        return {
            version: 2,
            exportedAt: new Date().toISOString(),
            data: {
                events,
                tasks,
                notes,
                meals,
                settings
            }
        };
    }

    validateBackup(backup) {
        if (!backup || typeof backup !== 'object' || !backup.data) {
            throw new Error('Formato backup non valido');
        }

        ['events', 'tasks', 'notes', 'meals'].forEach((storeName) => {
            if (!Array.isArray(backup.data[storeName])) {
                throw new Error(`Backup non valido: manca ${storeName}`);
            }
        });

        if (!backup.data.settings || typeof backup.data.settings !== 'object') {
            throw new Error('Backup non valido: mancano le impostazioni');
        }
    }

    async importBackup(backup) {
        this.validateBackup(backup);

        const transaction = this.db.transaction(['events', 'tasks', 'notes', 'meals', 'settings'], 'readwrite');
        const storeNames = ['events', 'tasks', 'notes', 'meals'];

        storeNames.forEach((storeName) => {
            transaction.objectStore(storeName).clear();
        });
        transaction.objectStore('settings').clear();

        storeNames.forEach((storeName) => {
            backup.data[storeName].forEach((record) => {
                transaction.objectStore(storeName).put(record);
            });
        });

        transaction.objectStore('settings').put({
            ...this.getDefaultSettings(),
            ...backup.data.settings,
            id: 'user-settings'
        });

        await this.transactionDone(transaction);
    }
}

const dataStore = new DataStore();
