import React, { useState, useEffect } from 'react';
import { TrainingSession, DailyWorkoutGroup } from '../types';
import { 
  Plus, 
  Save, 
  X, 
  Clock, 
  MapPin, 
  Zap, 
  Calendar,
  Target,
  Activity,
  Dumbbell,
  Heart,
  Waves,
  Flower,
  Mountain,
  Bike,
  TreePine,
  Sword,
  Music,
  MoreHorizontal
} from 'lucide-react';

interface MultiWorkoutTrackerProps {
  onSaveWorkouts: (workouts: TrainingSession[]) => void;
  selectedDate?: Date;
}

const MultiWorkoutTracker: React.FC<MultiWorkoutTrackerProps> = ({ 
  onSaveWorkouts, 
  selectedDate: initialDate = new Date() 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [workouts, setWorkouts] = useState<TrainingSession[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState({
    type: 'strength' as any,
    title: '',
    duration: 60,
    distance: 0,
    intensity: 'moderate' as 'low' | 'moderate' | 'high' | 'very_high',
    notes: '',
    location: '',
    equipment: [] as string[]
  });

  const workoutTypes = [
    { value: 'strength', label: 'Krafttraining', icon: Dumbbell, color: 'text-red-600', bgColor: 'bg-red-50' },
    { value: 'cardio', label: 'Laufen', icon: Heart, color: 'text-blue-600', bgColor: 'bg-blue-50', subtype: 'running' },
    { value: 'cardio', label: 'Rad fahren', icon: Bike, color: 'text-green-600', bgColor: 'bg-green-50', subtype: 'cycling' },
    { value: 'cardio', label: 'Intervalle', icon: Zap, color: 'text-orange-600', bgColor: 'bg-orange-50', subtype: 'intervals' },
    { value: 'swimming', label: 'Schwimmen', icon: Waves, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
    { value: 'yoga', label: 'Yoga', icon: Flower, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { value: 'cardio', label: 'Wandern', icon: Mountain, color: 'text-emerald-600', bgColor: 'bg-emerald-50', subtype: 'hiking' },
    { value: 'strength', label: 'Klettern', icon: TreePine, color: 'text-stone-600', bgColor: 'bg-stone-50', subtype: 'climbing' },
    { value: 'cardio', label: 'Boxen', icon: Sword, color: 'text-rose-600', bgColor: 'bg-rose-50', subtype: 'boxing' },
    { value: 'cardio', label: 'Tanzen', icon: Music, color: 'text-pink-600', bgColor: 'bg-pink-50', subtype: 'dancing' },
    { value: 'recovery', label: 'Sonstiges', icon: MoreHorizontal, color: 'text-gray-600', bgColor: 'bg-gray-50', subtype: 'other' }
  ];

  const intensityOptions = [
    { value: 'low', label: 'Niedrig', color: 'text-green-600', description: 'Entspannt, leichte Anstrengung' },
    { value: 'moderate', label: 'Moderat', color: 'text-yellow-600', description: 'Mittlere Anstrengung' },
    { value: 'high', label: 'Hoch', color: 'text-orange-600', description: 'Hohe Anstrengung' },
    { value: 'very_high', label: 'Sehr Hoch', color: 'text-red-600', description: 'Maximale Anstrengung' }
  ];

  const equipmentOptions = [
    'Hanteln', 'Langhantel', 'Kettlebell', 'Widerstandsbänder', 'Klimmzugstange', 
    'Laufband', 'Ergometer', 'Rudergerät', 'Yogamatte', 'Medizinball', 
    'TRX', 'Bosu Ball', 'Seil', 'Boxhandschuhe', 'Schwimmbrille'
  ];

  const addWorkout = () => {
    if (!currentWorkout.title.trim()) {
      alert('Bitte gib einen Titel ein!');
      return;
    }

    const workoutGroup = `${selectedDate.toDateString()}-multi`;
    const selectedType = workoutTypes.find(t => 
      t.label === currentWorkout.type || 
      (t.value === currentWorkout.type && (!t.subtype || t.subtype === currentWorkout.type))
    );

    const newWorkout: TrainingSession = {
      id: `multi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: selectedType?.value as any || currentWorkout.type,
      subtype: selectedType?.subtype as any,
      title: currentWorkout.title,
      description: `${currentWorkout.intensity.charAt(0).toUpperCase() + currentWorkout.intensity.slice(1)} Intensität${currentWorkout.location ? ` - ${currentWorkout.location}` : ''}`,
      duration: currentWorkout.duration,
      distance: currentWorkout.distance > 0 ? currentWorkout.distance : undefined,
      notes: currentWorkout.notes || undefined,
      completed: true,
      date: selectedDate,
      week: getTrainingWeek(selectedDate),
      day: selectedDate.getDay() || 7,
      isAdditionalWorkout: true,
      workoutGroup,
      calories: calculateCalories(currentWorkout.type, currentWorkout.duration, currentWorkout.intensity)
    };

    setWorkouts(prev => [...prev, newWorkout]);

    // Form zurücksetzen
    setCurrentWorkout({
      type: 'strength',
      title: '',
      duration: 60,
      distance: 0,
      intensity: 'moderate',
      notes: '',
      location: '',
      equipment: []
    });

    setShowForm(false);
  };

  const removeWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const saveAllWorkouts = () => {
    if (workouts.length === 0) {
      alert('Füge mindestens ein Workout hinzu!');
      return;
    }

    onSaveWorkouts(workouts);
    setWorkouts([]);
    alert(`${workouts.length} Workout${workouts.length > 1 ? 's' : ''} erfolgreich gespeichert! 🎉`);
  };

  // Intelligente Wochen-Zuordnung für Trainingsplan
  const getTrainingWeek = (date: Date): number => {
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    // Workouts der letzten 7 Tage = Woche 1
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

  const calculateCalories = (type: string, duration: number, intensity: string): number => {
    const baseCalories = {
      strength: 6,
      cardio: 8,
      swimming: 10,
      yoga: 3,
      recovery: 2
    };

    const intensityMultiplier = {
      low: 0.7,
      moderate: 1.0,
      high: 1.3,
      very_high: 1.6
    };

    const base = baseCalories[type as keyof typeof baseCalories] || 5;
    const multiplier = intensityMultiplier[intensity as keyof typeof intensityMultiplier] || 1;
    
    return Math.round(base * duration * multiplier);
  };

  const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
  const totalDistance = workouts.reduce((sum, w) => sum + (w.distance || 0), 0);
  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);

  const getWorkoutTypeInfo = (workout: TrainingSession) => {
    return workoutTypes.find(t => 
      t.value === workout.type && 
      (!t.subtype || t.subtype === workout.subtype)
    ) || workoutTypes[0];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg text-white">
              <Target size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Multi-Workout Tracker
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Tracke mehrere Workouts für das ausgewählte Datum
              </p>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Datum:
              </label>
            </div>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
              max={new Date().toISOString().split('T')[0]}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
            />
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectedDate.toLocaleDateString('de-DE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Du kannst Trainings bis zu heute eintragen
          </div>
        </div>

        {/* Summary Stats */}
        {workouts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{workouts.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Gesamtzeit</div>
            </div>
            {totalDistance > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalDistance.toFixed(1)} km</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Distanz</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalCalories}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Kalorien</div>
            </div>
          </div>
        )}

        {/* Workout List */}
        {workouts.length > 0 && (
          <div className="space-y-3 mb-6">
            {workouts.map((workout, index) => {
              const typeInfo = getWorkoutTypeInfo(workout);
              const Icon = typeInfo.icon;
              
              return (
                <div key={workout.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                      <Icon className={`w-5 h-5 ${typeInfo.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {index + 1}. {workout.title}
                      </h4>
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
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeWorkout(workout.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Workout Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
          >
            <Plus size={20} />
            <span className="font-medium">Workout hinzufügen</span>
          </button>
        )}

        {/* Action Buttons */}
        {workouts.length > 0 && (
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setWorkouts([])}
              className="btn-secondary flex-1"
            >
              Alle löschen
            </button>
            <button
              onClick={saveAllWorkouts}
              className="btn-success flex-1"
            >
              <Save size={18} />
              Alle Workouts speichern
            </button>
          </div>
        )}
      </div>

      {/* Add Workout Form */}
      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Neues Workout hinzufügen
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Workout Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Art des Workouts
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {workoutTypes.map((type) => {
                  const TypeIcon = type.icon;
                  const workoutTypeValue = type.subtype || type.value;
                  const isSelected = currentWorkout.type === workoutTypeValue;
                  
                  return (
                    <button
                      key={`${type.value}-${type.subtype || 'default'}`}
                      type="button"
                      onClick={() => setCurrentWorkout(prev => ({ 
                        ...prev, 
                        type: workoutTypeValue
                      }))}
                      className={`p-3 border rounded-lg transition-all text-center ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10'
                      }`}
                    >
                      <TypeIcon size={20} className={`mx-auto mb-1 ${isSelected ? 'text-primary-600' : ''}`} />
                      <div className={`text-xs font-medium ${isSelected ? 'text-primary-700 dark:text-primary-300' : ''}`}>
                        {type.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titel *
              </label>
              <input
                type="text"
                value={currentWorkout.title}
                onChange={(e) => setCurrentWorkout(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="z.B. Rad-Intervalle am See"
                required
              />
            </div>

            {/* Duration and Distance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock size={16} className="inline mr-1" />
                  Dauer (Minuten) *
                </label>
                <input
                  type="number"
                  value={currentWorkout.duration}
                  onChange={(e) => setCurrentWorkout(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="1"
                  required
                />
              </div>

              {(currentWorkout.type === 'cardio' || currentWorkout.type === 'running' || currentWorkout.type === 'cycling' || currentWorkout.type === 'swimming') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    Distanz (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentWorkout.distance}
                    onChange={(e) => setCurrentWorkout(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                  />
                </div>
              )}
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Intensität
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {intensityOptions.map((intensity) => {
                  const isSelected = currentWorkout.intensity === intensity.value;
                  
                  return (
                    <button
                      key={intensity.value}
                      type="button"
                      onClick={() => setCurrentWorkout(prev => ({ ...prev, intensity: intensity.value as any }))}
                      className={`p-3 border rounded-lg transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10'
                      }`}
                    >
                      <div className={`font-medium ${isSelected ? 'text-primary-700 dark:text-primary-300' : intensity.color}`}>
                        {intensity.label}
                      </div>
                      <div className={`text-xs mt-1 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {intensity.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ort
                </label>
                <input
                  type="text"
                  value={currentWorkout.location}
                  onChange={(e) => setCurrentWorkout(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="z.B. Fitnessstudio, Park, zu Hause"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notizen
                </label>
                <input
                  type="text"
                  value={currentWorkout.notes}
                  onChange={(e) => setCurrentWorkout(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Wie war das Training?"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={addWorkout}
                className="btn-primary flex-1"
              >
                <Plus size={18} />
                Workout hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiWorkoutTracker;
