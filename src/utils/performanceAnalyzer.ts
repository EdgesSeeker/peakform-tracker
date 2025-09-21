import { TrainingSession, UserStats } from '../types';

export interface PerformanceMetrics {
  // Grundlegende Metriken
  totalSessions: number;
  totalDuration: number; // Minuten
  totalDistance: number; // km
  currentStreak: number;
  longestStreak: number;
  
  // Nach Sportart getrennt
  running: SportMetrics;
  cycling: SportMetrics;
  swimming: SportMetrics;
  strength: StrengthMetrics;
  wellness: WellnessMetrics;
  
  // Performance-Trends
  weeklyTrends: WeeklyTrend[];
  monthlyTrends: MonthlyTrend[];
  personalBests: PersonalBest[];
  
  // Multi-Workout Analyse
  multiWorkoutDays: number;
  averageWorkoutsPerDay: number;
  intensityDistribution: IntensityDistribution;
  
  // Zeitbasierte Analyse
  timeAnalysis: TimeAnalysis;
  
  // Trainingsplan-Kontext
  trainingPlan: TrainingPlanAnalysis;
  
  // Analyse-Metadaten
  analysisDate: Date;
  dataQuality: DataQuality;
}

export interface TrainingPlanAnalysis {
  totalWeeks: number;
  currentWeek: number;
  planProgress: number; // Prozent abgeschlossen
  weeklyStructure: WeeklyPlanStructure[];
  planAdherence: number; // Wie gut wird der Plan befolgt (Prozent)
  deviations: PlanDeviation[];
  upcomingSessions: PlannedSession[];
}

export interface SportMetrics {
  sessions: number;
  totalDistance: number;
  totalDuration: number;
  averagePace?: string; // mm:ss/km
  averageSpeed?: number; // km/h
  bestDistance: number;
  bestTime: number;
  recentTrend: 'improving' | 'stable' | 'declining';
  weeklyAverage: number;
  calories: number;
}

export interface StrengthMetrics {
  sessions: number;
  totalDuration: number;
  exerciseTypes: string[];
  volumeTrend: 'increasing' | 'stable' | 'decreasing';
  averageSessionDuration: number;
  calories: number;
}

export interface WellnessMetrics {
  yogaSessions: number;
  meditationMinutes: number;
  stretchingSessions: number;
  recoveryScore: number; // 1-5
  wellnessBalance: number; // Prozent der Gesamttrainingszeit
}

export interface WeeklyTrend {
  week: number;
  sessions: number;
  duration: number;
  distance: number;
  intensityScore: number;
  change: number; // Prozent Änderung zur Vorwoche
}

export interface MonthlyTrend {
  month: string;
  sessions: number;
  totalDistance: number;
  averageIntensity: number;
  progressScore: number;
}

export interface PersonalBest {
  activity: string;
  distance: number;
  time: number; // Minuten
  pace?: string;
  date: Date;
  improvement?: string; // z.B. "8% schneller als vorher"
}

export interface IntensityDistribution {
  low: number; // Prozent
  moderate: number;
  high: number;
  veryHigh: number;
}

export interface TimeAnalysis {
  averageSessionDuration: number;
  longestSession: number;
  shortestSession: number;
  preferredTrainingTime: string; // "Morgens", "Mittags", "Abends"
  weekdayDistribution: { [key: string]: number };
}

export interface DataQuality {
  completeness: number; // Prozent
  consistency: number; // Prozent
  recentActivity: boolean;
  dataSpan: number; // Tage
}

export interface WeeklyPlanStructure {
  week: number;
  sessions: PlannedSession[];
  focus: string; // z.B. "Grundlagenausdauer", "Kraftaufbau"
  totalDuration: number;
  totalDistance: number;
}

export interface PlannedSession {
  day: number;
  dayName: string;
  type: string;
  title: string;
  duration: number;
  distance?: number;
  description: string;
  completed: boolean;
  focus: string; // z.B. "Ausdauer", "Kraft", "Technik"
}

export interface PlanDeviation {
  type: 'missed' | 'extra' | 'modified';
  description: string;
  impact: 'low' | 'medium' | 'high';
  week: number;
  day: number;
}

export class PerformanceAnalyzer {
  
  static generateAnalysis(sessions: TrainingSession[], userStats: UserStats): PerformanceMetrics {
    const completedSessions = sessions.filter(s => s.completed && !s.excludeFromStats);
    const now = new Date();
    
    return {
      // Grundlegende Metriken
      totalSessions: completedSessions.length,
      totalDuration: completedSessions.reduce((sum, s) => sum + s.duration, 0),
      totalDistance: completedSessions.reduce((sum, s) => sum + (s.distance || 0), 0),
      currentStreak: userStats.currentStreak,
      longestStreak: userStats.longestStreak,
      
      // Nach Sportart
      running: this.analyzeRunning(completedSessions),
      cycling: this.analyzeCycling(completedSessions),
      swimming: this.analyzeSwimming(completedSessions),
      strength: this.analyzeStrength(completedSessions),
      wellness: this.analyzeWellness(completedSessions),
      
      // Trends
      weeklyTrends: this.calculateWeeklyTrends(completedSessions),
      monthlyTrends: this.calculateMonthlyTrends(completedSessions),
      personalBests: this.findPersonalBests(completedSessions),
      
      // Multi-Workout
      multiWorkoutDays: this.countMultiWorkoutDays(completedSessions),
      averageWorkoutsPerDay: this.calculateAverageWorkoutsPerDay(completedSessions),
      intensityDistribution: this.analyzeIntensityDistribution(completedSessions),
      
      // Zeit-Analyse
      timeAnalysis: this.analyzeTimePatterns(completedSessions),
      
      // Trainingsplan-Analyse
      trainingPlan: this.analyzeTrainingPlan(sessions),
      
      // Metadaten
      analysisDate: now,
      dataQuality: this.assessDataQuality(completedSessions)
    };
  }
  
  private static analyzeRunning(sessions: TrainingSession[]): SportMetrics {
    const runningSessions = sessions.filter(s => 
      (s.type === 'cardio' && s.subtype === 'running') || 
      s.subtype === 'running'
    );
    
    if (runningSessions.length === 0) {
      return this.getEmptySportMetrics();
    }
    
    const totalDistance = runningSessions.reduce((sum, s) => sum + (s.distance || 0), 0);
    const totalDuration = runningSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalCalories = runningSessions.reduce((sum, s) => sum + (s.calories || 0), 0);
    
    // Berechne durchschnittliche Pace (min/km)
    const averagePace = totalDistance > 0 ? this.formatPace(totalDuration / totalDistance) : undefined;
    
    // Finde beste Distanz und Zeit
    const bestDistance = Math.max(...runningSessions.map(s => s.distance || 0));
    const bestTime = Math.min(...runningSessions.filter(s => s.distance && s.distance >= 5).map(s => s.duration));
    
    return {
      sessions: runningSessions.length,
      totalDistance,
      totalDuration,
      averagePace,
      averageSpeed: totalDistance > 0 ? (totalDistance / (totalDuration / 60)) : 0,
      bestDistance,
      bestTime,
      recentTrend: this.calculateTrend(runningSessions, 'distance'),
      weeklyAverage: this.calculateWeeklyAverage(runningSessions, 'distance'),
      calories: totalCalories
    };
  }
  
  private static analyzeCycling(sessions: TrainingSession[]): SportMetrics {
    const cyclingSessions = sessions.filter(s => 
      (s.type === 'cardio' && (s.subtype === 'cycling' || s.subtype === 'intervals')) || 
      s.subtype === 'cycling' || s.subtype === 'intervals'
    );
    
    if (cyclingSessions.length === 0) {
      return this.getEmptySportMetrics();
    }
    
    const totalDistance = cyclingSessions.reduce((sum, s) => sum + (s.distance || 0), 0);
    const totalDuration = cyclingSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalCalories = cyclingSessions.reduce((sum, s) => sum + (s.calories || 0), 0);
    
    return {
      sessions: cyclingSessions.length,
      totalDistance,
      totalDuration,
      averageSpeed: totalDistance > 0 ? (totalDistance / (totalDuration / 60)) : 0,
      bestDistance: Math.max(...cyclingSessions.map(s => s.distance || 0)),
      bestTime: Math.min(...cyclingSessions.filter(s => s.distance && s.distance >= 20).map(s => s.duration)),
      recentTrend: this.calculateTrend(cyclingSessions, 'distance'),
      weeklyAverage: this.calculateWeeklyAverage(cyclingSessions, 'distance'),
      calories: totalCalories
    };
  }
  
  private static analyzeSwimming(sessions: TrainingSession[]): SportMetrics {
    const swimmingSessions = sessions.filter(s => s.type === 'swimming');
    
    if (swimmingSessions.length === 0) {
      return this.getEmptySportMetrics();
    }
    
    const totalDistance = swimmingSessions.reduce((sum, s) => sum + (s.distance || 0), 0);
    const totalDuration = swimmingSessions.reduce((sum, s) => sum + s.duration, 0);
    
    // Schwimm-Pace (min/100m)
    const averagePace = totalDistance > 0 ? this.formatSwimPace(totalDuration / (totalDistance * 10)) : undefined;
    
    return {
      sessions: swimmingSessions.length,
      totalDistance,
      totalDuration,
      averagePace,
      bestDistance: Math.max(...swimmingSessions.map(s => s.distance || 0)),
      bestTime: Math.min(...swimmingSessions.filter(s => s.distance && s.distance >= 1).map(s => s.duration)),
      recentTrend: this.calculateTrend(swimmingSessions, 'distance'),
      weeklyAverage: this.calculateWeeklyAverage(swimmingSessions, 'distance'),
      calories: swimmingSessions.reduce((sum, s) => sum + (s.calories || 0), 0)
    };
  }
  
  private static analyzeStrength(sessions: TrainingSession[]): StrengthMetrics {
    const strengthSessions = sessions.filter(s => s.type === 'strength');
    
    return {
      sessions: strengthSessions.length,
      totalDuration: strengthSessions.reduce((sum, s) => sum + s.duration, 0),
      exerciseTypes: Array.from(new Set(strengthSessions.map(s => s.subtype || 'general'))),
      volumeTrend: this.calculateTrend(strengthSessions, 'duration') as any,
      averageSessionDuration: strengthSessions.length > 0 ? 
        strengthSessions.reduce((sum, s) => sum + s.duration, 0) / strengthSessions.length : 0,
      calories: strengthSessions.reduce((sum, s) => sum + (s.calories || 0), 0)
    };
  }
  
  private static analyzeWellness(sessions: TrainingSession[]): WellnessMetrics {
    const yogaSessions = sessions.filter(s => s.type === 'yoga').length;
    const meditationSessions = sessions.filter(s => 
      s.type === 'recovery' && s.title.toLowerCase().includes('meditation')
    );
    const stretchingSessions = sessions.filter(s => 
      s.type === 'recovery' && s.title.toLowerCase().includes('stretch')
    ).length;
    
    const meditationMinutes = meditationSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalTrainingTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const wellnessTime = sessions.filter(s => 
      s.type === 'yoga' || s.type === 'recovery' || 
      s.title.toLowerCase().includes('meditation') || 
      s.title.toLowerCase().includes('stretch')
    ).reduce((sum, s) => sum + s.duration, 0);
    
    return {
      yogaSessions,
      meditationMinutes,
      stretchingSessions,
      recoveryScore: Math.min(5, Math.max(1, Math.round((wellnessTime / totalTrainingTime) * 10))),
      wellnessBalance: totalTrainingTime > 0 ? (wellnessTime / totalTrainingTime) * 100 : 0
    };
  }
  
  private static calculateWeeklyTrends(sessions: TrainingSession[]): WeeklyTrend[] {
    const weeklyData = new Map<number, TrainingSession[]>();
    
    sessions.forEach(session => {
      const week = session.week;
      if (!weeklyData.has(week)) {
        weeklyData.set(week, []);
      }
      weeklyData.get(week)!.push(session);
    });
    
    return Array.from(weeklyData.entries()).map(([week, weekSessions]) => {
      const duration = weekSessions.reduce((sum, s) => sum + s.duration, 0);
      const distance = weekSessions.reduce((sum, s) => sum + (s.distance || 0), 0);
      const intensityScore = this.calculateWeekIntensityScore(weekSessions);
      
      return {
        week,
        sessions: weekSessions.length,
        duration,
        distance,
        intensityScore,
        change: 0 // Wird später berechnet
      };
    }).sort((a, b) => a.week - b.week);
  }
  
  private static calculateMonthlyTrends(sessions: TrainingSession[]): MonthlyTrend[] {
    const monthlyData = new Map<string, TrainingSession[]>();
    
    sessions.forEach(session => {
      const date = new Date(session.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, []);
      }
      monthlyData.get(monthKey)!.push(session);
    });
    
    return Array.from(monthlyData.entries()).map(([monthKey, monthSessions]) => ({
      month: monthKey,
      sessions: monthSessions.length,
      totalDistance: monthSessions.reduce((sum, s) => sum + (s.distance || 0), 0),
      averageIntensity: this.calculateAverageIntensity(monthSessions),
      progressScore: this.calculateProgressScore(monthSessions)
    }));
  }
  
  private static findPersonalBests(sessions: TrainingSession[]): PersonalBest[] {
    const bests: PersonalBest[] = [];
    
    // 5km Lauf PB
    const running5k = sessions.filter(s => 
      s.subtype === 'running' && s.distance && s.distance >= 4.8 && s.distance <= 5.2
    ).sort((a, b) => a.duration - b.duration);
    
    if (running5k.length > 0) {
      const best = running5k[0];
      bests.push({
        activity: '5km Lauf',
        distance: best.distance!,
        time: best.duration,
        pace: this.formatPace(best.duration / best.distance!),
        date: new Date(best.date)
      });
    }
    
    // 10km Lauf PB
    const running10k = sessions.filter(s => 
      s.subtype === 'running' && s.distance && s.distance >= 9.5 && s.distance <= 10.5
    ).sort((a, b) => a.duration - b.duration);
    
    if (running10k.length > 0) {
      const best = running10k[0];
      bests.push({
        activity: '10km Lauf',
        distance: best.distance!,
        time: best.duration,
        pace: this.formatPace(best.duration / best.distance!),
        date: new Date(best.date)
      });
    }
    
    // 20km Rad PB
    const cycling20k = sessions.filter(s => 
      (s.subtype === 'cycling' || s.subtype === 'intervals') && 
      s.distance && s.distance >= 18 && s.distance <= 22
    ).sort((a, b) => a.duration - b.duration);
    
    if (cycling20k.length > 0) {
      const best = cycling20k[0];
      bests.push({
        activity: '20km Rad',
        distance: best.distance!,
        time: best.duration,
        pace: `${(best.distance! / (best.duration / 60)).toFixed(1)} km/h`,
        date: new Date(best.date)
      });
    }
    
    // 1km Schwimmen PB
    const swimming1k = sessions.filter(s => 
      s.type === 'swimming' && s.distance && s.distance >= 0.9 && s.distance <= 1.1
    ).sort((a, b) => a.duration - b.duration);
    
    if (swimming1k.length > 0) {
      const best = swimming1k[0];
      bests.push({
        activity: '1km Schwimmen',
        distance: best.distance!,
        time: best.duration,
        pace: this.formatSwimPace(best.duration / (best.distance! * 10)),
        date: new Date(best.date)
      });
    }
    
    return bests;
  }
  
  private static countMultiWorkoutDays(sessions: TrainingSession[]): number {
    const dailyGroups = new Map<string, TrainingSession[]>();
    
    sessions.forEach(session => {
      const dateKey = new Date(session.date).toDateString();
      if (!dailyGroups.has(dateKey)) {
        dailyGroups.set(dateKey, []);
      }
      dailyGroups.get(dateKey)!.push(session);
    });
    
    return Array.from(dailyGroups.values()).filter(dayWorkouts => dayWorkouts.length > 1).length;
  }
  
  private static calculateAverageWorkoutsPerDay(sessions: TrainingSession[]): number {
    const uniqueDays = new Set(sessions.map(s => new Date(s.date).toDateString())).size;
    return uniqueDays > 0 ? sessions.length / uniqueDays : 0;
  }
  
  private static analyzeIntensityDistribution(sessions: TrainingSession[]): IntensityDistribution {
    // Schätze Intensität basierend auf Dauer und Typ
    const intensities = sessions.map(s => this.estimateIntensity(s));
    const total = intensities.length;
    
    return {
      low: (intensities.filter(i => i === 'low').length / total) * 100,
      moderate: (intensities.filter(i => i === 'moderate').length / total) * 100,
      high: (intensities.filter(i => i === 'high').length / total) * 100,
      veryHigh: (intensities.filter(i => i === 'very_high').length / total) * 100
    };
  }
  
  private static analyzeTimePatterns(sessions: TrainingSession[]): TimeAnalysis {
    const durations = sessions.map(s => s.duration);
    const weekdayCount = [0, 0, 0, 0, 0, 0, 0]; // Mo-So
    
    sessions.forEach(s => {
      const day = new Date(s.date).getDay();
      const adjustedDay = day === 0 ? 6 : day - 1; // 0=So->6, 1=Mo->0
      weekdayCount[adjustedDay]++;
    });
    
    const weekdayNames = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const weekdayDistribution: { [key: string]: number } = {};
    weekdayNames.forEach((name, index) => {
      weekdayDistribution[name] = weekdayCount[index];
    });
    
    return {
      averageSessionDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      longestSession: Math.max(...durations, 0),
      shortestSession: Math.min(...durations, 999),
      preferredTrainingTime: 'Abends', // Placeholder - könnte aus Timestamps berechnet werden
      weekdayDistribution
    };
  }
  
  // Hilfsfunktionen
  private static getEmptySportMetrics(): SportMetrics {
    return {
      sessions: 0,
      totalDistance: 0,
      totalDuration: 0,
      bestDistance: 0,
      bestTime: 0,
      recentTrend: 'stable',
      weeklyAverage: 0,
      calories: 0
    };
  }
  
  private static formatPace(minutesPerKm: number): string {
    const minutes = Math.floor(minutesPerKm);
    const seconds = Math.round((minutesPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  private static formatSwimPace(minutesPer100m: number): string {
    const minutes = Math.floor(minutesPer100m);
    const seconds = Math.round((minutesPer100m - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/100m`;
  }
  
  private static calculateTrend(sessions: TrainingSession[], metric: 'distance' | 'duration'): 'improving' | 'stable' | 'declining' {
    if (sessions.length < 4) return 'stable';
    
    const recent = sessions.slice(-3);
    const previous = sessions.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, s) => sum + (metric === 'distance' ? (s.distance || 0) : s.duration), 0) / recent.length;
    const previousAvg = previous.reduce((sum, s) => sum + (metric === 'distance' ? (s.distance || 0) : s.duration), 0) / previous.length;
    
    const change = (recentAvg - previousAvg) / previousAvg;
    
    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'declining';
    return 'stable';
  }
  
  private static calculateWeeklyAverage(sessions: TrainingSession[], metric: 'distance' | 'duration'): number {
    if (sessions.length === 0) return 0;
    
    const weeks = Math.max(1, Math.ceil(sessions.length / 7));
    const total = sessions.reduce((sum, s) => sum + (metric === 'distance' ? (s.distance || 0) : s.duration), 0);
    
    return total / weeks;
  }
  
  private static estimateIntensity(session: TrainingSession): 'low' | 'moderate' | 'high' | 'very_high' {
    // Einfache Intensitäts-Schätzung basierend auf Typ und Dauer
    if (session.type === 'yoga' || session.type === 'recovery') return 'low';
    if (session.subtype === 'intervals') return 'very_high';
    if (session.duration < 30) return 'moderate';
    if (session.duration < 60) return 'high';
    return 'very_high';
  }
  
  private static calculateWeekIntensityScore(sessions: TrainingSession[]): number {
    const intensities = sessions.map(s => this.estimateIntensity(s));
    const scores = { low: 1, moderate: 2, high: 3, very_high: 4 };
    
    return intensities.reduce((sum, intensity) => sum + scores[intensity], 0) / sessions.length;
  }
  
  private static calculateAverageIntensity(sessions: TrainingSession[]): number {
    return this.calculateWeekIntensityScore(sessions);
  }
  
  private static calculateProgressScore(sessions: TrainingSession[]): number {
    // Einfacher Progress-Score basierend auf Konsistenz und Volumen
    const consistency = sessions.length / 30; // Sessions pro Tag
    const volume = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length; // Durchschnittsdauer
    
    return Math.min(100, (consistency * 50) + (volume / 60 * 50));
  }
  
  private static analyzeTrainingPlan(sessions: TrainingSession[]): TrainingPlanAnalysis {
    const plannedSessions = sessions.filter(s => !s.isAdditionalWorkout);
    const completedPlanned = plannedSessions.filter(s => s.completed);
    
    // Bestimme aktuelle Woche
    const currentWeek = Math.max(1, ...plannedSessions.map(s => s.week));
    const totalWeeks = 8; // 8-Wochen Hybridplan
    
    // Berechne Plan-Progress
    const planProgress = plannedSessions.length > 0 ? 
      (completedPlanned.length / plannedSessions.length) * 100 : 0;
    
    // Erstelle Wochen-Struktur
    const weeklyStructure: WeeklyPlanStructure[] = [];
    for (let week = 1; week <= totalWeeks; week++) {
      const weekSessions = plannedSessions.filter(s => s.week === week);
      const weekCompleted = weekSessions.filter(s => s.completed);
      
      const weeklyPlan: WeeklyPlanStructure = {
        week,
        sessions: weekSessions.map(s => ({
          day: s.day,
          dayName: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'][s.day - 1],
          type: s.type,
          title: s.title,
          duration: s.duration,
          distance: s.distance,
          description: s.description,
          completed: s.completed,
          focus: this.getSessionFocus(s)
        })),
        focus: this.getWeekFocus(week),
        totalDuration: weekSessions.reduce((sum, s) => sum + s.duration, 0),
        totalDistance: weekSessions.reduce((sum, s) => sum + (s.distance || 0), 0)
      };
      
      weeklyStructure.push(weeklyPlan);
    }
    
    // Plan-Adherence berechnen
    const planAdherence = this.calculatePlanAdherence(sessions);
    
    // Abweichungen identifizieren
    const deviations = this.identifyPlanDeviations(sessions);
    
    // Kommende Sessions
    const upcomingSessions = plannedSessions
      .filter(s => !s.completed)
      .slice(0, 10)
      .map(s => ({
        day: s.day,
        dayName: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'][s.day - 1],
        type: s.type,
        title: s.title,
        duration: s.duration,
        distance: s.distance,
        description: s.description,
        completed: s.completed,
        focus: this.getSessionFocus(s)
      }));
    
    return {
      totalWeeks,
      currentWeek,
      planProgress,
      weeklyStructure,
      planAdherence,
      deviations,
      upcomingSessions
    };
  }
  
  private static getSessionFocus(session: TrainingSession): string {
    if (session.type === 'strength') return 'Kraftaufbau';
    if (session.type === 'cardio' && session.subtype === 'running') return 'Laufausdauer';
    if (session.type === 'cardio' && session.subtype === 'cycling') return 'Radausdauer';
    if (session.type === 'cardio' && session.subtype === 'intervals') return 'Intervalltraining';
    if (session.type === 'swimming') return 'Schwimmtechnik';
    if (session.type === 'yoga') return 'Beweglichkeit';
    if (session.type === 'recovery') return 'Regeneration';
    return 'Allgemein';
  }
  
  private static getWeekFocus(week: number): string {
    const focuses = [
      'Grundlagenaufbau', // Woche 1
      'Technikverbesserung', // Woche 2
      'Kraftentwicklung', // Woche 3
      'Ausdaueraufbau', // Woche 4
      'Intensitätssteigerung', // Woche 5
      'Leistungsoptimierung', // Woche 6
      'Wettkampfvorbereitung', // Woche 7
      'Peaking & Recovery' // Woche 8
    ];
    return focuses[week - 1] || 'Allgemeine Fitness';
  }
  
  private static calculatePlanAdherence(sessions: TrainingSession[]): number {
    const plannedSessions = sessions.filter(s => !s.isAdditionalWorkout);
    const completedPlanned = plannedSessions.filter(s => s.completed);
    
    return plannedSessions.length > 0 ? 
      (completedPlanned.length / plannedSessions.length) * 100 : 0;
  }
  
  private static identifyPlanDeviations(sessions: TrainingSession[]): PlanDeviation[] {
    const deviations: PlanDeviation[] = [];
    const additionalWorkouts = sessions.filter(s => s.isAdditionalWorkout && s.completed);
    
    // Bestimme aktuelle Woche basierend auf heutigem Datum
    const today = new Date();
    const currentWeek = Math.max(1, ...sessions.filter(s => !s.isAdditionalWorkout).map(s => s.week));
    
    // Nur Sessions aus aktueller und vergangenen Wochen können "verpasst" sein
    const missedPlanned = sessions.filter(s => 
      !s.isAdditionalWorkout && 
      !s.completed && 
      s.week <= currentWeek && // Nur aktuelle/vergangene Wochen
      this.isSessionOverdue(s) // Zusätzliche Prüfung ob wirklich überfällig
    );
    
    // Verpasste geplante Sessions (nur überfällige)
    missedPlanned.forEach(session => {
      deviations.push({
        type: 'missed',
        description: `Verpasst: ${session.title}`,
        impact: session.type === 'strength' ? 'high' : 'medium',
        week: session.week,
        day: session.day
      });
    });
    
    // Zusätzliche Workouts (nur aus aktueller/vergangener Zeit)
    additionalWorkouts.filter(session => session.week <= currentWeek).forEach(session => {
      deviations.push({
        type: 'extra',
        description: `Extra: ${session.title}`,
        impact: 'low',
        week: session.week,
        day: session.day
      });
    });
    
    return deviations.slice(0, 10); // Limitiere auf 10 wichtigste
  }
  
  // Prüfe ob eine Session wirklich überfällig ist
  private static isSessionOverdue(session: TrainingSession): boolean {
    const today = new Date();
    const todayWeekday = today.getDay() || 7; // 1=Mo, 7=So
    
    // Wenn wir in Woche 1 sind
    if (session.week === 1) {
      // Session ist überfällig wenn ihr Tag bereits vorbei ist
      return session.day < todayWeekday;
    }
    
    // Für zukünftige Wochen: nie überfällig
    return false;
  }

  private static assessDataQuality(sessions: TrainingSession[]): DataQuality {
    const now = new Date();
    const oldestSession = sessions.length > 0 ? 
      new Date(Math.min(...sessions.map(s => new Date(s.date).getTime()))) : now;
    const newestSession = sessions.length > 0 ? 
      new Date(Math.max(...sessions.map(s => new Date(s.date).getTime()))) : now;
    
    const dataSpan = Math.ceil((newestSession.getTime() - oldestSession.getTime()) / (1000 * 60 * 60 * 24));
    const recentActivity = (now.getTime() - newestSession.getTime()) < (7 * 24 * 60 * 60 * 1000); // Letzte 7 Tage
    
    // Vollständigkeit: Haben Sessions alle wichtigen Daten?
    const completenessScore = sessions.length > 0 ? 
      sessions.filter(s => s.duration && s.date && s.type).length / sessions.length * 100 : 0;
    
    // Konsistenz: Regelmäßige Einträge?
    const expectedSessions = Math.max(1, dataSpan / 2); // Erwarte alle 2 Tage ein Training
    const consistencyScore = Math.min(100, (sessions.length / expectedSessions) * 100);
    
    return {
      completeness: Math.round(completenessScore),
      consistency: Math.round(consistencyScore),
      recentActivity,
      dataSpan
    };
  }
  
  // Export-Funktionen
  static exportAsMarkdown(metrics: PerformanceMetrics): string {
    return `# 📊 PeakForm Performance-Analyse
**Erstellt am:** ${metrics.analysisDate.toLocaleDateString('de-DE')}

## 🏃‍♂️ Grundlegende Metriken
- **Absolvierte Sessions:** ${metrics.totalSessions}
- **Gesamtdistanz:** ${metrics.totalDistance.toFixed(1)} km
- **Trainingszeit:** ${Math.floor(metrics.totalDuration / 60)}h ${metrics.totalDuration % 60}min
- **Aktuelle Serie:** ${metrics.currentStreak} Tage
- **Längste Serie:** ${metrics.longestStreak} Tage

## 🏃‍♂️ Laufen
- **Sessions:** ${metrics.running.sessions}
- **Distanz:** ${metrics.running.totalDistance.toFixed(1)} km
- **Durchschnittspace:** ${metrics.running.averagePace || 'N/A'}
- **Beste Distanz:** ${metrics.running.bestDistance} km
- **Trend:** ${metrics.running.recentTrend === 'improving' ? '📈 Verbessernd' : metrics.running.recentTrend === 'declining' ? '📉 Abnehmend' : '➡️ Stabil'}

## 🚴‍♂️ Radfahren
- **Sessions:** ${metrics.cycling.sessions}
- **Distanz:** ${metrics.cycling.totalDistance.toFixed(1)} km
- **Durchschnittsgeschwindigkeit:** ${metrics.cycling.averageSpeed?.toFixed(1) || 'N/A'} km/h
- **Beste Distanz:** ${metrics.cycling.bestDistance} km
- **Trend:** ${metrics.cycling.recentTrend === 'improving' ? '📈 Verbessernd' : metrics.cycling.recentTrend === 'declining' ? '📉 Abnehmend' : '➡️ Stabil'}

## 🏊‍♂️ Schwimmen
- **Sessions:** ${metrics.swimming.sessions}
- **Distanz:** ${(metrics.swimming.totalDistance * 1000).toFixed(0)} m
- **Durchschnittspace:** ${metrics.swimming.averagePace || 'N/A'}
- **Beste Distanz:** ${(metrics.swimming.bestDistance * 1000).toFixed(0)} m
- **Trend:** ${metrics.swimming.recentTrend === 'improving' ? '📈 Verbessernd' : metrics.swimming.recentTrend === 'declining' ? '📉 Abnehmend' : '➡️ Stabil'}

## 💪 Krafttraining
- **Sessions:** ${metrics.strength.sessions}
- **Trainingszeit:** ${Math.floor(metrics.strength.totalDuration / 60)}h ${metrics.strength.totalDuration % 60}min
- **Durchschnittsdauer:** ${metrics.strength.averageSessionDuration.toFixed(0)} min
- **Übungsarten:** ${metrics.strength.exerciseTypes.join(', ')}
- **Volumen-Trend:** ${metrics.strength.volumeTrend === 'increasing' ? '📈 Steigend' : metrics.strength.volumeTrend === 'decreasing' ? '📉 Abnehmend' : '➡️ Stabil'}

## 🧘‍♀️ Wellness & Recovery
- **Yoga Sessions:** ${metrics.wellness.yogaSessions}
- **Meditation:** ${metrics.wellness.meditationMinutes} min
- **Stretching:** ${metrics.wellness.stretchingSessions} Sessions
- **Recovery Score:** ${metrics.wellness.recoveryScore}/5
- **Wellness-Balance:** ${metrics.wellness.wellnessBalance.toFixed(1)}% der Trainingszeit

## ⚡ Multi-Workout Analyse
- **Multi-Workout Tage:** ${metrics.multiWorkoutDays}
- **Durchschnitt Workouts/Tag:** ${metrics.averageWorkoutsPerDay.toFixed(1)}
- **Intensitätsverteilung:**
  - Niedrig: ${metrics.intensityDistribution.low.toFixed(1)}%
  - Moderat: ${metrics.intensityDistribution.moderate.toFixed(1)}%
  - Hoch: ${metrics.intensityDistribution.high.toFixed(1)}%
  - Sehr Hoch: ${metrics.intensityDistribution.veryHigh.toFixed(1)}%

## 🏆 Persönliche Bestzeiten
${metrics.personalBests.map(pb => 
  `- **${pb.activity}:** ${pb.time}min (${pb.pace}) am ${pb.date.toLocaleDateString('de-DE')}`
).join('\n')}

## ⏰ Trainingsgewohnheiten
- **Durchschnittliche Session:** ${metrics.timeAnalysis.averageSessionDuration.toFixed(0)} min
- **Längste Session:** ${metrics.timeAnalysis.longestSession} min
- **Bevorzugte Trainingstage:** ${Object.entries(metrics.timeAnalysis.weekdayDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([day, count]) => `${day} (${count})`)
    .join(', ')}

## 📈 Wöchentliche Trends
${metrics.weeklyTrends.map(trend => 
  `**Woche ${trend.week}:** ${trend.sessions} Sessions, ${trend.duration}min, ${trend.distance.toFixed(1)}km`
).join('\n')}

## 📅 8-Wochen Trainingsplan-Kontext

### Plan-Übersicht
- **Gesamtfortschritt:** ${metrics.trainingPlan.planProgress.toFixed(1)}%
- **Aktuelle Woche:** ${metrics.trainingPlan.currentWeek}/8
- **Plan-Befolgung:** ${metrics.trainingPlan.planAdherence.toFixed(1)}%

### Wöchentliche Struktur
${metrics.trainingPlan.weeklyStructure.map(week => 
  `**Woche ${week.week} - ${week.focus}:**
${week.sessions.map(session => 
  `  - ${session.dayName}: ${session.title} (${session.duration}min${session.distance ? `, ${session.distance}km` : ''}) ${session.completed ? '✅' : '⏳'}`
).join('\n')}
  - Wochensumme: ${Math.floor(week.totalDuration / 60)}h ${week.totalDuration % 60}min${week.totalDistance > 0 ? `, ${week.totalDistance.toFixed(1)}km` : ''}`
).join('\n\n')}

### Kommende Sessions (nächste 10)
${metrics.trainingPlan.upcomingSessions.map(session => 
  `- **${session.dayName}:** ${session.title} (${session.duration}min${session.distance ? `, ${session.distance}km` : ''}) - ${session.focus}`
).join('\n')}

### Plan-Abweichungen
${metrics.trainingPlan.deviations.length > 0 ? 
  metrics.trainingPlan.deviations.map(dev => 
    `- ${dev.type === 'missed' ? '❌' : dev.type === 'extra' ? '➕' : '🔄'} ${dev.description} (Woche ${dev.week}, ${dev.impact} Impact)`
  ).join('\n') : 
  '✅ Keine größeren Abweichungen vom Plan'
}

## 📊 Datenqualität
- **Vollständigkeit:** ${metrics.dataQuality.completeness}%
- **Konsistenz:** ${metrics.dataQuality.consistency}%
- **Aktuelle Aktivität:** ${metrics.dataQuality.recentActivity ? '✅ Ja' : '❌ Nein'}
- **Datenspanne:** ${metrics.dataQuality.dataSpan} Tage

---
*Diese umfassende Analyse inkl. 8-Wochen Trainingsplan kann für präzise KI-basierte Trainingsberatung verwendet werden.*`;
  }
  
  static exportAsJSON(metrics: PerformanceMetrics): string {
    return JSON.stringify(metrics, null, 2);
  }
}
