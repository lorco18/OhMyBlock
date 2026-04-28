# Quick Start

## Avvio locale

### Opzione 1: server Python semplice
```bash
python -m http.server 8000
```

Poi apri:
`http://localhost:8000`

### Opzione 2: script locale presente nel progetto
```bash
python assets/dev-server.py
```

## Come provare l'app

1. Apri la vista giornaliera
2. Inserisci un evento in uno slot orario
3. Aggiungi una task
4. Passa alla vista settimanale dal toggle header
5. Clicca un evento settimanale per modificarlo
6. Apri le impostazioni e prova tema o colore
7. Esporta un backup dal modal impostazioni

## Flussi principali da testare

### Daily view
- scrittura evento inline
- importante / completato / elimina
- task con riordino
- note
- pasti

### Weekly view
- nuovo evento
- modifica evento esistente
- eliminazione evento esistente
- task con riordino
- note

### Monthly view
- visualizzazione eventi
- apertura giorno dal calendario

## Dove guardare se qualcosa non va

- console browser
- scheda Application > IndexedDB
- scheda Application > Service Worker
