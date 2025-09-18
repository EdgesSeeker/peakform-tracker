import React from 'react';
import { TrainingSession, UserStats } from '../types';
import WeekOverview from './WeekOverview';
import StatsCards from './StatsCards';
import TrainingOverview from './TrainingOverview';
import AddTraining from './AddTraining';
import BadgeShowcase from './BadgeShowcase';
import SyncManager from './SyncManager';

interface DashboardProps {
  sessions: TrainingSession[];
  userStats: UserStats;
  onCompleteSession: (sessionId: string) => void;
  onUpdateSession: (updatedSession: TrainingSession) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  sessions,
  userStats,
  onCompleteSession,
  onUpdateSession
}) => {
  // Get current week (simplified - start with week 1)
  const currentWeek = 1;
  const currentWeekSessions = sessions.filter(s => s.week === currentWeek);
  
  // Get upcoming sessions (next 5 incomplete sessions)
  const today = new Date();
  const todayWeekday = today.getDay() || 7; // 1=Mo, 7=So
  
  const upcomingSessions = sessions
    .filter(s => {
      if (s.completed) return false;
      
      // Zeige Sessions ab heute (Wochentag-basiert)
      const isCurrentWeek = s.week === 1;
      const isTodayOrLater = s.day >= todayWeekday;
      const isNextWeek = s.week === 2;
      
      return (isCurrentWeek && isTodayOrLater) || isNextWeek;
    })
    .sort((a, b) => {
      if (a.week !== b.week) return a.week - b.week;
      return a.day - b.day;
    })
    .slice(0, 5);
  
  // Debug: Log sessions to see what we have
  console.log('Dashboard Debug:');
  console.log('Total sessions:', sessions.length);
  console.log('Current week sessions:', currentWeekSessions.length);
  console.log('Upcoming sessions:', upcomingSessions.length);
  console.log('Today weekday:', todayWeekday);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Willkommen zurück! 👋
        </h1>
        <p className="text-gray-600">
          Bereit für dein nächstes Training? Lass uns deine Ziele erreichen!
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards userStats={userStats} />

      {/* Current Week Overview */}
      <WeekOverview 
        sessions={currentWeekSessions}
        weekNumber={currentWeek}
        onCompleteSession={onCompleteSession}
        onUpdateSession={onUpdateSession}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Training Overview or Add Training */}
        {upcomingSessions.length > 0 ? (
          <TrainingOverview 
            sessions={sessions}
            onCompleteSession={onCompleteSession}
            onUpdateSession={onUpdateSession}
          />
        ) : (
          <AddTraining 
            onAddTraining={onUpdateSession}
          />
        )}

        {/* Badge Showcase */}
        <BadgeShowcase badges={userStats.badges} />
      </div>

      {/* Sync Manager */}
      <SyncManager />
    </div>
  );
};

export default Dashboard;