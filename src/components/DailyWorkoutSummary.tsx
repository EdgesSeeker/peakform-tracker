import React from 'react';
import { TrainingSession } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Zap, 
  Target,
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

interface DailyWorkoutSummaryProps {
  date: Date;
  sessions: TrainingSession[];
  onSessionClick?: (session: TrainingSession) => void;
}

const DailyWorkoutSummary: React.FC<DailyWorkoutSummaryProps> = ({ 
  date, 
  sessions,
  onSessionClick 
}) => {
  const dayWorkouts = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    return sessionDate.toDateString() === date.toDateString() && s.completed;
  });

  const workoutTypeIcons = {
    strength: { icon: Dumbbell, color: 'text-red-600', bgColor: 'bg-red-50' },
    cardio: { icon: Heart, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    swimming: { icon: Waves, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
    yoga: { icon: Flower, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    recovery: { icon: MoreHorizontal, color: 'text-gray-600', bgColor: 'bg-gray-50' }
  };

  const subtypeIcons = {
    running: { icon: Heart, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    cycling: { icon: Bike, color: 'text-green-600', bgColor: 'bg-green-50' },
    intervals: { icon: Zap, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    hiking: { icon: Mountain, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    climbing: { icon: TreePine, color: 'text-stone-600', bgColor: 'bg-stone-50' },
    boxing: { icon: Sword, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    dancing: { icon: Music, color: 'text-pink-600', bgColor: 'bg-pink-50' }
  };

  const getWorkoutIcon = (session: TrainingSession) => {
    if (session.subtype && subtypeIcons[session.subtype as keyof typeof subtypeIcons]) {
      return subtypeIcons[session.subtype as keyof typeof subtypeIcons];
    }
    return workoutTypeIcons[session.type as keyof typeof workoutTypeIcons] || workoutTypeIcons.recovery;
  };

  if (dayWorkouts.length === 0) {
    return null;
  }

  const totalDuration = dayWorkouts.reduce((sum, s) => sum + s.duration, 0);
  const totalDistance = dayWorkouts.reduce((sum, s) => sum + (s.distance || 0), 0);
  const totalCalories = dayWorkouts.reduce((sum, s) => sum + (s.calories || 0), 0);
  const isMultiWorkoutDay = dayWorkouts.length > 1;
  const hasAdditionalWorkouts = dayWorkouts.some(s => s.isAdditionalWorkout);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Calendar className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {date.toLocaleDateString('de-DE', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {dayWorkouts.length} Workout{dayWorkouts.length > 1 ? 's' : ''}
              {hasAdditionalWorkouts && ' (mit Extra-Workouts)'}
            </p>
          </div>
        </div>
        
        {isMultiWorkoutDay && (
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-secondary-100 to-primary-100 rounded-full">
            <Target className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-medium text-primary-700">Multi-Day</span>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
            <Clock size={14} />
            <span className="text-sm font-medium">
              {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
            </span>
          </div>
          <div className="text-xs text-gray-500">Gesamtzeit</div>
        </div>
        
        {totalDistance > 0 && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <MapPin size={14} />
              <span className="text-sm font-medium">{totalDistance.toFixed(1)} km</span>
            </div>
            <div className="text-xs text-gray-500">Distanz</div>
          </div>
        )}
        
        {totalCalories > 0 && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
              <Zap size={14} />
              <span className="text-sm font-medium">{totalCalories}</span>
            </div>
            <div className="text-xs text-gray-500">Kalorien</div>
          </div>
        )}
      </div>

      {/* Workout List */}
      <div className="space-y-2">
        {dayWorkouts.map((workout, index) => {
          const iconInfo = getWorkoutIcon(workout);
          const Icon = iconInfo.icon;
          
          return (
            <div
              key={workout.id}
              onClick={() => onSessionClick?.(workout)}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                onSessionClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''
              } ${workout.isAdditionalWorkout 
                ? 'border-dashed border-secondary-300 bg-secondary-50/30 dark:bg-secondary-900/20' 
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${iconInfo.bgColor}`}>
                  <Icon className={`w-4 h-4 ${iconInfo.color}`} />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {index + 1}. {workout.title}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {workout.duration} min
                    </span>
                    {workout.distance && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {workout.distance} km
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {workout.isAdditionalWorkout && (
                <div className="flex items-center gap-1 px-2 py-1 bg-secondary-100 dark:bg-secondary-800 rounded-full">
                  <span className="text-xs font-medium text-secondary-700 dark:text-secondary-300">
                    Extra
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notes if any */}
      {dayWorkouts.some(w => w.notes) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notizen:</h4>
          <div className="space-y-1">
            {dayWorkouts
              .filter(w => w.notes)
              .map(workout => (
                <div key={workout.id} className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{workout.title}:</span> {workout.notes}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyWorkoutSummary;
