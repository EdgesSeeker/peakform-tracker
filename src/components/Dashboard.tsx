import React, { useState, useEffect } from 'react';
import { TrainingSession, UserStats } from '../types';
import WeekOverview from './WeekOverview';
import StatsCards from './StatsCards';
import TrainingOverview from './TrainingOverview';
import AddTraining from './AddTraining';
import BadgeShowcase from './BadgeShowcase';
import SyncManager from './SyncManager';
import DuplicateWorkoutCleaner from './DuplicateWorkoutCleaner';
import QuickWeekPlanner from './QuickWeekPlanner';
import WeightProgress from './WeightProgress';

interface DashboardProps {
  sessions: TrainingSession[];
  userStats: UserStats;
  onCompleteSession: (sessionId: string) => void;
  onUpdateSession: (updatedSession: TrainingSession) => void;
  onAddMultipleWorkouts?: (workouts: TrainingSession[]) => void;
  onUncompleteSession?: (sessionId: string) => void;
  onDeleteSession?: (sessionId: string) => void;
  onUpdateWeek2?: () => boolean; // Neue Funktion für Woche 2 Update
}

const Dashboard: React.FC<DashboardProps> = ({
  sessions,
  userStats,
  onCompleteSession,
  onUpdateSession,
  onAddMultipleWorkouts,
  onUncompleteSession,
  onDeleteSession,
  onUpdateWeek2
}) => {
  // Wochen-Navigation State
  const [selectedWeek, setSelectedWeek] = useState<number>(() => {
    // Lade gespeicherte Woche oder verwende aktuelle Woche (Woche 2)
    const saved = localStorage.getItem('dashboard-selected-week');
    return saved ? parseInt(saved) : 2; // Starte standardmäßig mit Woche 2
  });

  // Speichere ausgewählte Woche
  useEffect(() => {
    localStorage.setItem('dashboard-selected-week', selectedWeek.toString());
  }, [selectedWeek]);

  const currentWeekSessions = sessions.filter(s => s.week === selectedWeek);
  
  // Handler für Woche 2 Update
  const handleUpdateWeek2 = () => {
    if (onUpdateWeek2) {
      const success = onUpdateWeek2();
      if (success) {
        // Erfolgsmeldung oder UI-Update
        console.log('✅ Woche 2 erfolgreich aktualisiert');
      }
    }
  };
  
  // Wochen-Fokus definieren
  const getWeekFocus = (week: number): string => {
    const focuses = [
      'Grundlagenaufbau', // Woche 1
      'Technikverbesserung', // Woche 2
      'Kraftentwicklung', // Woche 3
      'Ausdaueraufbau', // Woche 4
      'Intensitätssteigerung', // Woche 5
      'Leistungsoptimierung', // Woche 6
      'Wettkampfvorbereitung', // Woche 7
      'Peaking & Recovery' // Woche 8
    ];
    return focuses[week - 1] || 'Allgemeine Fitness';
  };

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
  
  // Debug: Show all sessions with their days
  console.log('🔍 Alle Sessions mit Tagen:');
  sessions.forEach(s => {
    console.log(`- ${s.title}: Tag ${s.day} (Woche ${s.week}) - ${s.completed ? 'Erledigt' : 'Offen'}`);
  });

  return (
    <div className="space-y-4 md:space-y-8 px-4 md:px-0 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Willkommen zurück! 👋
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Bereit für dein nächstes Training? Lass uns deine Ziele erreichen!
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards userStats={userStats} />

      {/* Duplicate Workout Cleaner */}
      <DuplicateWorkoutCleaner 
        sessions={sessions}
        onUpdateSession={onUpdateSession}
        onDeleteSession={onDeleteSession || (() => {})}
      />

      {/* Week Navigation */}
      <div className="card mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Wochenansicht
          </h3>
          
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden md:inline">Woche:</span>
            <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => {
                const weekSessions = sessions.filter(s => s.week === week && !s.isAdditionalWorkout);
                const completedCount = weekSessions.filter(s => s.completed).length;
                const totalCount = weekSessions.length;
                const isActive = selectedWeek === week;
                const hasContent = totalCount > 0;
                
                return (
                  <button
                    key={week}
                    onClick={() => setSelectedWeek(week)}
                    disabled={!hasContent}
                    className={`px-2 md:px-3 py-2 rounded-lg text-sm font-medium transition-all min-w-[44px] ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-md'
                        : hasContent
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{week}</span>
                      {hasContent && (
                        <span className="text-xs opacity-75">
                          {completedCount}/{totalCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Woche 2 Update Button */}
            {selectedWeek === 2 && (
              <button
                onClick={handleUpdateWeek2}
                className="ml-3 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                title="Woche 2 mit neuem Triathlon-Plan aktualisieren"
              >
                🔄 Triathlon-Plan laden
              </button>
            )}
            
            <div className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              {currentWeekSessions.filter(s => s.completed).length}/{currentWeekSessions.length} Sessions
            </div>
          </div>
        </div>
        
        {/* Week Info */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Woche {selectedWeek}: {getWeekFocus(selectedWeek)}
              </span>
              
              {/* Kombinierte Wochendatum und Dauer-Anzeige */}
              {currentWeekSessions.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(() => {
                    // Finde erste und letzte Session der Woche für Datumsbereich
                    const sortedSessions = [...currentWeekSessions].sort((a, b) => a.day - b.day);
                    const firstSession = sortedSessions[0];
                    const lastSession = sortedSessions[sortedSessions.length - 1];
                    
                    const totalDuration = currentWeekSessions.reduce((sum, s) => sum + s.duration, 0);
                    const hours = Math.floor(totalDuration / 60);
                    const minutes = totalDuration % 60;
                    
                    if (firstSession && lastSession) {
                      const startDate = new Date(firstSession.date);
                      const endDate = new Date(lastSession.date);
                      
                      const dateRange = `${startDate.toLocaleDateString('de-DE', { 
                        day: '2-digit', 
                        month: '2-digit' 
                      })} - ${endDate.toLocaleDateString('de-DE', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })}`;
                      
                      return `${dateRange} • ${currentWeekSessions.length} Sessions • ${hours}h ${minutes}min`;
                    }
                    return `${currentWeekSessions.length} Sessions • ${hours}h ${minutes}min`;
                  })()}
                </div>
              )}
            </div>
            
            {selectedWeek > 1 && currentWeekSessions.filter(s => !s.isAdditionalWorkout).length === 0 && (
              <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                ⚠️ Noch keine Sessions geplant
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Week Overview or Week Planner */}
      {currentWeekSessions.filter(s => !s.isAdditionalWorkout).length > 0 ? (
        <WeekOverview 
          sessions={currentWeekSessions}
          weekNumber={selectedWeek}
          onCompleteSession={onCompleteSession}
          onUpdateSession={onUpdateSession}
          onUncompleteSession={onUncompleteSession}
          onDeleteSession={onDeleteSession}
          onAddWorkout={(workout) => onAddMultipleWorkouts ? onAddMultipleWorkouts([workout]) : null}
        />
      ) : (
        <QuickWeekPlanner 
          week={selectedWeek}
          onAddWorkouts={onAddMultipleWorkouts || (() => {})}
        />
      )}

      {/* Training Overview - only if there are upcoming sessions */}
      {upcomingSessions.length > 0 && (
        <TrainingOverview 
          sessions={sessions}
          onCompleteSession={onCompleteSession}
          onUpdateSession={onUpdateSession}
        />
      )}

      {/* Mobile-optimierte Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Gewichts-Fortschritt - Mobile: Vollbreite, Desktop: Erste Spalte */}
        <div className="md:col-span-1">
          <WeightProgress />
        </div>

        {/* Add Training - Mobile: Vollbreite, Desktop: Zweite Spalte */}
        <div className="md:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {upcomingSessions.length > 0 ? 'Zusätzliche Trainings' : 'Training hinzufügen'}
          </h3>
          <AddTraining 
            onAddTraining={onUpdateSession}
            onAddMultipleWorkouts={onAddMultipleWorkouts}
          />
        </div>

        {/* Badge Showcase - Mobile: Vollbreite, Desktop: Dritte Spalte */}
        <div className="md:col-span-2 lg:col-span-1">
          <BadgeShowcase badges={userStats.badges} />
        </div>
      </div>

      {/* Sync Manager */}
      <SyncManager />
    </div>
  );
};

export default Dashboard;