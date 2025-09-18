# 💾 PeakForm - Backup & Wiederherstellung

## 🔄 Automatisches Backup

### **Täglich automatisch:**
- Alle 24 Stunden wird ein Backup im LocalStorage erstellt
- Bei App-Start wird geprüft ob Backup nötig ist
- Automatische Wiederherstellung bei Datenverlust

### **Manuell über Settings:**
1. **⚙️ Settings** → **"Backup erstellen"**
2. **Erfolgs-Meldung** → Backup im LocalStorage gespeichert

## 📥 Daten exportieren

### **JSON-Export:**
1. **⚙️ Settings** → **"Daten exportieren"**
2. **Download:** `peakform-backup-YYYY-MM-DD.json`
3. **Enthält:** Alle Trainings, Stats, Badges, Einstellungen

## 🔧 Plan zurücksetzen

### **Kompletter Neustart:**
1. **⚙️ Settings** → **"Plan zurücksetzen"**
2. **Bestätigung** → Alle Daten werden gelöscht
3. **Automatisch:** Neuer 8-Wochen-Plan ab heute

## 📊 Speicher-Status prüfen

### **Storage-Übersicht:**
1. **⚙️ Settings** → **"Speicher-Status"**
2. **Anzeige:**
   - Sessions-Anzahl
   - Speicherverbrauch (KB)
   - Backup-Status
   - Letztes Backup-Datum

## 🚨 Notfall-Wiederherstellung

### **Bei Datenverlust:**
1. **App öffnen** → Automatische Backup-Wiederherstellung
2. **Falls kein Backup:** Neuer Plan wird erstellt
3. **Garantiert:** App funktioniert immer

### **Manuell wiederherstellen:**
1. **Browser-Cache leeren:** Strg + Shift + R
2. **LocalStorage prüfen:** F12 → Application → Local Storage
3. **Plan neu laden:** Settings → "Plan zurücksetzen"

## 🔍 Troubleshooting

### **Sessions werden nicht angezeigt:**
```powershell
# Browser-Cache komplett leeren
Strg + Shift + R

# Oder Settings → "Plan zurücksetzen"
```

### **Alte Version wird geladen:**
```powershell
# Hard Refresh
Strg + Shift + R

# Oder Browser komplett schließen und neu öffnen
```

### **LocalStorage-Probleme:**
```powershell
# F12 → Console → Eingeben:
localStorage.clear()
# Dann Seite neu laden
```

## 📱 PWA-Installation

### **Desktop (Chrome/Edge):**
1. **Install-Button** in der Adressleiste
2. **Oder:** Menü → "PeakForm installieren"
3. **App startet** in eigenem Fenster

### **Mobile (iOS/Android):**
1. **Browser-Menü** → "Zur Startseite hinzufügen"
2. **App-Icon** erscheint auf Homescreen
3. **Offline-Funktionalität** verfügbar

## 🗂️ Datei-Struktur

```
PeakForm/
├── src/
│   ├── components/     # React Komponenten
│   ├── data/          # Trainingsplan & Badges
│   ├── services/      # Strava API
│   ├── utils/         # Storage Management
│   └── types/         # TypeScript Definitionen
├── public/            # PWA Assets
└── build/             # Production Build
```

## 💡 Wichtige Hinweise

- **Daten bleiben lokal** (kein Server erforderlich)
- **Offline-Funktionalität** durch PWA
- **Automatische Backups** verhindern Datenverlust
- **Cross-Platform** kompatibel
- **Privacy-First** - keine Daten verlassen dein Gerät

---

**Bei Problemen:** Settings → "Plan zurücksetzen" löst fast alle Probleme! 🔧
