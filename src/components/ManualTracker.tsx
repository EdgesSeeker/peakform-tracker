import React, { useState } from 'react';
import { TrainingSession, Exercise, Set } from '../types';
import { Plus, Minus, Save, X, Dumbbell, Clock, MapPin, Zap } from 'lucide-react';

interface ManualTrackerProps {
  session: TrainingSession;
  onSave: (updatedSession: TrainingSession) => void;
  onCancel: () => void;
}

const ManualTracker: React.FC<ManualTrackerProps> = ({ session, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    duration: session.duration,
    distance: session.distance || 0,
    calories: session.calories || 0,
    notes: session.notes || '',
    exercises: session.exercises || [],
    workoutPlan: session.workoutPlan || null
  });

  const addExercise = () => {
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      name: '',
      type: 'strength',
      sets: [{ reps: 8, weight: 20 }]
    };
    
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  const updateExercise = (exerciseIndex: number, field: keyof Exercise, value: any) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, index) => 
        index === exerciseIndex ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  const addSet = (exerciseIndex: number) => {
    const lastSet = formData.exercises[exerciseIndex].sets.slice(-1)[0];
    const newSet: Set = {
      reps: lastSet?.reps || 8,
      weight: lastSet?.weight || 20,
      time: lastSet?.time,
      distance: lastSet?.distance
    };

    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, index) => 
        index === exerciseIndex 
          ? { ...exercise, sets: [...exercise.sets, newSet] }
          : exercise
      )
    }));
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof Set, value: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, exIndex) => 
        exIndex === exerciseIndex 
          ? {
              ...exercise,
              sets: exercise.sets.map((set, sIndex) => 
                sIndex === setIndex ? { ...set, [field]: value } : set
              )
            }
          : exercise
      )
    }));
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, exIndex) => 
        exIndex === exerciseIndex 
          ? { ...exercise, sets: exercise.sets.filter((_, sIndex) => sIndex !== setIndex) }
          : exercise
      )
    }));
  };

  const removeExercise = (exerciseIndex: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, index) => index !== exerciseIndex)
    }));
  };

  const handleSave = () => {
    const updatedSession: TrainingSession = {
      ...session,
      duration: formData.duration,
      distance: formData.distance > 0 ? formData.distance : undefined,
      calories: formData.calories > 0 ? formData.calories : undefined,
      notes: formData.notes || undefined,
      exercises: formData.exercises.length > 0 ? formData.exercises : undefined,
      workoutPlan: formData.workoutPlan || undefined, // Behalte die workoutPlan Struktur
      completed: true
    };

    onSave(updatedSession);
  };

  const getSessionIcon = () => {
    switch (session.type) {
      case 'strength': return Dumbbell;
      case 'cardio': return Zap;
      case 'swimming': return MapPin;
      default: return Clock;
    }
  };

  const Icon = getSessionIcon();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Icon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{session.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{session.description}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock size={16} className="inline mr-1" />
                Dauer (Minuten)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                min="1"
              />
            </div>

            {(session.type === 'cardio' || session.type === 'swimming') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  Distanz (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.distance}
                  onChange={(e) => setFormData(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="0"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Zap size={16} className="inline mr-1" />
                Kalorien (optional)
              </label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                min="0"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notizen
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Wie war das Training? Besonderheiten?"
            />
          </div>

          {/* Workout Plan Anzeige (wenn vorhanden) */}
          {formData.workoutPlan && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Dumbbell size={18} className="text-primary-600" />
                Trainingsplan-Übersicht
              </h3>
              
              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {/* Warmup */}
                {formData.workoutPlan.warmup && (
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                    <h4 className="font-medium text-orange-800 dark:text-orange-200 text-sm mb-2">
                      🔥 {formData.workoutPlan.warmup.title} ({formData.workoutPlan.warmup.duration})
                    </h4>
                    <div className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                      {formData.workoutPlan.warmup.exercises.map((exercise, index) => (
                        <div key={index}>• {exercise.name} - {exercise.sets} x {exercise.reps}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Main */}
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm mb-2">
                    💪 {formData.workoutPlan.main.title} ({formData.workoutPlan.main.duration})
                  </h4>
                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    {formData.workoutPlan.main.exercises.map((exercise, index) => (
                      <div key={index}>• {exercise.name} - {exercise.sets} x {exercise.reps}</div>
                    ))}
                  </div>
                </div>
                
                {/* Cooldown */}
                {formData.workoutPlan.cooldown && (
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 text-sm mb-2">
                      🧘 {formData.workoutPlan.cooldown.title} ({formData.workoutPlan.cooldown.duration})
                    </h4>
                    <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                      {formData.workoutPlan.cooldown.exercises.map((exercise, index) => (
                        <div key={index}>• {exercise.name} - {exercise.sets} x {exercise.reps}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exercises (nur bei Krafttraining) */}
          {session.type === 'strength' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formData.workoutPlan ? 'Zusätzliche Übungen' : 'Übungen'}
                </h3>
                <button
                  onClick={addExercise}
                  className="btn-primary"
                >
                  <Plus size={18} />
                  Übung hinzufügen
                </button>
              </div>

              <div className="space-y-6">
                {formData.exercises.map((exercise, exerciseIndex) => (
                  <div key={exercise.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => updateExercise(exerciseIndex, 'name', e.target.value)}
                        placeholder="Übungsname (z.B. Kniebeuge)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button
                        onClick={() => removeExercise(exerciseIndex)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
                        <div>Satz</div>
                        <div>Wiederholungen</div>
                        <div>Gewicht (kg)</div>
                        <div></div>
                      </div>

                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="grid grid-cols-4 gap-2 items-center">
                          <div className="text-center text-sm text-gray-500 dark:text-gray-500 py-2">
                            {setIndex + 1}
                          </div>
                          <input
                            type="number"
                            value={set.reps || ''}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center"
                            min="1"
                          />
                          <input
                            type="number"
                            step="0.5"
                            value={set.weight || ''}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center"
                            min="0"
                          />
                          <button
                            onClick={() => removeSet(exerciseIndex, setIndex)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => addSet(exerciseIndex)}
                        className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors"
                      >
                        <Plus size={16} className="inline mr-1" />
                        Satz hinzufügen
                      </button>
                    </div>
                  </div>
                ))}

                {formData.exercises.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-500">
                    <Dumbbell size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>Noch keine Übungen hinzugefügt</p>
                    <p className="text-sm">Klicke auf "Übung hinzufügen" um zu starten</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-xl">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="btn-secondary"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              className="btn-success"
            >
              <Save size={18} />
              Training speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualTracker;
