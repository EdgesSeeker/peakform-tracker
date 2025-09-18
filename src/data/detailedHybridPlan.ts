import { TrainingSession } from '../types';

export const detailedHybridPlan: TrainingSession[] = [
  // WOCHE 1 - Grundlage, Technik
  {
    id: 'w1-mo',
    type: 'cardio',
    subtype: 'running',
    title: '10 km Lauf (locker)',
    description: '6:30–7:00/km Pace ODER 2h Rad GA1',
    duration: 60,
    completed: false,
    date: new Date(2024, 0, 1), // Beispieldatum - wird später angepasst
    week: 1,
    day: 1,
    distance: 10,
    pace: '6:30-7:00',
    notes: 'Alternative: 2h Rad GA1 (Grundlagenausdauer)'
  },
  {
    id: 'w1-tu',
    type: 'strength',
    subtype: 'legs',
    title: 'Beine/Core',
    description: 'Squat, RDL, Ausfallschritte, Plank, Leg Raises',
    duration: 60,
    completed: false,
    date: new Date(2024, 0, 2),
    week: 1,
    day: 2,
    exercises: [
      {
        id: 'squat',
        name: 'Kniebeuge (Squat)',
        type: 'strength',
        sets: [
          { reps: 8, weight: 60 },
          { reps: 8, weight: 60 },
          { reps: 8, weight: 60 },
          { reps: 8, weight: 60 }
        ]
      },
      {
        id: 'rdl',
        name: 'Romanian Deadlift (RDL)',
        type: 'strength',
        sets: [
          { reps: 10, weight: 50 },
          { reps: 10, weight: 50 },
          { reps: 10, weight: 50 },
          { reps: 10, weight: 50 }
        ]
      },
      {
        id: 'lunges',
        name: 'Ausfallschritte',
        type: 'strength',
        sets: [
          { reps: 12, weight: 20 },
          { reps: 12, weight: 20 },
          { reps: 12, weight: 20 }
        ]
      },
      {
        id: 'plank',
        name: 'Plank',
        type: 'strength',
        sets: [
          { time: 60 },
          { time: 60 },
          { time: 60 }
        ]
      },
      {
        id: 'leg-raises',
        name: 'Leg Raises',
        type: 'strength',
        sets: [
          { reps: 15 },
          { reps: 15 },
          { reps: 15 }
        ]
      }
    ]
  },
  {
    id: 'w1-we',
    type: 'swimming',
    title: 'Schwimmen Technik',
    description: '6×100m Technik + 400m am Stück',
    duration: 45,
    completed: false,
    date: new Date(2024, 0, 3),
    week: 1,
    day: 3,
    distance: 1.2,
    notes: '1.200m gesamt: 6×100m Techniktraining + 400m kontinuierlich'
  },
  {
    id: 'w1-th',
    type: 'strength',
    subtype: 'upper',
    title: 'Oberkörper',
    description: 'Bankdrücken, Schulterdrücken, Rudern, Klimmzüge',
    duration: 60,
    completed: false,
    date: new Date(2024, 0, 4),
    week: 1,
    day: 4,
    exercises: [
      {
        id: 'bench',
        name: 'Bankdrücken',
        type: 'strength',
        sets: [
          { reps: 8, weight: 70 },
          { reps: 8, weight: 70 },
          { reps: 9, weight: 70 },
          { reps: 10, weight: 70 }
        ]
      },
      {
        id: 'shoulder-press',
        name: 'Schulterdrücken',
        type: 'strength',
        sets: [
          { reps: 8, weight: 40 },
          { reps: 9, weight: 40 },
          { reps: 10, weight: 40 },
          { reps: 8, weight: 40 }
        ]
      },
      {
        id: 'rows',
        name: 'Rudern',
        type: 'strength',
        sets: [
          { reps: 10, weight: 50 },
          { reps: 10, weight: 50 },
          { reps: 10, weight: 50 }
        ]
      },
      {
        id: 'pullups',
        name: 'Klimmzüge',
        type: 'strength',
        sets: [
          { reps: 6 },
          { reps: 5 },
          { reps: 4 }
        ]
      }
    ]
  },
  {
    id: 'w1-fr',
    type: 'cardio',
    subtype: 'intervals',
    title: 'Rad Intervalle',
    description: '5×4 Min hart / 3 Min locker',
    duration: 60,
    completed: false,
    date: new Date(2024, 0, 5),
    week: 1,
    day: 5,
    distance: 30,
    watts: 280,
    notes: '5 Intervalle: 4 Min bei hoher Intensität, 3 Min Erholung'
  },
  {
    id: 'w1-sa',
    type: 'strength',
    subtype: 'fullbody',
    title: 'Ganzkörper',
    description: 'Kreuzheben, Push Press, Klimmzüge, Hip Thrust, Core',
    duration: 60,
    completed: false,
    date: new Date(2024, 0, 6),
    week: 1,
    day: 6,
    exercises: [
      {
        id: 'deadlift',
        name: 'Kreuzheben',
        type: 'strength',
        sets: [
          { reps: 6, weight: 80 },
          { reps: 7, weight: 80 },
          { reps: 8, weight: 80 },
          { reps: 6, weight: 80 }
        ]
      },
      {
        id: 'push-press',
        name: 'Push Press',
        type: 'strength',
        sets: [
          { reps: 8, weight: 50 },
          { reps: 8, weight: 50 },
          { reps: 8, weight: 50 }
        ]
      },
      {
        id: 'pullups-fb',
        name: 'Klimmzüge',
        type: 'strength',
        sets: [
          { reps: 6 },
          { reps: 5 },
          { reps: 4 }
        ]
      },
      {
        id: 'hip-thrust',
        name: 'Hip Thrust',
        type: 'strength',
        sets: [
          { reps: 12, weight: 60 },
          { reps: 12, weight: 60 },
          { reps: 12, weight: 60 }
        ]
      }
    ]
  },
  {
    id: 'w1-su',
    type: 'yoga',
    title: 'Yoga/Mobility',
    description: 'Entspannung und Beweglichkeit',
    duration: 30,
    completed: false,
    date: new Date(2024, 0, 7),
    week: 1,
    day: 7,
    notes: 'Flow für Entspannung und Flexibilität, 30 Minuten'
  },

  // WOCHE 2 - Grundlage, Technik (gleich wie Woche 1)
  {
    id: 'w2-mo',
    type: 'cardio',
    subtype: 'running',
    title: '10 km Lauf (locker)',
    description: '6:30–7:00/km Pace ODER 2h Rad GA1',
    duration: 60,
    completed: false,
    date: new Date(2024, 0, 8),
    week: 2,
    day: 1,
    distance: 10,
    pace: '6:30-7:00',
    notes: 'Alternative: 2h Rad GA1 (Grundlagenausdauer)'
  },
  {
    id: 'w2-tu',
    type: 'strength',
    subtype: 'legs',
    title: 'Beine/Core',
    description: 'Squat, RDL, Ausfallschritte, Plank, Leg Raises',
    duration: 60,
    completed: false,
    date: new Date(2024, 0, 9),
    week: 2,
    day: 2,
    exercises: [
      {
        id: 'squat',
        name: 'Kniebeuge (Squat)',
        type: 'strength',
        sets: [
          { reps: 8, weight: 62.5 },
          { reps: 8, weight: 62.5 },
          { reps: 8, weight: 62.5 },
          { reps: 8, weight: 62.5 }
        ]
      },
      {
        id: 'rdl',
        name: 'Romanian Deadlift (RDL)',
        type: 'strength',
        sets: [
          { reps: 10, weight: 52.5 },
          { reps: 10, weight: 52.5 },
          { reps: 10, weight: 52.5 },
          { reps: 10, weight: 52.5 }
        ]
      },
      {
        id: 'lunges',
        name: 'Ausfallschritte',
        type: 'strength',
        sets: [
          { reps: 12, weight: 22.5 },
          { reps: 12, weight: 22.5 },
          { reps: 12, weight: 22.5 }
        ]
      },
      {
        id: 'plank',
        name: 'Plank',
        type: 'strength',
        sets: [
          { time: 60 },
          { time: 60 },
          { time: 60 }
        ]
      },
      {
        id: 'leg-raises',
        name: 'Leg Raises',
        type: 'strength',
        sets: [
          { reps: 15 },
          { reps: 15 },
          { reps: 15 }
        ]
      }
    ]
  },
  {
    id: 'w2-we',
    type: 'swimming',
    title: 'Schwimmen Technik',
    description: '6×100m Technik + 400m am Stück',
    duration: 45,
    completed: false,
    date: new Date(2024, 0, 10),
    week: 2,
    day: 3,
    distance: 1.2,
    notes: '1.200m gesamt: 6×100m Techniktraining + 400m kontinuierlich'
  },
  {
    id: 'w2-th',
    type: 'strength',
    subtype: 'upper',
    title: 'Oberkörper',
    description: 'Bankdrücken, Schulterdrücken, Rudern, Klimmzüge',
    duration: 60,
    completed: false,
    date: new Date(2024, 0, 11),
    week: 2,
    day: 4,
    exercises: [
      {
        id: 'bench',
        name: 'Bankdrücken',
        type: 'strength',
        sets: [
          { reps: 8, weight: 72.5 },
          { reps: 8, weight: 72.5 },
          { reps: 9, weight: 72.5 },
          { reps: 10, weight: 72.5 }
        ]
      },
      {
        id: 'shoulder-press',
        name: 'Schulterdrücken',
        type: 'strength',
        sets: [
          { reps: 8, weight: 42.5 },
          { reps: 9, weight: 42.5 },
          { reps: 10, weight: 42.5 },
          { reps: 8, weight: 42.5 }
        ]
      },
      {
        id: 'rows',
        name: 'Rudern',
        type: 'strength',
        sets: [
          { reps: 10, weight: 52.5 },
          { reps: 10, weight: 52.5 },
          { reps: 10, weight: 52.5 }
        ]
      },
      {
        id: 'pullups',
        name: 'Klimmzüge',
        type: 'strength',
        sets: [
          { reps: 7 },
          { reps: 6 },
          { reps: 5 }
        ]
      }
    ]
  },
  {
    id: 'w2-fr',
    type: 'cardio',
    subtype: 'intervals',
    title: 'Rad Intervalle',
    description: '5×4 Min hart / 3 Min locker',
    duration: 60,
    completed: false,
    date: new Date(2024, 0, 12),
    week: 2,
    day: 5,
    distance: 30,
    watts: 290,
    notes: '5 Intervalle: 4 Min bei hoher Intensität, 3 Min Erholung'
  },
  {
    id: 'w2-sa',
    type: 'strength',
    subtype: 'fullbody',
    title: 'Ganzkörper',
    description: 'Kreuzheben, Push Press, Klimmzüge, Hip Thrust, Core',
    duration: 60,
    completed: false,
    date: new Date(2024, 0, 13),
    week: 2,
    day: 6,
    exercises: [
      {
        id: 'deadlift',
        name: 'Kreuzheben',
        type: 'strength',
        sets: [
          { reps: 6, weight: 82.5 },
          { reps: 7, weight: 82.5 },
          { reps: 8, weight: 82.5 },
          { reps: 6, weight: 82.5 }
        ]
      },
      {
        id: 'push-press',
        name: 'Push Press',
        type: 'strength',
        sets: [
          { reps: 8, weight: 52.5 },
          { reps: 8, weight: 52.5 },
          { reps: 8, weight: 52.5 }
        ]
      },
      {
        id: 'pullups-fb',
        name: 'Klimmzüge',
        type: 'strength',
        sets: [
          { reps: 7 },
          { reps: 6 },
          { reps: 5 }
        ]
      },
      {
        id: 'hip-thrust',
        name: 'Hip Thrust',
        type: 'strength',
        sets: [
          { reps: 12, weight: 62.5 },
          { reps: 12, weight: 62.5 },
          { reps: 12, weight: 62.5 }
        ]
      }
    ]
  },
  {
    id: 'w2-su',
    type: 'yoga',
    title: 'Yoga/Mobility',
    description: 'Entspannung und Beweglichkeit',
    duration: 30,
    completed: false,
    date: new Date(2024, 0, 14),
    week: 2,
    day: 7,
    notes: 'Flow für Entspannung und Flexibilität, 30 Minuten'
  }

  // Weitere Wochen würden hier folgen...
  // Für die Demo erstelle ich erst mal 2 Wochen komplett
];

// Funktion um Plan für aktuelles Datum anzupassen
export const getAdjustedPlan = (startDate: Date = new Date()): TrainingSession[] => {
  const today = new Date(startDate);
  const currentWeekday = today.getDay() === 0 ? 7 : today.getDay(); // So=7, Mo=1, Di=2, Mi=3, Do=4, Fr=5, Sa=6
  
  // Finde den Montag dieser Woche
  const mondayOfThisWeek = new Date(today);
  mondayOfThisWeek.setDate(today.getDate() - (currentWeekday - 1));
  
  console.log('Plan Generation:');
  console.log('Heute:', today.toLocaleDateString('de-DE'), 'Wochentag:', currentWeekday);
  console.log('Montag dieser Woche:', mondayOfThisWeek.toLocaleDateString('de-DE'));
  
  return detailedHybridPlan.map((session) => {
    // Berechne das korrekte Datum basierend auf Woche und Tag
    const sessionDate = new Date(mondayOfThisWeek);
    const daysToAdd = (session.week - 1) * 7 + (session.day - 1);
    sessionDate.setDate(mondayOfThisWeek.getDate() + daysToAdd);
    
    console.log(`Session: ${session.title}, Woche: ${session.week}, Tag: ${session.day}, Datum: ${sessionDate.toLocaleDateString('de-DE')}`);
    
    return {
      ...session,
      date: sessionDate,
      id: `plan-w${session.week}-d${session.day}-${sessionDate.getTime()}`
    };
  });
};
