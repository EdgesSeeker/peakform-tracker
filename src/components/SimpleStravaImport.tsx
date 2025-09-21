import React, { useState } from 'react';
import { TrainingSession } from '../types';
import { 
  Download, 
  Check, 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Zap,
  Trash2,
  Plus
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
  calories?: number;
  description?: string;
  sport_type: string;
}

interface SimpleStravaImportProps {
  onAddWorkouts: (workouts: TrainingSession[]) => void;
  onDeleteWorkout: (workoutId: string) => void;
  onUpdateSession: (session: TrainingSession) => void;
  existingSessions: TrainingSession[];
}

const SimpleStravaImport: React.FC<SimpleStravaImportProps> = ({ 
  onAddWorkouts, 
  onDeleteWorkout,
  onUpdateSession,
  existingSessions 
}) => {
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());

  // Mock Strava Activities - in der echten App würden diese von Strava API kommen
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
      average_speed: 6.94,
      calories: 450,
      description: 'Intensive Intervalleinheit'
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
      average_speed: 0.83,
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
      average_speed: 3.7,
      calories: 650
    },
    {
      id: 'strava-4',
      name: 'Krafttraining Studio',
      type: 'WeightTraining',
      sport_type: 'WeightTraining',
      start_date: '2024-09-18T19:00:00Z',
      moving_time: 4500, // 75 min
      distance: 0,
      total_elevation_gain: 0,
      average_speed: 0,
      calories: 400
    }
  ];

  // Bereits importierte Workouts filtern
  const importedWorkouts = existingSessions.filter(s => s.id.includes('strava'));
  const availableActivities = mockStravaActivities.filter(activity => 
    !importedWorkouts.some(workout => workout.id.includes(activity.id))
  );

  const toggleActivitySelection = (activityId: string) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(activityId)) {
      newSelected.delete(activityId);
    } else {
      newSelected.add(activityId);
    }
    setSelectedActivities(newSelected);
  };

  const convertStravaToSession = (activity: StravaActivity): TrainingSession => {
    const activityDate = new Date(activity.start_date);

    const getWorkoutType = () => {
      switch (activity.sport_type.toLowerCase()) {
        case 'ride':
        case 'virtualride':
          return { type: 'cardio' as const, subtype: 'cycling' as const };
        case 'run':
          return { type: 'cardio' as const, subtype: 'running' as const };
        case 'swim':
          return { type: 'swimming' as const, subtype: undefined };
        case 'weighttraining':
          return { type: 'strength' as const, subtype: 'fullbody' as const };
        default:
          return { type: 'cardio' as const, subtype: 'intervals' as const };
      }
    };

    const workoutType = getWorkoutType();

    // Intelligente Wochen-Zuordnung für Trainingsplan
    const getTrainingWeek = (date: Date): number => {
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      // Workouts der letzten 7 Tage = Woche 1
      // Workouts der vorletzten 7 Tage = Woche 2, etc.
      if (daysDiff <= 7) {
        return 1; // Aktuelle Woche
      } else if (daysDiff <= 14) {
        return 2; // Letzte Woche 
      } else if (daysDiff <= 21) {
        return 3; // Vorletzte Woche
      } else if (daysDiff <= 28) {
        return 4; // 3 Wochen zurück
      } else {
        return Math.min(8, Math.ceil(daysDiff / 7)); // Max 8 Wochen
      }
    };

    return {
      id: `strava-${activity.id}-${Date.now()}`,
      type: workoutType.type,
      subtype: workoutType.subtype,
      title: activity.name,
      description: activity.description || `Strava Import: ${activity.name}`,
      duration: Math.round(activity.moving_time / 60),
      distance: activity.distance > 0 ? Math.round(activity.distance / 100) / 10 : undefined,
      notes: `Importiert von Strava`,
      completed: true,
      date: activityDate,
      week: getTrainingWeek(activityDate),
      day: activityDate.getDay() || 7,
      calories: activity.calories,
      isAdditionalWorkout: true,
      workoutGroup: `${activityDate.toDateString()}-strava`
    };
  };

  // Finde passende geplante Sessions für Strava-Aktivität
  const findMatchingPlannedSession = (activity: StravaActivity): TrainingSession | null => {
    const activityDate = new Date(activity.start_date);
    const activityDay = activityDate.getDay() || 7;
    
    // Suche nach ungeplanten Sessions am gleichen Tag oder ±1 Tag
    const candidateSessions = existingSessions.filter(session => {
      if (session.completed || session.isAdditionalWorkout) return false;
      
      const dayDiff = Math.abs(session.day - activityDay);
      return dayDiff <= 1; // Gleicher Tag oder ±1 Tag
    });

    // Typ-Matching mit erweiterten Kriterien
    for (const session of candidateSessions) {
      // Rad-Intervalle Matching (spezifisch für dein Samstag-Training)
      if (activity.sport_type.toLowerCase() === 'ride') {
        if (session.title.toLowerCase().includes('rad') || 
            session.title.toLowerCase().includes('intervall') ||
            session.subtype === 'cycling' ||
            (session.type === 'cardio' && session.day === 6)) { // Samstag Cardio = wahrscheinlich Rad
          console.log(`🎯 Rad-Matching gefunden: ${session.title} ← ${activity.name}`);
          return session;
        }
      }
      
      // Lauf Matching
      if (activity.sport_type.toLowerCase() === 'run' && 
          (session.type === 'cardio' && session.subtype === 'running')) {
        console.log(`🏃‍♂️ Lauf-Matching gefunden: ${session.title} ← ${activity.name}`);
        return session;
      }
      
      // Schwimmen Matching
      if (activity.sport_type.toLowerCase() === 'swim' && 
          session.type === 'swimming') {
        console.log(`🏊‍♂️ Schwimm-Matching gefunden: ${session.title} ← ${activity.name}`);
        return session;
      }
      
      // Krafttraining Matching
      if (activity.sport_type.toLowerCase() === 'weighttraining' && 
          session.type === 'strength') {
        console.log(`💪 Kraft-Matching gefunden: ${session.title} ← ${activity.name}`);
        return session;
      }
    }
    
    return null;
  };

  const addSelectedWorkouts = () => {
    if (selectedActivities.size === 0) {
      alert('Bitte wähle mindestens ein Workout aus!');
      return;
    }

    let replacedSessions = 0;
    const workoutsToAdd: TrainingSession[] = [];

    Array.from(selectedActivities).forEach(activityId => {
      const activity = availableActivities.find(a => a.id === activityId)!;
      const matchingSession = findMatchingPlannedSession(activity);
      
      if (matchingSession) {
        // Ersetze die geplante Session
        const updatedSession = {
          ...matchingSession,
          title: `${activity.name} (Strava)`,
          description: activity.description || `Strava Import: ${activity.name}`,
          duration: Math.round(activity.moving_time / 60),
          distance: activity.distance > 0 ? Math.round(activity.distance / 100) / 10 : undefined,
          notes: `Strava Import ersetzt geplante Session: ${matchingSession.title}`,
          completed: true,
          date: new Date(activity.start_date),
          calories: activity.calories
        };
        
        onUpdateSession(updatedSession);
        replacedSessions++;
        console.log(`🔄 Ersetze geplante Session: ${matchingSession.title} → ${activity.name}`);
      } else {
        // Füge als zusätzliches Workout hinzu
        workoutsToAdd.push(convertStravaToSession(activity));
      }
    });

    if (workoutsToAdd.length > 0) {
      onAddWorkouts(workoutsToAdd);
    }
    
    setSelectedActivities(new Set());
    
    const totalImported = replacedSessions + workoutsToAdd.length;
    const message = replacedSessions > 0 
      ? `${totalImported} Workout${totalImported > 1 ? 's' : ''} importiert! ${replacedSessions} geplante Session${replacedSessions > 1 ? 's' : ''} ersetzt. 🎉`
      : `${workoutsToAdd.length} zusätzliche${workoutsToAdd.length > 1 ? '' : 's'} Workout${workoutsToAdd.length > 1 ? 's' : ''} hinzugefügt! 🎉`;
    
    alert(message);
  };

  const getActivityIcon = (sportType: string) => {
    switch (sportType.toLowerCase()) {
      case 'ride': return '🚴‍♂️';
      case 'run': return '🏃‍♂️';
      case 'swim': return '🏊‍♂️';
      case 'weighttraining': return '💪';
      default: return '🏃‍♂️';
    }
  };

  return (
    <div className="space-y-6">
      {/* Verfügbare Strava Workouts */}
      {availableActivities.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Verfügbare Strava Workouts
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Wähle die Workouts aus, die du hinzufügen möchtest
              </p>
            </div>
            
            {selectedActivities.size > 0 && (
              <button
                onClick={addSelectedWorkouts}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                {selectedActivities.size} Workout{selectedActivities.size > 1 ? 's' : ''} hinzufügen
              </button>
            )}
          </div>

          <div className="space-y-3">
            {availableActivities.map((activity) => {
              const isSelected = selectedActivities.has(activity.id);
              const activityDate = new Date(activity.start_date);

              const matchingSession = findMatchingPlannedSession(activity);
              const willReplace = matchingSession !== null;

              return (
                <div
                  key={activity.id}
                  onClick={() => toggleActivitySelection(activity.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-sm'
                      : 'border-gray-200 dark:border-gray-600 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-2xl">{getActivityIcon(activity.sport_type)}</div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {activity.name}
                            </h4>
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
                          
                          <div className={`p-2 rounded-full transition-colors ${
                            isSelected 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            {isSelected ? <Check size={16} /> : <Download size={16} />}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
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

                        {/* Matching Information */}
                        {willReplace && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                              🔄 Ersetzt geplante Session: "{matchingSession!.title}"
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Das geplante Training wird automatisch als erledigt markiert
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bereits importierte Workouts */}
      {importedWorkouts.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Importierte Strava Workouts
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Diese Workouts sind bereits in deinem Trainingsplan
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {importedWorkouts.map((workout) => {
              const workoutDate = new Date(workout.date);

              return (
                <div
                  key={workout.id}
                  className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-2xl">✅</div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {workout.title}
                            </h4>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {workoutDate.toLocaleDateString('de-DE', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long'
                              })}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => {
                              if (window.confirm('Workout aus Trainingsplan entfernen?')) {
                                onDeleteWorkout(workout.id);
                              }
                            }}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {workout.duration} min
                          </span>
                          {workout.distance && (
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {workout.distance} km
                            </span>
                          )}
                          {workout.calories && (
                            <span className="flex items-center gap-1">
                              <Zap size={14} />
                              {workout.calories} kcal
                            </span>
                          )}
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            In Trainingsplan
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Keine Workouts verfügbar */}
      {availableActivities.length === 0 && importedWorkouts.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <Download size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Keine Strava Workouts verfügbar
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Verbinde dein Strava Konto um Workouts zu importieren
          </p>
        </div>
      )}
    </div>
  );
};

export default SimpleStravaImport;
