# PeakForm Mobile App starten

## Mobile App starten
```bash
REACT_APP_MOBILE_MODE=true npm start
```

## Web-Version starten (Standard)
```bash
npm start
```

## Was ist anders in der Mobile App?

### ✅ Nur diese Funktionen:
- **Dashboard** - Training und Übersicht
- **Ernährung** - Protein-Tracking und Gewicht

### ❌ Entfernt:
- Kalender
- Fortschritt
- Strava-Integration
- KI-Analyse
- Bibliothek
- Erweiterte Einstellungen

### 🔄 Automatische Synchronisation:
- Alle 10 Sekunden mit Firebase
- Daten werden zwischen App und PC geteilt
- Keine manuelle Übertragung nötig

## Zurück zur Web-Version
Einfach ohne die Umgebungsvariable starten:
```bash
npm start
```
