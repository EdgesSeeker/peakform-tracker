import React, { useState } from 'react';
import { Calendar, Check, X, AlertCircle, ExternalLink, Clock, Zap } from 'lucide-react';
import { TrainingSession } from '../types';

interface GoogleCalendarSimpleProps {
  sessions: TrainingSession[];
  onClose: () => void;
}

const GoogleCalendarSimple: React.FC<GoogleCalendarSimpleProps> = ({ sessions, onClose }) => {
  const [step, setStep] = useState<'info' | 'manual' | 'complete'>('info');
  const [isProcessing, setIsProcessing] = useState(false);

  const getUpcomingSessionsCount = () => {
    const today = new Date();
    const endOfThisWeek = new Date();
    
    // Finde Sonntag dieser Woche
    const todayDayOfWeek = today.getDay(); // 0=Sonntag, 1=Montag, etc.
    const daysUntilSunday = todayDayOfWeek === 0 ? 0 : 7 - todayDayOfWeek; // Wenn heute Sonntag ist, dann 0, sonst Tage bis Sonntag
    endOfThisWeek.setDate(today.getDate() + daysUntilSunday);
    endOfThisWeek.setHours(23, 59, 59, 999);
    
    console.log('📅 Heute:', today.toLocaleDateString('de-DE'));
    console.log('📅 Ende der Woche (Sonntag):', endOfThisWeek.toLocaleDateString('de-DE'));
    
    const upcomingSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      const isUpcoming = !session.completed && 
                        sessionDate >= today && 
                        sessionDate <= endOfThisWeek;
      
      console.log(`🔍 Session: ${session.title}, Datum: ${sessionDate.toLocaleDateString('de-DE')}, Upcoming: ${isUpcoming}, Completed: ${session.completed}`);
      return isUpcoming;
    });
    
    console.log(`📊 Gefundene Sessions bis Sonntag: ${upcomingSessions.length}`);
    return upcomingSessions.length;
  };

  const generateCalendarEvents = () => {
    const today = new Date();
    const endOfThisWeek = new Date();
    
    // Finde Sonntag dieser Woche
    const todayDayOfWeek = today.getDay(); // 0=Sonntag, 1=Montag, etc.
    const daysUntilSunday = todayDayOfWeek === 0 ? 0 : 7 - todayDayOfWeek; // Wenn heute Sonntag ist, dann 0, sonst Tage bis Sonntag
    endOfThisWeek.setDate(today.getDate() + daysUntilSunday);
    endOfThisWeek.setHours(23, 59, 59, 999);
    
    const upcomingSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return !session.completed && 
             sessionDate >= today && 
             sessionDate <= endOfThisWeek;
    });

    return upcomingSessions.map(session => {
      const startTime = new Date(session.date);
      startTime.setHours(17, 0, 0, 0); // 17:00 Uhr

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + session.duration);

      const typeNames: { [key: string]: string } = {
        'strength': 'Krafttraining',
        'cardio': 'Ausdauertraining',
        'swimming': 'Schwimmen',
        'yoga': 'Yoga/Mobility'
      };

      return {
        title: `🏋️ ${session.title}`,
        start: startTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        end: endTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        description: `${session.description}\\n\\nTyp: ${typeNames[session.type] || session.type}\\nDauer: ${session.duration} Minuten${session.distance ? `\\nDistanz: ${session.distance} km` : ''}\\n\\n🎯 Erstellt mit PeakForm Training Tracker`,
        location: 'Training'
      };
    });
  };

  const createGoogleCalendarUrl = (event: any) => {
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams({
      text: event.title,
      dates: `${event.start}/${event.end}`,
      details: event.description,
      location: event.location
    });
    return `${baseUrl}&${params.toString()}`;
  };

  const handleCreateEvents = () => {
    setIsProcessing(true);
    
    const events = generateCalendarEvents();
    
    // Öffne für jedes Event ein neues Tab
    events.forEach((event, index) => {
      setTimeout(() => {
        const url = createGoogleCalendarUrl(event);
        window.open(url, `_blank_${index}`);
      }, index * 500); // 500ms Verzögerung zwischen Events
    });

    setTimeout(() => {
      setIsProcessing(false);
      setStep('complete');
      
      // Speichere letzten Sync-Zeitpunkt
      localStorage.setItem('last-calendar-sync', new Date().toISOString());
    }, events.length * 500 + 1000);
  };

  const lastSync = localStorage.getItem('last-calendar-sync');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Google Calendar</h2>
              <p className="text-sm text-gray-600">Workouts hinzufügen</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Status</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-500" />
              <span className="text-sm text-gray-600">Bereit zur Synchronisation</span>
            </div>
            {lastSync && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                <span className="text-sm text-gray-600">
                  Letzter Sync: {new Date(lastSync).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info Step */}
        {step === 'info' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium mb-2">
                    Vereinfachte Kalender-Integration
                  </p>
                  <p className="text-blue-700 mb-2">
                    Deine <strong>{getUpcomingSessionsCount()} anstehenden Workouts</strong> werden 
                    automatisch zu Google Calendar hinzugefügt:
                  </p>
                  <ul className="text-blue-700 text-xs space-y-1 list-disc list-inside">
                    <li>⏰ <strong>Trainingszeit: 17:00 Uhr</strong></li>
                    <li>📋 Mit allen Details und Übungen</li>
                    <li>🎯 Automatische Kategorisierung</li>
                    <li>📅 <strong>Bis Sonntag (Ende der Woche)</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setStep('manual')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Calendar size={16} />
                Workouts zu Calendar hinzufügen
              </button>
            </div>
          </div>
        )}

        {/* Manual Step */}
        {step === 'manual' && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-3">
                <ExternalLink className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium mb-2">
                    So funktioniert's:
                  </p>
                  <ol className="text-yellow-700 text-xs space-y-1 list-decimal list-inside">
                    <li>Klick auf "Events erstellen"</li>
                    <li>Es öffnen sich {getUpcomingSessionsCount()} neue Tabs</li>
                    <li>Klick in jedem Tab auf "Speichern"</li>
                    <li>Fertig! 🎉</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleCreateEvents}
                disabled={isProcessing}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Events werden erstellt...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    {getUpcomingSessionsCount()} Events erstellen
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-green-800 mb-2">
                  Events erstellt!
                </h3>
                <div className="text-sm text-green-700">
                  <p><strong>{getUpcomingSessionsCount()} Workout-Events</strong> wurden erstellt</p>
                  <p className="text-xs mt-1">Vergiss nicht, sie in den geöffneten Tabs zu speichern!</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-2">📅 Was wurde erstellt:</p>
                  <ul className="text-left space-y-1 text-xs">
                    <li>• Alle anstehenden Trainings <strong>bis Sonntag</strong></li>
                    <li>• Trainingszeit: <strong>17:00 Uhr</strong></li>
                    <li>• Mit detaillierter Beschreibung</li>
                    <li>• Automatische Kategorisierung</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Fertig
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleCalendarSimple;
