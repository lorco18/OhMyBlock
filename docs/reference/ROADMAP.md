# Product Roadmap

## Visione

OhMyBlock deve evolvere da agenda locale ben fatta a organizer personale rapido, elegante e molto pratico su mobile, senza perdere i suoi punti forti:
- zero backend
- dati locali
- struttura semplice
- velocita di utilizzo

La priorita non e aggiungere funzioni a caso. La priorita e ridurre attrito, migliorare leggibilita e rendere piu veloce ogni azione frequente.

## Obiettivi di prodotto

1. Ridurre i tap necessari per inserire e modificare dati.
2. Rendere piu chiara la gerarchia visiva tra contenuto principale e secondario.
3. Migliorare il comportamento mobile e la densita informativa su schermi piccoli.
4. Rendere ricerca, task e ricorrenze piu utili nella pratica quotidiana.
5. Preparare il progetto a una crescita di dati senza peggiorare la percezione di velocita.

## Stato attuale

L'app include gia:
- viste `daily`, `weekly`, `monthly` e `statistics`
- eventi con completamento, importanza e ricorrenza base
- task con ordinamento manuale
- note e pasti
- ricerca globale
- reminder locali
- backup export/import
- impostazioni di tema, layout, densita e font

Il prodotto e gia completo per una demo forte. La roadmap qui sotto serve a renderlo piu maturo e competitivo in UX.

## Priorita Alta

### 1. Quick Add globale

Obiettivo:
- inserire eventi o task da un solo campo, con meno passaggi e meno modal

Perche conta:
- e la miglioria con piu impatto sull'uso reale
- porta l'app verso il comportamento delle app migliori di calendario e produttivita

Esempi:
- `Call Luca domani 15:30`
- `Studiare matematica lunedi 18:00`
- `Task: finire slide venerdi`

Impatto:
- molto alto

Effort:
- medio

Aree da toccare:
- [index.html](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\index.html)
- [js/components/header.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\components\header.js)
- [js/utils/date.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\utils\date.js)
- nuovo parser dedicato in `js/utils`
- [js/datastore.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\datastore.js)

### 2. Weekly view piu pratica su mobile

Obiettivo:
- rendere la settimana piu veloce da navigare su schermi piccoli
Direzione consigliata:
- strip orizzontale dei giorni in alto
- dettaglio del giorno selezionato sotto
- mantenere la lista verticale attuale come fallback desktop o layout alternativo

Perche conta:
- oggi la vista settimanale e utile ma lunga
- su mobile il focus si disperde

Impatto:
- molto alto

Effort:
- medio

Aree da toccare:
- [js/views/weekly.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\views\weekly.js)
- [css/weekly.css](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\css\weekly.css)
- [css/main.css](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\css\main.css)

### 3. Search piu utile e navigabile

Obiettivo:
- trasformare la ricerca da filtro base a strumento operativo

Migliorie:
- chips rapide `Oggi`, `Importanti`, `Task`, `Note`, `Con orario`
- risultati cliccabili che aprono direttamente il giorno corretto
- highlight del testo cercato
- stato vuoto piu curato

Impatto:
- alto

Effort:
- medio

Aree da toccare:
- [js/app.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\app.js)
- [js/components/header.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\components\header.js)
- [js/datastore.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\datastore.js)
- [css/main.css](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\css\main.css)

## Priorita Media

### 4. Vista mensile piu ricca

Obiettivo:
- fare della monthly view una vera overview, non solo una griglia cliccabile

Migliorie:
- selezione del giorno piu evidente
- mini riepilogo del giorno selezionato
- indicatori di densita eventi
- pill eventi piu leggibili

Impatto:
- alto

Effort:
- medio

Aree da toccare:
- [js/views/monthly.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\views\monthly.js)
- [css/monthly.css](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\css\monthly.css)

### 5. Migliore integrazione tra task ed eventi

Obiettivo:
- far percepire task ed eventi come parti dello stesso flusso organizzativo

Migliorie:
- conversione task -> evento
- task in scadenza piu visibili nel calendario
- carry-over delle task incomplete
- sezione `Up next` o `Da recuperare`

Impatto:
- alto

Effort:
- medio-alto

Aree da toccare:
- [js/views/daily.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\views\daily.js)
- [js/views/weekly.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\views\weekly.js)
- [js/views/monthly.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\views\monthly.js)
- [js/datastore.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\datastore.js)

### 6. Rifinitura visuale completa

Obiettivo:
- rendere l'app piu premium e coerente, soprattutto su iPhone

Migliorie:
- stati `active`, `pressed` e `selected` piu leggibili
- migliore gerarchia tra blocchi primari e secondari
- riduzione del rumore iconografico
- modali e action surface piu curate
- header che si compatta allo scroll

Impatto:
- medio-alto

Effort:
- medio

Aree da toccare:
- [css/main.css](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\css\main.css)
- [css/header.css](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\css\header.css)
- [css/daily.css](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\css\daily.css)
- [css/weekly.css](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\css\weekly.css)
- [css/monthly.css](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\css\monthly.css)
- [css/settings.css](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\css\settings.css)

## Priorita Media-Bassa

### 7. Performance e rendering incrementale

Obiettivo:
- evitare rerender completi quando basta aggiornare una porzione della vista

Migliorie:
- update locali del singolo slot o task
- update del singolo giorno in weekly/monthly
- caching leggero per la ricerca
- evitare salvataggi ridondanti se il valore non cambia

Impatto:
- medio

Effort:
- medio

Aree da toccare:
- [js/app.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\app.js)
- [js/views/daily.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\views\daily.js)
- [js/views/weekly.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\views\weekly.js)
- [js/views/monthly.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\views\monthly.js)
- [js/datastore.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\datastore.js)

### 8. Template e scorciatoie

Obiettivo:
- velocizzare la creazione di contenuti frequenti

Migliorie:
- template evento
- template task
- duplicazione rapida
- preset di ricorrenza comuni

Impatto:
- medio

Effort:
- medio

Aree da toccare:
- [js/components/event-modal.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\components\event-modal.js)
- [js/views/daily.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\views\daily.js)
- [js/datastore.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\datastore.js)

### 9. Statistiche piu utili

Obiettivo:
- trasformare la pagina statistiche in una dashboard piccola ma davvero utile

Migliorie:
- completamento task per giorno e settimana
- giorni piu pieni
- eventi importanti completati
- trend ultimi 7 giorni

Impatto:
- medio

Effort:
- basso-medio

Aree da toccare:
- [js/views/statistics.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\views\statistics.js)
- [js/datastore.js](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\js\datastore.js)
- [css/main.css](C:\Users\Lorenzo\Desktop\CRW\ITS\COSE IN-UTILI\OhMyBlock2.2\css\main.css)

## Priorita Bassa

### 10. Contesti o mini-calendar sets

Obiettivo:
- separare meglio vita personale, studio, lavoro o routine

Migliorie:
- tag o contesti semplici
- filtro per contesto
- viste dedicate

Impatto:
- medio

Effort:
- alto

### 11. Sync opzionale

Obiettivo:
- mantenere l'app locale-first ma aprire in futuro a sincronizzazione o multi-device

Nota:
- da non affrontare ora se l'obiettivo principale resta portfolio, leggerezza e zero backend

Impatto:
- alto

Effort:
- molto alto

## Quick Wins consigliati

Se vuoi muoverti in modo pragmatico, farei prima questi quattro step:

1. Quick Add globale.
2. Risultati ricerca cliccabili con chips rapide.
3. Weekly mobile ridisegnata.
4. Vista mensile con riepilogo del giorno selezionato.

Questi quattro interventi migliorano davvero percezione di qualita, velocita e praticita senza cambiare identita al progetto.

## Metriche utili

Per capire se le modifiche stanno andando nella direzione giusta:
- tempo medio per creare un evento
- numero di tap per aggiungere un task
- numero di tap per trovare un elemento con la ricerca
- tempo medio per passare da mese a giorno e modificare qualcosa
- fluidita percepita su mobile nelle viste `daily` e `weekly`

## Sequenza consigliata

### Fase 1
- quick add
- search migliorata
- fix UX mobile della weekly

### Fase 2
- monthly view piu forte
- integrazione task/eventi
- rifinitura visuale completa

### Fase 3
- performance incrementali
- template
- statistiche migliori

### Fase 4
- contesti
- eventuale sync opzionale

## Nota finale

Il punto forte di OhMyBlock non deve diventare la complessita. Deve diventare la sensazione di controllo immediato: apri, capisci, scrivi, organizzi, chiudi.
