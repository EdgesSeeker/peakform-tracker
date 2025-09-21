import React, { useState, useEffect } from 'react';
import { TrainingSession } from '../types';
import { 
  Download, 
  Check, 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Zap, 
  Tag,
  AlertTriangle,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

interface StravaActivity {
  id: string;
  name: string;
  type: string;
  start_date: string;
  moving_time: number; // in seconds
  distance: number; // in meters
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  calories?: number;
  description?: string;
  sport_type: string;
}

interface WorkoutMatch {
  plannedSession?: TrainingSession;
  confidence: number;
  reason: string;
}

interface StravaImportManagerProps {
  sessions: TrainingSession[];
  onImportWorkouts: (workouts: TrainingSession[]) => void;
}

const StravaImportManager: React.FC<StravaImportManagerProps> = ({ 
  sessions, 
  onImportWorkouts 
}) => {
  const [stravaActivities, setStravaActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [activityTags, setActivityTags] = useState<{ [key: string]: string }>({});
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Mock Strava Activities (in real app würde das von der Strava API kommen)
  const mockStravaActivities: StravaActivity[] = [
    {
      id: 'strava-1',
      name: 'Rad-Intervalle am See',
      type: 'Ride',
      sport_type: 'Ride',
      start_date: '2024-09-20T15:30:00Z', // Gestern
      moving_time: 3600, // 1 Stunde
      distance: 25000, // 25km
      total_elevation_gain: 200,
      average_speed: 6.94, // m/s (25 km/h)
      max_speed: 12.5,
      calories: 450,
      description: 'Intensive Intervalleinheit mit 5x5min bei FTP'
    },
    {
      id: 'strava-2',
      name: 'Morgen-Schwimmen',
      type: 'Swim',
      sport_type: 'Swim',
      start_date: '2024-09-20T07:00:00Z',
      moving_time: 1800, // 30 min
      distance: 1500, // 1.5km
      total_elevation_gain: 0,
      average_speed: 0.83, // m/s
      max_speed: 1.2,
      calories: 280
    },
    {
      id: 'strava-3',
      name: '10K Lauf',
      type: 'Run',
      sport_type: 'Run',
      start_date: '2024-09-19T18:00:00Z',
      moving_time: 2700, // 45 min
      distance: 10000, // 10km
      total_elevation_gain: 50,
      average_speed: 3.7, // m/s
      max_speed: 4.2,
      calories: 650
    }
  ];

  useEffect(() => {
    // Simuliere Strava API Call
    setStravaActivities(mockStravaActivities);
  }, []);

  const findWorkoutMatch = (activity: StravaActivity): WorkoutMatch => {
    const activityDate = new Date(activity.start_date);
    const activityDay = activityDate.getDay() || 7;
    
    // Suche nach Sessions am gleichen Tag
    const sameDaySessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === activityDate.toDateString() && !session.completed;
    });

    // Typ-Matching
    const getSessionTypeFromStrava = (stravaType: string, sportType: string) => {
      switch (sportType.toLowerCase()) {
        case 'ride':
        case 'virtualride':
          return { type: 'cardio', subtype: 'cycling' };
        case 'run':
          return { type: 'cardio', subtype: 'running' };
        case 'swim':
          return { type: 'swimming', subtype: undefined };
        default:
          return { type: 'cardio', subtype: undefined };
      }
    };

    const stravaWorkoutType = getSessionTypeFromStrava(activity.type, activity.sport_type);

    // Finde beste Übereinstimmung
    let bestMatch: WorkoutMatch = { confidence: 0, reason: 'Keine Übereinstimmung gefunden' };

    for (const session of sameDaySessions) {
      let confidence = 0;
      let reasons = [];

      // Tag-Übereinstimmung (höchste Priorität)
      if (session.day === activityDay) {
        confidence += 30;
        reasons.push('Gleicher Wochentag');
      }

      // Typ-Übereinstimmung
      if (session.type === stravaWorkoutType.type) {
        confidence += 25;
        reasons.push('Gleicher Trainingstyp');
        
        if (session.subtype === stravaWorkoutType.subtype) {
          confidence += 15;
          reasons.push('Gleicher Subtyp');
        }
      }

      // Dauer-Übereinstimmung (±20%)
      const sessionDurationSec = session.duration * 60;
      const durationDiff = Math.abs(sessionDurationSec - activity.moving_time) / sessionDurationSec;
      if (durationDiff < 0.2) {
        confidence += 20;
        reasons.push('Ähnliche Dauer');
      } else if (durationDiff < 0.5) {
        confidence += 10;
        reasons.push('Ungefähr gleiche Dauer');
      }

      // Distanz-Übereinstimmung (falls vorhanden)
      if (session.distance && activity.distance > 0) {
        const sessionDistanceM = session.distance * 1000;
        const distanceDiff = Math.abs(sessionDistanceM - activity.distance) / sessionDistanceM;
        if (distanceDiff < 0.1) {
          confidence += 15;
          reasons.push('Gleiche Distanz');
        } else if (distanceDiff < 0.3) {
          confidence += 8;
          reasons.push('Ähnliche Distanz');
        }
      }

      if (confidence > bestMatch.confidence) {
        bestMatch = {
          plannedSession: session,
          confidence,
          reason: reasons.join(', ')
        };
      }
    }

    return bestMatch;
  };

  const isAlreadyImported = (activity: StravaActivity): boolean => {
    return sessions.some(session => 
      session.id.includes('strava') && 
      session.id.includes(activity.id)
    );
  };

  const convertStravaToSession = (activity: StravaActivity, replaceSession?: TrainingSession): TrainingSession => {
    const activityDate = new Date(activity.start_date);
    const tag = activityTags[activity.id];

    const getWorkoutType = () => {
      switch (activity.sport_type.toLowerCase()) {
        case 'ride':
        case 'virtualride':
          return { type: 'cardio' as const, subtype: 'cycling' as const };
        case 'run':
          return { type: 'cardio' as const, subtype: 'running' as const };
        case 'swim':
          return { type: 'swimming' as const, subtype: undefined };
        default:
          return { type: 'cardio' as const, subtype: 'intervals' as const };
      }
    };

    const workoutType = getWorkoutType();

    return {
      id: replaceSession ? replaceSession.id : `strava-${activity.id}-${Date.now()}`,
      type: workoutType.type,
      subtype: workoutType.subtype,
      title: tag ? `${activity.name} (${tag})` : activity.name,
      description: activity.description || `Strava Import: ${activity.name}`,
      duration: Math.round(activity.moving_time / 60),
      distance: activity.distance > 0 ? Math.round(activity.distance / 100) / 10 : undefined, // Convert to km
      notes: `Importiert von Strava${tag ? ` • Getaggt als: ${tag}` : ''}`,
      completed: true,
      date: activityDate,
      week: replaceSession?.week || Math.ceil((activityDate.getTime() - new Date().getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1,
      day: replaceSession?.day || (activityDate.getDay() || 7),
      calories: activity.calories,
      isAdditionalWorkout: !replaceSession,
      workoutGroup: replaceSession?.workoutGroup || `${activityDate.toDateString()}-strava`
    };
  };

  const toggleActivitySelection = (activityId: string) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(activityId)) {
      newSelected.delete(activityId);
    } else {
      newSelected.add(activityId);
    }
    setSelectedActivities(newSelected);
  };

  const setActivityTag = (activityId: string, tag: string) => {
    setActivityTags(prev => ({
      ...prev,
      [activityId]: tag
    }));
  };

  const importSelectedActivities = () => {
    if (selectedActivities.size === 0) {
      alert('Bitte wähle mindestens eine Aktivität aus!');
      return;
    }

    const workoutsToImport = Array.from(selectedActivities).map(activityId => {
      const activity = stravaActivities.find(a => a.id === activityId)!;
      const match = findWorkoutMatch(activity);
      
      return convertStravaToSession(
        activity, 
        match.confidence > 70 ? match.plannedSession : undefined
      );
    });

    onImportWorkouts(workoutsToImport);
    setSelectedActivities(new Set());
    setActivityTags({});
    
    alert(`${workoutsToImport.length} Strava Aktivität(en) erfolgreich importiert! 🎉`);
  };

  const filteredActivities = stravaActivities.filter(activity => {
    const matchesType = filterType === 'all' || activity.sport_type.toLowerCase() === filterType.toLowerCase();
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getActivityIcon = (sportType: string) => {
    switch (sportType.toLowerCase()) {
      case 'ride': return '🚴‍♂️';
      case 'run': return '🏃‍♂️';
      case 'swim': return '🏊‍♂️';
      default: return '🏃‍♂️';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white">
              <Download size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Smart Strava Import
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Importiere Strava Aktivitäten und vermeide Duplikate
              </p>
            </div>
          </div>
          <button
            onClick={() => setLoading(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Aktualisieren
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'ride', 'run', 'swim'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  filterType === type
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type === 'all' ? 'Alle' : type === 'ride' ? '🚴‍♂️ Radfahren' : type === 'run' ? '🏃‍♂️ Laufen' : '🏊‍♂️ Schwimmen'}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Aktivität suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Selected Activities Summary */}
        {selectedActivities.size > 0 && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="flex items-center justify-between">
              <div className="text-orange-600 dark:text-orange-400 font-medium">
                {selectedActivities.size} Aktivität(en) ausgewählt
              </div>
              <button
                onClick={importSelectedActivities}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Importieren
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.map((activity) => {
          const isSelected = selectedActivities.has(activity.id);
          const isImported = isAlreadyImported(activity);
          const match = findWorkoutMatch(activity);
          const activityDate = new Date(activity.start_date);

          return (
            <div
              key={activity.id}
              className={`card transition-all ${
                isSelected ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20' : ''
              } ${isImported ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-3xl">{getActivityIcon(activity.sport_type)}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {activity.name}
                        </h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {activityDate.toLocaleDateString('de-DE', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      
                      {!isImported && (
                        <button
                          onClick={() => toggleActivitySelection(activity.id)}
                          className={`p-2 rounded-lg transition-all ${
                            isSelected 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {isSelected ? <Check size={16} /> : <Download size={16} />}
                        </button>
                      )}
                    </div>

                    {/* Activity Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {Math.round(activity.moving_time / 60)} min
                      </span>
                      {activity.distance > 0 && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {(activity.distance / 1000).toFixed(1)} km
                        </span>
                      )}
                      {activity.calories && (
                        <span className="flex items-center gap-1">
                          <Zap size={14} />
                          {activity.calories} kcal
                        </span>
                      )}
                    </div>

                    {/* Match Information */}
                    {match.confidence > 0 && (
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${getConfidenceColor(match.confidence)}`}>
                        <AlertTriangle size={12} />
                        <span>
                          {match.confidence >= 70 ? '✓ Ersetzt geplantes Training' : 
                           match.confidence >= 50 ? '⚠️ Mögliche Übereinstimmung' : 
                           '❌ Keine Übereinstimmung'}
                        </span>
                        <span className="font-medium">({match.confidence}%)</span>
                      </div>
                    )}

                    {/* Tagging */}
                    {isSelected && !isImported && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2">
                          <Tag size={14} />
                          <span className="text-sm font-medium">Tag als:</span>
                          <input
                            type="text"
                            placeholder="z.B. Rad-Intervalle"
                            value={activityTags[activity.id] || ''}
                            onChange={(e) => setActivityTag(activity.id, e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    )}

                    {isImported && (
                      <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                        ✓ Bereits importiert
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Keine Strava Aktivitäten gefunden
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Verbinde dein Strava Konto oder ändere die Filtereinstellungen
          </p>
        </div>
      )}
    </div>
  );
};

export default StravaImportManager;
