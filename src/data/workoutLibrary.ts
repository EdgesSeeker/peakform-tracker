export interface WorkoutTemplate {
  id: string;
  name: string;
  type: 'cardio' | 'strength' | 'swimming' | 'yoga' | 'recovery';
  subtype?: 'running' | 'cycling' | 'intervals' | 'legs' | 'upper' | 'fullbody' | 'meditation' | 'stretching' | 'breathing';
  duration: number; // Standard-Dauer in Minuten
  distance?: number; // Standard-Distanz falls vorhanden
  description: string;
  category: 'cardio' | 'strength' | 'swimming' | 'flexibility' | 'mindfulness' | 'recovery';
  intensity: 'low' | 'moderate' | 'high' | 'very_high';
  icon: string;
  calories?: number; // Geschätzte Kalorien
  equipment?: string[];
}

export const workoutLibrary: WorkoutTemplate[] = [
  // Cardio Workouts
  {
    id: 'running-5k',
    name: '5km Lauf',
    type: 'cardio',
    subtype: 'running',
    duration: 30,
    distance: 5,
    description: 'Lockerer 5km Lauf im moderaten Tempo',
    category: 'cardio',
    intensity: 'moderate',
    icon: '🏃‍♂️',
    calories: 350,
    equipment: ['Laufschuhe']
  },
  {
    id: 'running-10k',
    name: '10km Lauf',
    type: 'cardio',
    subtype: 'running',
    duration: 60,
    distance: 10,
    description: 'Längerer 10km Lauf für Ausdauer',
    category: 'cardio',
    intensity: 'high',
    icon: '🏃‍♂️',
    calories: 700,
    equipment: ['Laufschuhe']
  },
  {
    id: 'cycling-30min',
    name: '30min Radfahren',
    type: 'cardio',
    subtype: 'cycling',
    duration: 30,
    distance: 15,
    description: 'Entspannte Radtour oder Heimtrainer',
    category: 'cardio',
    intensity: 'moderate',
    icon: '🚴‍♂️',
    calories: 300,
    equipment: ['Fahrrad']
  },
  {
    id: 'bike-intervals',
    name: 'Rad-Intervalle',
    type: 'cardio',
    subtype: 'intervals',
    duration: 45,
    distance: 20,
    description: 'Intensive Rad-Intervalle für Kraftausdauer',
    category: 'cardio',
    intensity: 'very_high',
    icon: '🚴‍♂️⚡',
    calories: 500,
    equipment: ['Fahrrad']
  },
  {
    id: 'hiit-20min',
    name: '20min HIIT',
    type: 'cardio',
    subtype: 'intervals',
    duration: 20,
    description: 'Hochintensives Intervalltraining',
    category: 'cardio',
    intensity: 'very_high',
    icon: '🔥',
    calories: 250,
    equipment: []
  },

  // Strength Training
  {
    id: 'fullbody-strength',
    name: 'Ganzkörper Kraft',
    type: 'strength',
    subtype: 'fullbody',
    duration: 60,
    description: 'Komplettes Ganzkörpertraining',
    category: 'strength',
    intensity: 'high',
    icon: '💪',
    calories: 400,
    equipment: ['Hanteln', 'Langhantel']
  },
  {
    id: 'upper-body',
    name: 'Oberkörper Training',
    type: 'strength',
    subtype: 'upper',
    duration: 45,
    description: 'Fokus auf Brust, Rücken, Schultern, Arme',
    category: 'strength',
    intensity: 'high',
    icon: '🏋️‍♂️',
    calories: 300,
    equipment: ['Hanteln', 'Klimmzugstange']
  },
  {
    id: 'leg-day',
    name: 'Beintraining',
    type: 'strength',
    subtype: 'legs',
    duration: 50,
    description: 'Intensive Bein- und Po-Übungen',
    category: 'strength',
    intensity: 'high',
    icon: '🦵',
    calories: 350,
    equipment: ['Langhantel', 'Beinpresse']
  },
  {
    id: 'core-workout',
    name: 'Core Training',
    type: 'strength',
    duration: 30,
    description: 'Bauch-, Rücken- und Rumpfstabilisation',
    category: 'strength',
    intensity: 'moderate',
    icon: '🎯',
    calories: 200,
    equipment: ['Yogamatte']
  },
  {
    id: 'bodyweight',
    name: 'Körpergewicht Training',
    type: 'strength',
    duration: 30,
    description: 'Training nur mit dem eigenen Körpergewicht',
    category: 'strength',
    intensity: 'moderate',
    icon: '🤸‍♂️',
    calories: 250,
    equipment: []
  },

  // Swimming
  {
    id: 'swim-technique',
    name: 'Schwimm-Technik',
    type: 'swimming',
    duration: 45,
    distance: 1.5,
    description: 'Techniktraining verschiedene Schwimmstile',
    category: 'swimming',
    intensity: 'moderate',
    icon: '🏊‍♂️',
    calories: 400,
    equipment: ['Schwimmbrille']
  },
  {
    id: 'swim-endurance',
    name: 'Schwimm-Ausdauer',
    type: 'swimming',
    duration: 60,
    distance: 2.5,
    description: 'Längere Schwimmeinheit für Ausdauer',
    category: 'swimming',
    intensity: 'high',
    icon: '🏊‍♂️💨',
    calories: 600,
    equipment: ['Schwimmbrille']
  },

  // Yoga & Flexibility
  {
    id: 'yoga-flow',
    name: 'Yoga Flow',
    type: 'yoga',
    duration: 60,
    description: 'Fließende Yoga-Sequenz für Flexibilität',
    category: 'flexibility',
    intensity: 'low',
    icon: '🧘‍♀️',
    calories: 180,
    equipment: ['Yogamatte']
  },
  {
    id: 'yoga-morning',
    name: 'Morgen Yoga',
    type: 'yoga',
    duration: 20,
    description: 'Sanfte Yoga-Routine für den Morgen',
    category: 'flexibility',
    intensity: 'low',
    icon: '🌅🧘‍♀️',
    calories: 80,
    equipment: ['Yogamatte']
  },
  {
    id: 'stretching-session',
    name: 'Stretching',
    type: 'recovery',
    subtype: 'stretching',
    duration: 15,
    description: 'Ganzkörper Stretching für Regeneration',
    category: 'flexibility',
    intensity: 'low',
    icon: '🤸‍♀️',
    calories: 50,
    equipment: ['Yogamatte']
  },
  {
    id: 'deep-stretching',
    name: 'Deep Stretching',
    type: 'recovery',
    subtype: 'stretching',
    duration: 30,
    description: 'Intensives Stretching für bessere Beweglichkeit',
    category: 'flexibility',
    intensity: 'low',
    icon: '🧘‍♂️',
    calories: 100,
    equipment: ['Yogamatte']
  },

  // Mindfulness & Recovery
  {
    id: 'meditation-10min',
    name: '10min Meditation',
    type: 'recovery',
    subtype: 'meditation',
    duration: 10,
    description: 'Kurze Meditation für mentale Klarheit',
    category: 'mindfulness',
    intensity: 'low',
    icon: '🧘',
    calories: 20,
    equipment: []
  },
  {
    id: 'meditation-20min',
    name: '20min Meditation',
    type: 'recovery',
    subtype: 'meditation',
    duration: 20,
    description: 'Längere Meditationssession',
    category: 'mindfulness',
    intensity: 'low',
    icon: '🧘✨',
    calories: 40,
    equipment: []
  },
  {
    id: 'breathing-exercise',
    name: 'Atemübungen',
    type: 'recovery',
    subtype: 'breathing',
    duration: 10,
    description: 'Atemtechniken für Entspannung und Fokus',
    category: 'mindfulness',
    intensity: 'low',
    icon: '💨🧘',
    calories: 15,
    equipment: []
  },
  {
    id: 'breathwork-session',
    name: 'Breathwork Session',
    type: 'recovery',
    subtype: 'breathing',
    duration: 30,
    description: 'Intensive Atemarbeit für Stressabbau',
    category: 'mindfulness',
    intensity: 'moderate',
    icon: '💨✨',
    calories: 60,
    equipment: []
  },

  // Spezifische Triathlon-Workouts
  {
    id: 'zone2-run-70min',
    name: '70min Zone 2 Lauf',
    type: 'cardio',
    subtype: 'running',
    duration: 70,
    distance: 11,
    description: 'Lockerer Dauerlauf Zone 2 (70-75% HFmax), Pace 6:20-6:40/km, Fokus Lauf-Ökonomie',
    category: 'cardio',
    intensity: 'moderate',
    icon: '🏃‍♂️⏱️',
    calories: 700,
    equipment: ['Laufschuhe', 'Pulsuhr']
  },
  {
    id: 'legs-core-strength',
    name: 'Kraft Beine/Core',
    type: 'strength',
    subtype: 'legs',
    duration: 60,
    description: 'Kniebeugen 4×8-10 (80% 1RM), Ausfallschritte 3×10/Bein, Hip Thrusts 3×12, Core-Zirkel 3×30s',
    category: 'strength',
    intensity: 'high',
    icon: '🦵💪',
    calories: 400,
    equipment: ['Langhantel', 'Kurzhanteln']
  },
  {
    id: 'swim-technique-70min',
    name: 'Schwimmen Technik 70min',
    type: 'swimming',
    duration: 70,
    distance: 1.8,
    description: '300m Einschwimmen, 6×50m Technik, 5×100m zügig (1:55-2:05), 3×200m GA1 (2:00-2:10), 200m Auslockern',
    category: 'swimming',
    intensity: 'moderate',
    icon: '🏊‍♂️🎯',
    calories: 500,
    equipment: ['Schwimmbrille', 'Pullbuoy']
  },
  {
    id: 'upper-body-strength',
    name: 'Oberkörper Push/Pull',
    type: 'strength',
    subtype: 'upper',
    duration: 60,
    description: 'Bankdrücken 4×8, Klimmzüge 4×Max, KH-Rudern 3×10/Seite, Facepulls 3×12, Liegestütz 3×15',
    category: 'strength',
    intensity: 'high',
    icon: '🏋️‍♂️💪',
    calories: 350,
    equipment: ['Langhantel', 'Klimmzugstange', 'Kurzhanteln']
  },
  {
    id: 'bike-intervals-80min',
    name: 'Rad Intervall 80min',
    type: 'cardio',
    subtype: 'intervals',
    duration: 80,
    distance: 35,
    description: '20min Einrollen (100-120W), 6×4min Schwellenbereich (85-95% FTP), 3min Pause, 20min Ausrollen',
    category: 'cardio',
    intensity: 'very_high',
    icon: '🚴‍♂️⚡',
    calories: 650,
    equipment: ['Rad', 'Powermeter']
  },
  {
    id: 'brick-workout',
    name: 'Koppeleinheit Rad+Lauf',
    type: 'cardio',
    subtype: 'intervals',
    duration: 75,
    distance: 28,
    description: '50min Rad GA2 (75-80% HFmax) direkt gefolgt von 25min Lauf (6:30/km), Fokus Frequenz',
    category: 'cardio',
    intensity: 'high',
    icon: '🚴‍♂️🏃‍♂️',
    calories: 600,
    equipment: ['Rad', 'Laufschuhe']
  },
  {
    id: 'fullbody-strength-45min',
    name: 'Ganzkörper Kraft 45min',
    type: 'strength',
    subtype: 'fullbody',
    duration: 45,
    description: 'Kreuzheben 3×8, Bulgarian Split Squat 3×8/Bein, Schulterdrücken 3×10, Plank-Varianten 3×30-45s',
    category: 'strength',
    intensity: 'high',
    icon: '💪🏋️‍♂️',
    calories: 300,
    equipment: ['Langhantel', 'Kurzhanteln']
  },
  {
    id: 'swim-recovery-30min',
    name: 'Schwimmen Recovery',
    type: 'swimming',
    duration: 30,
    distance: 1.2,
    description: 'Lockeres Schwimmen, Fokus Atmung und Wasserlage, Pace 2:15-2:30/100m',
    category: 'recovery',
    intensity: 'low',
    icon: '🏊‍♂️😌',
    calories: 200,
    equipment: ['Schwimmbrille']
  },
  {
    id: 'bike-ga1-30min',
    name: '30min Rad GA1',
    type: 'cardio',
    subtype: 'cycling',
    duration: 30,
    distance: 15,
    description: 'Lockere Radfahrt 100W GA1, hohe Trittfrequenz (Regeneration)',
    category: 'recovery',
    intensity: 'low',
    icon: '🚴‍♂️💨',
    calories: 200,
    equipment: ['Rad']
  },
  {
    id: 'yoga-mobility-20min',
    name: 'Yoga Mobilität 20min',
    type: 'yoga',
    duration: 20,
    description: 'Mobilität für Hüfte, Beinrückseite, Wirbelsäule',
    category: 'flexibility',
    intensity: 'low',
    icon: '🧘‍♀️🤸‍♀️',
    calories: 80,
    equipment: ['Yogamatte']
  },
  {
    id: 'yoga-recovery-30min',
    name: 'Yoga Recovery Flow',
    type: 'yoga',
    duration: 30,
    description: 'Ruhiger, dehnender Yoga Flow für Regeneration',
    category: 'recovery',
    intensity: 'low',
    icon: '🧘‍♀️💆‍♂️',
    calories: 120,
    equipment: ['Yogamatte']
  },
  {
    id: 'mobility-shoulder-15min',
    name: 'Mobility Schulter/Thorax',
    type: 'recovery',
    duration: 15,
    description: 'Mobility-Flow mit Fokus Schulter/Thorax/Rumpf',
    category: 'flexibility',
    intensity: 'low',
    icon: '🤸‍♂️💪',
    calories: 50,
    equipment: ['Yogamatte']
  },
  {
    id: 'stretching-legs-20min',
    name: 'Stretching Beine 20min',
    type: 'recovery',
    subtype: 'stretching',
    duration: 20,
    description: 'Langes Stretching für Beine, Hüfte, unterer Rücken',
    category: 'flexibility',
    intensity: 'low',
    icon: '🦵🤸‍♀️',
    calories: 60,
    equipment: ['Yogamatte']
  },
  {
    id: 'stretching-upper-10min',
    name: 'Stretching Oberkörper',
    type: 'recovery',
    subtype: 'stretching',
    duration: 10,
    description: 'Stretching für Oberkörper, Schultern, Brust',
    category: 'flexibility',
    intensity: 'low',
    icon: '💪🤸‍♂️',
    calories: 30,
    equipment: ['Yogamatte']
  },
  {
    id: 'box-breathing-10min',
    name: 'Box-Breathing & Meditation',
    type: 'recovery',
    subtype: 'breathing',
    duration: 10,
    description: 'Box-Breathing, Nasenatmung und Meditation',
    category: 'mindfulness',
    intensity: 'low',
    icon: '💨🧘',
    calories: 20,
    equipment: []
  },
  {
    id: 'breathing-technique-10min',
    name: 'Atemtechnik Wechselatmung',
    type: 'recovery',
    subtype: 'breathing',
    duration: 10,
    description: 'Wechselatmung und Atemtechnik-Training',
    category: 'mindfulness',
    intensity: 'low',
    icon: '💨✨',
    calories: 20,
    equipment: []
  },
  {
    id: 'meditation-relaxation-10min',
    name: 'Meditation/Entspannung',
    type: 'recovery',
    subtype: 'meditation',
    duration: 10,
    description: 'Geführte Meditation und Entspannung',
    category: 'mindfulness',
    intensity: 'low',
    icon: '🧘✨',
    calories: 20,
    equipment: []
  },
  {
    id: 'meditation-guided-15min',
    name: 'Geführte Meditation 15min',
    type: 'recovery',
    subtype: 'meditation',
    duration: 15,
    description: 'Geführte Meditation und Atemübungen',
    category: 'mindfulness',
    intensity: 'low',
    icon: '🧘‍♂️🎧',
    calories: 30,
    equipment: []
  },
  {
    id: 'stretching-legs-glutes-10min',
    name: 'Dehnen Beine/Glutes',
    type: 'recovery',
    subtype: 'stretching',
    duration: 10,
    description: 'Fokus-Dehnung für Beine und Glutes',
    category: 'flexibility',
    intensity: 'low',
    icon: '🦵🍑',
    calories: 30,
    equipment: ['Yogamatte']
  },

  // Recovery
  {
    id: 'recovery-walk',
    name: 'Erholungs-Spaziergang',
    type: 'recovery',
    duration: 30,
    distance: 2,
    description: 'Entspannter Spaziergang für aktive Erholung',
    category: 'recovery',
    intensity: 'low',
    icon: '🚶‍♂️',
    calories: 120,
    equipment: []
  },
  {
    id: 'foam-rolling',
    name: 'Foam Rolling',
    type: 'recovery',
    duration: 15,
    description: 'Selbstmassage mit der Faszienrolle',
    category: 'recovery',
    intensity: 'low',
    icon: '🎳',
    calories: 30,
    equipment: ['Faszienrolle']
  },
  {
    id: 'sauna-session',
    name: 'Sauna',
    type: 'recovery',
    duration: 20,
    description: 'Entspannung und Regeneration in der Sauna',
    category: 'recovery',
    intensity: 'low',
    icon: '🧖‍♂️',
    calories: 50,
    equipment: []
  }
];

// Kategorien für die Filterung
export const workoutCategories = [
  { id: 'all', name: 'Alle', icon: '🏃‍♂️' },
  { id: 'cardio', name: 'Ausdauer', icon: '❤️' },
  { id: 'strength', name: 'Kraft', icon: '💪' },
  { id: 'swimming', name: 'Schwimmen', icon: '🏊‍♂️' },
  { id: 'flexibility', name: 'Beweglichkeit', icon: '🤸‍♀️' },
  { id: 'mindfulness', name: 'Achtsamkeit', icon: '🧘' },
  { id: 'recovery', name: 'Erholung', icon: '💆‍♂️' }
];

// Intelligente Wochen-Zuordnung für Trainingsplan
const getTrainingWeek = (date: Date): number => {
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  // Workouts der letzten 7 Tage = Woche 1
  if (daysDiff <= 7) {
    return 1; // Aktuelle Woche
  } else if (daysDiff <= 14) {
    return 2; // Letzte Woche 
  } else if (daysDiff <= 21) {
    return 3; // Vorletzte Woche
  } else if (daysDiff <= 28) {
    return 4; // 3 Wochen zurück
  } else {
    return Math.min(8, Math.ceil(daysDiff / 7)); // Max 8 Wochen
  }
};

// Hilfsfunktion um Workout-Template in TrainingSession zu konvertieren
export const createSessionFromTemplate = (template: WorkoutTemplate, date: Date): any => {
  return {
    id: `template-${template.id}-${Date.now()}`,
    type: template.type,
    subtype: template.subtype,
    title: template.name,
    description: template.description,
    duration: template.duration,
    distance: template.distance,
    notes: undefined,
    completed: true,
    date: date,
    week: getTrainingWeek(date),
    day: date.getDay() || 7,
    isAdditionalWorkout: true,
    calories: template.calories,
    workoutGroup: `${date.toDateString()}-template`
  };
};
