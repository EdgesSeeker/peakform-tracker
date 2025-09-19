import React, { useState, useEffect } from 'react';
import { Cloud, Smartphone, Monitor, RefreshCw, Check, AlertTriangle, X, Zap } from 'lucide-react';
import cloudSyncService from '../services/cloudSync';
import { TrainingSession, UserStats, QuickCheck } from '../types';

interface CloudSyncProps {
  sessions: TrainingSession[];
  userStats: UserStats;
  quickCheck: QuickCheck;
  onDataUpdated: (sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck) => void;
  onClose: () => void;
}

const CloudSync: React.FC<CloudSyncProps> = ({ 
  sessions, 
  userStats, 
  quickCheck, 
  onDataUpdated, 
  onClose 
}) => {
  const [syncStatus, setSyncStatus] = useState(cloudSyncService.getSyncStatus());
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string>('');
  const [step, setStep] = useState<'info' | 'syncing' | 'result'>('info');

  useEffect(() => {
    updateStatus();
  }, []);

  const updateStatus = () => {
    const status = cloudSyncService.getSyncStatus();
    setSyncStatus(status);
  };

  const handleSmartSync = async () => {
    setIsLoading(true);
    setStep('syncing');
    
    try {
      const result = await cloudSyncService.performSmartSync(sessions, userStats, quickCheck);
      
      if (result.syncPerformed) {
        // Aktualisiere die App-Daten wenn sich etwas geändert hat
        onDataUpdated(result.sessions, result.userStats, result.quickCheck);
        setLastSyncResult(result.message);
        updateStatus();
        setStep('result');
      } else {
        setLastSyncResult(result.message);
        setStep('result');
      }
    } catch (error) {
      console.error('❌ Sync-Fehler:', error);
      setLastSyncResult('Synchronisation fehlgeschlagen');
      setStep('result');
    }
    
    setIsLoading(false);
  };

  const handleForceSync = async () => {
    setIsLoading(true);
    setStep('syncing');
    
    try {
      const success = await cloudSyncService.forceSyncToCloud(sessions, userStats, quickCheck);
      if (success) {
        setLastSyncResult('Daten erfolgreich zur Cloud hochgeladen');
        updateStatus();
      } else {
        setLastSyncResult('Upload fehlgeschlagen');
      }
    } catch (error) {
      setLastSyncResult('Upload-Fehler aufgetreten');
    }
    
    setIsLoading(false);
    setStep('result');
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
              <h2 className="text-lg font-bold text-gray-900">Geräte-Synchronisation</h2>
              <p className="text-sm text-gray-600">Daten zwischen Geräten abgleichen</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Device Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Aktueller Status</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-blue-500" />
              <span className="text-sm text-gray-600">
                Gerät: {syncStatus.deviceId.split('-')[1] || 'Unbekannt'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Monitor size={16} className="text-green-500" />
              <span className="text-sm text-gray-600">
                Lokale Daten: {sessions.length} Sessions, {completedSessions} abgeschlossen
              </span>
            </div>
            
            {syncStatus.lastSync && (
              <div className="flex items-center gap-2">
                <Cloud size={16} className="text-purple-500" />
                <span className="text-sm text-gray-600">
                  Letzter Sync: {syncStatus.lastSync.toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {syncStatus.hasCloudBackup ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <AlertTriangle size={16} className="text-orange-500" />
              )}
              <span className="text-sm text-gray-600">
                Cloud-Backup: {syncStatus.hasCloudBackup ? 'Verfügbar' : 'Nicht vorhanden'}
              </span>
            </div>
          </div>
        </div>

        {/* Info Step */}
        {step === 'info' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium mb-2">
                    Intelligente Synchronisation
                  </p>
                  <p className="text-blue-700 mb-2">
                    Die App vergleicht automatisch lokale und Cloud-Daten und verwendet die neuesten:
                  </p>
                  <ul className="text-blue-700 text-xs space-y-1 list-disc list-inside">
                    <li>🔍 Vergleicht Zeitstempel</li>
                    <li>📱 Behält neueste Daten</li>
                    <li>☁️ Synchronisiert automatisch</li>
                    <li>🔄 Löst Konflikte intelligent</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSmartSync}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Smart Sync
              </button>
              
              <button
                onClick={handleForceSync}
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                Force Upload
              </button>
            </div>
          </div>
        )}

        {/* Syncing Step */}
        {step === 'syncing' && (
          <div className="text-center py-8">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="font-medium text-gray-900 mb-2">
              Synchronisiere Daten...
            </h3>
            <p className="text-sm text-gray-600">
              Vergleiche lokale und Cloud-Daten
            </p>
          </div>
        )}

        {/* Result Step */}
        {step === 'result' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-green-800 mb-2">
                  Synchronisation abgeschlossen!
                </h3>
                <p className="text-sm text-green-700">
                  {lastSyncResult}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Was passiert jetzt:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Deine Daten sind auf allen Geräten gleich</li>
                <li>Abgeschlossene Sessions bleiben erhalten</li>
                <li>Reihenfolge und Status sind synchronisiert</li>
                <li>Automatischer Backup erstellt</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('info')}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Nochmal synchronisieren
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
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

export default CloudSync;
