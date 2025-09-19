import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import TodayOverview from './components/TodayOverview';
import TrainingLog from './components/TrainingLog';
import Calendar from './components/Calendar';
import Progress from './components/Progress';
import Navigation from './components/Navigation';
import StravaIntegration from './components/StravaIntegration';
import StravaCallback from './components/StravaCallback';
import ResetPlan from './components/ResetPlan';
import PWAInstall from './components/PWAInstall';
import { ThemeProvider } from './contexts/ThemeContext';
import { TrainingSession, UserStats, QuickCheck } from './types';
import { getAdjustedPlan } from './data/detailedHybridPlan';
import { badgeDefinitions, calculatePoints } from './data/badges';
import storageManager from './utils/storage';

function App() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalSessions: 0,
    totalDistance: 0,
    totalDuration: 0,
    currentStreak: 0,
    longestStreak: 0,
    points: 0,
    badges: badgeDefinitions,
    personalRecords: []
  });
  const [quickCheck, setQuickCheck] = useState<QuickCheck>({
    sleep: 3,
    nutrition: 3,
    stress: 3,
    date: new Date()
  });

  // Load data from localStorage on mount
  useEffect(() => {
    console.log('🚀 App wird initialisiert...');
    
    // Sessions laden
    const savedSessions = storageManager.loadSessions();
    if (savedSessions && savedSessions.length > 0) {
      setSessions(savedSessions);
      console.log('✅ Sessions erfolgreich geladen:', savedSessions.length);
    } else {
      // Versuche Backup wiederherzustellen
      const backup = storageManager.restoreFromBackup();
      if (backup && backup.sessions.length > 0) {
        setSessions(backup.sessions);
        setUserStats(backup.userStats);
        setQuickCheck(backup.quickCheck);
        console.log('🔄 Backup wiederhergestellt mit', backup.sessions.length, 'Sessions');
      } else {
        // Neuen Plan erstellen
        console.log('📅 Erstelle neuen 8-Wochen-Plan...');
        const detailedPlan = getAdjustedPlan(new Date());
        setSessions(detailedPlan);
        storageManager.saveSessions(detailedPlan);
      }
    }

    // Stats werden aus Sessions berechnet, nicht geladen

    // QuickCheck laden
    const savedQuickCheck = storageManager.loadQuickCheck();
    if (savedQuickCheck) {
      setQuickCheck(savedQuickCheck);
    }

    // Storage-Status loggen
    const status = storageManager.getStorageStatus();
    console.log('📊 Storage-Status:', status);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (sessions.length > 0) {
      console.log('💾 Speichere Sessions:', sessions.length, 'davon completed:', sessions.filter(s => s.completed).length);
      storageManager.saveSessions(sessions);
    }
  }, [sessions]);

  useEffect(() => {
    storageManager.saveStats(userStats);
  }, [userStats]);

  useEffect(() => {
    storageManager.saveQuickCheck(quickCheck);
  }, [quickCheck]);

  // Stats aus Sessions berechnen
  const calculateStatsFromSessions = (allSessions: TrainingSession[]): UserStats => {
    const completedSessions = allSessions.filter(s => s.completed);
    
    const totalSessions = completedSessions.length;
    const totalDistance = completedSessions.reduce((sum, s) => sum + (s.distance || 0), 0);
    const totalDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    const points = completedSessions.reduce((sum, s) => sum + calculatePoints(s), 0);
    
    // Streak-Berechnung (Reset erst nach 2 verpassten Sessions)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    const sortedSessions = completedSessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].date);
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (i === 0 && daysDiff <= 2) { // Erweitert auf 2 Tage Toleranz
        currentStreak = 1;
        tempStreak = 1;
      } else if (i > 0) {
        const prevDate = new Date(sortedSessions[i - 1].date);
        const daysBetween = Math.floor((prevDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysBetween <= 2) { // Erweitert auf 2 Tage zwischen Sessions
          tempStreak++;
          if (i === 1) currentStreak = tempStreak;
        } else {
          if (longestStreak < tempStreak) longestStreak = tempStreak;
          tempStreak = 1;
          if (i === 1) currentStreak = 0; // Reset nur bei > 2 Tagen Pause
        }
      }
    }
    
    if (longestStreak < tempStreak) longestStreak = tempStreak;
    
    return {
      totalSessions,
      totalDistance,
      totalDuration,
      currentStreak,
      longestStreak,
      points,
      badges: badgeDefinitions,
      personalRecords: []
    };
  };

  // Stats neu berechnen wenn Sessions sich ändern
  useEffect(() => {
    if (sessions.length > 0) {
      const completedCount = sessions.filter(s => s.completed).length;
      const totalCount = sessions.length;
      
      console.log('🔍 Session-Debug:', {
        totalSessions: totalCount,
        completedSessions: completedCount,
        completedSessionIds: sessions.filter(s => s.completed).map(s => s.id),
        sampleSessions: sessions.slice(0, 3).map(s => ({ id: s.id, title: s.title, completed: s.completed }))
      });
      
      const newStats = calculateStatsFromSessions(sessions);
      setUserStats(newStats);
      console.log('📊 Stats neu berechnet:', {
        sessions: newStats.totalSessions,
        distance: newStats.totalDistance.toFixed(1),
        duration: newStats.totalDuration,
        points: newStats.points,
        streak: newStats.currentStreak
      });
    }
  }, [sessions]);

  const completeSession = (sessionId: string) => {
    console.log('🎯 Session wird abgeschlossen:', sessionId);
    
    // Verwende updateSession für konsistente Logik
    const sessionToComplete = sessions.find(s => s.id === sessionId);
    if (sessionToComplete && !sessionToComplete.completed) {
      const completedSession = { ...sessionToComplete, completed: true };
      updateSession(completedSession);
    }
  };

  const updateSession = (updatedSession: TrainingSession) => {
    setSessions(prev => {
      const existingSessionIndex = prev.findIndex(s => s.id === updatedSession.id);
      
      if (existingSessionIndex >= 0) {
        // Update existing session
        const newSessions = [...prev];
        newSessions[existingSessionIndex] = updatedSession;
        
        // Stats werden automatisch durch useEffect neu berechnet
        
        return newSessions;
      } else {
        // Stats werden automatisch durch useEffect neu berechnet
        
        return [...prev, updatedSession];
      }
    });
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => {
      // Stats werden automatisch durch useEffect neu berechnet
      return prev.filter(s => s.id !== sessionId);
    });
  };

  const swapSessions = (sessionId1: string, sessionId2: string) => {
    setSessions(prev => {
      const newSessions = [...prev];
      const session1Index = newSessions.findIndex(s => s.id === sessionId1);
      const session2Index = newSessions.findIndex(s => s.id === sessionId2);

      if (session1Index !== -1 && session2Index !== -1) {
        // Komplett tauschen - alle Eigenschaften inklusive day und date
        const session1 = newSessions[session1Index];
        const session2 = newSessions[session2Index];
        
        // Tausche day und date zwischen den Sessions
        const tempDay = session1.day;
        const tempDate = session1.date;
        
        newSessions[session1Index] = {
          ...session1,
          day: session2.day,
          date: session2.date
        };
        
        newSessions[session2Index] = {
          ...session2,
          day: tempDay,
          date: tempDate
        };

        console.log('🔄 Sessions getauscht:', {
          session1: `${newSessions[session1Index].title} (Tag ${newSessions[session1Index].day})`,
          session2: `${newSessions[session2Index].title} (Tag ${newSessions[session2Index].day})`
        });
        
        // Explizite Benachrichtigung über erfolgreichen Tausch
        console.log('✅ Tausch erfolgreich! Dashboard und Heute-Sessions werden automatisch aktualisiert.');
      }

      return newSessions;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateQuickCheck = (field: keyof Omit<QuickCheck, 'date'>, value: 1 | 2 | 3 | 4 | 5) => {
    setQuickCheck(prev => ({
      ...prev,
      [field]: value,
      date: new Date()
    }));
  };

  const importStravaActivities = (newSessions: TrainingSession[]) => {
    setSessions(prev => {
      // Duplikate vermeiden (basierend auf ID)
      const existingIds = new Set(prev.map(s => s.id));
      const uniqueNewSessions = newSessions.filter(s => !existingIds.has(s.id));
      
      if (uniqueNewSessions.length === 0) {
        return prev;
      }

      // Neue Sessions hinzufügen - Stats werden automatisch durch useEffect neu berechnet
      return [...prev, ...uniqueNewSessions];
    });
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
          <Navigation sessions={sessions} />
          <main className="flex-1 container mx-auto px-4 py-6 pb-8">
            <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  sessions={sessions}
                  userStats={userStats}
                  onCompleteSession={completeSession}
                  onUpdateSession={updateSession}
                />
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <Calendar 
                  sessions={sessions}
                  onCompleteSession={completeSession}
                  onUpdateSession={updateSession}
                  onSwapSessions={swapSessions}
                />
              } 
            />
            <Route 
              path="/progress" 
              element={
                <Progress 
                  sessions={sessions}
                  userStats={userStats}
                />
              } 
            />
            <Route 
              path="/strava" 
              element={
                <StravaIntegration 
                  onImportActivities={importStravaActivities}
                />
              } 
            />
            <Route 
              path="/today" 
              element={
                <TodayOverview 
                  sessions={sessions}
                  onCompleteSession={completeSession}
                  onUpdateSession={updateSession}
                />
              } 
            />
            <Route 
              path="/log" 
              element={
                <TrainingLog 
                  sessions={sessions}
                  onUpdateSession={updateSession}
                  onDeleteSession={deleteSession}
                />
              } 
            />
            <Route 
              path="/auth/strava/callback" 
              element={<StravaCallback />} 
            />
          </Routes>
          </main>
          
          {/* PWA Install Prompt */}
          <PWAInstall />
          
          {/* Reset Plan Button */}
          <ResetPlan />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
