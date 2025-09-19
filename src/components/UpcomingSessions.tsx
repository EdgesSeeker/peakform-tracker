import React from 'react';
import { TrainingSession } from '../types';
import TrainingCard from './TrainingCard';
import { Calendar } from 'lucide-react';

interface UpcomingSessionsProps {
  sessions: TrainingSession[];
  onCompleteSession: (sessionId: string) => void;
  onUpdateSession?: (updatedSession: TrainingSession) => void;
}

const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({ 
  sessions, 
  onCompleteSession,
  onUpdateSession
}) => {
  if (sessions.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="text-success-500 mb-4">
          <Calendar size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Alle Sessions abgeschlossen! 🎉
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Fantastische Arbeit! Du hast alle geplanten Trainingseinheiten absolviert.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Kommende Sessions
        </h2>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <TrainingCard
            key={session.id}
            session={session}
            onComplete={onCompleteSession}
            onUpdate={onUpdateSession}
          />
        ))}
      </div>

      {sessions.length > 0 && (
        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-700">
            💡 <strong>Tipp:</strong> Klicke auf eine Session, um sie als abgeschlossen zu markieren 
            und Punkte zu sammeln!
          </p>
        </div>
      )}
    </div>
  );
};

export default UpcomingSessions;
