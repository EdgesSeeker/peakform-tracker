import React, { useState, useEffect } from 'react';
import { TrainingSession } from '../types';
import { 
  AlertTriangle, 
  Check, 
  X, 
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  Zap
} from 'lucide-react';

interface DuplicateMatch {
  plannedSession: TrainingSession;
  stravaSession: TrainingSession;
  confidence: number;
  reason: string;
}

interface DuplicateWorkoutCleanerProps {
  sessions: TrainingSession[];
  onUpdateSession: (session: TrainingSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

const DuplicateWorkoutCleaner: React.FC<DuplicateWorkoutCleanerProps> = ({
  sessions,
  onUpdateSession,
  onDeleteSession
}) => {
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [processing, setProcessing] = useState(false);
  const [ignoredDuplicates, setIgnoredDuplicates] = useState<Set<string>>(() => {
    // Lade ignorierte Duplikate aus localStorage
    const saved = localStorage.getItem('peakform-ignored-duplicates');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Funktion zum Speichern ignorierter Duplikate
  const saveIgnoredDuplicates = (newIgnored: Set<string>) => {
    setIgnoredDuplicates(newIgnored);
    localStorage.setItem('peakform-ignored-duplicates', JSON.stringify(Array.from(newIgnored)));
  };

  // Generiere eindeutige ID für ein Duplikat-Paar
  const getDuplicateId = (planned: TrainingSession, strava: TrainingSession) => {
    return `${planned.id}-${strava.id}`;
  };

  const findDuplicates = () => {
    const plannedSessions = sessions.filter(s => !s.isAdditionalWorkout && !s.id.includes('strava'));
    const stravaWorkouts = sessions.filter(s => s.id.includes('strava') || s.isAdditionalWorkout);
    
    const matches: DuplicateMatch[] = [];

    plannedSessions.forEach(planned => {
      stravaWorkouts.forEach(strava => {
        const duplicateId = getDuplicateId(planned, strava);
        
        // Überspringe ignorierte Duplikate
        if (ignoredDuplicates.has(duplicateId)) {
          return;
        }
        
        const confidence = calculateMatchConfidence(planned, strava);
        if (confidence > 60) { // Mindestens 60% Übereinstimmung
          matches.push({
            plannedSession: planned,
            stravaSession: strava,
            confidence,
            reason: getMatchReason(planned, strava)
          });
        }
      });
    });

    // Sortiere nach Confidence (beste Matches zuerst)
    matches.sort((a, b) => b.confidence - a.confidence);
    
    // Entferne überlappende Matches (eine Session kann nur einmal gematcht werden)
    const uniqueMatches: DuplicateMatch[] = [];
    const usedPlanned = new Set<string>();
    const usedStrava = new Set<string>();

    matches.forEach(match => {
      if (!usedPlanned.has(match.plannedSession.id) && !usedStrava.has(match.stravaSession.id)) {
        uniqueMatches.push(match);
        usedPlanned.add(match.plannedSession.id);
        usedStrava.add(match.stravaSession.id);
      }
    });

    setDuplicates(uniqueMatches);
    return uniqueMatches;
  };

  const calculateMatchConfidence = (planned: TrainingSession, strava: TrainingSession): number => {
    let confidence = 0;
    
    // Tag-Übereinstimmung (±1 Tag)
    const dayDiff = Math.abs(planned.day - strava.day);
    if (dayDiff === 0) {
      confidence += 40;
    } else if (dayDiff === 1) {
      confidence += 25;
    }

    // Typ-Übereinstimmung
    if (planned.type === strava.type) {
      confidence += 30;
      
      if (planned.subtype === strava.subtype) {
        confidence += 15;
      }
    }

    // Spezielle Rad-Intervall Erkennung
    if (planned.title.toLowerCase().includes('rad') && 
        strava.title.toLowerCase().includes('rad')) {
      confidence += 25;
    }

    // Dauer-Ähnlichkeit (±30%)
    if (planned.duration && strava.duration) {
      const durationDiff = Math.abs(planned.duration - strava.duration) / planned.duration;
      if (durationDiff < 0.3) {
        confidence += 15;
      }
    }

    return Math.min(100, confidence);
  };

  const getMatchReason = (planned: TrainingSession, strava: TrainingSession): string => {
    const reasons = [];
    
    if (planned.day === strava.day) {
      reasons.push('Gleicher Tag');
    }
    
    if (planned.type === strava.type) {
      reasons.push('Gleicher Typ');
    }
    
    if (planned.title.toLowerCase().includes('rad') && 
        strava.title.toLowerCase().includes('rad')) {
      reasons.push('Rad-Training');
    }

    return reasons.join(', ');
  };

  const resolveDuplicate = (match: DuplicateMatch, action: 'replace' | 'keep-both') => {
    if (action === 'replace') {
      // Markiere geplante Session als erledigt und lösche Strava-Import
      const updatedPlanned = {
        ...match.plannedSession,
        completed: true,
        notes: `Ersetzt durch Strava: ${match.stravaSession.title}`,
        duration: match.stravaSession.duration,
        distance: match.stravaSession.distance,
        calories: match.stravaSession.calories
      };
      
      onUpdateSession(updatedPlanned);
      onDeleteSession(match.stravaSession.id);
      
      console.log(`🔄 Duplikat aufgelöst: ${match.plannedSession.title} ersetzt ${match.stravaSession.title}`);
    }
    
    // Entferne aus Duplikate-Liste
    setDuplicates(prev => prev.filter(d => 
      d.plannedSession.id !== match.plannedSession.id && 
      d.stravaSession.id !== match.stravaSession.id
    ));
  };

  const resolveAllDuplicates = () => {
    setProcessing(true);
    
    duplicates.forEach(match => {
      resolveDuplicate(match, 'replace');
    });
    
    setTimeout(() => {
      setProcessing(false);
      alert(`${duplicates.length} Duplikat${duplicates.length > 1 ? 'e' : ''} aufgelöst! 🎉`);
    }, 500);
  };

  useEffect(() => {
    const foundDuplicates = findDuplicates();
    if (foundDuplicates.length > 0) {
      console.log(`⚠️ ${foundDuplicates.length} mögliche Duplikate gefunden`);
    }
  }, [sessions]);

  if (duplicates.length === 0) {
    return null; // Keine Duplikate, nichts anzeigen
  }

  return (
    <div className="card border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Mögliche Duplikate gefunden
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {duplicates.length} geplante Session{duplicates.length > 1 ? 's' : ''} könnte{duplicates.length > 1 ? 'n' : ''} durch Strava-Workouts ersetzt werden
          </p>
        </div>
        <button
          onClick={resolveAllDuplicates}
          disabled={processing}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {processing ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
          Alle auflösen
        </button>
        
        {ignoredDuplicates.size > 0 && (
          <button
            onClick={() => {
              if (window.confirm(`${ignoredDuplicates.size} dauerhaft ignorierte Duplikate zurücksetzen?`)) {
                saveIgnoredDuplicates(new Set());
                // Duplikate neu suchen
                const newDuplicates = findDuplicates();
                setDuplicates(newDuplicates);
                console.log('🔄 Ignorierte Duplikate zurückgesetzt');
              }
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Reset ({ignoredDuplicates.size})
          </button>
        )}
      </div>

      <div className="space-y-3">
        {duplicates.map((match, index) => {
          const plannedDate = new Date(match.plannedSession.date);
          const stravaDate = new Date(match.stravaSession.date);

          return (
            <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Duplikat erkannt ({match.confidence}% Übereinstimmung)
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {match.reason}
                  </div>
                  
                  {/* Geplante Session */}
                  <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="font-medium text-gray-700 dark:text-gray-300">📅 Geplant:</div>
                    <div className="text-sm">{match.plannedSession.title}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{match.plannedSession.duration} min</span>
                      {match.plannedSession.distance && <span>{match.plannedSession.distance} km</span>}
                    </div>
                  </div>

                  {/* Strava Session */}
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                    <div className="font-medium text-orange-700 dark:text-orange-300">🚴‍♂️ Strava:</div>
                    <div className="text-sm">{match.stravaSession.title}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{match.stravaSession.duration} min</span>
                      {match.stravaSession.distance && <span>{match.stravaSession.distance} km</span>}
                      {match.stravaSession.calories && <span>{match.stravaSession.calories} kcal</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => resolveDuplicate(match, 'replace')}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Check size={14} />
                    Ersetzen
                  </button>
                  <button
                    onClick={() => setDuplicates(prev => prev.filter(d => d !== match))}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <X size={14} />
                    Jetzt ignorieren
                  </button>
                  
                  <button
                    onClick={() => {
                      const duplicateId = getDuplicateId(match.plannedSession, match.stravaSession);
                      const newIgnored = new Set(ignoredDuplicates);
                      newIgnored.add(duplicateId);
                      saveIgnoredDuplicates(newIgnored);
                      
                      // Entferne aus aktueller Liste
                      setDuplicates(prev => prev.filter(d => d !== match));
                      
                      console.log('🔕 Duplikat dauerhaft ignoriert:', duplicateId);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <X size={14} />
                    Dauerhaft ignorieren
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DuplicateWorkoutCleaner;
