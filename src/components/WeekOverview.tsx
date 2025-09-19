import React from 'react';
import { TrainingSession } from '../types';
import TrainingCard from './TrainingCard';

interface WeekOverviewProps {
  sessions: TrainingSession[];
  weekNumber: number;
  onCompleteSession: (sessionId: string) => void;
  onUpdateSession?: (updatedSession: TrainingSession) => void;
}

const WeekOverview: React.FC<WeekOverviewProps> = ({ 
  sessions, 
  weekNumber, 
  onCompleteSession,
  onUpdateSession
}) => {
  // Debug: Log sessions für diese Woche
  console.log(`📅 WeekOverview Woche ${weekNumber}:`);
  sessions.forEach(s => {
    console.log(`- ${s.title}: Tag ${s.day} (${s.completed ? 'Erledigt' : 'Offen'})`);
  });
  
  const today = new Date();
  const todayWeekday = today.getDay() === 0 ? 7 : today.getDay(); // 0=So->7, 1=Mo->1, etc.
  console.log(`🗓️ Heute: ${today.toLocaleDateString('de-DE')}, Wochentag: ${todayWeekday} (${['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][today.getDay()]})`);
  const completedSessions = sessions.filter(s => s.completed).length;
  const totalSessions = sessions.length;
  const completionPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  // Calculate strength vs cardio ratio
  const strengthSessions = sessions.filter(s => s.type === 'strength').length;
  const cardioSessions = sessions.filter(s => ['cardio', 'swimming'].includes(s.type)).length;
  const strengthPercentage = totalSessions > 0 ? (strengthSessions / totalSessions) * 100 : 0;
  const cardioPercentage = totalSessions > 0 ? (cardioSessions / totalSessions) * 100 : 0;

  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Woche {weekNumber} Übersicht
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {completedSessions}/{totalSessions} Sessions
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fortschritt</span>
          <span className="text-sm text-gray-500 dark:text-gray-500">{Math.round(completionPercentage)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill bg-primary-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Kraft vs Ausdauer Balance */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kraft vs. Ausdauer</span>
        </div>
        <div className="flex rounded-lg overflow-hidden h-3">
          <div 
            className="bg-red-400 transition-all duration-300"
            style={{ width: `${strengthPercentage}%` }}
            title={`Kraft: ${Math.round(strengthPercentage)}%`}
          />
          <div 
            className="bg-blue-400 transition-all duration-300"
            style={{ width: `${cardioPercentage}%` }}
            title={`Ausdauer: ${Math.round(cardioPercentage)}%`}
          />
          <div 
            className="bg-gray-200 dark:bg-gray-600 transition-all duration-300"
            style={{ width: `${100 - strengthPercentage - cardioPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-500">
          <span>💪 Kraft ({Math.round(strengthPercentage)}%)</span>
          <span>🏃‍♂️ Ausdauer ({Math.round(cardioPercentage)}%)</span>
        </div>
      </div>

      {/* Training Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {sessions
          .sort((a, b) => a.day - b.day) // Sortiere nach Tag für korrekte Reihenfolge
          .map((session) => {
          const today = new Date();
          const todayWeekday = today.getDay() === 0 ? 7 : today.getDay(); // 0=So->7, 1=Mo->1, etc.
          const isToday = session.day === todayWeekday;
          console.log(`🔍 Session: ${session.title}, Session-Tag: ${session.day}, Heute-Tag: ${todayWeekday}, isToday: ${isToday}`);
          
          return (
            <div key={session.id} className="space-y-2">
              <div className={`text-center text-sm font-medium px-2 py-1 rounded-lg transition-all ${
                isToday 
                  ? 'bg-primary-500 text-white font-bold shadow-md' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {dayNames[session.day - 1] || `Tag ${session.day}`}
              </div>
              <div className={isToday ? 'transform scale-105 transition-transform' : ''}>
                <TrainingCard 
                  session={session}
                  onComplete={onCompleteSession}
                  onUpdate={onUpdateSession}
                  compact={true}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekOverview;
