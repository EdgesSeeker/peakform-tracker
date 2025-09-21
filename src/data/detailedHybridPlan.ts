import { TrainingSession } from '../types';

// Detaillierter 8-Wochen Hybrid-Trainingsplan (Muskelaufbau + Triathlon)
// Fokus: Kraftzuwachs, Ausdauer, Technik mit optimaler Recovery
export const detailedHybridPlan: TrainingSession[] = [
  // WOCHE 1 - Eingewöhnungsphase (7 Sessions)
  {
    id: 'w1-mo',
    type: 'cardio',
    subtype: 'running',
    title: 'Grundlagen Laufen',
    description: 'Lockerer Grundlagenlauf zur Eingewöhnung',
    duration: 45,
    completed: false,
    date: new Date(2024, 0, 1),
    week: 1,
    day: 1,
    distance: 7,
    pace: '6:00-6:30',
    notes: 'Ruhiges Tempo, auf Körper hören'
  },
  {
    id: 'w1-tu',
    type: 'strength',
    subtype: 'legs',
    title: 'Beine/Core Basis',
    description: 'Grundlegende Kraftübungen für Beine und Rumpf',
    duration: 50,
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
          { reps: 10, weight: 60 },
          { reps: 10, weight: 60 },
          { reps: 10, weight: 60 }
        ]
      }
    ]
  },
  {
    id: 'w1-we',
    type: 'swimming',
    title: 'Schwimmen Grundlagen',
    description: 'Techniktraining und Grundlagenausdauer',
    duration: 50,
    completed: false,
    date: new Date(2024, 0, 3),
    week: 1,
    day: 3,
    distance: 1,
    notes: '1000m: Technik und Atmung fokussieren'
  },
  {
    id: 'w1-th',
    type: 'strength',
    subtype: 'upper',
    title: 'Oberkörper Basis',
    description: 'Grundlegende Oberkörperkraft',
    duration: 50,
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
          { reps: 10, weight: 50 },
          { reps: 10, weight: 50 },
          { reps: 10, weight: 50 }
        ]
      }
    ]
  },
  {
    id: 'w1-fr',
    type: 'cardio',
    subtype: 'cycling',
    title: 'Rad Grundlagen',
    description: 'Grundlagenausdauer auf dem Rad',
    duration: 60,
    completed: false,
    date: new Date(2024, 0, 5),
    week: 1,
    day: 5,
    distance: 25,
    notes: 'Gleichmäßiges Tempo, Trittfrequenz 80-90 RPM'
  },
  {
    id: 'w1-sa',
    type: 'strength',
    subtype: 'fullbody',
    title: 'Ganzkörper Basis',
    description: 'Komplettes Ganzkörpertraining',
    duration: 55,
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
          { reps: 8, weight: 70 },
          { reps: 8, weight: 70 },
          { reps: 8, weight: 70 }
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
    notes: 'Flow für Entspannung und Flexibilität'
  },

  // WOCHE 2 - Exakte Sessions wie gewünscht (21 Sessions)
  
  // === MONTAG - Laufen + Yoga ===
  {
    id: 'w2-mo-lauf',
    type: 'cardio',
    subtype: 'running',
    title: 'Lockerer Dauerlauf',
    description: '70 Min lockerer Dauerlauf (Zone 2, 70–75% HFmax), Zielpace: 6:20–6:40/km, Fokus Lauf-Ökonomie und Grundlagenausdauer',
    duration: 70,
    completed: false,
    date: new Date(2024, 0, 8),
    week: 2,
    day: 1,
    distance: 10,
    pace: '6:20-6:40',
    notes: 'Zone 2, 70–75% HFmax, Fokus Lauf-Ökonomie'
  },
  {
    id: 'w2-mo-yoga',
    type: 'yoga',
    subtype: 'stretching',
    title: 'Yoga Mobilität',
    description: '20 Min abends Yoga (Mobilität: Hüfte, Beinrückseite, Wirbelsäule)',
    duration: 20,
    completed: false,
    date: new Date(2024, 0, 8),
    week: 2,
    day: 1,
    notes: 'Mobilität: Hüfte, Beinrückseite, Wirbelsäule'
  },
  {
    id: 'w2-mo-atem',
    type: 'recovery',
    subtype: 'breathing',
    title: 'Atemübungen und Meditation',
    description: '10 Min Atemübungen und Meditation (Box-Breathing, Nasenatmung)',
    duration: 10,
    completed: false,
    date: new Date(2024, 0, 8),
    week: 2,
    day: 1,
    notes: 'Box-Breathing, Nasenatmung'
  },

  // === DIENSTAG - Kraft Beine/Core + Stretching ===
  {
    id: 'w2-di-kraft',
    type: 'strength',
    subtype: 'legs',
    title: 'Kraft Beine/Core',
    description: '60 Min Kraft Beine/Core: Kniebeugen 4×8–10 (80% 1RM), Ausfallschritte 3×10/Bein, Hip Thrusts 3×12, Core-Zirkel 3×30 Sek.',
    duration: 60,
    completed: false,
    date: new Date(2024, 0, 9),
    week: 2,
    day: 2,
    exercises: [
      {
        id: 'squat',
        name: 'Kniebeugen',
        type: 'strength',
        sets: [
          { reps: 10, weight: 80 },
          { reps: 9, weight: 80 },
          { reps: 8, weight: 80 },
          { reps: 8, weight: 80 }
        ]
      },
      {
        id: 'lunges',
        name: 'Ausfallschritte',
        type: 'strength',
        sets: [
          { reps: 10 },
          { reps: 10 },
          { reps: 10 }
        ]
      },
      {
        id: 'hip-thrusts',
        name: 'Hip Thrusts',
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
    id: 'w2-di-stretch',
    type: 'recovery',
    subtype: 'stretching',
    title: 'Langes Stretching',
    description: '20 Min langes Stretching (Beine, Hüfte, unterer Rücken)',
    duration: 20,
    completed: false,
    date: new Date(2024, 0, 9),
    week: 2,
    day: 2,
    notes: 'Beine, Hüfte, unterer Rücken'
  },
  {
    id: 'w2-di-meditation',
    type: 'recovery',
    subtype: 'meditation',
    title: 'Meditation/Entspannung',
    description: '10 Min Meditation/Entspannung',
    duration: 10,
    completed: false,
    date: new Date(2024, 0, 9),
    week: 2,
    day: 2,
    notes: 'Entspannung und mentale Ruhe'
  },

  // === MITTWOCH - Schwimmen Technik + Mobility ===
  {
    id: 'w2-mi-schwimmen',
    type: 'swimming',
    title: 'Schwimmen Technik',
    description: '70 Min Schwimmen (ca. 1.8 km): 300m Einschwimmen, 6×50m Technik, 5×100m zügig, 3×200m GA1, 200m Auslockern',
    duration: 70,
    completed: false,
    date: new Date(2024, 0, 10),
    week: 2,
    day: 3,
    distance: 1.8,
    notes: '300m + 6×50m Technik + 5×100m + 3×200m + 200m'
  },
  {
    id: 'w2-mi-mobility',
    type: 'recovery',
    subtype: 'stretching',
    title: 'Mobility-Flow',
    description: '15 Min Mobility-Flow mit Fokus Schulter/Thorax/Rumpf',
    duration: 15,
    completed: false,
    date: new Date(2024, 0, 10),
    week: 2,
    day: 3,
    notes: 'Fokus Schulter/Thorax/Rumpf'
  },

  // === DONNERSTAG - Oberkörper Push/Pull + Rad ===
  {
    id: 'w2-do-oberkoerper',
    type: 'strength',
    subtype: 'upper',
    title: 'Kraft Oberkörper',
    description: '60 Min Kraft Oberkörper: Bankdrücken 4×8, Klimmzüge 4×Max, Kurzhantel-Rudern 3×10/Seite, Facepulls 3×12, Liegestütz 3×15',
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
          { reps: 8, weight: 70 },
          { reps: 8, weight: 70 },
          { reps: 8, weight: 70 },
          { reps: 8, weight: 70 }
        ]
      },
      {
        id: 'pullups',
        name: 'Klimmzüge',
        type: 'strength',
        sets: [
          { reps: 10 },
          { reps: 8 },
          { reps: 6 },
          { reps: 5 }
        ]
      },
      {
        id: 'dumbbell-rows',
        name: 'Kurzhantel-Rudern',
        type: 'strength',
        sets: [
          { reps: 10, weight: 25 },
          { reps: 10, weight: 25 },
          { reps: 10, weight: 25 }
        ]
      }
    ]
  },
  {
    id: 'w2-do-rad',
    type: 'cardio',
    subtype: 'cycling',
    title: 'Lockere Radfahrt',
    description: '30 Min lockere Radfahrt, 100 Watt GA1, hohe Trittfrequenz (Regeneration)',
    duration: 30,
    completed: false,
    date: new Date(2024, 0, 11),
    week: 2,
    day: 4,
    distance: 15,
    watts: 100,
    notes: '100 Watt GA1, hohe Trittfrequenz (Regeneration)'
  },
  {
    id: 'w2-do-stretch',
    type: 'recovery',
    subtype: 'stretching',
    title: 'Stretching Oberkörper',
    description: '10 Min Stretching Oberkörper',
    duration: 10,
    completed: false,
    date: new Date(2024, 0, 11),
    week: 2,
    day: 4,
    notes: 'Dehnung Oberkörper nach Krafttraining'
  },

  // === FREITAG - Intervall Rad + Stretching ===
  {
    id: 'w2-fr-intervall',
    type: 'cardio',
    subtype: 'intervals',
    title: 'Rad Intervall',
    description: '80 Min Rad Intervall: 20 Min Einrollen, 6×4 Min Schwellenbereich (85–95% FTP), 20 Min Ausrollen',
    duration: 80,
    completed: false,
    date: new Date(2024, 0, 12),
    week: 2,
    day: 5,
    distance: 35,
    watts: 320,
    notes: '6×4 Min Schwellenbereich (85–95% FTP), 3 Min Pause'
  },
  {
    id: 'w2-fr-yoga',
    type: 'yoga',
    subtype: 'stretching',
    title: 'Yoga/Mobility',
    description: '15 Min Yoga/Mobility, Schwerpunkt Rücken/Hüfte',
    duration: 15,
    completed: false,
    date: new Date(2024, 0, 12),
    week: 2,
    day: 5,
    notes: 'Schwerpunkt Rücken/Hüfte'
  },
  {
    id: 'w2-fr-atem',
    type: 'recovery',
    subtype: 'breathing',
    title: 'Atemtechnik Wechselatmung',
    description: '10 Min Atemtechnik: Wechselatmung',
    duration: 10,
    completed: false,
    date: new Date(2024, 0, 12),
    week: 2,
    day: 5,
    notes: 'Wechselatmung-Technik'
  },

  // === SAMSTAG - Koppeleinheit + Kraft Ganzkörper ===
  {
    id: 'w2-sa-koppel',
    type: 'cardio',
    subtype: 'cycling',
    title: 'Koppeleinheit Rad-Lauf',
    description: '50 Min Rad (GA2, 75–80% HFmax), direkt gefolgt von 25 Min Lauf (lockeres Tempo, 6:30/km)',
    duration: 75,
    completed: false,
    date: new Date(2024, 0, 13),
    week: 2,
    day: 6,
    distance: 30,
    pace: '6:30',
    notes: '50min Rad + 25min Lauf, Fokus: Frequenz und Abrollgefühl'
  },
  {
    id: 'w2-sa-ganzkoerper',
    type: 'strength',
    subtype: 'fullbody',
    title: 'Ganzkörper Kraft',
    description: '45 Min Ganzkörper Kraft: Kreuzheben 3×8, Bulgarian Split Squat 3×8/Bein, Schulterdrücken 3×10, Plank-Varianten 3×30–45 Sek.',
    duration: 45,
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
          { reps: 8, weight: 80 },
          { reps: 8, weight: 80 },
          { reps: 8, weight: 80 }
        ]
      },
      {
        id: 'bulgarian-split',
        name: 'Bulgarian Split Squat',
        type: 'strength',
        sets: [
          { reps: 8 },
          { reps: 8 },
          { reps: 8 }
        ]
      },
      {
        id: 'shoulder-press',
        name: 'Schulterdrücken',
        type: 'strength',
        sets: [
          { reps: 10, weight: 20 },
          { reps: 10, weight: 20 },
          { reps: 10, weight: 20 }
        ]
      }
    ]
  },
  {
    id: 'w2-sa-dehnen',
    type: 'recovery',
    subtype: 'stretching',
    title: 'Dehnen Beine/Glutes',
    description: '10 Min Dehnen (Fokus Beine/Glutes)',
    duration: 10,
    completed: false,
    date: new Date(2024, 0, 13),
    week: 2,
    day: 6,
    notes: 'Fokus Beine/Glutes'
  },

  // === SONNTAG - Schwimmen Recovery + Yoga/Meditation ===
  {
    id: 'w2-so-schwimmen',
    type: 'swimming',
    title: 'Schwimmen Recovery',
    description: '30 Min lockeres Schwimmen (Technik, Fokus Atmung und Wasserlage, Pace 2:15–2:30/100m)',
    duration: 30,
    completed: false,
    date: new Date(2024, 0, 14),
    week: 2,
    day: 7,
    distance: 0.8,
    pace: '2:15-2:30',
    notes: 'Technik, Fokus Atmung und Wasserlage'
  },
  {
    id: 'w2-so-yoga',
    type: 'yoga',
    subtype: 'stretching',
    title: 'Yoga Recovery Flow',
    description: '30 Min Yoga Recovery Flow (ruhig, dehnend)',
    duration: 30,
    completed: false,
    date: new Date(2024, 0, 14),
    week: 2,
    day: 7,
    notes: 'Ruhig, dehnend'
  },
  {
    id: 'w2-so-meditation',
    type: 'recovery',
    subtype: 'meditation',
    title: 'Geführte Meditation',
    description: '15 Min geführte Meditation/Atemübungen',
    duration: 15,
    completed: false,
    date: new Date(2024, 0, 14),
    week: 2,
    day: 7,
    notes: 'Geführte Meditation/Atemübungen'
  }

  // Weitere Wochen würden hier folgen...
  // Für die Demo erstelle ich erst mal 2 Wochen komplett
];

// Funktion um Plan für aktuelles Datum anzupassen
export const getAdjustedPlan = (startDate: Date = new Date()): TrainingSession[] => {
  // Feste Startdaten für die Wochen
  const week1Start = new Date(2024, 8, 16); // 16.09.2024 (Montag) - Woche 1 Start
  const week2Start = new Date(2024, 8, 22); // 22.09.2024 (Montag) - Woche 2 Start
  
  console.log('📅 Plan Generation mit festen Daten:');
  console.log('Woche 1 Start:', week1Start.toLocaleDateString('de-DE'));
  console.log('Woche 2 Start:', week2Start.toLocaleDateString('de-DE'));
  
  return detailedHybridPlan.map((session) => {
    let sessionDate: Date;
    
    if (session.week === 1) {
      // Woche 1: Ab 16.09.2024 (Montag = Tag 1)
      sessionDate = new Date(week1Start);
      sessionDate.setDate(week1Start.getDate() + (session.day - 1));
    } else if (session.week === 2) {
      // Woche 2: Ab 22.09.2024 (Montag = Tag 1)
      sessionDate = new Date(week2Start);
      sessionDate.setDate(week2Start.getDate() + (session.day - 1));
    } else {
      // Weitere Wochen: Berechnung basierend auf Woche 1
      sessionDate = new Date(week1Start);
      sessionDate.setDate(week1Start.getDate() + ((session.week - 1) * 7) + (session.day - 1));
    }
    
    return {
      ...session,
      date: sessionDate
    };
  });
};
