import { TrainingSession } from '../types';
import storageManager from '../utils/storage';

interface GoogleCalendarConfig {
  clientId: string;
  apiKey: string;
  calendarId: string;
  enabled: boolean;
}

interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  colorId?: string;
  reminders: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

class GoogleCalendarService {
  private config: GoogleCalendarConfig | null = null;
  private gapi: any = null;
  private isInitialized = false;

  // Konfiguration laden
  loadConfig(): GoogleCalendarConfig | null {
    try {
      const data = storageManager.getUIState('googleCalendar', null);
      if (data) {
        this.config = data;
        return data;
      }
      return null;
    } catch (error) {
      console.error('❌ Fehler beim Laden der Google Calendar Konfiguration:', error);
      return null;
    }
  }

  // Konfiguration speichern
  saveConfig(config: GoogleCalendarConfig): boolean {
    try {
      this.config = config;
      return storageManager.saveUIState('googleCalendar', config);
    } catch (error) {
      console.error('❌ Fehler beim Speichern der Google Calendar Konfiguration:', error);
      return false;
    }
  }

  // Google API initialisieren
  async initializeGoogleAPI(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;
      if (!this.config || !this.config.enabled) {
        console.log('ℹ️ Google Calendar nicht konfiguriert oder deaktiviert');
        return false;
      }

      // Validierung der Konfiguration
      if (!this.config.clientId || !this.config.apiKey) {
        console.error('❌ Client-ID oder API-Key fehlt');
        return false;
      }

      console.log('🚀 Google API wird initialisiert...');

      // Google API Script laden
      if (!window.gapi) {
        console.log('📥 Google API Script wird geladen...');
        await this.loadGoogleAPIScript();
      }

      this.gapi = window.gapi;

      // API initialisieren mit Timeout
      console.log('⚙️ Google API Bibliotheken werden geladen...');
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          this.gapi.load('client:auth2', {
            callback: () => {
              console.log('✅ Google API Bibliotheken geladen');
              resolve();
            },
            onerror: (error: any) => {
              console.error('❌ Fehler beim Laden der API Bibliotheken:', error);
              reject(error);
            }
          });
        }),
        new Promise<void>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout beim Laden der Google API')), 10000);
        })
      ]);

      // Client initialisieren mit besserer Fehlerbehandlung
      console.log('🔧 Google API Client wird initialisiert...');
      await this.gapi.client.init({
        apiKey: this.config.apiKey,
        clientId: this.config.clientId,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.events'
      });

      this.isInitialized = true;
      console.log('✅ Google Calendar API erfolgreich initialisiert');
      return true;
    } catch (error) {
      console.error('❌ Fehler bei Google API Initialisierung:', error);
      this.isInitialized = false;
      return false;
    }
  }

  // Google API Script laden
  private loadGoogleAPIScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="apis.google.com"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google API Script konnte nicht geladen werden'));
      document.head.appendChild(script);
    });
  }

  // Benutzer authentifizieren
  async authenticate(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initializeGoogleAPI();
        if (!initialized) return false;
      }

      const authInstance = this.gapi.auth2.getAuthInstance();
      
      if (authInstance.isSignedIn.get()) {
        console.log('✅ Bereits bei Google angemeldet');
        return true;
      }

      // Anmeldung durchführen
      await authInstance.signIn();
      console.log('✅ Google Anmeldung erfolgreich');
      return true;
    } catch (error) {
      console.error('❌ Google Authentifizierung fehlgeschlagen:', error);
      return false;
    }
  }

  // Training-Session zu Calendar-Event konvertieren
  private sessionToCalendarEvent(session: TrainingSession): CalendarEvent {
    // Standard-Trainingszeit: 10:00 Uhr
    const startTime = new Date(session.date);
    startTime.setHours(10, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + session.duration);

    // Farbe basierend auf Trainingstyp
    const colorMap: { [key: string]: string } = {
      'strength': '11', // Rot
      'cardio': '9',    // Blau
      'swimming': '7',  // Türkis
      'yoga': '2'       // Grün
    };

    const description = this.generateEventDescription(session);

    return {
      summary: `🏋️ ${session.title}`,
      description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      colorId: colorMap[session.type] || '1',
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'popup', minutes: 10 }
        ]
      }
    };
  }

  // Event-Beschreibung generieren
  private generateEventDescription(session: TrainingSession): string {
    let description = `${session.description}\n\n`;
    
    description += `📋 Details:\n`;
    description += `• Typ: ${this.getTypeDisplayName(session.type)}\n`;
    description += `• Dauer: ${session.duration} Minuten\n`;
    
    if (session.distance) {
      description += `• Distanz: ${session.distance} km\n`;
    }
    
    if (session.exercises && session.exercises.length > 0) {
      description += `\n💪 Übungen:\n`;
      session.exercises.forEach(exercise => {
        description += `• ${exercise.name}`;
        if (exercise.sets && exercise.sets.length > 0) {
          const sets = exercise.sets[0];
          description += ` (${sets.reps} Wdh, ${sets.weight || 'Körpergewicht'})`;
        }
        description += `\n`;
      });
    }

    description += `\n🎯 Erstellt mit PeakForm Hybrid Training Tracker`;
    
    return description;
  }

  // Typ-Anzeigename
  private getTypeDisplayName(type: string): string {
    const typeNames: { [key: string]: string } = {
      'strength': 'Krafttraining',
      'cardio': 'Ausdauertraining', 
      'swimming': 'Schwimmen',
      'yoga': 'Yoga/Mobility'
    };
    return typeNames[type] || type;
  }

  // Einzelne Session zu Google Calendar hinzufügen
  async addSessionToCalendar(session: TrainingSession): Promise<boolean> {
    try {
      if (!this.config || !this.config.enabled) {
        console.log('ℹ️ Google Calendar Integration deaktiviert');
        return false;
      }

      const authenticated = await this.authenticate();
      if (!authenticated) return false;

      const event = this.sessionToCalendarEvent(session);
      
      const response = await this.gapi.client.calendar.events.insert({
        calendarId: this.config.calendarId,
        resource: event
      });

      if (response.status === 200) {
        console.log('✅ Training zu Google Calendar hinzugefügt:', session.title);
        return true;
      } else {
        console.error('❌ Fehler beim Hinzufügen zu Google Calendar:', response);
        return false;
      }
    } catch (error) {
      console.error('❌ Google Calendar API Fehler:', error);
      return false;
    }
  }

  // Ganze Woche zu Calendar hinzufügen
  async addWeekToCalendar(sessions: TrainingSession[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const session of sessions) {
      const result = await this.addSessionToCalendar(session);
      if (result) {
        success++;
      } else {
        failed++;
      }
      
      // Kurze Pause zwischen API-Calls
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`📅 Google Calendar Sync: ${success} erfolgreich, ${failed} fehlgeschlagen`);
    return { success, failed };
  }

  // Verfügbarkeit prüfen
  isAvailable(): boolean {
    return this.config !== null && this.config.enabled;
  }

  // Status abrufen
  getStatus(): {
    configured: boolean;
    enabled: boolean;
    authenticated: boolean;
    lastSync: Date | null;
  } {
    const syncState = storageManager.getSyncState();
    
    return {
      configured: this.config !== null,
      enabled: this.config?.enabled || false,
      authenticated: (this.isInitialized && this.gapi?.auth2?.getAuthInstance()?.isSignedIn?.get()) || false,
      lastSync: syncState.lastSync
    };
  }

  // Konfiguration zurücksetzen
  resetConfig(): void {
    this.config = null;
    this.isInitialized = false;
    storageManager.saveUIState('googleCalendar', null);
    console.log('🔄 Google Calendar Konfiguration zurückgesetzt');
  }
}

// Global window interface für Google API
declare global {
  interface Window {
    gapi: any;
  }
}

const googleCalendarServiceInstance = new GoogleCalendarService();
export default googleCalendarServiceInstance;
