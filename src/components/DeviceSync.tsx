import React, { useState, useEffect } from 'react';
import { Cloud, Smartphone, Monitor, RefreshCw, Check, AlertTriangle, X, Copy, Download, Upload, Share } from 'lucide-react';
import realCloudSync from '../services/realCloudSync';
import { TrainingSession, UserStats, QuickCheck } from '../types';

interface DeviceSyncProps {
  sessions: TrainingSession[];
  userStats: UserStats;
  quickCheck: QuickCheck;
  onDataUpdated: (sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck) => void;
  onClose: () => void;
}

const DeviceSync: React.FC<DeviceSyncProps> = ({ 
  sessions, 
  userStats, 
  quickCheck, 
  onDataUpdated, 
  onClose 
}) => {
  const [syncStatus, setSyncStatus] = useState(realCloudSync.getSyncStatus());
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string>('');
  const [step, setStep] = useState<'info' | 'share' | 'import' | 'result'>('info');
  const [shareCode, setShareCode] = useState<string>('');
  const [importCode, setImportCode] = useState<string>('');

  useEffect(() => {
    updateStatus();
  }, []);

  const updateStatus = () => {
    const status = realCloudSync.getSyncStatus();
    setSyncStatus(status);
  };

  const handleGenerateShareCode = () => {
    setIsLoading(true);
    
    try {
      const code = realCloudSync.generateShareCode(sessions, userStats, quickCheck);
      setShareCode(code);
      setStep('share');
      updateStatus();
    } catch (error) {
      console.error('❌ Share-Code Fehler:', error);
      setLastSyncResult('Fehler beim Erstellen des Share-Codes');
      setStep('result');
    }
    
    setIsLoading(false);
  };

  const handleCopyShareCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      alert('Share-Code in Zwischenablage kopiert! 📋');
    } catch (error) {
      // Fallback für ältere Browser
      const textArea = document.createElement('textarea');
      textArea.value = shareCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Share-Code in Zwischenablage kopiert! 📋');
    }
  };

  const handleImportData = async () => {
    if (!importCode.trim()) {
      alert('Bitte gib einen Share-Code ein');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await realCloudSync.performSmartSync(sessions, userStats, quickCheck, importCode);
      
      if (result.syncPerformed) {
        onDataUpdated(result.sessions, result.userStats, result.quickCheck);
        setLastSyncResult(result.message);
        updateStatus();
        setStep('result');
      } else {
        setLastSyncResult('Import fehlgeschlagen - ungültiger Share-Code');
        setStep('result');
      }
    } catch (error) {
      console.error('❌ Import-Fehler:', error);
      setLastSyncResult('Import fehlgeschlagen');
      setStep('result');
    }
    
    setIsLoading(false);
  };

  const completedSessions = sessions.filter(s => s.completed).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Cloud className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Geräte-Synchronisation</h2>
              <p className="text-sm text-gray-600">Daten zwischen Geräten teilen</p>
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
                Gerät: {syncStatus.deviceId.split('-')[1]?.substr(0, 8) || 'Unbekannt'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Monitor size={16} className="text-green-500" />
              <span className="text-sm text-gray-600">
                Lokale Daten: {sessions.length} Sessions, {completedSessions} abgeschlossen
              </span>
            </div>
            
            {syncStatus.lastUpload && (
              <div className="flex items-center gap-2">
                <Upload size={16} className="text-purple-500" />
                <span className="text-sm text-gray-600">
                  Letzter Upload: {syncStatus.lastUpload.toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
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
                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium mb-2">
                    Einfache Geräte-Synchronisation
                  </p>
                  <p className="text-blue-700 mb-2">
                    Synchronisiere deine Daten zwischen PC und Handy:
                  </p>
                  <ul className="text-blue-700 text-xs space-y-1 list-disc list-inside">
                    <li>📤 <strong>Exportieren:</strong> Erstelle Share-Code auf dem aktuellen Gerät</li>
                    <li>📥 <strong>Importieren:</strong> Verwende Share-Code auf dem anderen Gerät</li>
                    <li>🔄 <strong>Automatisch:</strong> Neueste Daten gewinnen</li>
                    <li>✅ <strong>Sicher:</strong> Alle Daten bleiben lokal</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleGenerateShareCode}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Share size={16} />
                Daten exportieren (Share-Code erstellen)
              </button>
              
              <button
                onClick={() => setStep('import')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Daten importieren (Share-Code eingeben)
              </button>
            </div>
          </div>
        )}

        {/* Share Step */}
        {step === 'share' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-green-800 mb-2">
                  Share-Code erstellt!
                </h3>
                <p className="text-sm text-green-700">
                  Kopiere diesen Code und füge ihn auf dem anderen Gerät ein
                </p>
              </div>
              
              <div className="p-3 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                <div className="text-xs font-mono text-gray-700 break-all leading-relaxed">
                  {shareCode.substr(0, 100)}...
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {Math.round(shareCode.length / 1024)}KB • {sessions.length} Sessions • {completedSessions} abgeschlossen
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopyShareCode}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Copy size={16} />
                  Kopieren
                </button>
                <button
                  onClick={() => setStep('info')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Zurück
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Step */}
        {step === 'import' && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-3">
                <Download className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium mb-2">
                    Daten von anderem Gerät importieren
                  </p>
                  <p className="text-yellow-700">
                    Füge den Share-Code vom anderen Gerät ein:
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share-Code
              </label>
              <textarea
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Füge hier den Share-Code vom anderen Gerät ein..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs font-mono"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleImportData}
                disabled={!importCode.trim() || isLoading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Importiere...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Daten importieren
                  </>
                )}
              </button>
              <button
                onClick={() => setStep('info')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Zurück
              </button>
            </div>
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
                <li>Deine Daten sind auf beiden Geräten gleich</li>
                <li>Abgeschlossene Sessions bleiben erhalten</li>
                <li>Reihenfolge und Status sind synchronisiert</li>
                <li>App wird automatisch aktualisiert</li>
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

export default DeviceSync;
