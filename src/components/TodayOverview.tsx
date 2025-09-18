import React from 'react';
import { TrainingSession } from '../types';
import { Calendar, Clock, AlertCircle, Play } from 'lucide-react';
import TrainingCard from './TrainingCard';
import EmptyState from './EmptyState';

interface TodayOverviewProps {
  sessions: TrainingSession[];
  onCompleteSession: (sessionId: string) => void;
  onUpdateSession: (updatedSession: TrainingSession) => void;
}

const TodayOverview: React.FC<TodayOverviewProps> = ({
  sessions,
  onCompleteSession,
  onUpdateSession
}) => {
  const today = new Date();
  const todayWeekday = today.getDay() || 7; // 1=Mo, 7=So
  
  // Debug logging
  console.log('Today:', today);
  console.log('Today weekday:', todayWeekday);
  console.log('All sessions:', sessions.length);
  console.log('Sessions sample:', sessions.slice(0, 3).map(s => ({ id: s.id, date: s.date, day: s.day })));
  
  // Sessions für heute - nur erste Session des heutigen Wochentags
  const allTodaySessions = sessions.filter(session => {
    const dayMatch = session.day === todayWeekday;
    console.log(`Heute-Filter: ${session.title}, Woche: ${session.week}, Session-Tag: ${session.day}, Heute-Tag: ${todayWeekday}, Match: ${dayMatch}`);
    return dayMatch;
  });
  
  // Nur die erste Session für heute nehmen (aus der ersten Woche)
  const todaySessions = allTodaySessions.length > 0 
    ? [allTodaySessions.find(s => s.week === 1) || allTodaySessions[0]].filter(Boolean)
    : [];
  
  console.log('Alle Sessions für heute:', allTodaySessions.length);
  console.log('Gefiltert auf eine Session:', todaySessions.length);
  
  console.log('Today sessions found:', todaySessions.length);
  console.log('Today sessions:', todaySessions.map(s => ({ title: s.title, date: s.date, day: s.day })));
  
  const completedToday = todaySessions.filter(s => s.completed);
  const pendingToday = todaySessions.filter(s => !s.completed);
  
  // Sessions dieser Woche
  const thisWeek = Math.ceil(today.getDate() / 7) || 1;
  const thisWeekSessions = sessions.filter(s => s.week === thisWeek);
  const weekCompleted = thisWeekSessions.filter(s => s.completed);
  
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const todayName = dayNames[today.getDay()];
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // If no sessions at all, show empty state
  if (sessions.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState onLoadPlan={(newSessions) => {
          newSessions.forEach(session => onUpdateSession(session));
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header mit Datum */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Heute • {formatDate(today)}
              </h2>
              <p className="text-gray-600">
                Dein Trainingsplan für {todayName}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {completedToday.length}/{todaySessions.length}
            </div>
            <div className="text-sm text-gray-600">Heute erledigt</div>
          </div>
        </div>
      </div>

      {/* Heutige Sessions */}
      {todaySessions.length > 0 ? (
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Heutiges Training
            </h3>
            {pendingToday.length > 0 && (
              <span className="badge badge-primary">
                {pendingToday.length} offen
              </span>
            )}
          </div>

          <div className="space-y-4">
            {todaySessions.map((session) => (
              <div key={session.id} className="relative">
                <div>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <TrainingCard
                        session={session}
                        onComplete={onCompleteSession}
                        onUpdate={onUpdateSession}
                      />
                    </div>
                    {!session.completed && (
                      <div className="flex flex-col gap-2 pt-4">
                        <button
                          onClick={() => onCompleteSession(session.id)}
                          className="px-4 py-2 bg-success-500 hover:bg-success-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                          title="Als erledigt markieren"
                        >
                          <span className="text-xs">✓</span>
                          Erledigt
                        </button>
                        <button
                          onClick={() => {
                            // Öffne das Tracking-Modal durch Klick auf die TrainingCard
                            const editButton = document.querySelector(`[data-session-id="${session.id}"] .edit-button`) as HTMLElement;
                            if (editButton) editButton.click();
                          }}
                          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                          title="Detailliert tracken"
                        >
                          Tracken
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {completedToday.length === todaySessions.length && todaySessions.length > 0 && (
            <div className="mt-6 p-4 bg-success-50 rounded-lg border border-success-200">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-success-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-medium text-success-800">
                  Perfekt! Alle heutigen Trainings abgeschlossen! 🎉
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-8">
          <div className="text-gray-400 mb-4">
            <Calendar size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Kein Training für heute geplant
          </h3>
          <p className="text-gray-600">
            Heute ist ein Ruhetag oder du hast bereits alles erledigt!
          </p>
        </div>
      )}

      {/* Wochen-Fortschritt */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Diese Woche (Woche {thisWeek})
          </h3>
          <div className="text-sm text-gray-600">
            {weekCompleted.length}/{thisWeekSessions.length} Sessions
          </div>
        </div>

        <div className="mb-4">
          <div className="progress-bar">
            <div 
              className="progress-fill bg-primary-500"
              style={{ 
                width: `${thisWeekSessions.length > 0 ? (weekCompleted.length / thisWeekSessions.length) * 100 : 0}%` 
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day, index) => {
            const dayNumber = index + 1;
            const daySessions = thisWeekSessions.filter(s => s.day === dayNumber);
            const dayCompleted = daySessions.filter(s => s.completed);
            const isToday = dayNumber === todayWeekday;
            
            return (
              <div 
                key={day} 
                className={`text-center p-3 rounded-lg border-2 transition-all ${
                  isToday 
                    ? 'bg-primary-500 border-primary-600 text-white shadow-lg transform scale-105' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className={`text-xs font-bold mb-1 ${
                  isToday ? 'text-white' : 'text-gray-600'
                }`}>
                  {day}
                </div>
                <div className={`text-lg font-bold ${
                  isToday 
                    ? 'text-white'
                    : daySessions.length === dayCompleted.length && daySessions.length > 0
                    ? 'text-success-600' 
                    : daySessions.length > 0 
                    ? 'text-orange-600' 
                    : 'text-gray-400'
                }`}>
                  {daySessions.length > 0 ? `${dayCompleted.length}/${daySessions.length}` : '•'}
                </div>
                
                {isToday && daySessions.length > 0 && (
                  <div className="text-xs text-white opacity-90 mt-1">
                    {dayCompleted.length === daySessions.length ? '✅ Fertig!' : '⏳ Offen'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default TodayOverview;
