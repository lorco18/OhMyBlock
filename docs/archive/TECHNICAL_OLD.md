# Technical Documentation - Calendar PWA

## 📐 Architettura Dettagliata

### Pattern Architetturale: MVC-like

```
┌─────────────────────────────────────────────────┐
│                   View Layer                    │
│  (DailyView, WeeklyView, MonthlyView)          │
│  - Rendering UI                                 │
│  - Event handling                               │
│  - User interactions                            │
└──────────────────┬──────────────────────────────┘
                   │ EventBus
┌──────────────────▼──────────────────────────────┐
│               Controller Layer                   │
│  (AppState, Components)                         │
│  - State management                             │
│  - Navigation logic                             │
│  - Settings management                          │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│                Model Layer                       │
│  (DataStore)                                    │
│  - Data persistence                             │
│  - CRUD operations                              │
│  - IndexedDB wrapper                            │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              Storage Layer                       │
│  (IndexedDB)                                    │
│  - Browser storage                              │
│  - Indexed queries                              │
│  - Transactional                                │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Flusso Dati

### Creazione Evento

```
User Input (Event Modal)
    ↓
EventModalComponent.save()
    ↓
DataStore.saveEvent(event)
    ↓
IndexedDB.put(event)
    ↓
EventBus.emit('DATA_CHANGED', event)
    ↓
All Views listening → re-render
```

### Cambio Vista

```
User Click (Layout Toggle)
    ↓
HeaderComponent.handleLayoutToggle()
    ↓
AppState.setCurrentView(newView)
    ↓
EventBus.emit('VIEW_CHANGED', newView)
    ↓
CalendarApp.renderCurrentView()
    ↓
View.render(currentDate)
```

---

## 💾 IndexedDB Schema Dettagliato

### Database: calendarDB (version: 1)

#### Object Store: events
```javascript
{
  keyPath: 'id',
  indexes: {
    'date': { keyPath: 'date', unique: false },
    'dateTime': { keyPath: ['date', 'time'], unique: false },
    'important': { keyPath: 'important', unique: false }
  }
}
```

**Query patterns:**
- Get events by date: `index('date').getAll(dateStr)`
- Get events by range: `index('date').getAll(IDBKeyRange.bound(start, end))`
- Get important events: `index('important').getAll(true)`

#### Object Store: tasks
```javascript
{
  keyPath: 'id',
  indexes: {
    'date': { keyPath: 'date', unique: false },
    'dateOrder': { keyPath: ['date', 'order'], unique: false }
  }
}
```

**Query patterns:**
- Get tasks by date: `index('date').getAll(dateStr)`
- Get sorted tasks: `index('dateOrder').getAll()`

#### Object Store: notes
```javascript
{
  keyPath: 'id',
  indexes: {
    'date': { keyPath: 'date', unique: false }
  }
}
```

**Note:** Una nota per data (one-to-one relationship)

#### Object Store: meals
```javascript
{
  keyPath: 'id',
  indexes: {
    'date': { keyPath: 'date', unique: false },
    'dateMealType': { keyPath: ['date', 'mealType'], unique: false }
  }
}
```

**Query patterns:**
- Get all meals for date: `index('date').getAll(dateStr)`
- Get specific meal: `index('dateMealType').get([dateStr, mealType])`

#### Object Store: settings
```javascript
{
  keyPath: 'id'  // Always 'user-settings'
}
```

**Single record store** - no indexes needed

---

## 🎨 CSS Architecture

### Variabili CSS (CSS Custom Properties)

```css
:root {
  /* Colors - iOS-inspired */
  --primary-color: #007AFF;
  --background: #FFFFFF;
  --surface: #F2F2F7;
  --text-primary: #000000;
  --text-secondary: #8E8E93;
  
  /* Spacing - 8px base unit */
  --spacing-xs: 4px;   /* 0.5 unit */
  --spacing-sm: 8px;   /* 1 unit */
  --spacing-md: 16px;  /* 2 units */
  --spacing-lg: 24px;  /* 3 units */
  
  /* Border radius - rounded corners */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 14px;
  
  /* Typography - system fonts */
  --font-family: 'Inter', -apple-system, sans-serif;
  --font-size-base: 16px;
  --font-weight-regular: 400;
  --font-weight-semibold: 600;
}
```

### Dark Theme

Implementato via attribute selector:
```css
[data-theme="dark"] {
  --background: #000000;
  --surface: #1C1C1E;
  --text-primary: #FFFFFF;
}
```

### Responsive Strategy

**Mobile-first approach:**
```css
/* Base styles (mobile) */
.element { ... }

/* Tablet */
@media (min-width: 768px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }
```

---

## 🧩 Component Lifecycle

### View Component Lifecycle

```javascript
class DailyView {
  constructor(container) {
    // Initialize instance variables
  }
  
  async render(date) {
    // 1. Load data from IndexedDB
    await this.loadData()
    
    // 2. Build HTML
    const html = this.buildHTML()
    
    // 3. Update DOM
    this.container.innerHTML = html
    
    // 4. Attach event listeners
    this.attachEventListeners()
  }
  
  attachEventListeners() {
    // Event delegation pattern
    this.container.addEventListener('click', (e) => {
      // Handle all clicks
    })
  }
}
```

### Component Communication

**EventBus pattern:**
```javascript
// Publisher
eventBus.emit(EVENTS.DATA_CHANGED, { type: 'event', data })

// Subscriber
eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
  // React to change
})
```

---

## ⚡ Performance Optimizations

### 1. Event Delegation
Instead of attaching listeners to each element:
```javascript
// ❌ Bad
items.forEach(item => {
  item.addEventListener('click', handler)
})

// ✅ Good
container.addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    handler(e)
  }
})
```

### 2. Debouncing
Reduce function calls for rapid events:
```javascript
const debouncedSave = UIUtils.debounce(async (input) => {
  await dataStore.saveEvent(...)
}, 500) // Wait 500ms after last input
```

### 3. Lazy Loading
Load data only when needed:
```javascript
// Load only current month for monthly view
const startDate = this.calendarDates[0].date
const endDate = this.calendarDates[41].date
this.data.events = await dataStore.getEventsByDateRange(start, end)
```

### 4. Virtual Scrolling (Future)
For large datasets, implement virtual scrolling to render only visible items.

---

## 🔐 Security Considerations

### XSS Prevention
Always escape user input:
```javascript
// ✅ Escaped
element.textContent = userInput  // Safe
element.innerHTML = UIUtils.escapeHTML(userInput)  // Safe

// ❌ Dangerous
element.innerHTML = userInput  // XSS vulnerability!
```

### Data Validation
```javascript
// Validate before saving
if (!text || text.length > 1000) {
  return // Reject
}
```

### IndexedDB Security
- Data is origin-isolated
- No cross-site access
- Cleared on browser data clear

---

## 📱 PWA Lifecycle

### Installation Flow

```
1. User visits site (HTTPS required)
   ↓
2. Browser detects manifest.json
   ↓
3. Service Worker registers
   ↓
4. Browser shows "Install" prompt
   ↓
5. User clicks "Install"
   ↓
6. App installed to home screen
   ↓
7. Can launch offline
```

### Update Flow

```
1. New version deployed
   ↓
2. Service Worker detects changes
   ↓
3. New SW installed (waiting)
   ↓
4. User closes all tabs
   ↓
5. New SW activates
   ↓
6. Old cache deleted
   ↓
7. New resources cached
```

---

## 🧪 Testing Strategy

### Unit Tests (Future Implementation)

```javascript
// Example test structure
describe('DateUtils', () => {
  test('formatDate returns correct format', () => {
    const date = new Date(2024, 0, 15)
    expect(DateUtils.formatDate(date)).toBe('2024-01-15')
  })
})
```

### Integration Tests

Test data flow:
```javascript
test('Event created in daily view appears in weekly', async () => {
  // Create event
  await dataStore.saveEvent({...})
  
  // Check weekly view has it
  const events = await dataStore.getEventsByDate(date)
  expect(events).toContainEvent(...)
})
```

### E2E Tests (Future)

Using Playwright or Cypress:
```javascript
test('User can create and complete task', async () => {
  await page.goto('/')
  await page.click('.task-add')
  await page.fill('.task-input', 'Test task')
  await page.click('.task-checkbox')
  
  // Verify task is completed
  expect(await page.locator('.task-input').getAttribute('class'))
    .toContain('completed')
})
```

---

## 🔧 Debugging

### IndexedDB Inspector

```javascript
// Console utility to inspect DB
async function inspectDB() {
  const events = await dataStore.getEventsByDateRange('2024-01-01', '2024-12-31')
  console.table(events)
}
```

### Service Worker Debug

```javascript
// Check registration
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW State:', reg?.active?.state)
})

// Force update
navigator.serviceWorker.getRegistration().then(reg => {
  reg?.update()
})
```

### Performance Monitoring

```javascript
// Measure render time
performance.mark('render-start')
await view.render(date)
performance.mark('render-end')
performance.measure('render', 'render-start', 'render-end')
console.log(performance.getEntriesByName('render')[0].duration)
```

---

## 🚀 Future Enhancements

### 1. Sync API
```javascript
// Background sync when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-events') {
    event.waitUntil(syncPendingEvents())
  }
})
```

### 2. Push Notifications
```javascript
// Reminder notifications
if ('Notification' in window) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      new Notification('Event reminder', {
        body: 'Meeting in 15 minutes',
        icon: '/assets/icons/icon-192.png'
      })
    }
  })
}
```

### 3. Web Share API
```javascript
// Share events
if (navigator.share) {
  navigator.share({
    title: 'Calendar Event',
    text: event.text,
    url: window.location.href
  })
}
```

### 4. IndexedDB Sync
Cloud sync using Firebase or custom backend:
```javascript
async function syncToCloud() {
  const localEvents = await dataStore.getAllEvents()
  const response = await fetch('/api/sync', {
    method: 'POST',
    body: JSON.stringify(localEvents)
  })
  const cloudEvents = await response.json()
  // Merge and resolve conflicts
}
```

---

## 📊 Performance Benchmarks

### Target Metrics

- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.0s
- **Speed Index:** < 3.0s
- **Total Bundle Size:** < 200KB (uncompressed)
- **Service Worker Activation:** < 500ms

### Optimization Techniques

1. **Code Splitting:** Separate views into modules
2. **Tree Shaking:** Remove unused code
3. **Compression:** Gzip/Brotli
4. **Lazy Loading:** Load resources on demand
5. **Caching Strategy:** Aggressive caching with SW

---

## 🔗 External Dependencies

**Zero runtime dependencies!**

Optional dev dependencies:
- Python 3 (dev server)
- Pillow (icon generation)
- Lighthouse (PWA audit)

---

## 📚 Resources

### Documentation
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [IndexedDB Guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox) (optional SW library)

---

**Documentazione completa e sempre aggiornata!** 📖
