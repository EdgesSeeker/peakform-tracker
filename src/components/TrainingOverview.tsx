import React from 'react';
import { TrainingSession } from '../types';
import QuickTrainingActions from './QuickTrainingActions';
import { 
  Dumbbell, 
  Heart, 
  Waves, 
  Flower, 
  Clock, 
  MapPin,
  Zap,
  Play
} from 'lucide-react';

interface TrainingOverviewProps {
  sessions: TrainingSession[];
  onCompleteSession: (sessionId: string) => void;
  onUpdateSession: (updatedSession: TrainingSession) => void;
}

const TrainingOverview: React.FC<TrainingOverviewProps> = ({
  sessions,
  onCompleteSession,
  onUpdateSession
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'strength': return Dumbbell;
      case 'cardio': return Heart;
      case 'swimming': return Waves;
      case 'yoga': return Flower;
      default: return Zap;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return 'text-red-600 bg-red-50 border-red-200';
      case 'cardio': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'swimming': return 'text-cyan-600 bg-cyan-50 border-cyan-200';
      case 'yoga': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Show only future/today sessions that are incomplete
  const today = new Date();
  const todayWeekday = today.getDay() || 7; // 1=Mo, 7=So
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  console.log('TrainingOverview Debug:');
  console.log('Heute:', today.toLocaleDateString('de-DE'), 'Wochentag:', todayWeekday);
  console.log('Alle Sessions:', sessions.length);
  
  const upcomingSessions = sessions
    .filter(s => {
      if (s.completed) return false;
      
      // Verwende Wochentag-basierte Logik (einfacher und zuverlässiger)
      // Heute = Donnerstag = 4, zeige ab Tag 4 (heute) bis Ende der Woche
      const isCurrentWeek = s.week === 1; // Aktuelle Woche
      const isTodayOrLater = s.day >= todayWeekday; // Ab heute
      const isNextWeek = s.week === 2; // Nächste Woche
      
      console.log(`Session: ${s.title}, Woche: ${s.week}, Tag: ${s.day}, Heute-Tag: ${todayWeekday}, Show: ${isCurrentWeek && isTodayOrLater || isNextWeek}`);
      
      // Zeige: Aktuelle Woche ab heute + komplette nächste Woche
      return (isCurrentWeek && isTodayOrLater) || isNextWeek;
    })
    .sort((a, b) => {
      // Sortiere erst nach Woche, dann nach Tag
      if (a.week !== b.week) return a.week - b.week;
      return a.day - b.day;
    })
    .slice(0, 5);
  
  console.log('Anstehende Sessions:', upcomingSessions.map(s => ({ title: s.title, date: new Date(s.date).toLocaleDateString('de-DE'), day: s.day })));

  if (upcomingSessions.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="text-success-500 mb-4">
          <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto">
            ✅
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Alle Trainings abgeschlossen! 🎉
        </h3>
        <p className="text-gray-600">
          Fantastische Arbeit! Du hast alle geplanten Trainingseinheiten absolviert.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <Play className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Anstehende Trainings
        </h2>
        <span className="badge badge-primary">
          {upcomingSessions.length}
        </span>
      </div>

          <div className="space-y-4">
            {upcomingSessions.map((session) => {
              const Icon = getIcon(session.type);
              const colorClasses = getTypeColor(session.type);
              // Berechne das korrekte Datum basierend auf Wochentag
              const sessionDate = new Date(session.date);
              const isToday = session.day === todayWeekday;
              const isTomorrow = session.day === (todayWeekday === 7 ? 1 : todayWeekday + 1);
              
              // Berechne das echte Datum für die Anzeige
              const realDate = new Date(today);
              if (isToday) {
                // Heute
              } else if (isTomorrow) {
                realDate.setDate(today.getDate() + 1);
              } else if (session.day > todayWeekday) {
                // Später diese Woche
                realDate.setDate(today.getDate() + (session.day - todayWeekday));
              } else {
                // Nächste Woche
                realDate.setDate(today.getDate() + (7 - todayWeekday + session.day));
              }

              return (
                <div key={session.id} className={`border rounded-lg p-4 ${colorClasses} ${isToday ? 'ring-2 ring-primary-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {session.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            isToday 
                              ? 'bg-primary-500 text-white'
                              : isTomorrow
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isToday ? 'HEUTE' : isTomorrow ? 'MORGEN' : realDate.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {session.description}
                        </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{session.duration} Min</span>
                      </div>
                      {session.distance && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{session.distance} km</span>
                        </div>
                      )}
                      {session.exercises && (
                        <div className="flex items-center gap-1">
                          <Dumbbell size={14} />
                          <span>{session.exercises.length} Übungen</span>
                        </div>
                      )}
                    </div>

                    <QuickTrainingActions
                      session={session}
                      onComplete={onCompleteSession}
                      onUpdate={onUpdateSession}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex items-start gap-3">
          <div className="text-primary-600 mt-1">
            <Zap size={20} />
          </div>
          <div>
            <h4 className="font-medium text-primary-800 mb-1">
              💡 Wie funktioniert das Training-Tracking?
            </h4>
            <ul className="text-sm text-primary-700 space-y-1">
              <li>• <strong>"Abhaken"</strong> → Schnell als erledigt markieren</li>
              <li>• <strong>"Tracken"</strong> → Detailliert mit Gewichten, Zeit, Notizen</li>
              <li>• <strong>Punkte sammeln</strong> → Automatisch für jedes Training</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingOverview;
