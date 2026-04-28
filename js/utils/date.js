/**
 * Date utility functions
 */
const DateUtils = {
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    parseDate(dateStr) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    },

    today() {
        return this.formatDate(new Date());
    },

    addDays(dateStr, days) {
        const date = this.parseDate(dateStr);
        date.setDate(date.getDate() + days);
        return this.formatDate(date);
    },

    addWeeks(dateStr, weeks) {
        return this.addDays(dateStr, weeks * 7);
    },

    addMonths(dateStr, months) {
        const date = this.parseDate(dateStr);
        date.setMonth(date.getMonth() + months);
        return this.formatDate(date);
    },

    diffDays(startDate, endDate) {
        const start = this.parseDate(startDate);
        const end = this.parseDate(endDate);
        const diff = end.getTime() - start.getTime();
        return Math.floor(diff / 86400000);
    },

    isBefore(dateA, dateB) {
        return dateA.localeCompare(dateB) < 0;
    },

    isAfter(dateA, dateB) {
        return dateA.localeCompare(dateB) > 0;
    },

    isSameOrBefore(dateA, dateB) {
        return dateA.localeCompare(dateB) <= 0;
    },

    isSameOrAfter(dateA, dateB) {
        return dateA.localeCompare(dateB) >= 0;
    },

    getWeekStart(dateStr, weekStartsOn = 1) {
        const date = this.parseDate(dateStr);
        const day = date.getDay();
        const diff = (day - weekStartsOn + 7) % 7;
        date.setDate(date.getDate() - diff);
        return this.formatDate(date);
    },

    getWeekEnd(dateStr, weekStartsOn = 1) {
        return this.addDays(this.getWeekStart(dateStr, weekStartsOn), 6);
    },

    getWeekDates(dateStr, weekStartsOn = 1) {
        const start = this.getWeekStart(dateStr, weekStartsOn);
        return Array.from({ length: 7 }, (_, index) => this.addDays(start, index));
    },

    getWeekdayLabels(weekStartsOn = 1, format = 'short') {
        const referenceSunday = new Date(2024, 0, 7);
        return Array.from({ length: 7 }, (_, index) => {
            const current = new Date(referenceSunday);
            current.setDate(referenceSunday.getDate() + ((weekStartsOn + index) % 7));
            return current.toLocaleDateString('it-IT', { weekday: format });
        });
    },

    getMonthCalendarDates(dateStr, weekStartsOn = 1) {
        const date = this.parseDate(dateStr);
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const firstDayOfWeek = firstDay.getDay();
        const startOffset = -((firstDayOfWeek - weekStartsOn + 7) % 7);
        const startDate = new Date(year, month, 1 + startOffset);

        return Array.from({ length: 42 }, (_, index) => {
            const current = new Date(startDate);
            current.setDate(startDate.getDate() + index);
            return {
                date: this.formatDate(current),
                isCurrentMonth: current.getMonth() === month
            };
        });
    },

    formatStoredTime(timeStr, timeFormat = '24h') {
        if (!timeStr) return '';
        const [hour, minute] = timeStr.split(':').map(Number);
        if (Number.isNaN(hour) || Number.isNaN(minute)) return timeStr;

        if (timeFormat === '12h') {
            const period = hour >= 12 ? 'PM' : 'AM';
            const normalizedHour = hour % 12 || 12;
            return `${normalizedHour}:${String(minute).padStart(2, '0')} ${period}`;
        }

        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    },

    formatTime(hour, minute = 0) {
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    },

    formatTimeOption(hour, minute = 0, timeFormat = '24h') {
        return this.formatStoredTime(this.formatTime(hour, minute), timeFormat);
    },

    combineDateTime(dateStr, timeStr) {
        if (!timeStr) return null;
        return new Date(`${dateStr}T${timeStr}:00`);
    },

    isToday(dateStr) {
        return dateStr === this.today();
    },

    getDay(dateStr) {
        return this.parseDate(dateStr).getDate();
    },

    getMonth(dateStr) {
        return this.parseDate(dateStr).getMonth();
    },

    getYear(dateStr) {
        return this.parseDate(dateStr).getFullYear();
    },

    isValidTime(timeStr) {
        return /^([01]?\d|2[0-3]):([0-5]\d)$/.test(timeStr || '');
    },

    getNextWeekday(dateStr, targetDay, includeCurrentDay = false) {
        const date = this.parseDate(dateStr);
        const currentDay = date.getDay();
        let delta = (targetDay - currentDay + 7) % 7;
        if (delta === 0 && !includeCurrentDay) {
            delta = 7;
        }
        date.setDate(date.getDate() + delta);
        return this.formatDate(date);
    },

    getMonthName(dateStr) {
        return this.parseDate(dateStr).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    },

    getDayName(dateStr) {
        return this.parseDate(dateStr).toLocaleDateString('it-IT', { weekday: 'long' });
    },

    getDayNameShort(dateStr) {
        return this.parseDate(dateStr).toLocaleDateString('it-IT', { weekday: 'short' });
    },

    formatDayMonth(dateStr) {
        return this.parseDate(dateStr).toLocaleDateString('it-IT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    }
};
