# OhMyBlock Calendar

## Project Snapshot

OhMyBlock Calendar e una Progressive Web App di organizzazione personale costruita in HTML, CSS e JavaScript vanilla, con persistenza locale tramite IndexedDB e supporto offline tramite Service Worker.

Il progetto nasce come agenda visuale semplice da usare su desktop e mobile, ma abbastanza flessibile da gestire:
- pianificazione giornaliera
- overview settimanale
- panoramica mensile
- task, note e pasti
- personalizzazione dell'interfaccia
- backup locale dei dati

## Obiettivo del progetto

L'obiettivo era creare un'applicazione web leggera, installabile e immediata, senza framework e senza backend, mantenendo comunque una struttura modulare e facilmente estendibile.

## Problema risolto

Molte app calendario sono ricche di funzionalita ma lente, dispersive o dipendenti dal cloud. Questo progetto punta invece su:
- rapidita di accesso
- zero dipendenze runtime
- dati privati salvati in locale
- esperienza d'uso chiara anche su schermi piccoli

## Cosa fa l'app

L'app permette di:
- gestire eventi su base giornaliera, settimanale e mensile
- segnare eventi importanti o completati
- modificare ed eliminare eventi anche dalla vista settimanale
- creare, completare e riordinare task
- salvare note e pasti per ogni giorno
- personalizzare tema, font, colore e layout
- esportare e importare un backup JSON completo

## Scelte tecniche principali

- `Single-page app` con rendering dinamico delle viste
- `AppState` centrale per vista corrente, data e impostazioni
- `EventBus` per la comunicazione tra moduli
- `DataStore` come wrapper unico per IndexedDB
- viste separate per `daily`, `weekly`, `monthly`
- componenti dedicati per header, impostazioni e modal eventi

## Valore portfolio

Questo progetto e interessante da portfolio perche mostra:
- organizzazione del codice in moduli chiari
- uso di API browser reali come IndexedDB e Service Worker
- attenzione a UX, responsive design e persistenza dati
- refactor progressivo con pulizia del codice e riduzione duplicazioni
- documentazione tecnica e prodotto separata

## Stato attuale

Il progetto e funzionante come app locale/PWA e include gia una base solida per evoluzioni future come:
- eventi ricorrenti
- notifiche
- ricerca
- sync cloud opzionale
