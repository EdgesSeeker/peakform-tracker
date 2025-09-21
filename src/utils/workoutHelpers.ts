import { TrainingSession, DailyWorkoutGroup } from '../types';

/**
 * Gruppiert Sessions nach Tagen und erstellt DailyWorkoutGroup Objekte
 */
export const groupSessionsByDay = (sessions: TrainingSession[]): DailyWorkoutGroup[] => {
  const completedSessions = sessions.filter(s => s.completed);
  const groupedByDate = new Map<string, TrainingSession[]>();

  completedSessions.forEach(session => {
    const dateKey = new Date(session.date).toDateString();
    if (!groupedByDate.has(dateKey)) {
      groupedByDate.set(dateKey, []);
    }
    groupedByDate.get(dateKey)!.push(session);
  });

  return Array.from(groupedByDate.entries()).map(([dateString, workouts]) => {
    const date = new Date(dateString);
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalDistance = workouts.reduce((sum, w) => sum + (w.distance || 0), 0);
    
    return {
      date,
      workouts: workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      totalDuration,
      totalDistance,
      completed: true,
      notes: workouts.map(w => w.notes).filter(Boolean).join(' | ')
    };
  }).sort((a, b) => b.date.getTime() - a.date.getTime());
};

/**
 * Prüft ob ein Tag ein Multi-Workout Tag ist
 */
export const isMultiWorkoutDay = (sessions: TrainingSession[], date: Date): boolean => {
  const dayWorkouts = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    return sessionDate.toDateString() === date.toDateString() && s.completed;
  });
  
  return dayWorkouts.length > 1;
};

/**
 * Ermittelt alle Multi-Workout Tage
 */
export const getMultiWorkoutDays = (sessions: TrainingSession[]): Date[] => {
  const dailyGroups = groupSessionsByDay(sessions);
  return dailyGroups
    .filter(group => group.workouts.length > 1)
    .map(group => group.date);
};

/**
 * Berechnet Statistiken für zusätzliche Workouts
 */
export const getAdditionalWorkoutStats = (sessions: TrainingSession[]) => {
  const additionalWorkouts = sessions.filter(s => s.completed && s.isAdditionalWorkout);
  
  const stats = {
    total: additionalWorkouts.length,
    totalDuration: additionalWorkouts.reduce((sum, s) => sum + s.duration, 0),
    totalDistance: additionalWorkouts.reduce((sum, s) => sum + (s.distance || 0), 0),
    totalCalories: additionalWorkouts.reduce((sum, s) => sum + (s.calories || 0), 0),
    byType: {} as Record<string, number>,
    multiWorkoutDays: getMultiWorkoutDays(sessions).length
  };

  // Gruppierung nach Typ
  additionalWorkouts.forEach(workout => {
    const type = workout.subtype || workout.type;
    stats.byType[type] = (stats.byType[type] || 0) + 1;
  });

  return stats;
};

/**
 * Erstellt eine Workout-Gruppe ID für Multi-Workouts
 */
export const generateWorkoutGroupId = (date: Date): string => {
  return `${date.toDateString()}-multi`;
};

/**
 * Prüft ob zwei Sessions zur gleichen Workout-Gruppe gehören
 */
export const isSameWorkoutGroup = (session1: TrainingSession, session2: TrainingSession): boolean => {
  if (!session1.workoutGroup || !session2.workoutGroup) {
    return false;
  }
  return session1.workoutGroup === session2.workoutGroup;
};

/**
 * Berechnet die Intensität eines Workout-Tages basierend auf Dauer und Anzahl der Workouts
 */
export const calculateDayIntensity = (workouts: TrainingSession[]): 'low' | 'moderate' | 'high' | 'extreme' => {
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
  const workoutCount = workouts.length;
  
  if (workoutCount === 1) {
    if (totalDuration < 30) return 'low';
    if (totalDuration < 60) return 'moderate';
    if (totalDuration < 120) return 'high';
    return 'extreme';
  }
  
  if (workoutCount === 2) {
    if (totalDuration < 90) return 'moderate';
    if (totalDuration < 150) return 'high';
    return 'extreme';
  }
  
  if (workoutCount >= 3) {
    if (totalDuration < 120) return 'high';
    return 'extreme';
  }
  
  return 'moderate';
};

/**
 * Formatiert die Workout-Dauer in einem lesbaren Format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Generiert eine Zusammenfassung für einen Multi-Workout Tag
 */
export const generateDaySummary = (workouts: TrainingSession[]): string => {
  if (workouts.length === 1) {
    return workouts[0].title;
  }
  
  const types = Array.from(new Set(workouts.map(w => w.subtype || w.type)));
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
  const totalDistance = workouts.reduce((sum, w) => sum + (w.distance || 0), 0);
  
  let summary = `${workouts.length} Workouts: ${types.join(', ')}`;
  summary += ` (${formatDuration(totalDuration)}`;
  
  if (totalDistance > 0) {
    summary += `, ${totalDistance.toFixed(1)} km`;
  }
  
  summary += ')';
  
  return summary;
};
