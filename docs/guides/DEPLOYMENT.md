# Deployment Guide - Calendar PWA

## 📦 Opzioni di Hosting

### 1. GitHub Pages (Gratuito)

**Setup:**
```bash
# 1. Crea repository su GitHub
# 2. Carica i file
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/calendar-pwa.git
git push -u origin main

# 3. Abilita GitHub Pages
# Vai su: Settings → Pages → Source: main branch
```

**URL finale:** `https://USERNAME.github.io/calendar-pwa/`

**Nota:** Aggiorna `start_url` e `scope` nel `manifest.json`:
```json
{
  "start_url": "/calendar-pwa/",
  "scope": "/calendar-pwa/"
}
```

---

### 2. Netlify (Gratuito)

**Deploy via drag & drop:**
1. Vai su https://app.netlify.com/drop
2. Trascina la cartella `calendar-pwa`
3. App online in secondi!

**Deploy via CLI:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

**Features:**
- HTTPS automatico
- Deploy continui da Git
- Custom domain gratuito

---

### 3. Vercel (Gratuito)

**Deploy:**
```bash
npm i -g vercel
vercel login
cd calendar-pwa
vercel
```

**Features:**
- Deploy automatici da GitHub
- Performance analytics
- Edge network globale

---

### 4. Firebase Hosting (Gratuito)

**Setup:**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Seleziona la directory: .
# Configure as single-page app: No
firebase deploy
```

**Features:**
- CDN globale
- SSL automatico
- Integrazione con altri servizi Firebase

---

### 5. Self-Hosting (Server proprio)

**Requisiti minimi:**
- Web server (Apache, Nginx, Caddy)
- HTTPS (obbligatorio per Service Worker)
- Supporto HTTP/2 (consigliato)

**Esempio Nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name calendar.tuodominio.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/calendar-pwa;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # No cache for HTML and manifest
    location ~* \.(html|json)$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

---

## ⚡ Ottimizzazioni Pre-Deploy

### 1. Minificazione

**CSS:**
```bash
# Usando cssnano
npm install -g cssnano-cli
cssnano css/main.css css/main.min.css
```

**JavaScript:**
```bash
# Usando terser
npm install -g terser
terser js/app.js -c -m -o js/app.min.js
```

**Aggiorna riferimenti in `index.html`**

### 2. Compressione Gzip

La maggior parte degli host moderni comprime automaticamente.

**Verifica manuale:**
```bash
# Pre-compressione con gzip
find . -name "*.js" -o -name "*.css" | while read file; do
    gzip -c "$file" > "$file.gz"
done
```

### 3. Image Optimization

**Icone:**
```bash
# Usando optipng
optipng -o7 assets/icons/*.png
```

### 4. Service Worker Versioning

Aggiorna `CACHE_NAME` in `sw.js` ad ogni deploy:
```javascript
const CACHE_NAME = 'calendar-pwa-v2'; // Incrementa versione
```

---

## 🔒 Checklist Pre-Produzione

- [ ] **HTTPS attivo** (obbligatorio per PWA)
- [ ] **Manifest.json valido** (usa https://manifest-validator.appspot.com/)
- [ ] **Service Worker registrato** (verifica in DevTools)
- [ ] **Icone corrette** (tutte le dimensioni presenti)
- [ ] **Test offline** (DevTools → Network → Offline)
- [ ] **Test installazione** (prova su mobile)
- [ ] **Lighthouse score** (>90 PWA)
- [ ] **Cross-browser test** (Chrome, Safari, Firefox, Edge)
- [ ] **Responsive test** (mobile, tablet, desktop)
- [ ] **Performance test** (PageSpeed Insights)

---

## 🧪 Testing PWA

### Lighthouse

```bash
# Via Chrome DevTools
# DevTools → Lighthouse → Generate report

# Via CLI
npm install -g lighthouse
lighthouse https://tuo-url.com --view
```

**Target scores:**
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90
- PWA: 100

### PWA Builder

Testa compatibilità PWA:
https://www.pwabuilder.com/

### Browser DevTools

**Chrome:**
- Application → Manifest
- Application → Service Workers
- Application → Cache Storage
- Application → IndexedDB

**Firefox:**
- Debugger → Manifest
- Application → Service Workers

---

## 🌐 Custom Domain

### Netlify
```bash
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Aggiungi dominio in: Site settings → Domain management
```

### Vercel
```json
// vercel.json
{
  "routes": [
    { "src": "/(.*)", "dest": "/" }
  ]
}
```

### GitHub Pages
- Settings → Pages → Custom domain
- Aggiungi CNAME record al tuo DNS

---

## 📊 Monitoring

### Analytics (opzionale)

**Google Analytics:**
```html
<!-- Prima del </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### Error Tracking

**Sentry (opzionale):**
```html
<script src="https://browser.sentry-cdn.com/7.x.x/bundle.min.js"></script>
<script>
  Sentry.init({ dsn: 'YOUR_DSN' });
</script>
```

---

## 🔄 Aggiornamenti

### Strategia di Update

1. **Incrementa versione** cache in `sw.js`
2. **Deploy** nuovi file
3. **Service Worker** auto-aggiorna al reload successivo

**Notifica utente (opzionale):**
```javascript
// In sw.js
self.addEventListener('activate', (event) => {
  // Invia messaggio ai client
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'APP_UPDATED',
        version: 'v2.0.0'
      });
    });
  });
});
```

---

## 🐛 Troubleshooting Deploy

### Service Worker non funziona
- ✅ Verifica HTTPS attivo
- ✅ Controlla percorsi in `sw.js`
- ✅ Verifica scope corretto

### Manifest non rilevato
- ✅ Valida JSON syntax
- ✅ Verifica Content-Type: `application/manifest+json`
- ✅ Controlla percorso in `<link>`

### Icone non caricate
- ✅ Verifica percorsi relativi
- ✅ Controlla CORS headers
- ✅ Verifica dimensioni file

### Cache non aggiorna
- ✅ Incrementa `CACHE_NAME`
- ✅ Cancella cache browser
- ✅ Hard refresh (Ctrl+Shift+R)

---

## 📱 Test su Dispositivi Reali

### iOS
1. Apri Safari
2. Vai all'URL
3. Condividi → Aggiungi a Home
4. Apri da Home screen
5. Testa funzionalità

### Android
1. Apri Chrome
2. Vai all'URL
3. Menu → Installa app
4. Apri drawer apps
5. Testa funzionalità

---

## ✅ Go Live Checklist

- [ ] Tutti i file minificati
- [ ] Icone ottimizzate
- [ ] HTTPS configurato
- [ ] Domain configurato
- [ ] Service Worker testato
- [ ] Cross-browser test OK
- [ ] Mobile test OK
- [ ] Lighthouse score >90
- [ ] Analytics configurato (opzionale)
- [ ] Backup database (se presente)
- [ ] Documentazione aggiornata

---

**Pronto per il deploy!** 🚀

Scegli la piattaforma più adatta alle tue esigenze e segui la guida corrispondente.
