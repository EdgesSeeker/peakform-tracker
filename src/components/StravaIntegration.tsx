import React, { useState, useEffect } from 'react';
import { Activity, Download, Link, Unlink, RefreshCw } from 'lucide-react';
import stravaService from '../services/stravaService';
import { TrainingSession } from '../types';

interface StravaIntegrationProps {
  onImportActivities: (sessions: TrainingSession[]) => void;
}

const StravaIntegration: React.FC<StravaIntegrationProps> = ({ onImportActivities }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [importCount, setImportCount] = useState(0);

  useEffect(() => {
    setIsConnected(stravaService.isConnected());

    // Load last sync date
    const savedLastSync = localStorage.getItem('strava_last_sync');
    if (savedLastSync) {
      setLastSync(new Date(savedLastSync));
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    try {
      setIsLoading(true);
      await stravaService.exchangeCodeForTokens(code);
      setIsConnected(true);
      
      // URL bereinigen
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Automatisch erste Aktivitäten importieren
      await syncActivities();
    } catch (error) {
      console.error('OAuth callback error:', error);
      alert('Fehler bei der Strava-Verbindung. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const connectToStrava = () => {
    const authUrl = stravaService.getAuthorizationUrl();
    window.location.href = authUrl;
  };

  const disconnectFromStrava = () => {
    stravaService.disconnect();
    setIsConnected(false);
    setLastSync(null);
    setImportCount(0);
    localStorage.removeItem('strava_last_sync');
  };

  const syncActivities = async () => {
    try {
      setIsLoading(true);
      
      // Nur Aktivitäten seit letzter Synchronisation laden
      const activities = await stravaService.getActivities(lastSync || undefined);
      
      if (activities.length === 0) {
        alert('Keine neuen Aktivitäten gefunden.');
        return;
      }

      // Zu TrainingSessions konvertieren
      const trainingSessions = activities.map(activity => 
        stravaService.convertToTrainingSession(activity)
      );

      // Sessions importieren
      onImportActivities(trainingSessions);
      
      // Sync-Zeit aktualisieren
      const now = new Date();
      setLastSync(now);
      localStorage.setItem('strava_last_sync', now.toISOString());
      setImportCount(prev => prev + trainingSessions.length);
      
      alert(`${trainingSessions.length} Aktivitäten erfolgreich importiert! 🎉`);
    } catch (error) {
      console.error('Sync error:', error);
      alert('Fehler beim Importieren der Aktivitäten. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Activity className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Strava Integration</h3>
          <p className="text-sm text-gray-600">
            Automatisches Importieren von Lauf-, Rad- und Schwimmeinheiten
          </p>
        </div>
      </div>

      {!isConnected ? (
        // Nicht verbunden
        <div className="text-center py-8">
          <div className="mb-4">
            <img 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiNGQzQ3MDAiLz4KPHBhdGggZD0iTTQ4IDI0SDQwTDM2IDMySDI4TDMyIDI0SDI0TDI4IDE2SDM2TDQwIDI0SDQ4WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+" 
              alt="Strava"
              className="w-16 h-16 mx-auto mb-4"
            />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Mit Strava verbinden
          </h4>
          <p className="text-gray-600 mb-6">
            Verbinde dein Strava-Konto, um deine Aktivitäten automatisch zu importieren.
          </p>
          <button
            onClick={connectToStrava}
            disabled={isLoading}
            className="btn-primary"
          >
            <Link size={18} />
            {isLoading ? 'Verbinde...' : 'Mit Strava verbinden'}
          </button>
        </div>
      ) : (
        // Verbunden
        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-success-50 rounded-lg border border-success-200">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-success-500 rounded-full"></div>
              <div>
                <div className="font-medium text-success-800">Strava verbunden</div>
                <div className="text-sm text-success-600">
                  Bereit für automatischen Import
                </div>
              </div>
            </div>
            <button
              onClick={disconnectFromStrava}
              className="text-success-600 hover:text-success-700 p-2 rounded-lg hover:bg-success-100 transition-colors"
              title="Verbindung trennen"
            >
              <Unlink size={18} />
            </button>
          </div>

          {/* Sync Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{importCount}</div>
              <div className="text-sm text-gray-600">Importierte Aktivitäten</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900">
                {lastSync ? formatDate(lastSync) : 'Nie'}
              </div>
              <div className="text-sm text-gray-600">Letzte Synchronisation</div>
            </div>
          </div>

          {/* Sync Button */}
          <div className="text-center">
            <button
              onClick={syncActivities}
              disabled={isLoading}
              className="btn-primary"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? 'Synchronisiere...' : 'Aktivitäten synchronisieren'}
            </button>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">ℹ️ Automatischer Import</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Laufen:</strong> Distanz, Pace, Dauer automatisch übernommen</li>
              <li>• <strong>Radfahren:</strong> Distanz, Watt, Dauer automatisch übernommen</li>
              <li>• <strong>Schwimmen:</strong> Distanz und Dauer automatisch übernommen</li>
              <li>• <strong>Krafttraining:</strong> Manuell erfassen (Strava hat keine Gewichte)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StravaIntegration;
