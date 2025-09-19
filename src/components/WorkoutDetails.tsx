import React, { useState } from 'react';
import { TrainingSession, WorkoutPlan } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Dumbbell, 
  Play, 
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface WorkoutDetailsProps {
  session: TrainingSession;
  onUpdateSession: (session: TrainingSession) => void;
  onComplete?: () => void;
  timer?: {
    isRunning: boolean;
    currentTime: number;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onComplete: () => void;
    onReset: () => void;
  };
}

const WorkoutDetails: React.FC<WorkoutDetailsProps> = ({ 
  session, 
  onUpdateSession,
  onComplete,
  timer 
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['main']));
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);

  // Create default workout plan if none exists
  const workoutPlan: WorkoutPlan = session.workoutPlan || getDefaultWorkoutPlan(session);

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const toggleExercise = (sectionKey: string, exerciseId: string) => {
    const updatedWorkoutPlan = { ...workoutPlan };
    const section = updatedWorkoutPlan[sectionKey as keyof WorkoutPlan];
    
    if (section && section.exercises) {
      const exerciseIndex = section.exercises.findIndex(ex => ex.id === exerciseId);
      if (exerciseIndex !== -1) {
        section.exercises[exerciseIndex].completed = !section.exercises[exerciseIndex].completed;
        
        const updatedSession = {
          ...session,
          workoutPlan: updatedWorkoutPlan
        };
        
        onUpdateSession(updatedSession);
      }
    }
  };

  const getCompletedExercises = () => {
    let completed = 0;
    let total = 0;
    
    [workoutPlan.warmup, workoutPlan.main, workoutPlan.cooldown].forEach(section => {
      if (section) {
        section.exercises.forEach(exercise => {
          total++;
          if (exercise.completed) completed++;
        });
      }
    });
    
    return { completed, total };
  };

  const { completed, total } = getCompletedExercises();
  const progress = total > 0 ? (completed / total) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = () => {
    setWorkoutStarted(true);
    if (workoutPlan.warmup && workoutPlan.warmup.exercises.length > 0) {
      setCurrentExerciseId(workoutPlan.warmup.exercises[0].id);
    } else if (workoutPlan.main.exercises.length > 0) {
      setCurrentExerciseId(workoutPlan.main.exercises[0].id);
    }
  };

  const completeWorkout = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const renderSection = (section: any, sectionKey: string, icon: React.ReactNode) => {
    if (!section) return null;
    
    const isExpanded = expandedSections.has(sectionKey);
    const sectionCompleted = section.exercises.filter((ex: any) => ex.completed).length;
    const sectionTotal = section.exercises.length;
    
    return (
      <div key={sectionKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            {icon}
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">{section.title}</h3>
              <p className="text-sm text-gray-600">{section.duration}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {sectionCompleted}/{sectionTotal}
            </span>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-4 space-y-3">
            {section.exercises.map((exercise: any) => (
              <div 
                key={exercise.id}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                  exercise.completed 
                    ? 'border-green-200 bg-green-50' 
                    : currentExerciseId === exercise.id
                    ? 'border-primary-200 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => toggleExercise(sectionKey, exercise.id)}
                  className="flex-shrink-0 mt-1"
                >
                  {exercise.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 hover:text-primary-600" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h4 className={`font-medium ${
                      exercise.completed ? 'text-green-800 line-through' : 'text-gray-900'
                    }`}>
                      {exercise.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {exercise.sets} × {exercise.reps}
                      </span>
                      {exercise.equipment && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {exercise.equipment}
                        </span>
                      )}
                    </div>
                  </div>
                  {exercise.instructions && (
                    <p className="text-sm text-gray-600 mt-1">{exercise.instructions}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{session.title}</h1>
            <p className="text-primary-100">{session.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{session.duration} Min</span>
              </div>
              <div className="flex items-center gap-1">
                <Dumbbell size={16} />
                <span>{total} Übungen</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            {timer && timer.currentTime > 0 ? (
              <div>
                <div className="text-3xl font-bold font-mono">
                  {formatTime(timer.currentTime)}
                </div>
                <div className="text-sm text-primary-100">
                  {timer.isRunning ? '⏱️ Läuft' : '⏸️ Pausiert'}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-3xl font-bold">
                  {Math.round(progress)}%
                </div>
                <div className="text-sm text-primary-100">Fortschritt</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-primary-400 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-primary-100 mt-2">
            <span>{completed} von {total} abgeschlossen</span>
            <span>{total - completed} verbleibend</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {timer ? (
          // Timer-basierte Buttons
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {!timer.isRunning && timer.currentTime === 0 ? (
              <button
                onClick={timer.onStart}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <Play size={20} />
                Workout starten
              </button>
            ) : (
              <div className="flex gap-3 flex-1">
                {timer.isRunning ? (
                  <button
                    onClick={timer.onPause}
                    className="flex-1 bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Pause size={20} />
                    Pausieren
                  </button>
                ) : (
                  <button
                    onClick={timer.onResume}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Play size={20} />
                    Weiter
                  </button>
                )}
                <button
                  onClick={timer.onReset}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  Reset
                </button>
              </div>
            )}
            
            {/* Workout beendet Button - immer sichtbar wenn Timer läuft */}
            {timer.currentTime > 0 && (
              <button
                onClick={timer.onComplete}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 animate-pulse"
              >
                <CheckCircle2 size={20} />
                Workout beendet ({formatTime(timer.currentTime)})
              </button>
            )}
          </div>
        ) : (
          // Standard Buttons ohne Timer
          <>
            {!workoutStarted ? (
              <button
                onClick={startWorkout}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <Play size={20} />
                Workout starten
              </button>
            ) : (
              <>
                <button
                  onClick={() => setWorkoutStarted(false)}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Pause size={20} />
                  Pausieren
                </button>
                <button
                  onClick={() => {
                    setWorkoutStarted(false);
                    setCurrentExerciseId(null);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  Reset
                </button>
              </>
            )}
            
            {progress === 100 && (
              <button
                onClick={completeWorkout}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                Workout abschließen
              </button>
            )}
          </>
        )}
      </div>

      {/* Workout Sections */}
      <div className="space-y-4">
        {renderSection(workoutPlan.warmup, 'warmup', <div className="w-5 h-5 bg-yellow-500 rounded-full" />)}
        {renderSection(workoutPlan.main, 'main', <Dumbbell className="w-5 h-5 text-primary-600" />)}
        {renderSection(workoutPlan.cooldown, 'cooldown', <div className="w-5 h-5 bg-blue-500 rounded-full" />)}
      </div>
    </div>
  );
};

// Default workout plan for upper body
function getDefaultWorkoutPlan(session: TrainingSession): WorkoutPlan {
  if (session.subtype === 'upper') {
    return {
      warmup: {
        title: 'Aufwärmen',
        duration: '5–10 Minuten',
        exercises: [
          {
            id: 'warmup-1',
            name: 'Seilspringen oder Hampelmänner',
            sets: '1',
            reps: '5 Min',
            instructions: 'Lockeres Tempo, Körper aktivieren'
          },
          {
            id: 'warmup-2',
            name: 'Schulterkreisen & Armkreisen',
            sets: '2',
            reps: '10 pro Richtung',
            instructions: 'Große, kontrollierte Bewegungen'
          },
          {
            id: 'warmup-3',
            name: 'Leichte Push-ups',
            sets: '1',
            reps: '5-10',
            instructions: 'Auf Knien falls nötig'
          }
        ]
      },
      main: {
        title: 'Haupttraining',
        duration: '~50 Minuten',
        exercises: [
          {
            id: 'main-1',
            name: 'Schulterdrücken',
            sets: '4',
            reps: '8–12',
            equipment: 'Kurzhanteln oder Langhantel',
            instructions: 'Kontrollierte Bewegung, Schultern stabilisieren'
          },
          {
            id: 'main-2',
            name: 'Bankdrücken / Floor Press',
            sets: '4',
            reps: '8–12',
            equipment: 'Kurzhantel oder Langhantel',
            instructions: 'Vollständige Bewegungsamplitude'
          },
          {
            id: 'main-3',
            name: 'Einarmiges Kurzhantel-Rudern',
            sets: '3',
            reps: '10–12 pro Seite',
            equipment: 'Kurzhantel',
            instructions: 'Rücken gerade, Ellbogen nah am Körper'
          },
          {
            id: 'main-4',
            name: 'Bizeps Curls',
            sets: '3',
            reps: '10–12',
            equipment: 'Kurzhantel oder Langhantel',
            instructions: 'Keine Schwungbewegung, kontrolliert'
          },
          {
            id: 'main-5',
            name: 'Trizeps-Kickbacks oder Overhead-Trizeps',
            sets: '3',
            reps: '10–12',
            equipment: 'Kurzhantel/Kettlebell',
            instructions: 'Oberarm fixiert, nur Unterarm bewegt'
          },
          {
            id: 'main-6',
            name: 'Seitheben',
            sets: '3',
            reps: '12–15',
            equipment: 'Kurzhantel',
            instructions: 'Leichte Gewichte, saubere Technik'
          },
          {
            id: 'main-7',
            name: 'Kettlebell Swings',
            sets: '3',
            reps: '15–20',
            equipment: 'Kettlebell',
            instructions: 'Hüfte antreiben, Rücken & Core aktivieren'
          }
        ]
      },
      cooldown: {
        title: 'Cooldown / Stretch',
        duration: '5 Minuten',
        exercises: [
          {
            id: 'cooldown-1',
            name: 'Schulterdehnungen',
            sets: '2',
            reps: '30 Sek halten',
            instructions: 'Arm über Brust ziehen, andere Seite'
          },
          {
            id: 'cooldown-2',
            name: 'Brustdehnungen',
            sets: '2',
            reps: '30 Sek halten',
            instructions: 'Türrahmen nutzen oder Wand'
          },
          {
            id: 'cooldown-3',
            name: 'Armdehnungen',
            sets: '2',
            reps: '20 Sek pro Arm',
            instructions: 'Trizeps und Bizeps dehnen'
          }
        ]
      }
    };
  }
  
  // Default fallback
  return {
    main: {
      title: 'Haupttraining',
      duration: `${session.duration} Minuten`,
      exercises: [
        {
          id: 'default-1',
          name: session.title,
          sets: '1',
          reps: `${session.duration} Min`,
          instructions: session.description
        }
      ]
    }
  };
}

export default WorkoutDetails;
