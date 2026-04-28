/**
 * Settings Component
 */
class SettingsComponent {
    constructor() {
        this.modal = document.getElementById('settings-modal');
        this.closeBtn = document.getElementById('settings-close');
        this.resetBtn = document.getElementById('settings-reset');
        this.exportBtn = document.getElementById('export-backup');
        this.importBtn = document.getElementById('import-backup');
        this.importFileInput = document.getElementById('import-backup-file');
        this.changePinBtn = document.getElementById('change-pin');
        this.exportGoogleBtn = document.getElementById('export-google-ics');
        this.exportOutlookBtn = document.getElementById('export-outlook-ics');
        this.exportAppleBtn = document.getElementById('export-apple-ics');
        this.importIcsBtn = document.getElementById('import-ics');
        this.importIcsFileInput = document.getElementById('import-ics-file');

        this.inputs = {
            startHour: document.getElementById('start-hour'),
            endHour: document.getElementById('end-hour'),
            interval: document.getElementById('interval'),
            weekStartsOn: document.getElementById('week-start-select'),
            timeFormat: document.getElementById('time-format-select'),
            palette: document.getElementById('palette-select'),
            primaryColor: document.getElementById('primary-color'),
            font: document.getElementById('font-select'),
            theme: document.getElementById('theme-select'),
            layout: document.getElementById('layout-select'),
            density: document.getElementById('density-select'),
            minimalMode: document.getElementById('minimal-mode'),
            notificationsEnabled: document.getElementById('notifications-enabled'),
            reminderMinutes: document.getElementById('reminder-minutes'),
            lockMethod: document.getElementById('lock-method-select')
        };

        this.init();
    }

    init() {
        this.populateHourSelects();

        this.closeBtn.addEventListener('click', () => this.close());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.exportBtn.addEventListener('click', () => this.exportBackup());
        this.importBtn.addEventListener('click', () => this.importFileInput.click());
        this.importFileInput.addEventListener('change', (e) => this.handleImport(e));
        this.changePinBtn.addEventListener('click', () => this.configurePin());
        this.exportGoogleBtn.addEventListener('click', () => this.exportIcs('google'));
        this.exportOutlookBtn.addEventListener('click', () => this.exportIcs('outlook'));
        this.exportAppleBtn.addEventListener('click', () => this.exportIcs('apple'));
        this.importIcsBtn.addEventListener('click', () => this.importIcsFileInput.click());
        this.importIcsFileInput.addEventListener('change', (e) => this.handleIcsImport(e));

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        Object.entries(this.inputs).forEach(([key, input]) => {
            const eventName = input.type === 'checkbox' ? 'change' : 'change';
            input.addEventListener(eventName, () => this.handleChange(key, input));
        });

        eventBus.on(EVENTS.SETTINGS_OPENED, () => this.open());
    }

    populateHourSelects(timeFormat = '24h') {
        this.inputs.startHour.innerHTML = '';
        this.inputs.endHour.innerHTML = '';
        for (let i = 0; i < 24; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = DateUtils.formatTimeOption(i, 0, timeFormat);
            this.inputs.startHour.appendChild(option.cloneNode(true));
            this.inputs.endHour.appendChild(option);
        }
    }

    open() {
        appState.storeCurrentSettings();
        const settings = appState.getSettings();
        this.populateHourSelects(settings.timeFormat);

        Object.entries(this.inputs).forEach(([key, input]) => {
            if (input.type === 'checkbox') {
                input.checked = !!settings[key];
            } else {
                input.value = settings[key];
            }
        });

        this.syncLockControls();
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    async reset() {
        await appState.restoreSettings();
        this.open();
    }

    async handleChange(key, input) {
        const updates = {};
        const value = input.type === 'checkbox' ? input.checked : input.value;

        if (['startHour', 'endHour', 'interval', 'reminderMinutes', 'weekStartsOn'].includes(key)) {
            updates[key] = parseInt(value, 10);
        } else {
            updates[key] = value;
        }

        if (key === 'palette') {
            const paletteColor = UIUtils.getPaletteColor(value);
            if (paletteColor) {
                updates.primaryColor = paletteColor;
                this.inputs.primaryColor.value = paletteColor;
            }
        }

        if (key === 'primaryColor' && this.inputs.palette.value !== 'custom') {
            updates.palette = 'custom';
            this.inputs.palette.value = 'custom';
        }

        if (key === 'notificationsEnabled' && input.checked) {
            if (!('Notification' in window)) {
                input.checked = false;
                updates.notificationsEnabled = false;
                window.alert('Le notifiche non sono supportate da questo browser.');
                await appState.updateSettings(updates);
                return;
            }
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                input.checked = false;
                updates.notificationsEnabled = false;
            }
        }

        if (key === 'timeFormat') {
            this.populateHourSelects(value);
            this.inputs.startHour.value = String(appState.getSettings().startHour);
            this.inputs.endHour.value = String(appState.getSettings().endHour);
        }

        if (key === 'lockMethod') {
            const currentSettings = appState.getSettings();

            if (value === 'pin') {
                const configured = await this.configurePin();
                if (!configured) {
                    input.value = currentSettings.lockMethod;
                    this.syncLockControls();
                    return;
                }
                updates.lockMethod = 'pin';
            }

            if (value === 'biometric') {
                const credentialId = appLockComponent ? await appLockComponent.registerBiometricCredential() : '';
                if (!credentialId) {
                    input.value = currentSettings.lockMethod;
                    this.syncLockControls();
                    return;
                }
                updates.lockMethod = 'biometric';
                updates.lockPinHash = '';
                updates.biometricCredentialId = credentialId;
            }

            if (value === 'none') {
                updates.lockPinHash = '';
                updates.biometricCredentialId = '';
            }
        }

        await appState.updateSettings(updates);
        this.syncLockControls();
    }

    async configurePin() {
        const pin = window.prompt('Inserisci un PIN numerico di 4-8 cifre');
        if (!pin) return false;
        if (!/^\d{4,8}$/.test(pin)) {
            window.alert('Il PIN deve contenere tra 4 e 8 cifre.');
            return false;
        }

        const confirmPin = window.prompt('Conferma il PIN');
        if (pin !== confirmPin) {
            window.alert('I PIN non coincidono.');
            return false;
        }

        if (!appLockComponent) return false;
        const hash = await appLockComponent.hashPin(pin);
        await appState.updateSettings({
            lockMethod: 'pin',
            lockPinHash: hash,
            biometricCredentialId: ''
        });
        this.inputs.lockMethod.value = 'pin';
        this.syncLockControls();
        return true;
    }

    syncLockControls() {
        const lockMethod = this.inputs.lockMethod.value;
        this.changePinBtn.classList.toggle('hidden', lockMethod !== 'pin');
    }

    async exportBackup() {
        try {
            const backup = await dataStore.exportBackup();
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ohmyblock-backup-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export backup:', error);
            eventBus.emit(EVENTS.ERROR, error);
        }
    }

    async exportIcs(provider) {
        try {
            const content = await dataStore.exportIcs();
            const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ohmyblock-${provider}-${new Date().toISOString().slice(0, 10)}.ics`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export ics:', error);
            eventBus.emit(EVENTS.ERROR, error);
        }
    }

    async handleIcsImport(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const content = await file.text();
            const imported = await dataStore.importIcs(content);
            window.alert(`Importati ${imported} eventi dal file calendario.`);
            eventBus.emit(EVENTS.DATA_CHANGED, { type: 'ics-import' });
        } catch (error) {
            console.error('Failed to import ics:', error);
            eventBus.emit(EVENTS.ERROR, error);
            window.alert('File calendario non valido o non supportato.');
        } finally {
            event.target.value = '';
        }
    }

    async handleImport(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const content = await file.text();
            const backup = JSON.parse(content);

            if (!UIUtils.confirm('Importando il backup sovrascriverai i dati correnti. Continuare?')) {
                return;
            }

            await dataStore.importBackup(backup);
            await appState.init();
            eventBus.emit(EVENTS.DATA_CHANGED, { type: 'import' });
            this.open();
        } catch (error) {
            console.error('Failed to import backup:', error);
            eventBus.emit(EVENTS.ERROR, error);
            window.alert('Backup non valido o danneggiato.');
        } finally {
            event.target.value = '';
        }
    }
}

let settingsComponent;
