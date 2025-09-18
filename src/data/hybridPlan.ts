import { TrainingSession } from '../types';

export const hybridPlan: TrainingSession[] = [
  // WOCHE 1
  // Montag - Lange Einheit (Lauf)
  {
    id: 'w1-mon',
    type: 'cardio',
    subtype: 'running',
    title: '10 km Lauf (locker)',
    description: 'Grundlagenausdauer - 6:30-7:00/km Pace',
    duration: 60,
    completed: false,
    date: new Date(),
    week: 1,
    day: 1,
    distance: 10,
    pace: '6:30-7:00',
    notes: 'Locker laufen, auf Atmung achten'
  },
  // Dienstag - Kraft Beine/Core
  {
    id: 'w1-tue',
    type: 'strength',
    subtype: 'legs',
    title: 'Kraft Beine/Core',
    description: 'Grundübungen für Beine und Rumpf',
    duration: 75,
    completed: false,
    date: new Date(),
    week: 1,
    day: 2,
    exercises: [
      {
        id: 'squat',
        name: 'Kniebeuge',
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
        name: 'Romanian Deadlift',
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
        name: 'Planks',
        type: 'strength',
        sets: [
          { time: 45 },
          { time: 45 },
          { time: 45 }
        ]
      }
    ]
  },
  // Mittwoch - Schwimmen
  {
    id: 'w1-wed',
    type: 'swimming',
    title: 'Schwimmen Technik',
    description: 'Techniktraining und Ausdauer',
    duration: 45,
    completed: false,
    date: new Date(),
    week: 1,
    day: 3,
    distance: 1.2,
    notes: '6x100m Technik + 400m am Stück'
  },
  // Donnerstag - Kraft Oberkörper
  {
    id: 'w1-thu',
    type: 'strength',
    subtype: 'upper',
    title: 'Kraft Oberkörper',
    description: 'Push/Pull Training für Oberkörper',
    duration: 75,
    completed: false,
    date: new Date(),
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
          { reps: 8, weight: 70 },
          { reps: 8, weight: 70 }
        ]
      },
      {
        id: 'shoulder-press',
        name: 'Schulterdrücken',
        type: 'strength',
        sets: [
          { reps: 8, weight: 40 },
          { reps: 8, weight: 40 },
          { reps: 8, weight: 40 },
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
          { reps: 6 },
          { reps: 6 }
        ]
      }
    ]
  },
  // Freitag - Rad Intervalle
  {
    id: 'w1-fri',
    type: 'cardio',
    subtype: 'intervals',
    title: 'Rad Intervalle',
    description: '5x4 Min hart / 3 Min locker',
    duration: 60,
    completed: false,
    date: new Date(),
    week: 1,
    day: 5,
    distance: 25,
    watts: 250,
    notes: '5x4 Min bei 300W / 3 Min bei 150W'
  },
  // Samstag - Ganzkörper
  {
    id: 'w1-sat',
    type: 'strength',
    subtype: 'fullbody',
    title: 'Kraft Ganzkörper',
    description: 'Grundübungen für den ganzen Körper',
    duration: 75,
    completed: false,
    date: new Date(),
    week: 1,
    day: 6,
    exercises: [
      {
        id: 'deadlift',
        name: 'Kreuzheben',
        type: 'strength',
        sets: [
          { reps: 6, weight: 80 },
          { reps: 6, weight: 80 },
          { reps: 6, weight: 80 },
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
        id: 'pullups-weighted',
        name: 'Klimmzüge',
        type: 'strength',
        sets: [
          { reps: 8 },
          { reps: 8 },
          { reps: 8 }
        ]
      }
    ]
  },
  // Sonntag - Yoga
  {
    id: 'w1-sun',
    type: 'yoga',
    title: 'Yoga/Recovery',
    description: 'Entspannung und Mobilität',
    duration: 30,
    completed: false,
    date: new Date(),
    week: 1,
    day: 7,
    notes: 'Flow für Entspannung und Flexibilität'
  }
];

// Funktion um den Plan für alle 8 Wochen zu generieren
export const generateFullPlan = (): TrainingSession[] => {
  const fullPlan: TrainingSession[] = [];
  
  for (let week = 1; week <= 8; week++) {
    const weekPlan = hybridPlan.map(session => ({
      ...session,
      id: `w${week}-${session.id.split('-')[1]}`,
      week,
      date: new Date(2024, 0, (week - 1) * 7 + session.day), // Beispiel-Datum
      // Progressionen für verschiedene Wochen
      ...(session.type === 'cardio' && session.subtype === 'running' && {
        distance: session.distance! + (week - 1) * 2, // +2km pro Woche
        title: `${session.distance! + (week - 1) * 2} km Lauf (locker)`
      }),
      ...(session.type === 'swimming' && {
        distance: session.distance! + (week - 1) * 0.2, // +200m pro Woche
        title: `Schwimmen ${(session.distance! + (week - 1) * 0.2).toFixed(1)}km`
      }),
      ...(session.exercises && {
        exercises: session.exercises.map(exercise => ({
          ...exercise,
          sets: exercise.sets.map(set => ({
            ...set,
            // Gewichtssteigerung pro Woche
            weight: set.weight ? set.weight + (week - 1) * 2.5 : undefined
          }))
        }))
      })
    }));
    
    fullPlan.push(...weekPlan);
  }
  
  return fullPlan;
};
