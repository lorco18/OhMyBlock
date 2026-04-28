# Architecture Reference

## High-level structure

### Entry point
- `index.html`

### Core modules
- `js/app.js`: avvio app e render della vista corrente
- `js/state.js`: stato globale
- `js/datastore.js`: persistenza locale e backup
- `js/eventbus.js`: comunicazione evento-driven

### Components
- `js/components/header.js`
- `js/components/settings.js`
- `js/components/event-modal.js`

### Views
- `js/views/daily.js`
- `js/views/weekly.js`
- `js/views/monthly.js`

### Utilities
- `js/utils/date.js`
- `js/utils/ui.js`

## Rendering model

L'app usa una sola pagina HTML e sostituisce il contenuto di `#app-content` in base alla vista attiva.

Le viste sono istanze persistenti, ma il loro contenuto viene renderizzato nuovamente quando cambia:
- vista
- data
- parte dei dati mostrati
- impostazioni che influenzano il layout

## State model

Lo stato applicativo comprende:
- `currentView`
- `currentDate`
- `settings`
- `isLoading`

Le impostazioni salvano anche:
- ultima vista aperta
- ultima data aperta

## Persistence

IndexedDB contiene gli store:
- `events`
- `tasks`
- `notes`
- `meals`
- `settings`

Il `DataStore` incapsula:
- CRUD base
- query per data e range
- export backup
- import backup

## Communication pattern

L'app usa un `EventBus` semplice per disaccoppiare moduli e componenti.

Eventi principali:
- `VIEW_CHANGED`
- `DATE_CHANGED`
- `DATA_CHANGED`
- `DATA_DELETED`
- `SETTINGS_CHANGED`
- `SETTINGS_OPENED`

## UI composition

### Daily view
- agenda a slot orari
- sezione task
- sezione note
- sezione pasti

### Weekly view
- card per ogni giorno della settimana
- sezione task
- sezione note

### Monthly view
- griglia calendario
- preview eventi

## Notable implementation details

- salvataggi input con `debounce`
- riordino task persistito tramite campo `order`
- modal evento riusato sia per creazione sia per modifica
- backup JSON completo con sovrascrittura del database locale
