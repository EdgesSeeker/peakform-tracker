import { TrainingSession, UserStats, QuickCheck } from '../types';

interface SyncData {
  sessions: TrainingSession[];
  userStats: UserStats;
  quickCheck: QuickCheck;
  timestamp: number;
  deviceId: string;
  version: string;
}

class FirebaseSyncService {
  private readonly FIREBASE_URL = 'https://peakform-sync-default-rtdb.europe-west1.firebasedatabase.app';
  private readonly USER_ID = 'user-' + this.generateUserId();
  private deviceId: string;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
  }

  private generateUserId(): string {
    // Erstelle eine eindeutige User-ID basierend auf Browser-Fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('PeakForm', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      window.screen.width + 'x' + window.screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Einfacher Hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('peakform-device-id');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('peakform-device-id', deviceId);
    }
    return deviceId;
  }

  // Daten zur Firebase hochladen
  async uploadToFirebase(sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck): Promise<boolean> {
    try {
      const syncData: SyncData = {
        sessions,
        userStats,
        quickCheck,
        timestamp: Date.now(),
        deviceId: this.deviceId,
        version: '1.0.0'
      };

      const response = await fetch(`${this.FIREBASE_URL}/users/${this.USER_ID}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syncData)
      });

      if (response.ok) {
        localStorage.setItem('peakform-last-firebase-sync', new Date().toISOString());
        console.log('☁️ Firebase: Daten erfolgreich hochgeladen', {
          sessions: sessions.length,
          completed: sessions.filter(s => s.completed).length,
          userId: this.USER_ID
        });
        return true;
      } else {
        throw new Error(`Firebase Upload failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Firebase Upload fehlgeschlagen:', error);
      return false;
    }
  }

  // Daten von Firebase herunterladen
  async downloadFromFirebase(): Promise<SyncData | null> {
    try {
      const response = await fetch(`${this.FIREBASE_URL}/users/${this.USER_ID}.json`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('ℹ️ Keine Firebase-Daten gefunden (erste Nutzung)');
          return null;
        }
        throw new Error(`Firebase Download failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.sessions) {
        console.log('ℹ️ Keine gültigen Firebase-Daten gefunden');
        return null;
      }

      // Date-Objekte wiederherstellen
      data.sessions = data.sessions.map((session: any) => ({
        ...session,
        date: new Date(session.date)
      }));

      console.log('☁️ Firebase: Daten erfolgreich heruntergeladen', {
        sessions: data.sessions.length,
        completed: data.sessions.filter((s: any) => s.completed).length,
        fromDevice: data.deviceId,
        age: Math.round((Date.now() - data.timestamp) / 1000) + 's'
      });

      return data;
    } catch (error) {
      console.error('❌ Firebase Download fehlgeschlagen:', error);
      return null;
    }
  }

  // Intelligente Synchronisation
  async performSmartSync(
    localSessions: TrainingSession[], 
    localStats: UserStats, 
    localQuickCheck: QuickCheck,
    onDataUpdated?: (sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck) => void
  ): Promise<{ success: boolean; message: string; dataUpdated: boolean }> {
    try {
      console.log('🔄 Firebase Smart-Sync gestartet...');
      
      // Lade Firebase-Daten
      const firebaseData = await this.downloadFromFirebase();
      
      if (!firebaseData) {
        // Keine Firebase-Daten - erste Synchronisation
        const uploaded = await this.uploadToFirebase(localSessions, localStats, localQuickCheck);
        return {
          success: uploaded,
          message: uploaded ? 'Erste Synchronisation erfolgreich' : 'Upload fehlgeschlagen',
          dataUpdated: false
        };
      }

      // Vergleiche Zeitstempel
      const localTimestamp = localStorage.getItem('peakform-last-firebase-sync');
      const localTime = localTimestamp ? new Date(localTimestamp).getTime() : 0;
      const firebaseTime = firebaseData.timestamp;

      console.log('📊 Sync-Vergleich:', {
        lokal: localTimestamp ? new Date(localTime).toLocaleString('de-DE') : 'Nie',
        firebase: new Date(firebaseTime).toLocaleString('de-DE'),
        firebaseNewer: firebaseTime > localTime,
        lokaleSessions: localSessions.length,
        firebaseSessions: firebaseData.sessions.length,
        lokaleCompleted: localSessions.filter(s => s.completed).length,
        firebaseCompleted: firebaseData.sessions.filter(s => s.completed).length
      });

      if (firebaseTime > localTime) {
        // Firebase-Daten sind neuer
        console.log('☁️ Firebase-Daten sind neuer - übernehme sie');
        if (onDataUpdated) {
          onDataUpdated(firebaseData.sessions, firebaseData.userStats, firebaseData.quickCheck);
        }
        return {
          success: true,
          message: `Daten von ${firebaseData.deviceId} synchronisiert`,
          dataUpdated: true
        };
      } else {
        // Lokale Daten sind neuer oder gleich - prüfe auf Änderungen
        const hasChanges = this.hasLocalChanges(localSessions, localStats);
        
        if (hasChanges) {
          console.log('📱 Lokale Änderungen erkannt - lade hoch');
          const uploaded = await this.uploadToFirebase(localSessions, localStats, localQuickCheck);
          return {
            success: uploaded,
            message: uploaded ? 'Lokale Änderungen hochgeladen' : 'Upload fehlgeschlagen',
            dataUpdated: false
          };
        } else {
          return {
            success: true,
            message: 'Bereits synchronisiert',
            dataUpdated: false
          };
        }
      }
    } catch (error) {
      console.error('❌ Firebase Smart-Sync fehlgeschlagen:', error);
      return {
        success: false,
        message: 'Synchronisation fehlgeschlagen',
        dataUpdated: false
      };
    }
  }

  private hasLocalChanges(sessions: TrainingSession[], userStats: UserStats): boolean {
    try {
      const lastSyncData = localStorage.getItem('peakform-last-sync-fingerprint');
      const currentFingerprint = {
        sessionCount: sessions.length,
        completedCount: sessions.filter(s => s.completed).length,
        totalSessions: userStats.totalSessions,
        sessionIds: sessions.map(s => s.id).sort().join(',')
      };

      const currentFingerprintString = JSON.stringify(currentFingerprint);
      
      if (lastSyncData !== currentFingerprintString) {
        localStorage.setItem('peakform-last-sync-fingerprint', currentFingerprintString);
        return true;
      }

      return false;
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

    console.log('🚀 Firebase Auto-Sync gestartet (alle 30 Sekunden)');

    this.syncInterval = setInterval(async () => {
      if (!navigator.onLine) return;
      
      const sessions = getSessions();
      const userStats = getUserStats();
      const quickCheck = getQuickCheck();
      
      const result = await this.performSmartSync(sessions, userStats, quickCheck, onDataUpdated);
      
      if (result.dataUpdated) {
        console.log('🔄 Auto-Sync: Daten aktualisiert -', result.message);
      }
    }, 30000); // 30 Sekunden

    // Initiale Synchronisation nach 3 Sekunden
    setTimeout(async () => {
      const sessions = getSessions();
      const userStats = getUserStats();
      const quickCheck = getQuickCheck();
      
      const result = await this.performSmartSync(sessions, userStats, quickCheck, onDataUpdated);
      console.log('🚀 Initiale Firebase-Sync:', result.message);
    }, 3000);
  }

  // Auto-Sync stoppen
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Firebase Auto-Sync gestoppt');
    }
  }

  // Status abrufen
  getSyncStatus(): {
    deviceId: string;
    userId: string;
    lastSync: Date | null;
    isAutoSyncActive: boolean;
    isOnline: boolean;
  } {
    const lastSync = localStorage.getItem('peakform-last-firebase-sync');
    
    return {
      deviceId: this.deviceId,
      userId: this.USER_ID,
      lastSync: lastSync ? new Date(lastSync) : null,
      isAutoSyncActive: this.syncInterval !== null,
      isOnline: navigator.onLine
    };
  }

  // Manueller Sync
  async forceSyncNow(
    sessions: TrainingSession[], 
    userStats: UserStats, 
    quickCheck: QuickCheck,
    onDataUpdated?: (sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck) => void
  ): Promise<string> {
    console.log('🚀 Manueller Firebase-Sync gestartet...');
    
    const result = await this.performSmartSync(sessions, userStats, quickCheck, onDataUpdated);
    
    return result.message;
  }
}

const firebaseSyncService = new FirebaseSyncService();
export default firebaseSyncService;
