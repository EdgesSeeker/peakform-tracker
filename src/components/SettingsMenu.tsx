import React, { useState } from 'react';
import { Settings, RotateCcw, Download, AlertTriangle, Shield, Info, Calendar, Cloud } from 'lucide-react';
import storageManager from '../utils/storage';
import GoogleCalendarSimple from './GoogleCalendarSimple';
import AutoSyncStatus from './AutoSyncStatus';
import { TrainingSession, UserStats, QuickCheck } from '../types';

interface SettingsMenuProps {
  sessions?: TrainingSession[];
  userStats?: UserStats;
  quickCheck?: QuickCheck;
  onDataUpdated?: (sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck) => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ 
  sessions = [], 
  userStats,
  quickCheck,
  onDataUpdated 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showStorageInfo, setShowStorageInfo] = useState(false);
  const [showGoogleCalendarSetup, setShowGoogleCalendarSetup] = useState(false);
  const [showCloudSync, setShowCloudSync] = useState(false);

  const resetPlan = () => {
    console.log('🔄 Plan wird zurückgesetzt...');
    storageManager.clearAll();
    window.location.reload();
  };

  const exportData = () => {
    const data = storageManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peakform-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createManualBackup = () => {
    const sessions = storageManager.loadSessions() || [];
    const stats = storageManager.loadStats() || { totalSessions: 0, totalDistance: 0, totalDuration: 0, currentStreak: 0, longestStreak: 0, points: 0, badges: [], personalRecords: [] };
    const quickCheck = storageManager.loadQuickCheck() || { sleep: 3, nutrition: 3, stress: 3, date: new Date() };
    
    if (storageManager.createBackup(sessions, stats, quickCheck)) {
      alert('✅ Backup erfolgreich erstellt!');
    } else {
      alert('❌ Fehler beim Erstellen des Backups');
    }
    setIsOpen(false);
  };

  const storageStatus = storageManager.getStorageStatus();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          isOpen ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900'
        }`}
        title="Einstellungen"
      >
        <Settings size={18} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20">
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Einstellungen</div>
            </div>
            
            <button
              onClick={() => {
                setShowCloudSync(true);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 flex items-center gap-3 transition-colors"
            >
              <Cloud size={16} className="text-purple-500" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Auto-Sync</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Automatische Synchronisation
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowGoogleCalendarSetup(true);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 flex items-center gap-3 transition-colors"
            >
              <Calendar size={16} className="text-blue-500" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Google Calendar</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Einfache Integration
                    </div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowStorageInfo(true);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 flex items-center gap-3 transition-colors"
            >
              <Info size={16} className="text-blue-500" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Speicher-Status</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">{storageStatus.sessionsCount} Sessions, {storageStatus.storageUsed}KB</div>
              </div>
            </button>

            <button
              onClick={() => {
                createManualBackup();
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 flex items-center gap-3 transition-colors"
            >
              <Shield size={16} className="text-green-500" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Backup erstellen</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">Sicherheitskopie anlegen</div>
              </div>
            </button>
            
            <button
              onClick={() => {
                exportData();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 flex items-center gap-3 transition-colors"
            >
              <Download size={16} className="text-gray-500 dark:text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Daten exportieren</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">Backup als JSON-Datei</div>
              </div>
            </button>
            
            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
            
            <button
              onClick={() => {
                setShowResetConfirm(true);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 flex items-center gap-3 transition-colors"
            >
              <RotateCcw size={16} className="text-orange-500" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Plan zurücksetzen</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">Neu starten mit heutigem Datum</div>
              </div>
            </button>
          </div>
        </>
      )}

      {showResetConfirm && (
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
                onClick={() => setShowResetConfirm(false)}
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
      )}

      {showStorageInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Speicher-Status
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Sessions:</div>
                  <div className="text-gray-600 dark:text-gray-400">{storageStatus.sessionsCount}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Speicher:</div>
                  <div className="text-gray-600 dark:text-gray-400">{storageStatus.storageUsed} KB</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Stats:</div>
                  <div className="text-gray-600 dark:text-gray-400">{storageStatus.hasStats ? '✅' : '❌'}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Backup:</div>
                  <div className="text-gray-600 dark:text-gray-400">{storageStatus.hasBackup ? '✅' : '❌'}</div>
                </div>
              </div>
              
              {storageStatus.lastBackup && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-800">Letztes Backup:</div>
                  <div className="text-sm text-green-600">
                    {storageStatus.lastBackup.toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowStorageInfo(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition-colors"
              >
                Schließen
              </button>
              <button
                onClick={() => {
                  createManualBackup();
                  setShowStorageInfo(false);
                }}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Backup erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Sync Status Modal */}
      {showCloudSync && userStats && quickCheck && onDataUpdated && (
        <AutoSyncStatus
          sessions={sessions}
          userStats={userStats}
          quickCheck={quickCheck}
          onDataUpdated={onDataUpdated}
          onClose={() => setShowCloudSync(false)}
        />
      )}

      {/* Google Calendar Simple Modal */}
      {showGoogleCalendarSetup && (
        <GoogleCalendarSimple 
          sessions={sessions}
          onClose={() => setShowGoogleCalendarSetup(false)} 
        />
      )}
    </div>
  );
};

export default SettingsMenu;
