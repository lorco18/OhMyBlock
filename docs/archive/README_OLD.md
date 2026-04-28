# Calendar PWA

Progressive Web App di agenda/calendario con viste giornaliera, settimanale e mensile.

## 🎯 Caratteristiche

- **Tre layout di visualizzazione:**
  - Giornaliero: orari dinamici, task, note, pasti
  - Settimanale: panoramica settimana con eventi
  - Mensile: griglia calendario con eventi importanti
  
- **PWA completa:**
  - Installabile su desktop e mobile
  - Funzionamento offline completo
  - Sincronizzazione automatica
  
- **Dati persistenti:**
  - IndexedDB per storage locale
  - Dati sincronizzati tra tutti i layout
  
- **Design iOS-like:**
  - Interfaccia minimal e pulita
  - Animazioni fluide
  - Touch-friendly

## 🏗️ Architettura

```
calendar-pwa/
├── index.html              # Entry point
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── css/                    # Stili
│   ├── main.css           # Globale + variabili
│   ├── header.css
│   ├── daily.css
│   ├── weekly.css
│   ├── monthly.css
│   └── settings.css
├── js/
│   ├── app.js             # Inizializzazione
│   ├── state.js           # Stato globale
│   ├── datastore.js       # IndexedDB wrapper
│   ├── eventbus.js        # Sistema eventi
│   ├── utils/
│   │   ├── date.js        # Helper date
│   │   └── ui.js          # Helper UI
│   ├── components/
│   │   ├── header.js
│   │   ├── settings.js
│   │   └── event-modal.js
│   └── views/
│       ├── daily.js
│       ├── weekly.js
│       └── monthly.js
└── assets/
    └── icons/             # Icone PWA
```

## 🚀 Installazione e Setup

### Requisiti
- Server web locale (es. Python, Node.js, Live Server)
- Browser moderno con supporto IndexedDB e Service Worker

### Avvio rapido

1. **Con Python:**
```bash
cd calendar-pwa
python -m http.server 8000
# Apri http://localhost:8000
```

2. **Con Node.js:**
```bash
npx serve calendar-pwa
```

3. **Con VS Code:**
Installa l'estensione "Live Server" e fai click destro su `index.html` → "Open with Live Server"

### Generazione icone PWA

Le icone devono essere create nelle seguenti dimensioni:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

Puoi usare tool online come:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Salva le icone in `/assets/icons/` con i nomi:
`icon-72.png`, `icon-96.png`, etc.

## 📱 Installazione come PWA

### Desktop (Chrome/Edge)
1. Apri l'app nel browser
2. Click sull'icona di installazione nella barra degli indirizzi
3. Segui le istruzioni

### iOS (Safari)
1. Apri l'app in Safari
2. Tap sul pulsante "Condividi"
3. Tap "Aggiungi a Home"

### Android (Chrome)
1. Apri l'app in Chrome
2. Tap sul menu (⋮)
3. Tap "Aggiungi a schermata Home"

## 🎨 Personalizzazione

### Impostazioni disponibili

**Funzionali:**
- Ora inizio giornata (0-23)
- Ora fine giornata (0-23)
- Intervallo orario (15m / 30m / 1h)

**Estetiche:**
- Colore principale (color picker)
- Font (Inter / SF Pro / Roboto / System)
- Tema (Chiaro / Scuro)
- Layout (Verticale / Orizzontale)

Tutte le modifiche hanno effetto immediato.

## 💾 Struttura Dati

### IndexedDB Schema

**events**
```javascript
{
  id: string,
  date: 'YYYY-MM-DD',
  time: 'HH:mm',
  text: string,
  important: boolean,
  completed: boolean
}
```

**tasks**
```javascript
{
  id: string,
  date: 'YYYY-MM-DD',
  text: string,
  completed: boolean,
  order: number
}
```

**notes**
```javascript
{
  id: string,
  date: 'YYYY-MM-DD',
  text: string
}
```

**meals**
```javascript
{
  id: string,
  date: 'YYYY-MM-DD',
  mealType: 'lunch' | 'snack' | 'dinner',
  text: string
}
```

**settings**
```javascript
{
  id: 'user-settings',
  startHour: number,
  endHour: number,
  interval: number,
  primaryColor: string,
  font: string,
  theme: string,
  layout: string,
  lastView: string,
  lastDate: string
}
```

## 🔄 Sincronizzazione Dati

- **Single Source of Truth:** Un unico modello dati in IndexedDB
- **Event-driven:** Modifiche propagate via EventBus
- **Real-time:** Aggiornamenti immediati su tutti i layout
- **Offline-first:** Tutte le operazioni funzionano offline

## 🧪 Testing

### Test manuale
1. Crea eventi in vista giornaliera
2. Passa a vista settimanale → verifica sincronizzazione
3. Passa a vista mensile → verifica visualizzazione
4. Modifica impostazioni → verifica applicazione
5. Testa offline (DevTools → Network → Offline)

### Debugging
- Apri DevTools → Console per log
- Application → IndexedDB per verificare dati
- Application → Service Workers per PWA status

## 🐛 Troubleshooting

### L'app non si carica
- Verifica che il server sia avviato
- Controlla Console per errori JavaScript
- Verifica che IndexedDB sia supportato

### Service Worker non si registra
- Deve essere servito via HTTPS o localhost
- Controlla DevTools → Application → Service Workers

### Dati non persistono
- Verifica che IndexedDB non sia disabilitato
- Controlla storage quota disponibile
- Verifica errori in Console

### Offline non funziona
- Verifica che Service Worker sia attivo
- Controlla Application → Cache Storage
- Prova a ricaricare l'app online prima

## 🔐 Privacy e Sicurezza

- **Dati locali:** Tutti i dati sono salvati solo sul dispositivo
- **Nessun server:** Nessuna comunicazione di rete (eccetto assets statici)
- **Storage isolato:** IndexedDB è isolato per origine

## 🚧 Sviluppo Futuro

Possibili estensioni:
- [ ] Export/Import dati (JSON, iCal)
- [ ] Sync cloud (opzionale)
- [ ] Widget per reminder
- [ ] Integrazione calendario Google
- [ ] Ricerca globale eventi
- [ ] Statistiche e analytics
- [ ] Temi personalizzati avanzati

## 📄 Licenza

MIT License - Libero per uso personale e commerciale.

## 🤝 Contributi

Per contribuire:
1. Fork del repository
2. Crea un branch per la feature
3. Commit delle modifiche
4. Push e apertura Pull Request

## 📞 Supporto

Per bug o richieste di feature, apri un issue su GitHub.

---

**Nota:** Questa è una PWA vanilla (senza framework). Per performance ottimali in produzione, considera bundling e minification dei file JS/CSS.
