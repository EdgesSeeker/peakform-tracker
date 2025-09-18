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
  
  return points;
};
