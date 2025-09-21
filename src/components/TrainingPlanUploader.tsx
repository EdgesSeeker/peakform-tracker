import React, { useState } from 'react';
import { TrainingSession } from '../types';

interface TrainingPlanUploaderProps {
  onUploadPlan: (weekNumber: number, sessions: TrainingSession[]) => void;
}

const TrainingPlanUploader: React.FC<TrainingPlanUploaderProps> = ({ onUploadPlan }) => {
  const [weekNumber, setWeekNumber] = useState<number>(2);
  const [planText, setPlanText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const parsePlanText = (text: string, week: number): TrainingSession[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const sessions: TrainingSession[] = [];
    let currentDay = 1;
    
    // Basis-Datum für die Woche (korrekte Startdaten)
    let weekStartDate: Date;
    if (week === 1) {
      weekStartDate = new Date(2024, 8, 16); // 16.09.2024 (Montag Woche 1)
    } else if (week === 2) {
      weekStartDate = new Date(2024, 8, 22); // 22.09.2024 (Montag Woche 2)
    } else {
      // Für andere Wochen: Standard-Berechnung
      const baseDate = new Date(2024, 8, 16); // 16.09.2024 (Montag Woche 1)
      weekStartDate = new Date(baseDate);
      weekStartDate.setDate(baseDate.getDate() + ((week - 1) * 7));
    }
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Erkenne Wochentage
      if (trimmed.match(/^(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag)/i)) {
        const dayMap: { [key: string]: number } = {
          'montag': 1, 'dienstag': 2, 'mittwoch': 3, 'donnerstag': 4,
          'freitag': 5, 'samstag': 6, 'sonntag': 7
        };
        const dayName = trimmed.split(/[\s–-]/)[0].toLowerCase();
        currentDay = dayMap[dayName] || currentDay;
        continue;
      }
      
      // Erkenne Workouts (beginnen mit Zahl + "Min")
      if (trimmed.match(/^\d+\s*[Mm]in/)) {
        const session = parseWorkoutLine(trimmed, week, currentDay, weekStartDate);
        if (session) {
          sessions.push(session);
        }
      }
    }
    
    return sessions;
  };

  const parseWorkoutLine = (line: string, week: number, day: number, weekStartDate: Date): TrainingSession | null => {
    const sessionDate = new Date(weekStartDate);
    sessionDate.setDate(weekStartDate.getDate() + (day - 1));
    
    // Extrahiere Dauer
    const durationMatch = line.match(/(\d+)\s*[Mm]in/);
    const duration = durationMatch ? parseInt(durationMatch[1]) : 60;
    
    // Bestimme Typ basierend auf Keywords
    let type: 'cardio' | 'strength' | 'swimming' | 'yoga' | 'recovery' = 'cardio';
    let subtype: 'running' | 'cycling' | 'intervals' | 'legs' | 'upper' | 'fullbody' | 'meditation' | 'stretching' | 'breathing' | undefined;
    let distance: number | undefined;
    let pace: string | undefined;
    
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('kraft') || lowerLine.includes('kniebeuge') || lowerLine.includes('bankdrück')) {
      type = 'strength';
      if (lowerLine.includes('bein') || lowerLine.includes('core')) subtype = 'legs';
      else if (lowerLine.includes('oberkörp')) subtype = 'upper';
      else subtype = 'fullbody';
    } else if (lowerLine.includes('schwimm')) {
      type = 'swimming';
      // Extrahiere Distanz aus Text wie "1.8 km" oder "1800m"
      const distanceMatch = line.match(/(\d+(?:\.\d+)?)\s*km|(\d+)\s*m/);
      if (distanceMatch) {
        distance = distanceMatch[1] ? parseFloat(distanceMatch[1]) : parseInt(distanceMatch[2]) / 1000;
      }
    } else if (lowerLine.includes('yoga') || lowerLine.includes('mobility')) {
      type = 'yoga';
      subtype = 'stretching';
    } else if (lowerLine.includes('meditation') || lowerLine.includes('atem') || lowerLine.includes('stretch')) {
      type = 'recovery';
      if (lowerLine.includes('meditation')) subtype = 'meditation';
      else if (lowerLine.includes('atem')) subtype = 'breathing';
      else subtype = 'stretching';
    } else if (lowerLine.includes('lauf')) {
      type = 'cardio';
      subtype = 'running';
      // Extrahiere Pace
      const paceMatch = line.match(/(\d+:\d+)[-–]?(\d+:\d+)?/);
      if (paceMatch) {
        pace = paceMatch[2] ? `${paceMatch[1]}-${paceMatch[2]}` : paceMatch[1];
      }
      // Extrahiere Distanz
      const distanceMatch = line.match(/(\d+(?:\.\d+)?)\s*km/);
      if (distanceMatch) {
        distance = parseFloat(distanceMatch[1]);
      }
    } else if (lowerLine.includes('rad') || lowerLine.includes('bike')) {
      type = 'cardio';
      subtype = lowerLine.includes('intervall') ? 'intervals' : 'cycling';
      // Extrahiere Distanz
      const distanceMatch = line.match(/(\d+(?:\.\d+)?)\s*km/);
      if (distanceMatch) {
        distance = parseFloat(distanceMatch[1]);
      }
    }
    
    // Extrahiere Titel (ersten Teil vor Doppelpunkt oder Klammer)
    let title = line.replace(/^\d+\s*[Mm]in\s*/, '').split(/[:(]/)[0].trim();
    if (title.length < 3) title = line.split(/[:(]/)[0].trim();
    
    const session: TrainingSession = {
      id: `plan-w${week}-d${day}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      subtype,
      title,
      description: line,
      duration,
      completed: false,
      date: sessionDate,
      week,
      day,
      distance,
      pace,
      notes: line
    };
    
    return session;
  };

  const handleUpload = () => {
    if (!planText.trim()) {
      alert('Bitte gib einen Trainingsplan ein!');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const sessions = parsePlanText(planText, weekNumber);
      console.log(`📋 ${sessions.length} Sessions für Woche ${weekNumber} erstellt:`, sessions.map(s => s.title));
      
      onUploadPlan(weekNumber, sessions);
      
      // Reset
      setPlanText('');
      alert(`✅ ${sessions.length} Sessions für Woche ${weekNumber} erfolgreich hinzugefügt!`);
    } catch (error) {
      console.error('❌ Fehler beim Parsen des Plans:', error);
      alert('❌ Fehler beim Verarbeiten des Plans. Bitte überprüfe das Format.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        📋 Trainingsplan hochladen
      </h3>
      
      <div className="space-y-4">
        {/* Woche auswählen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Woche auswählen:
          </label>
          <select
            value={weekNumber}
            onChange={(e) => setWeekNumber(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(week => (
              <option key={week} value={week}>Woche {week}</option>
            ))}
          </select>
        </div>
        
        {/* Plan eingeben */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trainingsplan (Format: "Montag – Übung"):
          </label>
          <textarea
            value={planText}
            onChange={(e) => setPlanText(e.target.value)}
            placeholder={`Beispiel:

Montag – Laufen + Yoga
70 Min lockerer Dauerlauf (Zone 2, 6:20–6:40/km)
20 Min Yoga (Mobilität: Hüfte, Beinrückseite)
10 Min Atemübungen

Dienstag – Kraft Beine/Core
60 Min Kraft Beine/Core: Kniebeugen 4×8–10
20 Min Stretching (Beine, Hüfte)
10 Min Meditation`}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          />
        </div>
        
        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={isProcessing || !planText.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Verarbeite...
            </>
          ) : (
            <>
              📤 Plan für Woche {weekNumber} hochladen
            </>
          )}
        </button>
      </div>
      
      {/* Hilfe */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
          💡 Format-Hilfe:
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Wochentage: "Montag", "Dienstag", etc.</li>
          <li>• Workouts: "70 Min Laufen", "60 Min Kraft", etc.</li>
          <li>• Automatische Erkennung von Typ, Dauer, Distanz</li>
          <li>• Mehrere Workouts pro Tag möglich</li>
        </ul>
      </div>
    </div>
  );
};

export default TrainingPlanUploader;
