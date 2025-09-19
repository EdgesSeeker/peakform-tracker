import React, { useState } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

const ResetPlan: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const resetPlan = () => {
    // Clear all localStorage
    localStorage.removeItem('peakform-sessions');
    localStorage.removeItem('peakform-stats');
    localStorage.removeItem('peakform-quickcheck');
    
    // Reload page to initialize with fresh plan
    window.location.reload();
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg transition-colors z-50 hidden md:block"
        title="Plan zurücksetzen"
      >
        <RotateCcw size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Plan zurücksetzen?
          </h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Dies wird alle deine Trainings und Fortschritte löschen und den 8-Wochen-Plan 
          neu mit dem heutigen Datum starten.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirm(false)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={resetPlan}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Zurücksetzen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPlan;
