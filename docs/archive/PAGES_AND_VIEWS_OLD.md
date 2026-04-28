# Pages And Views

## Struttura generale
L'app è una single-page application. Non esistono più pagine HTML separate: il contenuto cambia dinamicamente dentro `#app-content`.

## Header
Elementi principali:
- pulsante precedente
- titolo dinamico
- pulsante impostazioni
- pulsante cambio vista
- pulsante successivo

Comportamenti:
- `precedente` e `successivo` cambiano giorno, settimana o mese in base alla vista attiva
- il titolo cambia automaticamente in base alla data e alla vista
- il toggle vista scorre tra `daily`, `weekly`, `monthly`

## Daily View
Scopo:
visualizzare nel dettaglio una singola giornata.

Sezioni:
- agenda oraria
- task
- note
- pasti

Funzioni principali:
- creare o modificare un evento direttamente in una fascia oraria
- marcare evento importante
- marcare evento completato
- eliminare evento
- aggiungere task
- modificare task
- segnare task completata
- riordinare task
- scrivere note del giorno
- salvare pranzo, merenda e cena

## Weekly View
Scopo:
vedere i 7 giorni della settimana corrente con riepilogo eventi e area laterale per task e note.

Sezioni:
- lista giorni della settimana
- task settimana
- note settimana

Funzioni principali:
- aggiungere un evento a un giorno
- aprire un evento esistente e modificarlo
- eliminare un evento esistente
- vedere evidenza visiva di eventi importanti e completati
- aggiungere task
- modificare task
- completare task
- riordinare task
- scrivere note della settimana

Nota:
le task e le note settimanali sono salvate sulla `currentDate` della settimana visualizzata.

## Monthly View
Scopo:
fornire una panoramica del mese con anteprima degli eventi.

Contenuto per ogni giorno:
- numero giorno
- fino a 2 eventi importanti mostrati come testo
- eventi normali mostrati come puntini
- indicatore `+N` per eventi nascosti

Funzioni principali:
- vedere rapidamente carico del mese
- distinguere i giorni del mese corrente da quelli esterni alla griglia
- passare al dettaglio giornaliero cliccando su un giorno

## Settings Modal
Sezioni:
- orari
- aspetto
- backup

Funzioni:
- impostare ora inizio
- impostare ora fine
- impostare intervallo slot
- cambiare colore principale
- cambiare font
- cambiare tema chiaro/scuro
- cambiare layout verticale/orizzontale
- esportare backup JSON
- importare backup JSON
- ripristinare impostazioni precedenti aperte nel modal

## Event Modal
Modal usato nella vista settimanale.

Modalità:
- nuovo evento
- modifica evento

Funzioni:
- inserire testo evento
- inserire orario
- salvare evento
- eliminare evento esistente
