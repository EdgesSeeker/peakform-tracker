import { TrainingSession, UserStats, QuickCheck } from '../types';

interface BackupData {
  sessions: TrainingSession[];
  userStats: UserStats;
  quickCheck: QuickCheck;
  timestamp: number;
  version: string;
}

class StorageManager {
  private readonly STORAGE_KEYS = {
    sessions: 'peakform-sessions',
    stats: 'peakform-stats',
    quickcheck: 'peakform-quickcheck',
    backup: 'peakform-backup',
    lastBackup: 'peakform-last-backup',
    uiState: 'peakform-ui-state',
    syncState: 'peakform-sync-state',
    googleCalendar: 'peakform-google-calendar'
  };

  private readonly BACKUP_INTERVAL = 6 * 60 * 60 * 1000; // 6 Stunden (häufiger)
  private readonly VERSION = '1.0.1';
  private readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB Limit

  // Sessions speichern
  saveSessions(sessions: TrainingSession[]): boolean {
    try {
      const data = JSON.stringify(sessions);
      localStorage.setItem(this.STORAGE_KEYS.sessions, data);
      console.log('✅ Sessions gespeichert:', sessions.length);
      this.createBackupIfNeeded();
      return true;
    } catch (error) {
      console.error('❌ Fehler beim Speichern der Sessions:', error);
      return false;
    }
  }

  // Sessions laden
  loadSessions(): TrainingSession[] | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.sessions);
      if (!data) {
        console.log('ℹ️ Keine gespeicherten Sessions gefunden');
        return null;
      }
      
      const sessions = JSON.parse(data);
      // console.log('✅ Sessions geladen:', sessions.length); // Zu viele Logs
      
      // Validierung der Sessions
      if (!Array.isArray(sessions)) {
        console.error('❌ Sessions-Daten sind kein Array');
        return null;
      }
      
      // Date-Objekte wiederherstellen
      const validatedSessions = sessions.map(session => ({
        ...session,
        date: new Date(session.date)
      }));
      
      return validatedSessions;
    } catch (error) {
      console.error('❌ Fehler beim Laden der Sessions:', error);
      return this.restoreFromBackup()?.sessions || null;
    }
  }

  // Stats speichern
  saveStats(stats: UserStats): boolean {
    try {
      localStorage.setItem(this.STORAGE_KEYS.stats, JSON.stringify(stats));
      console.log('✅ Stats gespeichert');
      return true;
    } catch (error) {
      console.error('❌ Fehler beim Speichern der Stats:', error);
      return false;
    }
  }

  // Stats laden
  loadStats(): UserStats | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.stats);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Fehler beim Laden der Stats:', error);
      return this.restoreFromBackup()?.userStats || null;
    }
  }

  // QuickCheck speichern
  saveQuickCheck(quickCheck: QuickCheck): boolean {
    try {
      const dataToSave = {
        ...quickCheck,
        date: quickCheck.date.toISOString()
      };
      localStorage.setItem(this.STORAGE_KEYS.quickcheck, JSON.stringify(dataToSave));
      return true;
    } catch (error) {
      console.error('❌ Fehler beim Speichern des QuickChecks:', error);
      return false;
    }
  }

  // QuickCheck laden
  loadQuickCheck(): QuickCheck | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.quickcheck);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        date: new Date(parsed.date)
      };
    } catch (error) {
      console.error('❌ Fehler beim Laden des QuickChecks:', error);
      return null;
    }
  }

  // Backup erstellen
  createBackup(sessions: TrainingSession[], stats: UserStats, quickCheck: QuickCheck): boolean {
    try {
      const backupData: BackupData = {
        sessions,
        userStats: stats,
        quickCheck,
        timestamp: Date.now(),
        version: this.VERSION
      };
      
      localStorage.setItem(this.STORAGE_KEYS.backup, JSON.stringify(backupData));
      localStorage.setItem(this.STORAGE_KEYS.lastBackup, Date.now().toString());
      
      console.log('✅ Backup erstellt');
      return true;
    } catch (error) {
      console.error('❌ Fehler beim Erstellen des Backups:', error);
      return false;
    }
  }

  // Backup wiederherstellen
  restoreFromBackup(): BackupData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.backup);
      if (!data) {
        console.log('ℹ️ Kein Backup gefunden');
        return null;
      }
      
      const backup: BackupData = JSON.parse(data);
      console.log('✅ Backup wiederhergestellt vom:', new Date(backup.timestamp));
      
      // Date-Objekte wiederherstellen
      backup.sessions = backup.sessions.map(session => ({
        ...session,
        date: new Date(session.date)
      }));
      
      backup.quickCheck = {
        ...backup.quickCheck,
        date: new Date(backup.quickCheck.date)
      };
      
      return backup;
    } catch (error) {
      console.error('❌ Fehler beim Wiederherstellen des Backups:', error);
      return null;
    }
  }

  // Automatisches Backup wenn nötig
  createBackupIfNeeded(): void {
    try {
      const lastBackup = localStorage.getItem(this.STORAGE_KEYS.lastBackup);
      const now = Date.now();
      
      if (!lastBackup || (now - parseInt(lastBackup)) > this.BACKUP_INTERVAL) {
        // Aktuelle Daten für Backup sammeln
        const sessions = this.loadSessions() || [];
        const stats = this.loadStats() || this.getDefaultStats();
        const quickCheck = this.loadQuickCheck() || this.getDefaultQuickCheck();
        
        this.createBackup(sessions, stats, quickCheck);
      }
    } catch (error) {
      console.error('❌ Fehler beim automatischen Backup:', error);
    }
  }

  // Alle Daten löschen
  clearAll(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ Alle Daten gelöscht');
  }

  // Daten exportieren
  exportData(): string {
    const sessions = this.loadSessions() || [];
    const stats = this.loadStats() || this.getDefaultStats();
    const quickCheck = this.loadQuickCheck() || this.getDefaultQuickCheck();
    
    const exportData = {
      sessions,
      userStats: stats,
      quickCheck,
      exportDate: new Date().toISOString(),
      version: this.VERSION
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Storage-Status prüfen
  getStorageStatus(): {
    sessionsCount: number;
    hasStats: boolean;
    hasQuickCheck: boolean;
    hasBackup: boolean;
    lastBackup: Date | null;
    storageUsed: number;
  } {
    const sessions = this.loadSessions() || [];
    const stats = this.loadStats();
    const quickCheck = this.loadQuickCheck();
    const backup = localStorage.getItem(this.STORAGE_KEYS.backup);
    const lastBackup = localStorage.getItem(this.STORAGE_KEYS.lastBackup);
    
    // Storage-Größe berechnen
    let storageUsed = 0;
    Object.values(this.STORAGE_KEYS).forEach(key => {
      const data = localStorage.getItem(key);
      if (data) storageUsed += data.length;
    });
    
    return {
      sessionsCount: sessions.length,
      hasStats: !!stats,
      hasQuickCheck: !!quickCheck,
      hasBackup: !!backup,
      lastBackup: lastBackup ? new Date(parseInt(lastBackup)) : null,
      storageUsed: Math.round(storageUsed / 1024) // KB
    };
  }

  private getDefaultStats(): UserStats {
    return {
      totalSessions: 0,
      totalDistance: 0,
      totalDuration: 0,
      currentStreak: 0,
      longestStreak: 0,
      points: 0,
      badges: [],
      personalRecords: []
    };
  }

  private getDefaultQuickCheck(): QuickCheck {
    return {
      sleep: 3,
      nutrition: 3,
      stress: 3,
      date: new Date()
    };
  }

  // UI-Zustand speichern
  saveUIState(key: string, value: any): boolean {
    try {
      const currentState = this.loadUIState();
      const newState = { ...currentState, [key]: value };
      localStorage.setItem(this.STORAGE_KEYS.uiState, JSON.stringify(newState));
      return true;
    } catch (error) {
      console.error('❌ Fehler beim Speichern des UI-Zustands:', error);
      return false;
    }
  }

  // UI-Zustand laden
  loadUIState(): { [key: string]: any } {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.uiState);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('❌ Fehler beim Laden des UI-Zustands:', error);
      return {};
    }
  }

  // Spezifischen UI-Zustand laden
  getUIState(key: string, defaultValue: any = null): any {
    const state = this.loadUIState();
    return state[key] !== undefined ? state[key] : defaultValue;
  }

  // Erweiterte Persistierung-Funktionen
  
  // Prüfe ob Storage verfügbar ist
  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Prüfe Storage-Größe
  getStorageSize(): { used: number; available: number; percentage: number } {
    let used = 0;
    Object.values(this.STORAGE_KEYS).forEach(key => {
      const data = localStorage.getItem(key);
      if (data) used += new Blob([data]).size;
    });

    const available = this.MAX_STORAGE_SIZE - used;
    const percentage = Math.round((used / this.MAX_STORAGE_SIZE) * 100);

    return { used, available, percentage };
  }

  // Automatische Bereinigung bei Storage-Problemen
  cleanupStorage(): void {
    try {
      const storageInfo = this.getStorageSize();
      
      if (storageInfo.percentage > 80) {
        console.log('🧹 Storage-Bereinigung gestartet...');
        
        // Alte Backups löschen (behalte nur das neueste)
        const keys = Object.keys(localStorage);
        const backupKeys = keys.filter(key => key.startsWith('peakform-backup-old'));
        backupKeys.forEach(key => localStorage.removeItem(key));
        
        // UI-State bereinigen (behalte nur wichtige Einstellungen)
        const uiState = this.loadUIState();
        const importantKeys = ['theme', 'expandedSessions'];
        const cleanedUIState: any = {};
        importantKeys.forEach(key => {
          if (uiState[key] !== undefined) {
            cleanedUIState[key] = uiState[key];
          }
        });
        localStorage.setItem(this.STORAGE_KEYS.uiState, JSON.stringify(cleanedUIState));
        
        console.log('✅ Storage bereinigt');
      }
    } catch (error) {
      console.error('❌ Fehler bei Storage-Bereinigung:', error);
    }
  }

  // Sync-State für Multi-Device Support
  saveSyncState(lastSync: Date, deviceId: string): void {
    try {
      const syncState = {
        lastSync: lastSync.toISOString(),
        deviceId,
        version: this.VERSION,
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEYS.syncState, JSON.stringify(syncState));
    } catch (error) {
      console.error('❌ Fehler beim Speichern des Sync-Status:', error);
    }
  }

  getSyncState(): { lastSync: Date | null; deviceId: string | null; needsSync: boolean } {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.syncState);
      if (!data) {
        return { lastSync: null, deviceId: null, needsSync: true };
      }

      const syncState = JSON.parse(data);
      const lastSync = new Date(syncState.lastSync);
      const now = new Date();
      const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
      
      return {
        lastSync,
        deviceId: syncState.deviceId,
        needsSync: hoursSinceSync > 2 // Sync wenn älter als 2 Stunden
      };
    } catch (error) {
      console.error('❌ Fehler beim Laden des Sync-Status:', error);
      return { lastSync: null, deviceId: null, needsSync: true };
    }
  }

  // Robustes Speichern mit Retry-Logic
  saveWithRetry<T>(key: string, data: T, maxRetries: number = 3): boolean {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (error) {
        console.warn(`⚠️ Speichern fehlgeschlagen (Versuch ${attempt}/${maxRetries}):`, error);
        
        if (attempt === maxRetries) {
          // Letzter Versuch: Storage bereinigen und nochmal versuchen
          this.cleanupStorage();
          try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
          } catch (finalError) {
            console.error('❌ Speichern endgültig fehlgeschlagen:', finalError);
            return false;
          }
        }
        
        // Kurz warten vor nächstem Versuch
        setTimeout(() => {}, 100);
      }
    }
    return false;
  }
}

const storageManagerInstance = new StorageManager();
export default storageManagerInstance;
