/**
 * App Lock Component
 */
class AppLockComponent {
    constructor() {
        this.screen = document.getElementById('app-lock-screen');
        this.description = document.getElementById('app-lock-description');
        this.pinGroup = document.getElementById('app-lock-pin-group');
        this.pinInput = document.getElementById('app-lock-pin-input');
        this.pinSubmit = document.getElementById('app-lock-pin-submit');
        this.bioGroup = document.getElementById('app-lock-bio-group');
        this.bioSubmit = document.getElementById('app-lock-bio-submit');
    }

    init() {
        this.pinSubmit.addEventListener('click', () => this.unlockWithPin());
        this.bioSubmit.addEventListener('click', () => this.unlockWithBiometric());
        this.pinInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.unlockWithPin();
            }
        });
    }

    async ensureUnlocked() {
        const settings = appState.getSettings();
        if (!settings || settings.lockMethod === 'none') {
            this.hide();
            return true;
        }

        this.screen.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        if (settings.lockMethod === 'pin') {
            this.description.textContent = 'Inserisci il PIN per sbloccare l\'app.';
            this.pinGroup.classList.remove('hidden');
            this.bioGroup.classList.add('hidden');
            window.setTimeout(() => this.pinInput.focus(), 50);
            return false;
        }

        this.description.textContent = 'Usa l\'autenticazione biometrica del dispositivo per sbloccare l\'app.';
        this.pinGroup.classList.add('hidden');
        this.bioGroup.classList.remove('hidden');
        return false;
    }

    hide() {
        this.screen.classList.add('hidden');
        document.body.style.overflow = '';
        this.pinInput.value = '';
    }

    async hashPin(pin) {
        const data = new TextEncoder().encode(pin);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(digest))
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join('');
    }

    toBase64Url(uint8Array) {
        return btoa(String.fromCharCode(...uint8Array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    fromBase64Url(value) {
        const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
        return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
    }

    randomBytes(length = 32) {
        return crypto.getRandomValues(new Uint8Array(length));
    }

    async registerBiometricCredential() {
        if (!window.PublicKeyCredential || !navigator.credentials?.create) {
            window.alert('La biometria non e supportata da questo browser.');
            return '';
        }

        try {
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge: this.randomBytes(),
                    rp: { name: 'OhMyBlock' },
                    user: {
                        id: this.randomBytes(16),
                        name: 'local-user',
                        displayName: 'OhMyBlock User'
                    },
                    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required',
                        residentKey: 'preferred'
                    },
                    timeout: 60000,
                    attestation: 'none'
                }
            });

            return this.toBase64Url(new Uint8Array(credential.rawId));
        } catch (error) {
            console.error('Failed to register biometric credential:', error);
            window.alert('Registrazione biometrica annullata o non riuscita.');
            return '';
        }
    }

    async unlockWithPin() {
        const settings = appState.getSettings();
        const hash = await this.hashPin(this.pinInput.value);
        if (hash !== settings.lockPinHash) {
            window.alert('PIN non corretto.');
            this.pinInput.select();
            return;
        }

        this.hide();
    }

    async unlockWithBiometric() {
        const settings = appState.getSettings();
        if (!settings.biometricCredentialId || !window.PublicKeyCredential || !navigator.credentials?.get) {
            window.alert('Biometria non disponibile su questo dispositivo.');
            return;
        }

        try {
            await navigator.credentials.get({
                publicKey: {
                    challenge: this.randomBytes(),
                    allowCredentials: [{
                        id: this.fromBase64Url(settings.biometricCredentialId),
                        type: 'public-key'
                    }],
                    userVerification: 'required',
                    timeout: 60000
                }
            });
            this.hide();
        } catch (error) {
            console.error('Failed to unlock with biometrics:', error);
            window.alert('Sblocco biometrico non riuscito.');
        }
    }
}

let appLockComponent;
