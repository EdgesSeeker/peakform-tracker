import React, { useState, useEffect } from 'react';
import { Cloud, Wifi, WifiOff, Check, RefreshCw, X } from 'lucide-react';
import firebaseSync from '../services/firebaseSync';
import { TrainingSession, UserStats, QuickCheck } from '../types';

interface AutoSyncStatusProps {
  sessions: TrainingSession[];
  userStats: UserStats;
  quickCheck: QuickCheck;
  onDataUpdated: (sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck) => void;
  onClose: () => void;
}

const AutoSyncStatus: React.FC<AutoSyncStatusProps> = ({ 
  sessions, 
  userStats, 
  quickCheck, 
  onDataUpdated, 
  onClose 
}) => {
  const [syncStatus, setSyncStatus] = useState(firebaseSync.getSyncStatus());
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(firebaseSync.getSyncStatus());
    }, 5000); // Update alle 5 Sekunden

    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsLoading(true);
    
    try {
      const result = await firebaseSync.forceSyncNow(sessions, userStats, quickCheck, onDataUpdated);
      setLastResult(result);
    } catch (error) {
      setLastResult('Manueller Sync fehlgeschlagen');
    }
    
    setIsLoading(false);
  };

  const completedSessions = sessions.filter(s => s.completed).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Cloud className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Auto-Synchronisation</h2>
              <p className="text-sm text-gray-600">Automatischer Daten-Abgleich</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Status</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {syncStatus.isOnline ? (
                <Wifi size={16} className="text-green-500" />
              ) : (
                <WifiOff size={16} className="text-red-500" />
              )}
              <span className="text-sm text-gray-600">
                {syncStatus.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {syncStatus.isAutoSyncActive ? (
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              )}
              <span className="text-sm text-gray-600">
                Auto-Sync: {syncStatus.isAutoSyncActive ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Cloud size={16} className="text-blue-500" />
              <span className="text-sm text-gray-600">
                Lokale Daten: {sessions.length} Sessions, {completedSessions} abgeschlossen
              </span>
            </div>
            
            {syncStatus.lastSync && (
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                <span className="text-sm text-gray-600">
                  Letzter Sync: {syncStatus.lastSync.toLocaleTimeString('de-DE')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">🔄 Wie es funktioniert:</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Automatische Synchronisation alle 30 Sekunden</li>
            <li>Funktioniert zwischen verschiedenen Browser-Tabs</li>
            <li>Erkennt Änderungen automatisch</li>
            <li>Neueste Daten haben immer Priorität</li>
          </ul>
        </div>

        {lastResult && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{lastResult}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleManualSync}
            disabled={isLoading || !syncStatus.isOnline}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Synchronisiere...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Jetzt synchronisieren
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Schließen
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>💡 <strong>Tipp:</strong> Öffne die App in mehreren Tabs oder auf verschiedenen Geräten - 
          die Synchronisation läuft automatisch im Hintergrund!</p>
        </div>
      </div>
    </div>
  );
};

export default AutoSyncStatus;
