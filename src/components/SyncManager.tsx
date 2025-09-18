import React, { useState } from 'react';
import { Smartphone, Monitor, Download, Upload, Wifi, WifiOff } from 'lucide-react';
import storageManager from '../utils/storage';

const SyncManager: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSyncOptions, setShowSyncOptions] = useState(false);

  // Listen for online/offline status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const exportForSync = () => {
    const data = storageManager.exportData();
    
    // Create a shareable link or QR code (simplified version)
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Copy to clipboard for easy sharing
    navigator.clipboard.writeText(data).then(() => {
      alert('📋 Daten in Zwischenablage kopiert!\n\nÖffne die App auf dem anderen Gerät und importiere die Daten.');
    });
    
    // Also download as file
    const a = document.createElement('a');
    a.href = url;
    a.download = `peakform-sync-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importFromSync = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          // Import data
          if (data.sessions) {
            localStorage.setItem('peakform-sessions', JSON.stringify(data.sessions));
          }
          if (data.userStats) {
            localStorage.setItem('peakform-stats', JSON.stringify(data.userStats));
          }
          if (data.quickCheck) {
            localStorage.setItem('peakform-quickcheck', JSON.stringify(data.quickCheck));
          }
          
          alert('✅ Daten erfolgreich importiert!\n\nSeite wird neu geladen...');
          window.location.reload();
        } catch (error) {
          alert('❌ Fehler beim Importieren der Daten. Bitte prüfe die Datei.');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  return (
    <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-100' : 'bg-gray-100'}`}>
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-gray-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Geräte-Sync</h3>
            <p className="text-sm text-gray-600">
              Synchronisiere zwischen Handy und PC
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowSyncOptions(!showSyncOptions)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {showSyncOptions ? 'Weniger' : 'Mehr'}
        </button>
      </div>

      {showSyncOptions && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={exportForSync}
              className="flex items-center gap-3 p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Daten teilen</div>
                <div className="text-sm text-gray-600">An anderes Gerät senden</div>
              </div>
            </button>

            <button
              onClick={importFromSync}
              className="flex items-center gap-3 p-4 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Daten empfangen</div>
                <div className="text-sm text-gray-600">Von anderem Gerät laden</div>
              </div>
            </button>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">📱 So synchronisierst du:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li><strong>1. PC:</strong> "Daten teilen" → Datei wird heruntergeladen + in Zwischenablage</li>
              <li><strong>2. Handy:</strong> PeakForm öffnen → Settings → "Daten empfangen" → Datei auswählen</li>
              <li><strong>3. Fertig:</strong> Beide Geräte haben die gleichen Daten!</li>
            </ol>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Monitor size={16} />
            <span>PC</span>
            <div className="flex-1 border-t border-dashed border-gray-300"></div>
            <Smartphone size={16} />
            <span>Handy</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncManager;
