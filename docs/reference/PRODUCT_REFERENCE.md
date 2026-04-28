# Product Reference

## Views

### Daily
Funzioni:
- creare e modificare eventi inline
- marcare evento importante
- marcare evento completato
- eliminare evento
- aggiungere task
- completare task
- riordinare task
- scrivere note
- salvare pasti

### Weekly
Funzioni:
- creare eventi con modal
- modificare eventi esistenti
- eliminare eventi esistenti
- vedere eventi importanti e completati
- gestire task
- riordinare task
- salvare note

### Monthly
Funzioni:
- overview mese
- visualizzazione eventi importanti come testo
- eventi normali come indicatori
- apertura del giorno selezionato

## Settings

Parametri disponibili:
- `startHour`
- `endHour`
- `interval`
- `primaryColor`
- `font`
- `theme`
- `layout`

## Data entities

### Event
- `id`
- `date`
- `time`
- `text`
- `important`
- `completed`

### Task
- `id`
- `date`
- `text`
- `completed`
- `order`

### Note
- `id`
- `date`
- `text`

### Meal
- `id`
- `date`
- `mealType`
- `text`

## Backup format

Il backup contiene:
- `version`
- `exportedAt`
- `data.events`
- `data.tasks`
- `data.notes`
- `data.meals`
- `data.settings`

## Current strengths

- semplice da capire
- nessuna dipendenza runtime
- dati completamente locali
- adatta a demo, studio e portfolio

## Possible next steps

- eventi ricorrenti
- reminder/notifiche
- ricerca globale
- categorie eventi
- sync cloud opzionale
