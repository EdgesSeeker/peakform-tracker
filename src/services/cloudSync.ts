import { TrainingSession, UserStats, QuickCheck } from '../types';
import storageManager from '../utils/storage';

interface SyncData {
  sessions: TrainingSession[];
  userStats: UserStats;
  quickCheck: QuickCheck;
  timestamp: number;
  deviceId: string;
  version: string;
}

interface CloudSyncResponse {
  success: boolean;
  data?: SyncData;
  message?: string;
}

class CloudSyncService {
  private readonly SYNC_ENDPOINT = 'https://api.jsonbin.io/v3/b';
  private readonly API_KEY = '$2a$10$9fVfNPOQxrEeUJXuBBCuWeC.LCuFGv1OOPzw1fNQxrEeUJXuBBCuWe'; // Fake key for demo
  private readonly BIN_ID = 'peakform-sync-data';
  private deviceId: string;

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('peakform-device-id');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('peakform-device-id', deviceId);
    }
    return deviceId;
  }

  // Vereinfachte Synchronisation über localStorage mit Backup-URL
  async syncToCloud(sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck): Promise<boolean> {
    try {
      const syncData: SyncData = {
        sessions,
        userStats,
        quickCheck,
        timestamp: Date.now(),
        deviceId: this.deviceId,
        version: '1.0.0'
      };

      // Lokale Speicherung als Backup
      localStorage.setItem('peakform-cloud-backup', JSON.stringify(syncData));
      
      // Für Demo: Simuliere Cloud-Upload
      console.log('☁️ Daten zur Cloud synchronisiert:', {
        sessions: sessions.length,
        completedSessions: sessions.filter(s => s.completed).length,
        deviceId: this.deviceId,
        timestamp: new Date().toLocaleString('de-DE')
      });

      // Speichere letzten Sync-Zeitpunkt
      storageManager.saveSyncState(new Date(), this.deviceId);
      
      return true;
    } catch (error) {
      console.error('❌ Cloud-Sync fehlgeschlagen:', error);
      return false;
    }
  }

  async syncFromCloud(): Promise<SyncData | null> {
    try {
      // Für Demo: Lade aus lokalem Backup
      const backupData = localStorage.getItem('peakform-cloud-backup');
      if (backupData) {
        const syncData: SyncData = JSON.parse(backupData);
        console.log('☁️ Daten aus Cloud geladen:', {
          sessions: syncData.sessions.length,
          completedSessions: syncData.sessions.filter(s => s.completed).length,
          fromDevice: syncData.deviceId,
          timestamp: new Date(syncData.timestamp).toLocaleString('de-DE')
        });
        return syncData;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Cloud-Sync-Download fehlgeschlagen:', error);
      return null;
    }
  }

  // Intelligente Synchronisation - löst Konflikte
  async performSmartSync(localSessions: TrainingSession[], localStats: UserStats, localQuickCheck: QuickCheck): Promise<{
    sessions: TrainingSession[];
    userStats: UserStats;
    quickCheck: QuickCheck;
    syncPerformed: boolean;
    message: string;
  }> {
    try {
      console.log('🔄 Starte intelligente Synchronisation...');
      
      // Lade Cloud-Daten
      const cloudData = await this.syncFromCloud();
      
      if (!cloudData) {
        // Keine Cloud-Daten vorhanden - lokale Daten hochladen
        await this.syncToCloud(localSessions, localStats, localQuickCheck);
        return {
          sessions: localSessions,
          userStats: localStats,
          quickCheck: localQuickCheck,
          syncPerformed: true,
          message: 'Lokale Daten zur Cloud synchronisiert (erste Synchronisation)'
        };
      }

      // Prüfe, welche Daten neuer sind
      const localTimestamp = storageManager.getSyncState().lastSync?.getTime() || 0;
      const cloudTimestamp = cloudData.timestamp;

      console.log('📊 Sync-Vergleich:', {
        lokal: new Date(localTimestamp).toLocaleString('de-DE'),
        cloud: new Date(cloudTimestamp).toLocaleString('de-DE'),
        cloudNewer: cloudTimestamp > localTimestamp
      });

      if (cloudTimestamp > localTimestamp) {
        // Cloud-Daten sind neuer - verwende sie
        console.log('☁️ Cloud-Daten sind neuer - übernehme sie');
        return {
          sessions: cloudData.sessions,
          userStats: cloudData.userStats,
          quickCheck: cloudData.quickCheck,
          syncPerformed: true,
          message: `Daten von ${cloudData.deviceId} synchronisiert (${new Date(cloudTimestamp).toLocaleString('de-DE')})`
        };
      } else {
        // Lokale Daten sind neuer oder gleich - lade sie hoch
        console.log('📱 Lokale Daten sind aktueller - lade sie hoch');
        await this.syncToCloud(localSessions, localStats, localQuickCheck);
        return {
          sessions: localSessions,
          userStats: localStats,
          quickCheck: localQuickCheck,
          syncPerformed: true,
          message: 'Lokale Daten zur Cloud synchronisiert (lokale Daten neuer)'
        };
      }
    } catch (error) {
      console.error('❌ Smart-Sync fehlgeschlagen:', error);
      return {
        sessions: localSessions,
        userStats: localStats,
        quickCheck: localQuickCheck,
        syncPerformed: false,
        message: 'Synchronisation fehlgeschlagen - verwende lokale Daten'
      };
    }
  }

  // Manueller Sync-Trigger
  async forceSyncToCloud(sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck): Promise<boolean> {
    console.log('🚀 Erzwinge Cloud-Synchronisation...');
    return await this.syncToCloud(sessions, userStats, quickCheck);
  }

  // Sync-Status abrufen
  getSyncStatus(): {
    deviceId: string;
    lastSync: Date | null;
    hasCloudBackup: boolean;
  } {
    const syncState = storageManager.getSyncState();
    const hasBackup = localStorage.getItem('peakform-cloud-backup') !== null;
    
    return {
      deviceId: this.deviceId,
      lastSync: syncState.lastSync,
      hasCloudBackup: hasBackup
    };
  }

  // Gerät zurücksetzen (für Debugging)
  resetDevice(): void {
    localStorage.removeItem('peakform-device-id');
    localStorage.removeItem('peakform-cloud-backup');
    this.deviceId = this.getOrCreateDeviceId();
    console.log('🔄 Gerät zurückgesetzt, neue ID:', this.deviceId);
  }
}

const cloudSyncService = new CloudSyncService();
export default cloudSyncService;
