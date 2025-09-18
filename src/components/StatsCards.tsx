import React from 'react';
import { UserStats } from '../types';
import { Trophy, Target, Clock, Flame } from 'lucide-react';

interface StatsCardsProps {
  userStats: UserStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ userStats }) => {
  const stats = [
    {
      icon: Target,
      label: 'Absolvierte Sessions',
      value: userStats.totalSessions,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      icon: Trophy,
      label: 'Gesamt-Distanz',
      value: `${userStats.totalDistance.toFixed(1)} km`,
      color: 'text-success-600',
      bgColor: 'bg-success-50'
    },
    {
      icon: Clock,
      label: 'Trainingszeit',
      value: `${Math.floor(userStats.totalDuration / 60)}h ${userStats.totalDuration % 60}m`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Flame,
      label: 'Aktuelle Serie',
      value: `${userStats.currentStreak} Tage`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="card card-hover">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
