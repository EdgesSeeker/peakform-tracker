import { Badge } from '../types';

export const badgeDefinitions: Badge[] = [
  // Consistency Badges
  {
    id: 'week-warrior',
    name: 'Wochen-Krieger',
    description: '7 Tage in Folge trainiert',
    icon: '🔥',
    earned: false,
    category: 'consistency'
  },
  {
    id: 'month-master',
    name: 'Monats-Meister',
    description: '4 Wochen am Stück kein Ausfall',
    icon: '💪',
    earned: false,
    category: 'consistency'
  },
  {
    id: 'iron-discipline',
    name: 'Eiserne Disziplin',
    description: '8 Wochen Hybridplan komplett absolviert',
    icon: '🏆',
    earned: false,
    category: 'consistency'
  },
  
  // Distance Badges
  {
    id: 'century-rider',
    name: '100km Radler',
    description: '100km mit dem Rad gefahren',
    icon: '🚴‍♂️',
    earned: false,
    category: 'distance'
  },
  {
    id: 'marathon-runner',
    name: 'Marathon Läufer',
    description: '42.2km gelaufen (kumulativ)',
    icon: '🏃‍♂️',
    earned: false,
    category: 'distance'
  },
  {
    id: 'channel-swimmer',
    name: 'Kanal-Schwimmer',
    description: '10km geschwommen (kumulativ)',
    icon: '🏊‍♂️',
    earned: false,
    category: 'distance'
  },
  
  // Strength Badges
  {
    id: 'squat-king',
    name: 'Kniebeuge König',
    description: '100kg Kniebeuge erreicht',
    icon: '👑',
    earned: false,
    category: 'strength'
  },
  {
    id: 'deadlift-demon',
    name: 'Kreuzhebe Dämon',
    description: '120kg Kreuzheben erreicht',
    icon: '😈',
    earned: false,
    category: 'strength'
  },
  {
    id: 'pullup-pro',
    name: 'Klimmzug Profi',
    description: '15 Klimmzüge am Stück',
    icon: '💯',
    earned: false,
    category: 'strength'
  },
  
  // Special Badges
  {
    id: 'early-bird',
    name: 'Frühaufsteher',
    description: '10x vor 7:00 Uhr trainiert',
    icon: '🌅',
    earned: false,
    category: 'special'
  },
  {
    id: 'triathlete',
    name: 'Triathlet',
    description: 'An einem Tag: Schwimmen, Radfahren und Laufen',
    icon: '🏅',
    earned: false,
    category: 'special'
  },
  {
    id: 'point-collector',
    name: 'Punkte Sammler',
    description: '1000 Punkte erreicht',
    icon: '⭐',
    earned: false,
    category: 'special'
  },
  // Multi-Workout Badges
  {
    id: 'multi-warrior',
    name: 'Multi-Krieger',
    description: 'Erstes Multi-Workout Tag absolviert',
    icon: '⚡',
    earned: false,
    category: 'special'
  },
  {
    id: 'triple-threat',
    name: 'Triple Threat',
    description: '3 verschiedene Workouts an einem Tag',
    icon: '🎯',
    earned: false,
    category: 'special'
  },
  {
    id: 'endurance-machine',
    name: 'Ausdauer-Maschine',
    description: 'Über 3 Stunden Training an einem Tag',
    icon: '🤖',
    earned: false,
    category: 'special'
  },
  {
    id: 'variety-master',
    name: 'Vielfalt-Meister',
    description: '10 verschiedene Workout-Typen ausprobiert',
    icon: '🌈',
    earned: false,
    category: 'special'
  },
  {
    id: 'extra-mile',
    name: 'Extra Mile',
    description: '50 zusätzliche Workouts absolviert',
    icon: '🚀',
    earned: false,
    category: 'special'
  }
];

export const calculatePoints = (session: any): number => {
  let points = 10; // Basis-Punkte pro Session
  
  // Bonus für verschiedene Trainingstypen
  switch (session.type) {
    case 'strength':
      points += 5;
      break;
    case 'cardio':
      points += Math.floor((session.distance || 0) / 2); // 1 Punkt pro 2km
      break;
    case 'swimming':
      points += Math.floor((session.distance || 0) * 10); // 10 Punkte pro km
      break;
    case 'yoga':
      points += 3;
      break;
  }
  
  // Bonus für längere Sessions
  if (session.duration > 60) {
    points += 5;
  }
  
  // Bonus für zusätzliche Workouts
  if (session.isAdditionalWorkout) {
    points += 15; // Extra Belohnung für zusätzliche Aktivität
  }
  
  // Bonus für Kalorien (falls verfügbar)
  if (session.calories) {
    points += Math.floor(session.calories / 50); // 1 Punkt pro 50 Kalorien
  }
  
  return points;
};

// Badge-Überprüfung für Multi-Workouts
export const checkMultiWorkoutBadges = (sessions: any[], badges: Badge[]): Badge[] => {
  const updatedBadges = [...badges];
  const completedSessions = sessions.filter((s: any) => s.completed);
  const additionalWorkouts = completedSessions.filter((s: any) => s.isAdditionalWorkout);
  
  // Multi-Krieger: Erstes Multi-Workout Tag
  const multiWarriorBadge = updatedBadges.find(b => b.id === 'multi-warrior');
  if (multiWarriorBadge && !multiWarriorBadge.earned) {
    const dailyGroups = new Map<string, any[]>();
    completedSessions.forEach((session: any) => {
      const dateKey = new Date(session.date).toDateString();
      if (!dailyGroups.has(dateKey)) {
        dailyGroups.set(dateKey, []);
      }
      dailyGroups.get(dateKey)!.push(session);
    });
    
    const hasMultiWorkoutDay = Array.from(dailyGroups.values()).some((dayWorkouts: any[]) => dayWorkouts.length > 1);
    if (hasMultiWorkoutDay) {
      multiWarriorBadge.earned = true;
      multiWarriorBadge.earnedDate = new Date();
    }
  }
  
  // Triple Threat: 3 verschiedene Workouts an einem Tag
  const tripleThreatBadge = updatedBadges.find(b => b.id === 'triple-threat');
  if (tripleThreatBadge && !tripleThreatBadge.earned) {
    const dailyGroups = new Map<string, any[]>();
    completedSessions.forEach((session: any) => {
      const dateKey = new Date(session.date).toDateString();
      if (!dailyGroups.has(dateKey)) {
        dailyGroups.set(dateKey, []);
      }
      dailyGroups.get(dateKey)!.push(session);
    });
    
    const hasTripleDay = Array.from(dailyGroups.values()).some((dayWorkouts: any[]) => {
      const uniqueTypes = new Set(dayWorkouts.map((w: any) => w.subtype || w.type));
      return uniqueTypes.size >= 3;
    });
    
    if (hasTripleDay) {
      tripleThreatBadge.earned = true;
      tripleThreatBadge.earnedDate = new Date();
    }
  }
  
  // Ausdauer-Maschine: Über 3 Stunden an einem Tag
  const enduranceMachineBadge = updatedBadges.find(b => b.id === 'endurance-machine');
  if (enduranceMachineBadge && !enduranceMachineBadge.earned) {
    const dailyGroups = new Map<string, any[]>();
    completedSessions.forEach((session: any) => {
      const dateKey = new Date(session.date).toDateString();
      if (!dailyGroups.has(dateKey)) {
        dailyGroups.set(dateKey, []);
      }
      dailyGroups.get(dateKey)!.push(session);
    });
    
    const hasEnduranceDay = Array.from(dailyGroups.values()).some((dayWorkouts: any[]) => {
      const totalDuration = dayWorkouts.reduce((sum: number, w: any) => sum + w.duration, 0);
      return totalDuration >= 180; // 3 Stunden
    });
    
    if (hasEnduranceDay) {
      enduranceMachineBadge.earned = true;
      enduranceMachineBadge.earnedDate = new Date();
    }
  }
  
  // Vielfalt-Meister: 10 verschiedene Workout-Typen
  const varietyMasterBadge = updatedBadges.find(b => b.id === 'variety-master');
  if (varietyMasterBadge && !varietyMasterBadge.earned) {
    const uniqueTypes = new Set(completedSessions.map((s: any) => s.subtype || s.type));
    if (uniqueTypes.size >= 10) {
      varietyMasterBadge.earned = true;
      varietyMasterBadge.earnedDate = new Date();
    }
  }
  
  // Extra Mile: 50 zusätzliche Workouts
  const extraMileBadge = updatedBadges.find(b => b.id === 'extra-mile');
  if (extraMileBadge && !extraMileBadge.earned && additionalWorkouts.length >= 50) {
    extraMileBadge.earned = true;
    extraMileBadge.earnedDate = new Date();
  }
  
  return updatedBadges;
};
