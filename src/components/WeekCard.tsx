import React from 'react';
import { TrainingSession } from '../types';
import TrainingCard from './TrainingCard';
import { Calendar, Circle } from 'lucide-react';

interface WeekCardProps {
  week: number;
  sessions: TrainingSession[];
  onCompleteSession: (sessionId: string) => void;
  onUpdateSession?: (updatedSession: TrainingSession) => void;
  detailed?: boolean;
}

const WeekCard: React.FC<WeekCardProps> = ({ 
  week, 
  sessions, 
  onCompleteSession, 
  onUpdateSession,
  detailed = false 
}) => {
  const completedSessions = sessions.filter(s => s.completed).length;
  const totalSessions = sessions.length;
  const completionPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  // Calculate total distance and duration for the week
  const totalDistance = sessions.reduce((sum, s) => sum + (s.distance || 0), 0);
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);

  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const getWeekPhase = (weekNumber: number) => {
    if (weekNumber <= 2) return { phase: 'Grundlage', color: 'bg-blue-100 text-blue-800' };
    if (weekNumber <= 4) return { phase: 'Aufbau', color: 'bg-yellow-100 text-yellow-800' };
    if (weekNumber <= 6) return { phase: 'Intensität', color: 'bg-orange-100 text-orange-800' };
    return { phase: 'Peak', color: 'bg-red-100 text-red-800' };
  };

  const { phase, color } = getWeekPhase(week);

  if (detailed) {
    return (
      <div className="space-y-6">
        {/* Week Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{completedSessions}/{totalSessions}</div>
            <div className="text-sm text-gray-600">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalDistance.toFixed(1)}km</div>
            <div className="text-sm text-gray-600">Gesamt-Distanz</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</div>
            <div className="text-sm text-gray-600">Trainingszeit</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Wochenfortschritt</span>
            <span className="text-sm text-gray-500">{Math.round(completionPercentage)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill bg-primary-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Training Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sessions.map((session, index) => (
            <div key={session.id} className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {dayNames[index]} - Tag {index + 1}
                </span>
                {session.completed ? (
                  <div className="w-4 h-4 bg-success-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                ) : (
                  <Circle size={16} className="text-gray-400" />
                )}
              </div>
              <TrainingCard 
                session={session}
                onComplete={onCompleteSession}
                onUpdate={onUpdateSession}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card card-hover cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Woche {week}
          </h3>
        </div>
        <div className={`badge ${color}`}>
          {phase}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Fortschritt</span>
          <span className="text-sm font-medium text-gray-900">
            {completedSessions}/{totalSessions}
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill bg-primary-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {totalDistance.toFixed(1)}km
          </div>
          <div className="text-xs text-gray-600">Distanz</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
          </div>
          <div className="text-xs text-gray-600">Zeit</div>
        </div>
      </div>

      {/* Session Preview */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex -space-x-1">
          {sessions.slice(0, 7).map((session, index) => (
            <div
              key={session.id}
              className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium ${
                session.completed 
                  ? 'bg-success-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}
              title={`${dayNames[index]}: ${session.title}`}
            >
              {dayNames[index]?.[0]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekCard;
