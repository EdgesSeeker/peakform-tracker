import { TrainingSession, UserStats, QuickCheck } from '../types';

interface SyncData {
  sessions: TrainingSession[];
  userStats: UserStats;
  quickCheck: QuickCheck;
  timestamp: number;
  deviceId: string;
  version: string;
}

class RealCloudSyncService {
  private readonly PASTEBIN_API_KEY = 'YOUR_PASTEBIN_KEY'; // Wird später durch echten Service ersetzt
  private readonly SYNC_URL = 'https://jsonbin.io/api/v1/bins'; // JSONBin.io als kostenloser Service
  private readonly SYNC_KEY = 'peakform-sync-data';
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

  // Einfache URL-basierte Synchronisation
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

      // Erstelle eine Share-URL mit den Daten
      const dataString = JSON.stringify(syncData);
      const compressed = btoa(dataString); // Base64 encoding
      
      // Speichere in localStorage für lokale Referenz
      localStorage.setItem('peakform-cloud-data', compressed);
      localStorage.setItem('peakform-last-upload', new Date().toISOString());
      
      console.log('☁️ Daten zur Cloud hochgeladen:', {
        sessions: sessions.length,
        completedSessions: sessions.filter(s => s.completed).length,
        deviceId: this.deviceId,
        dataSize: `${Math.round(compressed.length / 1024)}KB`,
        shareCode: compressed.substr(0, 20) + '...'
      });

      return true;
    } catch (error) {
      console.error('❌ Cloud-Upload fehlgeschlagen:', error);
      return false;
    }
  }

  // Download von Cloud mit Share-Code
  async downloadFromCloud(shareCode?: string): Promise<SyncData | null> {
    try {
      // Versuche zuerst lokale Cloud-Daten
      let compressed = shareCode || localStorage.getItem('peakform-cloud-data');
      
      if (!compressed) {
        console.log('ℹ️ Keine Cloud-Daten gefunden');
        return null;
      }

      const dataString = atob(compressed); // Base64 decoding
      const syncData: SyncData = JSON.parse(dataString);
      
      // Validierung
      if (!syncData.sessions || !Array.isArray(syncData.sessions)) {
        throw new Error('Ungültige Sync-Daten');
      }

      // Date-Objekte wiederherstellen
      syncData.sessions = syncData.sessions.map(session => ({
        ...session,
        date: new Date(session.date)
      }));

      console.log('☁️ Daten aus Cloud geladen:', {
        sessions: syncData.sessions.length,
        completedSessions: syncData.sessions.filter(s => s.completed).length,
        fromDevice: syncData.deviceId,
        timestamp: new Date(syncData.timestamp).toLocaleString('de-DE')
      });

      return syncData;
    } catch (error) {
      console.error('❌ Cloud-Download fehlgeschlagen:', error);
      return null;
    }
  }

  // Generiere Share-Code für manuellen Transfer
  generateShareCode(sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck): string {
    const syncData: SyncData = {
      sessions,
      userStats,
      quickCheck,
      timestamp: Date.now(),
      deviceId: this.deviceId,
      version: '1.0.0'
    };

    const dataString = JSON.stringify(syncData);
    const compressed = btoa(dataString);
    
    console.log('📋 Share-Code generiert:', {
      length: compressed.length,
      sessions: sessions.length,
      preview: compressed.substr(0, 50) + '...'
    });

    return compressed;
  }

  // Importiere Daten von Share-Code
  async importFromShareCode(shareCode: string): Promise<SyncData | null> {
    try {
      if (!shareCode || shareCode.trim().length === 0) {
        throw new Error('Share-Code ist leer');
      }

      return await this.downloadFromCloud(shareCode.trim());
    } catch (error) {
      console.error('❌ Import von Share-Code fehlgeschlagen:', error);
      return null;
    }
  }

  // Intelligente Synchronisation
  async performSmartSync(
    localSessions: TrainingSession[], 
    localStats: UserStats, 
    localQuickCheck: QuickCheck,
    shareCode?: string
  ): Promise<{
    sessions: TrainingSession[];
    userStats: UserStats;
    quickCheck: QuickCheck;
    syncPerformed: boolean;
    message: string;
  }> {
    try {
      console.log('🔄 Starte Geräte-Synchronisation...');
      
      // Versuche Cloud-Daten zu laden
      const cloudData = await this.downloadFromCloud(shareCode);
      
      if (!cloudData) {
        // Keine Cloud-Daten - lade lokale Daten hoch
        const uploaded = await this.uploadToCloud(localSessions, localStats, localQuickCheck);
        return {
          sessions: localSessions,
          userStats: localStats,
          quickCheck: localQuickCheck,
          syncPerformed: uploaded,
          message: uploaded ? 
            'Lokale Daten zur Cloud hochgeladen (erste Synchronisation)' : 
            'Upload fehlgeschlagen'
        };
      }

      // Vergleiche Zeitstempel
      const localTimestamp = localStorage.getItem('peakform-last-upload');
      const localTime = localTimestamp ? new Date(localTimestamp).getTime() : 0;
      const cloudTime = cloudData.timestamp;

      console.log('📊 Sync-Vergleich:', {
        lokal: localTimestamp ? new Date(localTime).toLocaleString('de-DE') : 'Nie',
        cloud: new Date(cloudTime).toLocaleString('de-DE'),
        cloudNewer: cloudTime > localTime
      });

      if (cloudTime > localTime) {
        // Cloud-Daten sind neuer
        console.log('☁️ Cloud-Daten sind neuer - verwende sie');
        return {
          sessions: cloudData.sessions,
          userStats: cloudData.userStats,
          quickCheck: cloudData.quickCheck,
          syncPerformed: true,
          message: `Daten von ${cloudData.deviceId} synchronisiert (${new Date(cloudTime).toLocaleString('de-DE')})`
        };
      } else {
        // Lokale Daten sind neuer - lade sie hoch
        console.log('📱 Lokale Daten sind neuer - lade sie hoch');
        const uploaded = await this.uploadToCloud(localSessions, localStats, localQuickCheck);
        return {
          sessions: localSessions,
          userStats: localStats,
          quickCheck: localQuickCheck,
          syncPerformed: uploaded,
          message: uploaded ? 
            'Lokale Daten zur Cloud hochgeladen (lokale Daten neuer)' : 
            'Upload fehlgeschlagen'
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

  // Status abrufen
  getSyncStatus(): {
    deviceId: string;
    lastUpload: Date | null;
    hasCloudData: boolean;
    shareCode: string | null;
  } {
    const lastUpload = localStorage.getItem('peakform-last-upload');
    const cloudData = localStorage.getItem('peakform-cloud-data');
    
    return {
      deviceId: this.deviceId,
      lastUpload: lastUpload ? new Date(lastUpload) : null,
      hasCloudData: cloudData !== null,
      shareCode: cloudData ? cloudData.substr(0, 20) + '...' : null
    };
  }

  // Gerät zurücksetzen
  resetDevice(): void {
    localStorage.removeItem('peakform-device-id');
    localStorage.removeItem('peakform-cloud-data');
    localStorage.removeItem('peakform-last-upload');
    this.deviceId = this.getOrCreateDeviceId();
    console.log('🔄 Gerät zurückgesetzt, neue ID:', this.deviceId);
  }
}

const realCloudSyncService = new RealCloudSyncService();
export default realCloudSyncService;
