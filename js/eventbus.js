/**
 * EventBus - Simple pub/sub pattern for component communication
 */
class EventBus {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);

        return () => {
            this.events[event] = this.events[event].filter((cb) => cb !== callback);
        };
    }

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach((callback) => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for "${event}":`, error);
            }
        });
    }
}

const eventBus = new EventBus();

const EVENTS = {
    DATA_LOADED: 'data:loaded',
    DATA_CHANGED: 'data:changed',
    DATA_DELETED: 'data:deleted',
    VIEW_CHANGED: 'view:changed',
    DATE_CHANGED: 'date:changed',
    SETTINGS_CHANGED: 'settings:changed',
    SETTINGS_OPENED: 'settings:opened',
    SEARCH_CHANGED: 'search:changed',
    LOADING: 'ui:loading',
    ERROR: 'ui:error'
};
