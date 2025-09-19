import React from 'react';
import { TrainingSession, PersonalRecord } from '../types';
import { Trophy, TrendingUp, Dumbbell, Timer } from 'lucide-react';

interface PersonalRecordsProps {
  sessions: TrainingSession[];
  personalRecords: PersonalRecord[];
}

const PersonalRecords: React.FC<PersonalRecordsProps> = ({ sessions, personalRecords }) => {
  // Calculate current PRs from sessions
  const calculatePRs = () => {
    const prs: { [key: string]: PersonalRecord } = {};

    sessions.filter(s => s.completed && s.exercises).forEach(session => {
      session.exercises?.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.weight && set.weight > 0) {
            const key = exercise.name;
            if (!prs[key] || set.weight > prs[key].value) {
              prs[key] = {
                exercise: exercise.name,
                value: set.weight,
                unit: 'kg',
                date: session.date
              };
            }
          }
        });
      });
    });

    // Add distance PRs
    const runningPRs = sessions.filter(s => s.completed && s.type === 'cardio' && s.subtype === 'running');
    if (runningPRs.length > 0) {
      const longestRun = runningPRs.reduce((max, s) => (s.distance || 0) > (max.distance || 0) ? s : max);
      if (longestRun.distance && longestRun.distance > 0) {
        prs['Längster Lauf'] = {
          exercise: 'Längster Lauf',
          value: longestRun.distance,
          unit: 'km',
          date: longestRun.date
        };
      }
    }

    const cyclingPRs = sessions.filter(s => s.completed && (s.type === 'cardio' && (s.subtype === 'cycling' || s.subtype === 'intervals')));
    if (cyclingPRs.length > 0) {
      const longestRide = cyclingPRs.reduce((max, s) => (s.distance || 0) > (max.distance || 0) ? s : max);
      if (longestRide.distance && longestRide.distance > 0) {
        prs['Längste Radtour'] = {
          exercise: 'Längste Radtour',
          value: longestRide.distance,
          unit: 'km',
          date: longestRide.date
        };
      }
    }

    const swimmingPRs = sessions.filter(s => s.completed && s.type === 'swimming');
    if (swimmingPRs.length > 0) {
      const longestSwim = swimmingPRs.reduce((max, s) => (s.distance || 0) > (max.distance || 0) ? s : max);
      if (longestSwim.distance && longestSwim.distance > 0) {
        prs['Längste Schwimmeinheit'] = {
          exercise: 'Längste Schwimmeinheit',
          value: longestSwim.distance, // Keep in km for consistency
          unit: 'km',
          date: longestSwim.date
        };
      }
    }

    return Object.values(prs);
  };

  const currentPRs = calculatePRs();

  // Group PRs by category
  const strengthPRs = currentPRs.filter(pr => pr.unit === 'kg');
  const distancePRs = currentPRs.filter(pr => pr.unit === 'km' || pr.unit === 'm');
  const timePRs = currentPRs.filter(pr => pr.unit === 'min');

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'strength':
        return Dumbbell;
      case 'distance':
        return TrendingUp;
      case 'time':
        return Timer;
      default:
        return Trophy;
    }
  };

  const renderPRSection = (title: string, prs: PersonalRecord[], category: string, color: string) => {
    const Icon = getIcon(category);
    
    if (prs.length === 0) {
      return (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Icon className={`w-5 h-5 ${color}`} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          </div>
          <div className="text-center py-8 text-gray-500 dark:text-gray-500">
            <Trophy size={48} className="mx-auto mb-2 text-gray-300" />
            <p>Noch keine Rekorde in dieser Kategorie</p>
            <p className="text-sm">Starte dein Training, um deine ersten PRs zu setzen!</p>
          </div>
        </div>
      );
    }

    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Icon className={`w-5 h-5 ${color}`} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <div className="space-y-3">
          {prs.map((pr, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{pr.exercise}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(pr.date)}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {pr.value} {pr.unit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Persönliche Bestleistungen
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Deine besten Leistungen in allen Bereichen
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {currentPRs.length}
          </div>
          <div className="text-sm text-yellow-700">Persönliche Rekorde</div>
        </div>
        <div className="card text-center bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {strengthPRs.length}
          </div>
          <div className="text-sm text-red-700">Kraft-Rekorde</div>
        </div>
        <div className="card text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {distancePRs.length}
          </div>
          <div className="text-sm text-blue-700">Distanz-Rekorde</div>
        </div>
      </div>

      {/* PR Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderPRSection('💪 Kraft-Rekorde', strengthPRs, 'strength', 'text-red-600')}
        {renderPRSection('🏃‍♂️ Distanz-Rekorde', distancePRs, 'distance', 'text-blue-600')}
      </div>

      {/* Motivation Section */}
      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🎯 Nächste Ziele
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="font-medium text-gray-900 dark:text-gray-100">Kniebeuge</div>
              <div className="text-gray-600 dark:text-gray-400">Ziel: 100kg</div>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="font-medium text-gray-900 dark:text-gray-100">Kreuzheben</div>
              <div className="text-gray-600 dark:text-gray-400">Ziel: 120kg</div>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="font-medium text-gray-900 dark:text-gray-100">Laufen</div>
              <div className="text-gray-600 dark:text-gray-400">Ziel: 21km</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalRecords;
