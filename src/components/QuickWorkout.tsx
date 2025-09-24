import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, RotateCcw, Check, Clock, Target, Zap, ArrowLeft, Search } from 'lucide-react';
import { workoutLibrary } from '../data/workoutLibrary';

interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  duration?: number; // in seconds
  rest?: number; // in seconds
  weight?: number;
  completed: boolean;
}

interface QuickWorkoutSession {
  id: string;
  name: string;
  exercises: Exercise[];
  totalDuration: number;
  completed: boolean;
}

const QuickWorkout: React.FC = () => {
  const [selectedWorkout, setSelectedWorkout] = useState<QuickWorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [showWorkoutList, setShowWorkoutList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Spezifisches Oberkörper-Workout erstellen
  const createUpperBodyWorkout = (): QuickWorkoutSession => {
    const exercises: Exercise[] = [
      // Aufwärmen
      { id: 'warmup-1', name: 'Seilspringen oder Hampelmänner', sets: 1, reps: 1, duration: 300, rest: 0, completed: false }, // 5 Min
      { id: 'warmup-2', name: 'Schulterkreisen & Armkreisen', sets: 2, reps: 10, rest: 30, completed: false },
      { id: 'warmup-3', name: 'Leichte Push-ups', sets: 1, reps: 10, rest: 60, completed: false },
      
      // Haupttraining
      { id: 'main-1', name: 'Schulterdrücken', sets: 4, reps: 12, rest: 90, completed: false },
      { id: 'main-2', name: 'Bankdrücken / Floor Press', sets: 4, reps: 12, rest: 90, completed: false },
      { id: 'main-3', name: 'Einarmiges Kurzhantel-Rudern', sets: 3, reps: 12, rest: 60, completed: false },
      { id: 'main-4', name: 'Bizeps Curls', sets: 3, reps: 12, rest: 60, completed: false },
      { id: 'main-5', name: 'Trizeps-Kickbacks oder Overhead-Trizeps', sets: 3, reps: 12, rest: 60, completed: false },
      { id: 'main-6', name: 'Seitheben', sets: 3, reps: 15, rest: 45, completed: false },
      { id: 'main-7', name: 'Kettlebell Swings', sets: 3, reps: 20, rest: 60, completed: false },
      
      // Cooldown
      { id: 'cooldown-1', name: 'Schulterdehnungen', sets: 2, reps: 1, duration: 30, rest: 30, completed: false },
      { id: 'cooldown-2', name: 'Brustdehnungen', sets: 2, reps: 1, duration: 30, rest: 30, completed: false },
      { id: 'cooldown-3', name: 'Armdehnungen', sets: 2, reps: 1, duration: 20, rest: 30, completed: false }
    ];

    return {
      id: 'upper-body-detailed',
      name: 'Oberkörper Workout (Detailliert)',
      exercises,
      totalDuration: 60 * 60, // 60 Minuten
      completed: false
    };
  };

  // Konvertiere Workout Library zu Quick Workout Format
  const convertToQuickWorkout = (workout: any): QuickWorkoutSession => {
    const exercises: Exercise[] = [];
    
    // Beispiel-Übungen basierend auf Workout-Typ
    if (workout.type === 'strength') {
      if (workout.subtype === 'upper') {
        exercises.push(
          { id: '1', name: 'Push-ups', sets: 3, reps: 12, rest: 60, completed: false },
          { id: '2', name: 'Pull-ups', sets: 3, reps: 8, rest: 60, completed: false },
          { id: '3', name: 'Dips', sets: 3, reps: 10, rest: 60, completed: false },
          { id: '4', name: 'Shoulder Press', sets: 3, reps: 10, rest: 60, completed: false },
          { id: '5', name: 'Bicep Curls', sets: 3, reps: 12, rest: 45, completed: false }
        );
      } else if (workout.subtype === 'legs') {
        exercises.push(
          { id: '1', name: 'Squats', sets: 4, reps: 15, rest: 60, completed: false },
          { id: '2', name: 'Lunges', sets: 3, reps: 12, rest: 60, completed: false },
          { id: '3', name: 'Deadlifts', sets: 3, reps: 10, rest: 90, completed: false },
          { id: '4', name: 'Calf Raises', sets: 3, reps: 20, rest: 45, completed: false },
          { id: '5', name: 'Wall Sit', sets: 3, reps: 1, duration: 45, rest: 60, completed: false }
        );
      } else {
        exercises.push(
          { id: '1', name: 'Burpees', sets: 3, reps: 10, rest: 60, completed: false },
          { id: '2', name: 'Mountain Climbers', sets: 3, reps: 20, rest: 45, completed: false },
          { id: '3', name: 'Plank', sets: 3, reps: 1, duration: 60, rest: 60, completed: false },
          { id: '4', name: 'Jump Squats', sets: 3, reps: 15, rest: 45, completed: false }
        );
      }
    } else if (workout.type === 'cardio') {
      exercises.push(
        { id: '1', name: 'Warm-up', duration: 300, completed: false }, // 5 min
        { id: '2', name: 'Main Cardio', duration: 1200, completed: false }, // 20 min
        { id: '3', name: 'Cool-down', duration: 300, completed: false } // 5 min
      );
    } else if (workout.type === 'yoga') {
      exercises.push(
        { id: '1', name: 'Child\'s Pose', duration: 60, completed: false },
        { id: '2', name: 'Downward Dog', duration: 90, completed: false },
        { id: '3', name: 'Warrior I', duration: 60, completed: false },
        { id: '4', name: 'Warrior II', duration: 60, completed: false },
        { id: '5', name: 'Tree Pose', duration: 60, completed: false },
        { id: '6', name: 'Savasana', duration: 300, completed: false }
      );
    }

    return {
      id: workout.id,
      name: workout.name,
      exercises,
      totalDuration: workout.duration * 60, // Convert to seconds
      completed: false
    };
  };

  const availableWorkouts = [
    createUpperBodyWorkout(), // Füge das detaillierte Oberkörper-Workout hinzu
    ...workoutLibrary
      .filter(w => ['strength', 'cardio', 'yoga'].includes(w.type))
      .map(convertToQuickWorkout)
  ];

  // Filtere Workouts basierend auf Suchbegriff
  const filteredWorkouts = availableWorkouts.filter(workout =>
    workout.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = (workout: QuickWorkoutSession) => {
    setSelectedWorkout(workout);
    setCurrentExerciseIndex(0);
    setTimer(0);
    setIsRunning(false);
    setIsResting(false);
    setWorkoutStartTime(new Date());
    setShowWorkoutList(false);
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setTimer(0);
    setIsRunning(false);
    setIsResting(false);
  };

  const completeExercise = (exerciseId: string) => {
    if (!selectedWorkout) return;

    const updatedWorkout = {
      ...selectedWorkout,
      exercises: selectedWorkout.exercises.map(ex => 
        ex.id === exerciseId ? { ...ex, completed: true } : ex
      )
    };
    setSelectedWorkout(updatedWorkout);

    // Auto-advance to next exercise
    const currentIndex = selectedWorkout.exercises.findIndex(ex => ex.id === exerciseId);
    if (currentIndex < selectedWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(currentIndex + 1);
      setTimer(0);
      setIsRunning(false);
    } else {
      // Workout completed
      setIsRunning(false);
      setSelectedWorkout({ ...updatedWorkout, completed: true });
    }
  };

  const goBack = () => {
    setShowWorkoutList(true);
    setSelectedWorkout(null);
    setCurrentExerciseIndex(0);
    setTimer(0);
    setIsRunning(false);
    setIsResting(false);
  };

  const currentExercise = selectedWorkout?.exercises[currentExerciseIndex];

  if (showWorkoutList) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-primary-500 rounded-full">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Quick Workout
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Wähle ein Workout und starte sofort durch!
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Workout suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Workout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                onClick={() => startWorkout(workout)}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                    <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {workout.name}
                  </h3>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(workout.totalDuration / 60)} Minuten</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Target className="w-4 h-4" />
                    <span>{workout.exercises.length} Übungen</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {workout.exercises.slice(0, 2).map(ex => ex.name).join(', ')}
                    {workout.exercises.length > 2 && '...'}
                  </div>
                  <div className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Starten
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredWorkouts.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Keine Workouts gefunden
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Versuche einen anderen Suchbegriff oder{' '}
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  zeige alle Workouts
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!selectedWorkout) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Zurück</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {selectedWorkout.name}
            </h1>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {/* Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Fortschritt
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedWorkout.exercises.filter(ex => ex.completed).length} / {selectedWorkout.exercises.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(selectedWorkout.exercises.filter(ex => ex.completed).length / selectedWorkout.exercises.length) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Current Exercise */}
        {currentExercise && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {currentExercise.name}
              </h2>
              <div className="text-6xl font-mono text-primary-600 dark:text-primary-400 mb-4">
                {formatTime(timer)}
              </div>
              
              {/* Exercise Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {currentExercise.sets && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sätze</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {currentExercise.sets}
                    </div>
                  </div>
                )}
                {currentExercise.reps && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Wiederholungen</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {currentExercise.reps}
                    </div>
                  </div>
                )}
                {currentExercise.duration && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Dauer</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {currentExercise.duration}s
                    </div>
                  </div>
                )}
                {currentExercise.rest && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Pause</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {currentExercise.rest}s
                    </div>
                  </div>
                )}
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={isRunning ? pauseTimer : startTimer}
                  className="bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-lg transition-colors"
                >
                  {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-full shadow-lg transition-colors"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>

              {/* Complete Button */}
              <button
                onClick={() => completeExercise(currentExercise.id)}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-6 h-6" />
                Übung abschließen
              </button>
            </div>
          </div>
        )}

        {/* Exercise List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Übungen
          </h3>
          <div className="space-y-4">
            {/* Aufwärmen */}
            <div>
              <h4 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
                🔥 Aufwärmen (5-10 Minuten)
                <span className="text-xs bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                  {selectedWorkout.exercises.filter(ex => ex.id.startsWith('warmup-') && ex.completed).length}/3
                </span>
              </h4>
              <div className="space-y-2">
                {selectedWorkout.exercises.filter(ex => ex.id.startsWith('warmup-')).map((exercise, index) => {
                  const globalIndex = selectedWorkout.exercises.findIndex(ex => ex.id === exercise.id);
                  return (
                    <div
                      key={exercise.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        exercise.completed
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                          : globalIndex === currentExerciseIndex
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700'
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                          exercise.completed
                            ? 'bg-green-500 text-white'
                            : globalIndex === currentExerciseIndex
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}>
                          {exercise.completed ? '✓' : index + 1}
                        </div>
                        <span className={`font-medium ${
                          exercise.completed
                            ? 'text-green-700 dark:text-green-300 line-through'
                            : globalIndex === currentExerciseIndex
                            ? 'text-primary-700 dark:text-primary-300'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {exercise.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {exercise.sets && exercise.reps && `${exercise.sets}x${exercise.reps}`}
                        {exercise.duration && `${Math.floor(exercise.duration / 60)} Min`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Haupttraining */}
            <div>
              <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                💪 Haupttraining (~50 Minuten)
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                  {selectedWorkout.exercises.filter(ex => ex.id.startsWith('main-') && ex.completed).length}/7
                </span>
              </h4>
              <div className="space-y-2">
                {selectedWorkout.exercises.filter(ex => ex.id.startsWith('main-')).map((exercise, index) => {
                  const globalIndex = selectedWorkout.exercises.findIndex(ex => ex.id === exercise.id);
                  return (
                    <div
                      key={exercise.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        exercise.completed
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                          : globalIndex === currentExerciseIndex
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700'
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                          exercise.completed
                            ? 'bg-green-500 text-white'
                            : globalIndex === currentExerciseIndex
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}>
                          {exercise.completed ? '✓' : index + 1}
                        </div>
                        <span className={`font-medium ${
                          exercise.completed
                            ? 'text-green-700 dark:text-green-300 line-through'
                            : globalIndex === currentExerciseIndex
                            ? 'text-primary-700 dark:text-primary-300'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {exercise.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {exercise.sets && exercise.reps && `${exercise.sets}x${exercise.reps}`}
                        {exercise.duration && `${exercise.duration}s`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cooldown */}
            <div>
              <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                🧘 Cooldown / Stretch (5 Minuten)
                <span className="text-xs bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  {selectedWorkout.exercises.filter(ex => ex.id.startsWith('cooldown-') && ex.completed).length}/3
                </span>
              </h4>
              <div className="space-y-2">
                {selectedWorkout.exercises.filter(ex => ex.id.startsWith('cooldown-')).map((exercise, index) => {
                  const globalIndex = selectedWorkout.exercises.findIndex(ex => ex.id === exercise.id);
                  return (
                    <div
                      key={exercise.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        exercise.completed
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                          : globalIndex === currentExerciseIndex
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700'
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                          exercise.completed
                            ? 'bg-green-500 text-white'
                            : globalIndex === currentExerciseIndex
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}>
                          {exercise.completed ? '✓' : index + 1}
                        </div>
                        <span className={`font-medium ${
                          exercise.completed
                            ? 'text-green-700 dark:text-green-300 line-through'
                            : globalIndex === currentExerciseIndex
                            ? 'text-primary-700 dark:text-primary-300'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {exercise.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {exercise.sets && exercise.reps && `${exercise.sets}x${exercise.reps}`}
                        {exercise.duration && `${exercise.duration}s halten`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Workout Complete */}
        {selectedWorkout.completed && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Workout abgeschlossen!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Großartige Arbeit! Du hast alle Übungen erfolgreich absolviert.
              </p>
              <div className="space-y-3">
                <button
                  onClick={goBack}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Neues Workout starten
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  App schließen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickWorkout;
