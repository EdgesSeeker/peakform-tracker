export interface TrainingSession {
  id: string;
  type: 'cardio' | 'strength' | 'swimming' | 'yoga' | 'recovery';
  subtype?: 'running' | 'cycling' | 'intervals' | 'legs' | 'upper' | 'fullbody';
  title: string;
  description: string;
  duration: number; // in minutes
  completed: boolean;
  date: Date;
  week: number;
  day: number;
  exercises?: Exercise[];
  distance?: number; // for cardio
  pace?: string; // for running
  watts?: number; // for cycling
  notes?: string;
  calories?: number;
  workoutPlan?: WorkoutPlan;
}

export interface WorkoutPlan {
  warmup?: WorkoutSection;
  main: WorkoutSection;
  cooldown?: WorkoutSection;
}

export interface WorkoutSection {
  title: string;
  duration: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  equipment?: string;
  instructions?: string;
  completed?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  type: 'strength' | 'cardio' | 'mobility';
  completed?: boolean;
  instructions?: string;
  targetSets?: number;
  targetReps?: string;
}

export interface Set {
  reps?: number;
  weight?: number;
  distance?: number;
  time?: number;
  rest?: number;
}

export interface WeeklyProgress {
  week: number;
  strengthPercentage: number;
  cardioPercentage: number;
  completedSessions: number;
  totalSessions: number;
  totalDistance: number;
  totalDuration: number;
}

export interface UserStats {
  totalSessions: number;
  totalDistance: number;
  totalDuration: number;
  currentStreak: number;
  longestStreak: number;
  points: number;
  badges: Badge[];
  personalRecords: PersonalRecord[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: Date;
  category: 'consistency' | 'distance' | 'strength' | 'special';
}

export interface PersonalRecord {
  exercise: string;
  value: number;
  unit: 'kg' | 'km' | 'min' | 'reps' | 'm';
  date: Date;
}

export interface QuickCheck {
  sleep: 1 | 2 | 3 | 4 | 5;
  nutrition: 1 | 2 | 3 | 4 | 5;
  stress: 1 | 2 | 3 | 4 | 5;
  date: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  type: 'training';
  sessionId: string;
}
