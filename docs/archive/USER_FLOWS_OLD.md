# User Flows

## Avvio applicazione
1. L'app inizializza `IndexedDB`
2. Carica le impostazioni
3. Ripristina ultima vista e ultima data
4. Applica tema, font e colore
5. Renderizza la vista corrente

## Creazione evento nella daily view
1. L'utente scrive in uno slot orario
2. Il testo viene salvato automaticamente
3. Se necessario viene creato un nuovo record evento
4. L'evento resta associato alla fascia oraria

## Gestione evento nella weekly view
1. L'utente clicca `+` su un giorno per creare un evento
2. Oppure clicca un evento esistente per modificarlo
3. Il modal permette salvataggio o eliminazione
4. La vista si aggiorna con i dati nuovi

## Gestione task
1. L'utente crea una nuova task
2. Modifica il testo inline
3. Può marcarla completata
4. Può spostarla in alto o in basso
5. L'ordine viene salvato in modo persistente

## Gestione note
1. L'utente scrive nel campo note
2. Il salvataggio avviene automaticamente dopo debounce

## Gestione pasti
1. L'utente compila pranzo, merenda o cena
2. Ogni campo viene salvato automaticamente

## Cambio impostazioni
1. L'utente apre il modal impostazioni
2. Cambia uno o più valori
3. Le modifiche sono salvate subito
4. Tema, font e colore vengono applicati immediatamente

## Export backup
1. L'utente apre impostazioni
2. Preme `Esporta backup`
3. L'app genera un file JSON scaricabile

## Import backup
1. L'utente apre impostazioni
2. Preme `Importa backup`
3. Seleziona un file JSON
4. Conferma la sovrascrittura
5. I dati locali vengono rimpiazzati
6. L'app ricarica stato e vista corrente
