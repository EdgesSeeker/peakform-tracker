# 🏋️‍♂️ PeakForm - Hybrid Training Tracker

Eine moderne Progressive Web App (PWA) für dein 8-Wochen Hybrid-Training mit Kraft- und Ausdauerelementen.

## ✨ Features

### 📊 Dashboard
- **Wochenübersicht** mit 6-7 Trainingseinheiten
- **Fortschrittsbalken** für Kraft vs. Ausdauer-Anteil
- **Quick-Check** für Schlaf, Ernährung und Stress-Level
- **Upcoming Sessions** mit direkter Completion-Funktion

### 📅 Kalender/Wochenplan
- **8-Wochen Hybridplan** vollständig integriert
- **Detailansicht** für jede Woche
- **Kalender-Export** (.ics Format für Google/Apple/Outlook)
- **Checkbox-System** für erledigte Einheiten

### 📈 Auswertung/Fortschritt
- **Kraft-Tracking**: Verlauf von Squat, Deadlift, Bench Press, Pull-ups
- **Ausdauer-Diagramme**: Distanz, Pace, Watt-Entwicklung
- **Kumulative Statistiken**: Gesamt-km gelaufen/geradelt/geschwommen
- **Persönliche Rekorde** automatisch getrackt

### 🏆 Gamification
- **Badge-System**: 12 verschiedene Achievements
- **Punkte-System**: 10+ Punkte pro Session mit Boni
- **Streak-Tracking**: Aktuelle und längste Serie
- **Motivations-Features**: Nächste Ziele und Herausforderungen

### 📱 PWA-Features
- **Installierbar** als App auf Smartphone/Desktop
- **Offline-Funktionalität** durch Service Worker
- **Responsive Design** für alle Bildschirmgrößen
- **Native App-Feeling** mit Standalone-Modus

## 🏋️‍♂️ 8-Wochen Hybridplan

### Wochenstruktur:
- **Montag**: Lange Einheit (Lauf/Rad abwechselnd)
- **Dienstag**: Kraft Beine/Core
- **Mittwoch**: Schwimmen
- **Donnerstag**: Kraft Oberkörper  
- **Freitag**: Rad Intervalle
- **Samstag**: Kraft Ganzkörper
- **Sonntag**: Yoga/Recovery

### Progression:
- **Woche 1-2**: Grundlage & Technik
- **Woche 3-4**: Volumen steigern
- **Woche 5-6**: Intensität erhöhen
- **Woche 7-8**: Peak vor Deload

## 🚀 Installation & Start

1. **Dependencies installieren**:
   ```bash
   npm install
   ```

2. **Development Server starten**:
   ```bash
   npm start
   ```

3. **Production Build erstellen**:
   ```bash
   npm run build
   ```

4. **Als PWA installieren**:
   - Browser öffnen (Chrome/Edge/Safari)
   - Auf "App installieren" klicken
   - Oder manuell über Browser-Menü

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React
- **PWA**: Service Worker + Web App Manifest
- **Data**: LocalStorage (persistent)
- **Build**: Create React App

## 📊 Datenstruktur

### TrainingSession
```typescript
interface TrainingSession {
  id: string;
  type: 'cardio' | 'strength' | 'swimming' | 'yoga';
  title: string;
  duration: number;
  completed: boolean;
  exercises?: Exercise[];
  distance?: number;
  // ... weitere Felder
}
```

### UserStats & Gamification
- Punkte-System mit Bonusfaktoren
- Badge-Achievements automatisch getrackt
- Personal Records aus Sessions berechnet
- Streak-Algorithmus für Motivation

## 🎯 Geplante Features

### Phase 2 (Integrationen):
- **Strava API**: Automatisches Importieren von Aktivitäten
- **Google Calendar API**: Bidirektionale Synchronisation
- **Benachrichtigungen**: Push-Notifications für Training

### Phase 3 (Erweitert):
- **Social Features**: Freunde, Challenges, Leaderboards
- **KI-Coach**: Personalisierte Trainingsempfehlungen
- **Ernährungs-Tracking**: Integration mit MyFitnessPal

## 📱 PWA Installation

### Android:
1. Chrome öffnen → peakform.app
2. Menü → "Zur Startseite hinzufügen"
3. App-Icon erscheint auf Homescreen

### iOS:
1. Safari öffnen → peakform.app  
2. Teilen → "Zum Home-Bildschirm"
3. App startet wie native App

### Desktop:
1. Chrome/Edge → Install-Button in Adressleiste
2. Oder: Menü → "PeakForm installieren"
3. App startet in eigenem Fenster

## 🎨 Design-System

- **Primärfarbe**: Blue (#0ea5e9)
- **Sekundärfarbe**: Purple (#d946ef)  
- **Erfolg**: Green (#22c55e)
- **Schriftart**: Inter (Google Fonts)
- **Komponenten**: Modulares Card-System
- **Animationen**: Smooth Transitions & Micro-Interactions

## 🔧 Customization

### Badge-System erweitern:
```typescript
// src/data/badges.ts
export const badgeDefinitions: Badge[] = [
  {
    id: 'new-badge',
    name: 'Neues Achievement',
    description: 'Beschreibung der Anforderung',
    icon: '🏆',
    category: 'special'
  }
];
```

### Training-Plan anpassen:
```typescript
// src/data/hybridPlan.ts
// Übungen, Sätze, Wiederholungen nach Bedarf ändern
```

## 📄 Lizenz

MIT License - Frei für persönliche und kommerzielle Nutzung.

---

**Viel Erfolg mit deinem Hybrid-Training! 💪🏃‍♂️🏊‍♂️**
