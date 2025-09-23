import React, { useState } from 'react';
import { TrainingSession } from '../types';
import { 
  Dumbbell, 
  Heart, 
  Waves, 
  Flower, 
  Clock, 
  MapPin, 
  Zap,
  Circle,
  Edit,
  Timer
} from 'lucide-react';
import ManualTracker from './ManualTracker';

interface TrainingCardProps {
  session: TrainingSession;
  onComplete: (sessionId: string) => void;
  onUpdate?: (updatedSession: TrainingSession) => void;
  compact?: boolean;
}

const TrainingCard: React.FC<TrainingCardProps> = ({ 
  session, 
  onComplete, 
  onUpdate,
  compact = false 
}) => {
  const [showTracker, setShowTracker] = useState(false);
  const getIcon = () => {
    // Prüfe zuerst, ob das Workout bereits ein Icon hat (aus der Bibliothek)
    if (session.icon) {
      return session.icon;
    }

    // Fallback basierend auf Typ
    switch (session.type) {
      case 'cardio':
        if (session.subtype === 'running') return '🏃‍♂️';
        if (session.subtype === 'cycling') return '🚴‍♂️';
        if (session.subtype === 'intervals') return '⚡';
        return '❤️';
      case 'strength':
        if (session.subtype === 'legs') return '🦵';
        if (session.subtype === 'upper') return '🏋️‍♂️';
        if (session.subtype === 'fullbody') return '💪';
        return '💪';
      case 'swimming':
        return '🏊‍♂️';
      case 'yoga':
        if (session.subtype === 'stretching') return '🤸‍♀️';
        return '🧘‍♀️';
      case 'recovery':
        if (session.subtype === 'meditation') return '🧘';
        if (session.subtype === 'breathing') return '💨';
        if (session.subtype === 'stretching') return '🤸‍♀️';
        return '😌';
      default:
        return '💪';
    }
  };

  const getTypeColor = () => {
    switch (session.type) {
      case 'strength':
        return 'text-red-600 bg-red-50';
      case 'cardio':
        return 'text-blue-600 bg-blue-50';
      case 'swimming':
        return 'text-cyan-600 bg-cyan-50';
      case 'yoga':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900';
    }
  };

  const getTypeLabel = () => {
    switch (session.type) {
      case 'strength':
        return 'Kraft';
      case 'cardio':
        return 'Ausdauer';
      case 'swimming':
        return 'Schwimmen';
      case 'yoga':
        return 'Yoga';
      default:
        return 'Training';
    }
  };

  const icon = getIcon();
  const colorClasses = getTypeColor();

  const handleTrackingComplete = (updatedSession: TrainingSession) => {
    if (onUpdate) {
      onUpdate(updatedSession);
    } else {
      onComplete(updatedSession.id);
    }
    setShowTracker(false);
  };

  if (compact) {
  return (
    <div 
      className={`training-card ${session.completed ? 'completed' : ''} p-4`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses}`}>
          <span className="text-lg">{icon}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Toggle: Abhaken oder wieder aufheben
            if (session.completed) {
              // Session wieder als "nicht abgeschlossen" markieren
              const uncompletedSession = { ...session, completed: false };
              if (onUpdate) {
                onUpdate(uncompletedSession);
              }
            } else {
              onComplete(session.id);
            }
          }}
          className="text-gray-400 hover:text-success-500 transition-colors"
          title={session.completed ? "Als offen markieren" : "Als erledigt markieren"}
        >
          {session.completed ? (
            <div className="w-5 h-5 bg-success-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          ) : (
            <Circle size={20} />
          )}
        </button>
      </div>
        
        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-2">
          {session.title}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
          <Clock size={12} />
          <span>{session.duration}min</span>
          {session.distance && (
            <>
              <MapPin size={12} />
              <span>{session.distance}km</span>
            </>
          )}
          {session.workoutPlan && (
            <>
              <Dumbbell size={12} />
              <span>Plan</span>
            </>
          )}
        </div>
        
        <div className={`badge badge-secondary mt-2 text-xs`}>
          {getTypeLabel()}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`training-card ${session.completed ? 'completed' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Toggle: Abhaken oder wieder aufheben
            if (session.completed) {
              // Session wieder als "nicht abgeschlossen" markieren
              const uncompletedSession = { ...session, completed: false };
              if (onUpdate) {
                onUpdate(uncompletedSession);
              }
            } else {
              onComplete(session.id);
            }
          }}
          className="text-gray-400 hover:text-success-500 transition-colors"
          title={session.completed ? "Als offen markieren" : "Als erledigt markieren"}
        >
          {session.completed ? (
            <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
          ) : (
            <Circle size={24} />
          )}
        </button>
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {session.title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {session.description}
      </p>

      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          {session.notes && session.notes.includes('Timer:') ? (
            <Timer size={16} className="text-primary-600" />
          ) : (
            <Clock size={16} />
          )}
          <span>{session.duration} Min</span>
          {session.notes && session.notes.includes('Timer:') && (
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded ml-1">
              ⏱️
            </span>
          )}
        </div>
        {session.distance && (
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{session.distance.toFixed(1)} km</span>
          </div>
        )}
        {session.workoutPlan ? (
          <div className="flex items-center gap-1">
            <Dumbbell size={16} />
            <span>Detaillierter Plan</span>
          </div>
        ) : session.exercises && (
          <div className="flex items-center gap-1">
            <Dumbbell size={16} />
            <span>{session.exercises.length} Übungen</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className={`badge ${session.completed ? 'badge-success' : 'badge-secondary'}`}>
          {getTypeLabel()}
        </div>
        
        {!session.completed && onUpdate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTracker(true);
            }}
            className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
            title="Training tracken"
          >
            <Edit size={14} />
          </button>
        )}
        
        {session.notes && (
          <div className="text-xs text-gray-400 max-w-24 truncate">
            {session.notes.includes('Timer:') ? (
              <span className="text-primary-600 font-medium">
                ⏱️ {session.notes.split('Timer: ')[1] || 'Timer'}
              </span>
            ) : (
              session.notes
            )}
          </div>
        )}
      </div>

      {showTracker && (
        <ManualTracker
          session={session}
          onSave={handleTrackingComplete}
          onCancel={() => setShowTracker(false)}
        />
      )}
    </div>
  );
};

export default TrainingCard;
