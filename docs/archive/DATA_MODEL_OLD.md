# Data Model

## Persistenza
L'app usa `IndexedDB` con database `calendarDB`.

## Object stores

### events
Campi principali:
- `id`
- `date`
- `time`
- `text`
- `important`
- `completed`
- `type`

Indici:
- `date`
- `dateTime`
- `important`

### tasks
Campi principali:
- `id`
- `date`
- `text`
- `completed`
- `order`
- `type`

Indici:
- `date`
- `dateOrder`

### notes
Campi principali:
- `id`
- `date`
- `text`
- `type`

Indici:
- `date`

### meals
Campi principali:
- `id`
- `date`
- `mealType`
- `text`
- `type`

Indici:
- `date`
- `dateMealType`

### settings
Campi principali:
- `id`
- `startHour`
- `endHour`
- `interval`
- `primaryColor`
- `font`
- `theme`
- `layout`
- `lastView`
- `lastDate`

## Backup JSON
Il backup esportato contiene:
- `version`
- `exportedAt`
- `data.events`
- `data.tasks`
- `data.notes`
- `data.meals`
- `data.settings`

## Regole operative
- gli eventi sono ordinati per orario quando vengono letti
- le task sono ordinate per `order`
- le note sono una per data
- i pasti sono separati per `mealType`
- le impostazioni vengono applicate subito all'interfaccia
