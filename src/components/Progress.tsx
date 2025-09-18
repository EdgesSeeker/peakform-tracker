import React, { useState } from 'react';
import { TrainingSession, UserStats } from '../types';
import { TrendingUp, Award, Target, Calendar } from 'lucide-react';
import ProgressCharts from './ProgressCharts';
import PersonalRecords from './PersonalRecords';
import BadgeGallery from './BadgeGallery';

interface ProgressProps {
  sessions: TrainingSession[];
  userStats: UserStats;
}

const Progress: React.FC<ProgressProps> = ({ sessions, userStats }) => {
  const [activeTab, setActiveTab] = useState<'charts' | 'records' | 'badges'>('charts');

  // Calculate weekly progress
  const weeklyProgress = Array.from({ length: 8 }, (_, i) => {
    const week = i + 1;
    const weekSessions = sessions.filter(s => s.week === week);
    const completedSessions = weekSessions.filter(s => s.completed);
    const strengthSessions = weekSessions.filter(s => s.type === 'strength');
    const cardioSessions = weekSessions.filter(s => ['cardio', 'swimming'].includes(s.type));
    
    return {
      week,
      completedSessions: completedSessions.length,
      totalSessions: weekSessions.length,
      strengthPercentage: weekSessions.length > 0 ? (strengthSessions.length / weekSessions.length) * 100 : 0,
      cardioPercentage: weekSessions.length > 0 ? (cardioSessions.length / weekSessions.length) * 100 : 0,
      totalDistance: weekSessions.reduce((sum, s) => sum + (s.distance || 0), 0),
      totalDuration: weekSessions.reduce((sum, s) => sum + s.duration, 0)
    };
  });

  // Calculate cumulative stats
  const cumulativeStats = sessions.reduce((acc, session, index) => {
    if (session.completed) {
      const prev = acc[acc.length - 1] || { distance: 0, duration: 0, sessions: 0 };
      acc.push({
        week: session.week,
        distance: prev.distance + (session.distance || 0),
        duration: prev.duration + session.duration,
        sessions: prev.sessions + 1,
        date: session.date
      });
    }
    return acc;
  }, [] as any[]);

  const tabs = [
    { key: 'charts' as const, label: 'Diagramme', icon: TrendingUp },
    { key: 'records' as const, label: 'Rekorde', icon: Target },
    { key: 'badges' as const, label: 'Badges', icon: Award }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dein Fortschritt 📊
        </h1>
        <p className="text-gray-600">
          Verfolge deine Entwicklung und erreichte Meilensteine
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {userStats.totalSessions}
          </div>
          <div className="text-sm text-gray-600">Absolvierte Sessions</div>
          <div className="text-xs text-gray-500 mt-1">
            von {sessions.length} geplant
          </div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-success-600 mb-2">
            {userStats.totalDistance.toFixed(1)}km
          </div>
          <div className="text-sm text-gray-600">Gesamt-Distanz</div>
          <div className="text-xs text-gray-500 mt-1">
            🏃‍♂️ Lauf + 🚴‍♂️ Rad + 🏊‍♂️ Schwimmen
          </div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {Math.floor(userStats.totalDuration / 60)}h
          </div>
          <div className="text-sm text-gray-600">Trainingszeit</div>
          <div className="text-xs text-gray-500 mt-1">
            {userStats.totalDuration % 60}min zusätzlich
          </div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {userStats.points}
          </div>
          <div className="text-sm text-gray-600">Punkte</div>
          <div className="text-xs text-gray-500 mt-1">
            🏆 {userStats.badges.filter(b => b.earned).length} Badges
          </div>
        </div>
      </div>

      {/* Weekly Progress Overview */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Wöchentlicher Fortschritt
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {weeklyProgress.map(week => (
            <div key={week.week} className="text-center">
              <div className="mb-2">
                <div className="text-lg font-bold text-gray-900">W{week.week}</div>
                <div className="text-xs text-gray-500">
                  {week.completedSessions}/{week.totalSessions}
                </div>
              </div>
              <div className="progress-bar mb-2">
                <div 
                  className="progress-fill bg-primary-500"
                  style={{ 
                    width: `${week.totalSessions > 0 ? (week.completedSessions / week.totalSessions) * 100 : 0}%` 
                  }}
                />
              </div>
              <div className="text-xs text-gray-600">
                {week.totalDistance.toFixed(1)}km
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'charts' && (
          <ProgressCharts 
            sessions={sessions}
            weeklyProgress={weeklyProgress}
            cumulativeStats={cumulativeStats}
          />
        )}
        {activeTab === 'records' && (
          <PersonalRecords 
            sessions={sessions}
            personalRecords={userStats.personalRecords}
          />
        )}
        {activeTab === 'badges' && (
          <BadgeGallery badges={userStats.badges} />
        )}
      </div>
    </div>
  );
};

export default Progress;
