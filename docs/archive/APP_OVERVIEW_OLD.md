# App Overview

## Nome progetto
OhMyBlock Calendar

## Descrizione
Applicazione web calendario in stile PWA con salvataggio locale su `IndexedDB`.

## Obiettivo
Gestire rapidamente giornata, settimana e mese in un'unica interfaccia, con focus su:
- eventi
- task
- note
- pasti
- personalizzazione grafica
- backup locale

## Tecnologie principali
- HTML statico con una sola pagina
- CSS modulare per viste e componenti
- JavaScript vanilla
- IndexedDB per persistenza locale
- Service Worker per comportamento PWA

## Architettura sintetica
- `index.html`: shell principale dell'app
- `js/app.js`: bootstrap e render della vista corrente
- `js/state.js`: stato globale applicazione
- `js/datastore.js`: accesso ai dati e backup
- `js/eventbus.js`: comunicazione tra componenti
- `js/components/*`: header, impostazioni, modale eventi
- `js/views/*`: rendering delle viste daily, weekly, monthly

## Viste disponibili
- Daily view
- Weekly view
- Monthly view

## Dati gestiti
- eventi
- task
- note
- pasti
- impostazioni utente

## Persistenza
Tutti i dati sono salvati localmente nel browser. Non è presente un backend remoto.
