export interface TrainingSession {
  id: string;
  type: 'cardio' | 'strength' | 'swimming' | 'yoga' | 'recovery';
  subtype?: 'running' | 'cycling' | 'intervals' | 'legs' | 'upper' | 'fullbody' | 'meditation' | 'stretching' | 'breathing';
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
  icon?: string; // Emoji-Icon für das Workout
  // Multi-workout support
  isAdditionalWorkout?: boolean; // Kennzeichnet zusätzliche Workouts
  parentWorkoutId?: string; // Verknüpfung zu anderen Workouts desselben Tages
  workoutGroup?: string; // Gruppierung für Multi-Workouts
  excludeFromStats?: boolean; // Workout aus Statistiken ausschließen
}

// Neue Interfaces für Multi-Workout System
export interface DailyWorkoutGroup {
  date: Date;
  workouts: TrainingSession[];
  totalDuration: number;
  totalDistance: number;
  completed: boolean;
  notes?: string;
}

export interface AdditionalWorkout {
  id: string;
  type: 'cycling' | 'swimming' | 'strength' | 'running' | 'yoga' | 'hiking' | 'climbing' | 'boxing' | 'dancing' | 'other';
  title: string;
  duration: number;
  distance?: number;
  intensity?: 'low' | 'moderate' | 'high' | 'very_high';
  calories?: number;
  notes?: string;
  equipment?: string[];
  location?: string;
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
  weightEntries: WeightEntry[];
  weightGoal: WeightGoal;
  proteinEntries: ProteinEntry[];
  nutritionGoal: NutritionGoal;
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

export interface WeightEntry {
  id: string;
  weight: number; // in kg
  date: Date;
  notes?: string;
}

export interface WeightGoal {
  targetWeight: number; // in kg
  startWeight: number; // in kg
  startDate: Date;
  targetDate?: Date;
}

export interface ProteinEntry {
  id: string;
  protein: number; // in gram
  food: string; // Lebensmittel
  date: Date;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
}

export interface NutritionGoal {
  dailyProtein: number; // in gram (Ziel: 140g)
  dailyCalories?: number;
  dailyCarbs?: number;
  dailyFat?: number;
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
