import React, { useState } from 'react';
import { TrainingSession } from '../types';
import { workoutLibrary, workoutCategories, createSessionFromTemplate, WorkoutTemplate } from '../data/workoutLibrary';
import { Plus, Calendar, Clock, MapPin, Zap, Search, Filter } from 'lucide-react';

interface QuickWorkoutLibraryProps {
  onAddWorkouts: (workouts: TrainingSession[]) => void;
}

const QuickWorkoutLibrary: React.FC<QuickWorkoutLibraryProps> = ({ onAddWorkouts }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedWorkouts, setSelectedWorkouts] = useState<Set<string>>(new Set());

  // Gefilterte Workouts
  const filteredWorkouts = workoutLibrary.filter(workout => {
    const matchesCategory = selectedCategory === 'all' || workout.category === selectedCategory;
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleWorkoutSelection = (workoutId: string) => {
    const newSelected = new Set(selectedWorkouts);
    if (newSelected.has(workoutId)) {
      newSelected.delete(workoutId);
    } else {
      newSelected.add(workoutId);
    }
    setSelectedWorkouts(newSelected);
  };

  const addSelectedWorkouts = () => {
    if (selectedWorkouts.size === 0) {
      alert('Bitte wähle mindestens ein Workout aus!');
      return;
    }

    const workoutsToAdd = Array.from(selectedWorkouts).map(workoutId => {
      const template = workoutLibrary.find(w => w.id === workoutId)!;
      return createSessionFromTemplate(template, selectedDate);
    });

    onAddWorkouts(workoutsToAdd);
    setSelectedWorkouts(new Set());
    
    const workoutNames = workoutsToAdd.map(w => w.title).join(', ');
    alert(`${workoutsToAdd.length} Workout${workoutsToAdd.length > 1 ? 's' : ''} hinzugefügt: ${workoutNames} 🎉`);
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-lg text-white">
              <Plus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Quick Workout Bibliothek
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Wähle vorgefertigte Workouts aus und füge sie schnell hinzu
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
                day: 'numeric', 
                month: 'long' 
              })}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {workoutCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white shadow-md'
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Selected Workouts Summary */}
        {selectedWorkouts.size > 0 && (
          <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-primary-600 dark:text-primary-400 font-medium">
                  {selectedWorkouts.size} Workout{selectedWorkouts.size > 1 ? 's' : ''} ausgewählt
                </div>
                <div className="text-sm text-primary-500">
                  Gesamtdauer: {Array.from(selectedWorkouts).reduce((total, id) => {
                    const workout = workoutLibrary.find(w => w.id === id);
                    return total + (workout?.duration || 0);
                  }, 0)} min
                </div>
              </div>
              <button
                onClick={addSelectedWorkouts}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Hinzufügen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Workout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkouts.map((workout) => {
          const isSelected = selectedWorkouts.has(workout.id);
          
          return (
            <div
              key={workout.id}
              onClick={() => toggleWorkoutSelection(workout.id)}
              className={`card cursor-pointer transition-all hover:shadow-lg transform hover:-translate-y-1 ${
                isSelected 
                  ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md' 
                  : 'hover:shadow-md'
              }`}
            >
              {/* Workout Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{workout.icon}</div>
                  <div>
                    <h3 className={`font-semibold ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100'}`}>
                      {workout.name}
                    </h3>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getIntensityColor(workout.intensity)}`}>
                      {getIntensityLabel(workout.intensity)}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="text-primary-500 bg-primary-100 dark:bg-primary-800 p-2 rounded-full">
                    ✓
                  </div>
                )}
              </div>

              {/* Workout Details */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {workout.description}
              </p>

              {/* Workout Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
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

              {/* Equipment */}
              {workout.equipment && workout.equipment.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>Equipment:</strong> {workout.equipment.join(', ')}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredWorkouts.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Keine Workouts gefunden
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Versuche einen anderen Suchbegriff oder ändere die Kategorie
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickWorkoutLibrary;
