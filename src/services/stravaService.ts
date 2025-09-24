interface StravaConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  start_date: string;
  average_speed?: number;
  average_watts?: number;
  calories?: number;
}

interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

class StravaService {
  private config: StravaConfig = {
    clientId: '177525',
    clientSecret: '5caa2901956e8e9601388f3edde4ba8281a9db10', // In Production: Environment Variable!
    redirectUri: 'http://localhost:3002/auth/strava/callback'
  };

  // 1. OAuth Authorization URL generieren
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'read,activity:read_all',
      approval_prompt: 'force'
    });

    return `https://www.strava.com/oauth/authorize?${params.toString()}`;
  }

  // 2. Access Token mit Authorization Code tauschen
  async exchangeCodeForTokens(code: string): Promise<StravaTokens> {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    
    // Tokens im localStorage speichern
    localStorage.setItem('strava_tokens', JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at
    }));

    return tokens;
  }

  // 3. Access Token erneuern wenn nötig
  async refreshAccessToken(): Promise<string> {
    const storedTokens = localStorage.getItem('strava_tokens');
    if (!storedTokens) {
      throw new Error('No stored tokens found');
    }

    const tokens: StravaTokens = JSON.parse(storedTokens);
    
    // Prüfen ob Token noch gültig ist
    if (Date.now() / 1000 < tokens.expires_at) {
      return tokens.access_token;
    }

    // Token erneuern
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: tokens.refresh_token,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const newTokens = await response.json();
    
    // Neue Tokens speichern
    localStorage.setItem('strava_tokens', JSON.stringify({
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token,
      expires_at: newTokens.expires_at
    }));

    return newTokens.access_token;
  }

  // 4. Aktivitäten von Strava abrufen
  async getActivities(after?: Date): Promise<StravaActivity[]> {
    try {
      const accessToken = await this.refreshAccessToken();
      
      const params = new URLSearchParams({
        per_page: '30',
        page: '1'
      });

      if (after) {
        params.append('after', Math.floor(after.getTime() / 1000).toString());
      }

      const response = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Strava activities:', error);
      throw error;
    }
  }

  // 5. Strava Activity zu TrainingSession konvertieren
  convertToTrainingSession(activity: StravaActivity): any {
    const getSessionType = (stravaType: string) => {
      switch (stravaType.toLowerCase()) {
        case 'run':
        case 'virtualrun':
          return { type: 'cardio', subtype: 'running' };
        case 'ride':
        case 'virtualride':
          return { type: 'cardio', subtype: 'cycling' };
        case 'swim':
          return { type: 'swimming' };
        case 'workout':
          return { type: 'strength' };
        default:
          return { type: 'cardio' };
      }
    };

    const { type, subtype } = getSessionType(activity.type);
    
    return {
      id: `strava-${activity.id}`,
      type,
      subtype,
      title: activity.name,
      description: `Importiert von Strava - ${activity.type}`,
      duration: Math.round(activity.moving_time / 60), // Sekunden zu Minuten
      distance: activity.distance / 1000, // Meter zu Kilometer
      pace: activity.average_speed ? this.calculatePace(activity.average_speed) : undefined,
      watts: activity.average_watts,
      calories: activity.calories,
      completed: true,
      date: new Date(activity.start_date),
      week: this.getWeekNumber(new Date(activity.start_date)),
      day: new Date(activity.start_date).getDay() || 7,
      notes: `Strava Import - ${activity.type}`
    };
  }

  // Helper: Pace berechnen (m/s zu min/km)
  private calculatePace(averageSpeed: number): string {
    if (averageSpeed === 0) return '0:00';
    
    const paceInSeconds = 1000 / averageSpeed; // Sekunden pro km
    const minutes = Math.floor(paceInSeconds / 60);
    const seconds = Math.round(paceInSeconds % 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Helper: Wochennummer berechnen (angepasst für Training-Plan)
  private getWeekNumber(date: Date): number {
    // Verwende eine feste Startwoche für den Training-Plan
    // Startdatum: 16. September 2024 (Montag Woche 1)
    const planStartDate = new Date(2024, 8, 16); // 16.09.2024
    const daysDiff = Math.floor((date.getTime() - planStartDate.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.floor(daysDiff / 7) + 1;
    
    // Begrenze auf Woche 1-8 für den aktuellen Plan
    return Math.max(1, Math.min(8, weekNumber));
  }

  // 6. Check ob User mit Strava verbunden ist
  isConnected(): boolean {
    const tokens = localStorage.getItem('strava_tokens');
    return !!tokens;
  }

  // 7. Strava-Verbindung trennen
  disconnect(): void {
    localStorage.removeItem('strava_tokens');
  }
}

export default new StravaService();
