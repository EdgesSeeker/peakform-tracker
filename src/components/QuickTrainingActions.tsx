import React, { useState } from 'react';
import { TrainingSession } from '../types';
import { Edit } from 'lucide-react';
import ManualTracker from './ManualTracker';

interface QuickTrainingActionsProps {
  session: TrainingSession;
  onComplete: (sessionId: string) => void;
  onUpdate: (updatedSession: TrainingSession) => void;
}

const QuickTrainingActions: React.FC<QuickTrainingActionsProps> = ({
  session,
  onComplete,
  onUpdate
}) => {
  const [showTracker, setShowTracker] = useState(false);

  const handleTrackingComplete = (updatedSession: TrainingSession) => {
    onUpdate(updatedSession);
    setShowTracker(false);
  };

  if (session.completed) {
    return (
      <div className="flex items-center gap-2 text-success-600">
        <div className="w-4 h-4 bg-success-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
        <span className="text-sm font-medium">Abgeschlossen</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Schnell abhaken */}
        <button
          onClick={() => onComplete(session.id)}
          className="btn-secondary text-sm"
          title="Schnell als erledigt markieren"
        >
          <div className="w-4 h-4 border-2 border-current rounded-full mr-2"></div>
          Abhaken
        </button>
        
        {/* Detailliert tracken */}
        <button
          onClick={() => setShowTracker(true)}
          className="btn-primary text-sm"
          title="Detailliert tracken"
        >
          <Edit size={16} />
          Tracken
        </button>
      </div>

      {showTracker && (
        <ManualTracker
          session={session}
          onSave={handleTrackingComplete}
          onCancel={() => setShowTracker(false)}
        />
      )}
    </>
  );
};

export default QuickTrainingActions;
