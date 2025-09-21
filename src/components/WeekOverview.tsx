import React from 'react';
import { TrainingSession } from '../types';

interface WeekOverviewProps {
  sessions: TrainingSession[];
  weekNumber: number;
  onCompleteSession: (sessionId: string) => void;
  onUpdateSession?: (updatedSession: TrainingSession) => void;
  onUncompleteSession?: (sessionId: string) => void;
}

const WeekOverview: React.FC<WeekOverviewProps> = ({ 
  sessions, 
  weekNumber, 
  onCompleteSession,
  onUpdateSession,
  onUncompleteSession
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

  // Gruppiere Sessions nach Tagen (1=Mo, 2=Di, ..., 7=So)
  const sessionsByDay = sessions.reduce((acc, session) => {
    const day = session.day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(session);
    return acc;
  }, {} as { [key: number]: TrainingSession[] });

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

      {/* Weekly Calendar View - 7 Columns */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6, 7].map((dayNumber) => {
          const dayName = dayNames[dayNumber - 1];
          const daySessions = sessionsByDay[dayNumber] || [];
          const isToday = dayNumber === todayWeekday;
          
          return (
            <div key={dayNumber} className={`min-h-[140px] p-3 rounded-lg border-2 transition-all ${
              isToday 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg' 
                : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
            }`}>
              {/* Day Header */}
              <div className={`text-center mb-3 pb-2 border-b ${
                isToday 
                  ? 'border-primary-300 text-primary-700 dark:text-primary-300' 
                  : 'border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-400'
              }`}>
                <div className={`text-sm font-bold ${isToday ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'}`}>
                  {dayName}
                </div>
                
                {/* Datum unter jedem Wochentag anzeigen */}
                {daySessions.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(daySessions[0].date).toLocaleDateString('de-DE', { 
                      day: '2-digit', 
                      month: '2-digit'
                    })}
                  </div>
                )}
                
                {isToday && (
                  <div className="text-xs text-primary-500 font-semibold mt-1 bg-primary-100 dark:bg-primary-800 px-2 py-1 rounded-full">
                    Heute
                  </div>
                )}
              </div>
              
              {/* Sessions for this day - stacked vertically */}
              <div className="space-y-2">
                {daySessions.length === 0 ? (
                  <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-6 italic">
                    Kein Training
                  </div>
                ) : (
                  daySessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-2 rounded-md text-xs cursor-pointer transition-all hover:shadow-md transform hover:-translate-y-0.5 ${
                        session.completed
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-l-4 border-green-500 shadow-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }`}
                      onClick={() => {
                        if (session.completed && onUncompleteSession) {
                          onUncompleteSession(session.id);
                        } else if (!session.completed) {
                          onCompleteSession(session.id);
                        }
                      }}
                    >
                      <div className="font-semibold truncate mb-1" title={session.title}>
                        {session.title}
                      </div>
                      
                      <div className="text-xs opacity-80 flex items-center justify-between">
                        <span>{session.duration} min</span>
                        {session.distance && (
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 rounded">
                            {session.distance}km
                          </span>
                        )}
                      </div>
                      {session.completed ? (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-2 font-bold flex items-center gap-1">
                          <span className="text-green-500">✓</span> Erledigt
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 opacity-75">
                          Klick zum Abhaken
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Kraft vs Ausdauer Balance - kompakter */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-700 dark:text-gray-300 font-medium">Balance:</span>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full overflow-hidden h-2 w-24">
            <div 
              className="bg-red-400 transition-all duration-300"
              style={{ width: `${strengthPercentage}%` }}
            />
            <div 
              className="bg-blue-400 transition-all duration-300"
              style={{ width: `${cardioPercentage}%` }}
            />
            <div 
              className="bg-gray-200 dark:bg-gray-600"
              style={{ width: `${100 - strengthPercentage - cardioPercentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">
            💪 {Math.round(strengthPercentage)}% • 🏃‍♂️ {Math.round(cardioPercentage)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeekOverview;
