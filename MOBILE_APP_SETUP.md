# PeakForm Mobile App Setup

## Übersicht
Die PeakForm App ist jetzt in zwei Versionen verfügbar:
- **Web-Version** (`src/App.tsx`) - Vollständige Funktionen für Desktop
- **Mobile App** (`src/AppMobile.tsx`) - Vereinfachte Version nur mit Dashboard und Ernährung

## App-Version verwenden

### Option 1: Index.tsx ändern
Um die Mobile App zu verwenden, ändere in `src/index.tsx`:

```tsx
// Von:
import App from './App';

// Zu:
import App from './AppMobile';
```

### Option 2: Environment Variable
Du kannst auch eine Environment Variable verwenden:

```tsx
// In src/index.tsx
const App = process.env.REACT_APP_MOBILE_MODE === 'true' ? 
  require('./AppMobile').default : 
  require('./App').default;
```

Dann starte mit:
```bash
REACT_APP_MOBILE_MODE=true npm start
```

## Unterschiede zwischen den Versionen

### Web-Version (App.tsx)
- ✅ Vollständige Navigation (Dashboard, Heute, Ernährung, Kalender, Fortschritt, etc.)
- ✅ Alle Funktionen verfügbar
- ✅ Erweiterte Einstellungen
- ✅ Strava-Integration
- ✅ KI-Analyse
- ✅ Bibliothek

### Mobile App (AppMobile.tsx)
- ✅ Nur Dashboard und Ernährung
- ✅ Vereinfachte Navigation
- ✅ Automatische Synchronisation mit Firebase
- ✅ PWA-fähig
- ✅ Mobile-optimiert

## Synchronisation
Die Mobile App synchronisiert automatisch alle 10 Sekunden mit Firebase, sodass Daten zwischen App und PC geteilt werden.

## Zurück zur Web-Version
Um zur Web-Version zurückzukehren, ändere in `src/index.tsx`:

```tsx
// Von:
import App from './AppMobile';

// Zu:
import App from './App';
```
