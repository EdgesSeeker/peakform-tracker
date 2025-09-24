import React, { useState, useEffect, useRef } from 'react';
import { TrainingSession } from '../types';
import { workoutLibrary, workoutCategories, createSessionFromTemplate, WorkoutTemplate } from '../data/workoutLibrary';
import { Plus, Clock, MapPin, Zap, Search, X, ArrowRight, Activity, Download } from 'lucide-react';
import stravaService from '../services/stravaService';

interface WorkoutContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  targetDay: number;
  targetWeek: number;
  targetDate: Date;
  onClose: () => void;
  onAddWorkout: (workout: TrainingSession) => void;
}

const WorkoutContextMenu: React.FC<WorkoutContextMenuProps> = ({
  isOpen,
  position,
  targetDay,
  targetWeek,
  targetDate,
  onClose,
  onAddWorkout
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedWorkouts, setSelectedWorkouts] = useState<Set<string>>(new Set());
  const [stravaActivities, setStravaActivities] = useState<any[]>([]);
  const [selectedStravaActivities, setSelectedStravaActivities] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'library' | 'strava'>('library');
  const [loadingStrava, setLoadingStrava] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Schließe Menü bei Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // ESC-Taste zum Schließen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Lade Strava-Aktivitäten wenn Strava-Tab aktiviert wird
  useEffect(() => {
    if (isOpen && activeTab === 'strava' && stravaActivities.length === 0) {
      loadStravaActivities();
    }
  }, [isOpen, activeTab]);

  const loadStravaActivities = async () => {
    if (!stravaService.isConnected()) {
      return;
    }

    try {
      setLoadingStrava(true);
      const activities = await stravaService.getActivities();
      setStravaActivities(activities);
    } catch (error) {
      console.error('Fehler beim Laden der Strava-Aktivitäten:', error);
    } finally {
      setLoadingStrava(false);
    }
  };

  // Gefilterte Workouts
  const filteredWorkouts = workoutLibrary.filter(workout => {
    const matchesCategory = selectedCategory === 'all' || workout.category === selectedCategory;
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleWorkoutSelect = (workoutId: string) => {
    const newSelected = new Set(selectedWorkouts);
    if (newSelected.has(workoutId)) {
      newSelected.delete(workoutId);
    } else {
      newSelected.add(workoutId);
    }
    setSelectedWorkouts(newSelected);
  };

  const handleAddWorkouts = () => {
    if (activeTab === 'library') {
      handleAddLibraryWorkouts();
    } else {
      handleAddStravaWorkouts();
    }
  };

  const handleAddLibraryWorkouts = () => {
    if (selectedWorkouts.size === 0) {
      alert('Bitte wähle mindestens ein Workout aus!');
      return;
    }

    const workoutsToAdd = Array.from(selectedWorkouts).map(workoutId => {
      const template = workoutLibrary.find(w => w.id === workoutId)!;
      
      // Erstelle Workout manuell mit korrekten Werten
      const workout = {
        id: `template-${template.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: template.type,
        subtype: template.subtype,
        title: template.name,
        description: template.description,
        duration: template.duration,
        distance: template.distance,
        notes: undefined,
        completed: false, // Nicht als erledigt markieren
        date: targetDate,
        week: targetWeek, // Verwende die gewünschte Woche
        day: targetDay,   // Verwende den gewünschten Tag
        isAdditionalWorkout: true,
        calories: template.calories,
        workoutGroup: `${targetDate.toDateString()}-template`
      };
      
      return workout;
    });

    // Füge alle Workouts hinzu
    workoutsToAdd.forEach(workout => onAddWorkout(workout));
    
    // Zeige Bestätigung
    const workoutNames = workoutsToAdd.map(w => w.title).join(', ');
    alert(`${workoutsToAdd.length} Workout${workoutsToAdd.length > 1 ? 's' : ''} hinzugefügt: ${workoutNames} 🎉`);
    
    onClose();
  };

  const handleAddStravaWorkouts = () => {
    if (selectedStravaActivities.size === 0) {
      alert('Bitte wähle mindestens eine Strava-Aktivität aus!');
      return;
    }

    const workoutsToAdd = Array.from(selectedStravaActivities).map(activityId => {
      const activity = stravaActivities.find(a => a.id.toString() === activityId)!;
      const trainingSession = stravaService.convertToTrainingSession(activity);
      
      // Überschreibe Datum und Woche/Tag mit den gewünschten Werten
      return {
        ...trainingSession,
        id: `strava-${activity.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date: targetDate,
        week: targetWeek,
        day: targetDay,
        completed: true, // Strava-Workouts sind bereits abgeschlossen
        isAdditionalWorkout: true,
        workoutGroup: `${targetDate.toDateString()}-strava`
      };
    });

    // Füge alle Workouts hinzu
    workoutsToAdd.forEach(workout => onAddWorkout(workout));
    
    // Zeige Bestätigung
    const workoutNames = workoutsToAdd.map(w => w.title).join(', ');
    alert(`${workoutsToAdd.length} Strava-Workout${workoutsToAdd.length > 1 ? 's' : ''} hinzugefügt: ${workoutNames} 🎉`);
    
    onClose();
  };

  const handleStravaActivitySelect = (activityId: string) => {
    const newSelected = new Set(selectedStravaActivities);
    if (newSelected.has(activityId)) {
      newSelected.delete(activityId);
    } else {
      newSelected.add(activityId);
    }
    setSelectedStravaActivities(newSelected);
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'moderate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'very_high': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getIntensityLabel = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'Niedrig';
      case 'moderate': return 'Moderat';
      case 'high': return 'Hoch';
      case 'very_high': return 'Sehr Hoch';
      default: return intensity;
    }
  };

  // Button-Text basierend auf Auswahl
  const getButtonText = () => {
    if (activeTab === 'library') {
      if (selectedWorkouts.size === 0) {
        return 'Workout auswählen';
      } else if (selectedWorkouts.size === 1) {
        return '1 Workout hinzufügen';
      } else {
        return `${selectedWorkouts.size} Workouts hinzufügen`;
      }
    } else {
      if (selectedStravaActivities.size === 0) {
        return 'Strava-Aktivität auswählen';
      } else if (selectedStravaActivities.size === 1) {
        return '1 Strava-Workout hinzufügen';
      } else {
        return `${selectedStravaActivities.size} Strava-Workouts hinzufügen`;
      }
    }
  };

  const buttonText = getButtonText();
  console.log('🔘 Button-Text:', buttonText, 'selectedWorkouts.size:', selectedWorkouts.size, 'selectedStravaActivities.size:', selectedStravaActivities.size);

  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const dayName = dayNames[targetDay - 1];

  if (!isOpen) return null;

  console.log('🔍 Kontextmenü wird gerendert:', { isOpen, selectedWorkouts: selectedWorkouts.size });

  // Einfache Positionierung - immer in der Mitte des Bildschirms
  const left = Math.max(10, (window.innerWidth - 400) / 2);
  const top = Math.max(10, (window.innerHeight - 400) / 2);

  console.log('📍 Menü Position (zentriert):', { left, top, windowWidth: window.innerWidth, windowHeight: window.innerHeight });

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 max-w-md w-full h-[500px] overflow-hidden flex flex-col"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 9999
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Workout hinzufügen
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {dayName} - {targetDate.toLocaleDateString('de-DE', { 
                day: '2-digit', 
                month: '2-digit' 
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'library'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            📚 Workout-Bibliothek
          </button>
          <button
            onClick={() => setActiveTab('strava')}
            disabled={!stravaService.isConnected()}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'strava'
                ? 'bg-orange-500 text-white'
                : stravaService.isConnected()
                ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Activity size={14} className="inline mr-1" />
            Strava
            {!stravaService.isConnected() && <span className="text-xs ml-1">(Nicht verbunden)</span>}
          </button>
        </div>
      </div>

      {/* Filters */}
      {activeTab === 'library' && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-3">
            {workoutCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Workout suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-sm"
            />
          </div>
        </div>
      )}

      {/* Strava Info */}
      {activeTab === 'strava' && !stravaService.isConnected() && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="text-center py-8">
            <Activity size={48} className="mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Strava nicht verbunden
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Verbinde dein Strava-Konto, um deine Aktivitäten zu importieren.
            </p>
            <button
              onClick={() => {
                const authUrl = stravaService.getAuthorizationUrl();
                window.location.href = authUrl;
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Activity size={16} className="inline mr-2" />
              Mit Strava verbinden
            </button>
          </div>
        </div>
      )}

      {/* Workout List */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'library' ? (
          // Library Workouts
          filteredWorkouts.map((workout) => {
            const isSelected = selectedWorkouts.has(workout.id);
            
            return (
              <div
                key={workout.id}
                onClick={() => handleWorkoutSelect(workout.id)}
                className={`p-3 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">{workout.icon}</div>
                    <div>
                      <h4 className={`font-medium text-sm ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100'}`}>
                        {workout.name}
                      </h4>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getIntensityColor(workout.intensity)}`}>
                        {getIntensityLabel(workout.intensity)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <div className="text-primary-500 bg-primary-100 dark:bg-primary-800 p-1 rounded-full">
                        ✓
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {workout.duration}min
                      </span>
                      {workout.distance && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {workout.distance}km
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Strava Activities
          loadingStrava ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Lade Strava-Aktivitäten...</span>
            </div>
          ) : stravaActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity size={48} className="mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Keine Strava-Aktivitäten
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Keine Aktivitäten in den letzten 30 Tagen gefunden.
              </p>
            </div>
          ) : (
            stravaActivities.map((activity) => {
              const isSelected = selectedStravaActivities.has(activity.id.toString());
              const activityDate = new Date(activity.start_date);
              
              return (
                <div
                  key={activity.id}
                  onClick={() => handleStravaActivitySelect(activity.id.toString())}
                  className={`p-3 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isSelected ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-lg">
                        {activity.type === 'Run' ? '🏃‍♂️' : 
                         activity.type === 'Ride' ? '🚴‍♂️' : 
                         activity.type === 'Swim' ? '🏊‍♂️' : '🏃‍♂️'}
                      </div>
                      <div>
                        <h4 className={`font-medium text-sm ${isSelected ? 'text-orange-700 dark:text-orange-300' : 'text-gray-900 dark:text-gray-100'}`}>
                          {activity.name}
                        </h4>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {activityDate.toLocaleDateString('de-DE', { 
                            day: '2-digit', 
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <div className="text-orange-500 bg-orange-100 dark:bg-orange-800 p-1 rounded-full">
                          ✓
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {Math.round(activity.moving_time / 60)}min
                        </span>
                        {activity.distance > 0 && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {(activity.distance / 1000).toFixed(1)}km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 flex-shrink-0">
        {/* Selected Workouts Summary */}
        {activeTab === 'library' && selectedWorkouts.size > 0 && (
          <div className="mb-3 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
            <div className="text-sm text-primary-700 dark:text-primary-300 font-medium">
              {selectedWorkouts.size} Workout{selectedWorkouts.size > 1 ? 's' : ''} ausgewählt
            </div>
            <div className="text-xs text-primary-600 dark:text-primary-400 mt-1">
              Gesamtdauer: {Array.from(selectedWorkouts).reduce((total, id) => {
                const workout = workoutLibrary.find(w => w.id === id);
                return total + (workout?.duration || 0);
              }, 0)} min
            </div>
          </div>
        )}

        {activeTab === 'strava' && selectedStravaActivities.size > 0 && (
          <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">
              {selectedStravaActivities.size} Strava-Aktivität{selectedStravaActivities.size > 1 ? 'en' : ''} ausgewählt
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Diese werden als abgeschlossene Workouts hinzugefügt
            </div>
          </div>
        )}
        
        <button
          onClick={handleAddWorkouts}
          disabled={
            (activeTab === 'library' && selectedWorkouts.size === 0) ||
            (activeTab === 'strava' && selectedStravaActivities.size === 0)
          }
          className={`w-full px-6 py-3 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            activeTab === 'library' 
              ? 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white'
              : 'bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white'
          }`}
        >
          <ArrowRight size={20} className="text-white" />
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default WorkoutContextMenu;
