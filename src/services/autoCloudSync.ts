import { TrainingSession, UserStats, QuickCheck } from '../types';

interface SyncData {
  sessions: TrainingSession[];
  userStats: UserStats;
  quickCheck: QuickCheck;
  timestamp: number;
  deviceId: string;
  version: string;
}

class AutoCloudSyncService {
  private readonly GITHUB_GIST_TOKEN = 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Wird durch echten Token ersetzt
  private readonly GIST_ID = 'peakform-sync-gist';
  private readonly SYNC_INTERVAL = 30000; // 30 Sekunden
  private deviceId: string;
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = navigator.onLine;

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
    this.setupOnlineListener();
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('peakform-device-id');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('peakform-device-id', deviceId);
    }
    return deviceId;
  }

  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Internetverbindung wiederhergestellt - Sync wird fortgesetzt');
      // Auto-Sync wird bei Bedarf von der App neu gestartet
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Offline - Sync pausiert');
      this.stopAutoSync();
    });
  }

  // Vereinfachte Cloud-Synchronisation mit localStorage als "Cloud"
  async uploadToCloud(sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck): Promise<boolean> {
    try {
      const syncData: SyncData = {
        sessions,
        userStats,
        quickCheck,
        timestamp: Date.now(),
        deviceId: this.deviceId,
        version: '1.0.0'
      };

      // Für Demo: Verwende localStorage als "Cloud" mit speziellem Key
      const cloudKey = 'peakform-global-cloud-data';
      localStorage.setItem(cloudKey, JSON.stringify(syncData));
      localStorage.setItem('peakform-last-sync', new Date().toISOString());
      
      // Zusätzlich: Versuche es in sessionStorage für Tab-übergreifende Sync
      try {
        sessionStorage.setItem(cloudKey, JSON.stringify(syncData));
      } catch (e) {
        // Ignoriere sessionStorage Fehler
      }

      console.log('☁️ Auto-Sync: Daten hochgeladen', {
        sessions: sessions.length,
        completed: sessions.filter(s => s.completed).length,
        timestamp: new Date().toLocaleTimeString('de-DE')
      });

      return true;
    } catch (error) {
      console.error('❌ Auto-Upload fehlgeschlagen:', error);
      return false;
    }
  }

  async downloadFromCloud(): Promise<SyncData | null> {
    try {
      const cloudKey = 'peakform-global-cloud-data';
      
      // Versuche zuerst sessionStorage (für Tab-übergreifend)
      let data = sessionStorage.getItem(cloudKey);
      
      // Fallback: localStorage
      if (!data) {
        data = localStorage.getItem(cloudKey);
      }

      if (!data) {
        return null;
      }

      const syncData: SyncData = JSON.parse(data);
      
      // Date-Objekte wiederherstellen
      syncData.sessions = syncData.sessions.map(session => ({
        ...session,
        date: new Date(session.date)
      }));

      console.log('☁️ Auto-Sync: Daten heruntergeladen', {
        sessions: syncData.sessions.length,
        completed: syncData.sessions.filter(s => s.completed).length,
        fromDevice: syncData.deviceId,
        age: Math.round((Date.now() - syncData.timestamp) / 1000) + 's'
      });

      return syncData;
    } catch (error) {
      console.error('❌ Auto-Download fehlgeschlagen:', error);
      return null;
    }
  }

  // Automatische Synchronisation
  async performAutoSync(
    localSessions: TrainingSession[], 
    localStats: UserStats, 
    localQuickCheck: QuickCheck,
    onDataUpdated?: (sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck) => void
  ): Promise<boolean> {
    try {
      if (!this.isOnline) {
        console.log('📴 Offline - Auto-Sync übersprungen');
        return false;
      }

      // Lade Cloud-Daten
      const cloudData = await this.downloadFromCloud();
      
      if (!cloudData) {
        // Keine Cloud-Daten - lade lokale hoch
        return await this.uploadToCloud(localSessions, localStats, localQuickCheck);
      }

      // Vergleiche Zeitstempel
      const localTimestamp = localStorage.getItem('peakform-last-sync');
      const localTime = localTimestamp ? new Date(localTimestamp).getTime() : 0;
      const cloudTime = cloudData.timestamp;

      // Prüfe ob sich lokale Daten geändert haben
      const localChanged = this.hasLocalDataChanged(localSessions, localStats);
      
      if (cloudTime > localTime && !localChanged) {
        // Cloud-Daten sind neuer und lokal hat sich nichts geändert
        console.log('☁️ Auto-Sync: Cloud-Daten übernehmen');
        if (onDataUpdated) {
          onDataUpdated(cloudData.sessions, cloudData.userStats, cloudData.quickCheck);
        }
        return true;
      } else if (localChanged) {
        // Lokale Änderungen - lade hoch
        console.log('📱 Auto-Sync: Lokale Änderungen hochladen');
        return await this.uploadToCloud(localSessions, localStats, localQuickCheck);
      }

      return false; // Keine Änderungen
    } catch (error) {
      console.error('❌ Auto-Sync fehlgeschlagen:', error);
      return false;
    }
  }

  private hasLocalDataChanged(sessions: TrainingSession[], userStats: UserStats): boolean {
    try {
      const lastSyncData = localStorage.getItem('peakform-last-sync-data');
      if (!lastSyncData) return true;

      const lastData = JSON.parse(lastSyncData);
      const currentData = {
        sessionCount: sessions.length,
        completedCount: sessions.filter(s => s.completed).length,
        totalSessions: userStats.totalSessions
      };

      const hasChanged = JSON.stringify(lastData) !== JSON.stringify(currentData);
      
      if (hasChanged) {
        localStorage.setItem('peakform-last-sync-data', JSON.stringify(currentData));
      }

      return hasChanged;
    } catch (error) {
      return true; // Bei Fehlern immer als "geändert" behandeln
    }
  }

  // Auto-Sync starten
  startAutoSync(
    getSessions: () => TrainingSession[],
    getUserStats: () => UserStats,
    getQuickCheck: () => QuickCheck,
    onDataUpdated?: (sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck) => void
  ): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    console.log('🚀 Auto-Sync gestartet (alle 30 Sekunden)');

    this.syncInterval = setInterval(async () => {
      const sessions = getSessions();
      const userStats = getUserStats();
      const quickCheck = getQuickCheck();
      
      await this.performAutoSync(sessions, userStats, quickCheck, onDataUpdated);
    }, this.SYNC_INTERVAL);

    // Initiale Synchronisation
    setTimeout(async () => {
      const sessions = getSessions();
      const userStats = getUserStats();
      const quickCheck = getQuickCheck();
      
      await this.performAutoSync(sessions, userStats, quickCheck, onDataUpdated);
    }, 2000); // 2 Sekunden nach Start
  }

  // Auto-Sync stoppen
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Auto-Sync gestoppt');
    }
  }

  // Manueller Sync-Trigger
  async forceSyncNow(
    sessions: TrainingSession[], 
    userStats: UserStats, 
    quickCheck: QuickCheck,
    onDataUpdated?: (sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck) => void
  ): Promise<string> {
    console.log('🚀 Manueller Sync gestartet...');
    
    const result = await this.performAutoSync(sessions, userStats, quickCheck, onDataUpdated);
    
    return result ? 
      'Synchronisation erfolgreich abgeschlossen' : 
      'Synchronisation fehlgeschlagen oder keine Änderungen';
  }

  // Status abrufen
  getSyncStatus(): {
    deviceId: string;
    lastSync: Date | null;
    isAutoSyncActive: boolean;
    isOnline: boolean;
  } {
    const lastSync = localStorage.getItem('peakform-last-sync');
    
    return {
      deviceId: this.deviceId,
      lastSync: lastSync ? new Date(lastSync) : null,
      isAutoSyncActive: this.syncInterval !== null,
      isOnline: this.isOnline
    };
  }
}

const autoCloudSyncService = new AutoCloudSyncService();
export default autoCloudSyncService;
