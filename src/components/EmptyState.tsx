import React from 'react';
import { Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { getAdjustedPlan } from '../data/detailedHybridPlan';
import { TrainingSession } from '../types';

interface EmptyStateProps {
  onLoadPlan: (sessions: TrainingSession[]) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onLoadPlan }) => {
  const loadPlan = () => {
    const plan = getAdjustedPlan(new Date());
    console.log('Loading fresh plan with sessions:', plan.length);
    onLoadPlan(plan);
    localStorage.setItem('peakform-sessions', JSON.stringify(plan));
  };

  return (
    <div className="card bg-orange-50 border-orange-200">
      <div className="text-center py-8">
        <div className="text-orange-500 mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-orange-900 mb-3">
          Keine Trainings gefunden
        </h3>
        
        <p className="text-orange-700 mb-6 max-w-md mx-auto">
          Es sieht so aus, als wäre dein 8-Wochen-Hybridplan nicht geladen. 
          Lass uns das schnell beheben!
        </p>
        
        <div className="space-y-3">
          <button
            onClick={loadPlan}
            className="w-full max-w-xs mx-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Calendar size={20} />
            8-Wochen-Plan laden
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="block mx-auto text-orange-600 hover:text-orange-700 text-sm underline transition-colors"
          >
            <RefreshCw size={14} className="inline mr-1" />
            Seite neu laden
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-orange-100 rounded-lg">
          <h4 className="font-medium text-orange-800 mb-2">
            💡 Was passiert beim Laden?
          </h4>
          <ul className="text-sm text-orange-700 text-left space-y-1">
            <li>• <strong>14 Trainingseinheiten</strong> für 2 Wochen</li>
            <li>• <strong>Detaillierte Übungen</strong> mit Sätzen & Gewichten</li>
            <li>• <strong>Plan startet heute</strong> mit deinem Wochentag</li>
            <li>• <strong>Automatische Progression</strong> über die Wochen</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
