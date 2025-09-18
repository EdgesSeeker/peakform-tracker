import React, { useState } from 'react';
import { TrainingSession } from '../types';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import WeekCard from './WeekCard';

interface CalendarProps {
  sessions: TrainingSession[];
  onCompleteSession: (sessionId: string) => void;
  onUpdateSession?: (updatedSession: TrainingSession) => void;
}

const Calendar: React.FC<CalendarProps> = ({ sessions, onCompleteSession, onUpdateSession }) => {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  // Group sessions by week
  const sessionsByWeek = sessions.reduce((acc, session) => {
    if (!acc[session.week]) {
      acc[session.week] = [];
    }
    acc[session.week].push(session);
    return acc;
  }, {} as Record<number, TrainingSession[]>);

  const weeks = Object.keys(sessionsByWeek).map(Number).sort((a, b) => a - b);

  const exportToCalendar = () => {
    // Create ICS calendar file
    const icsContent = generateICS(sessions);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'peakform-training.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateICS = (sessions: TrainingSession[]): string => {
    const header = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PeakForm//Training Tracker//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ].join('\r\n');

    const footer = 'END:VCALENDAR';

    const events = sessions.map(session => {
      const startDate = new Date(session.date);
      const endDate = new Date(startDate.getTime() + session.duration * 60000);
      
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      return [
        'BEGIN:VEVENT',
        `UID:${session.id}@peakform.app`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${session.title}`,
        `DESCRIPTION:${session.description}\\n\\nDauer: ${session.duration} Min${session.distance ? `\\nDistanz: ${session.distance} km` : ''}${session.notes ? `\\nNotizen: ${session.notes}` : ''}`,
        'CATEGORIES:TRAINING,SPORT',
        'STATUS:TENTATIVE',
        'END:VEVENT'
      ].join('\r\n');
    }).join('\r\n');

    return [header, events, footer].join('\r\n');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            8-Wochen Hybridplan 📅
          </h1>
          <p className="text-gray-600">
            Dein kompletter Trainingsplan mit Kraft- und Ausdauertraining
          </p>
        </div>
        
        <button
          onClick={exportToCalendar}
          className="btn-secondary"
        >
          <Download size={18} />
          Kalender Export
        </button>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => setSelectedWeek(prev => prev && prev > 1 ? prev - 1 : null)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          disabled={!selectedWeek || selectedWeek <= 1}
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex gap-2">
          {weeks.map(week => (
            <button
              key={week}
              onClick={() => setSelectedWeek(selectedWeek === week ? null : week)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedWeek === week
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Woche {week}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setSelectedWeek(prev => prev && prev < weeks.length ? prev + 1 : null)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          disabled={!selectedWeek || selectedWeek >= weeks.length}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Week View or Overview */}
      {selectedWeek ? (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Woche {selectedWeek} - Detailansicht
            </h2>
            <WeekCard
              week={selectedWeek}
              sessions={sessionsByWeek[selectedWeek] || []}
              onCompleteSession={onCompleteSession}
              onUpdateSession={onUpdateSession}
              detailed={true}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {weeks.map(week => (
            <div key={week} onClick={() => setSelectedWeek(week)}>
              <WeekCard
                week={week}
                sessions={sessionsByWeek[week] || []}
                onCompleteSession={onCompleteSession}
                onUpdateSession={onUpdateSession}
                detailed={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* Plan Info */}
      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Plan-Übersicht
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Wochenstruktur:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>🏃‍♂️ <strong>Montag:</strong> Lange Einheit (Lauf/Rad)</li>
              <li>💪 <strong>Dienstag:</strong> Kraft Beine/Core</li>
              <li>🏊‍♂️ <strong>Mittwoch:</strong> Schwimmen</li>
              <li>💪 <strong>Donnerstag:</strong> Kraft Oberkörper</li>
              <li>🚴‍♂️ <strong>Freitag:</strong> Rad Intervalle</li>
              <li>💪 <strong>Samstag:</strong> Kraft Ganzkörper</li>
              <li>🧘‍♀️ <strong>Sonntag:</strong> Yoga/Recovery</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Progression:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>📈 <strong>Woche 1-2:</strong> Grundlage & Technik</li>
              <li>📊 <strong>Woche 3-4:</strong> Volumen steigern</li>
              <li>🔥 <strong>Woche 5-6:</strong> Intensität erhöhen</li>
              <li>🏆 <strong>Woche 7-8:</strong> Peak vor Deload</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
