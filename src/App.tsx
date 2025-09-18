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

    // Stats laden
    const savedStats = storageManager.loadStats();
    if (savedStats) {
      setUserStats(savedStats);
    }

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
      storageManager.saveSessions(sessions);
    }
  }, [sessions]);

  useEffect(() => {
    storageManager.saveStats(userStats);
  }, [userStats]);

  useEffect(() => {
    storageManager.saveQuickCheck(quickCheck);
  }, [quickCheck]);

  const completeSession = (sessionId: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId && !session.completed) {
        const points = calculatePoints(session);
        
        // Update user stats
        setUserStats(prevStats => ({
          ...prevStats,
          totalSessions: prevStats.totalSessions + 1,
          totalDistance: prevStats.totalDistance + (session.distance || 0),
          totalDuration: prevStats.totalDuration + session.duration,
          points: prevStats.points + points
        }));

        return { ...session, completed: true };
      }
      return session;
    }));
  };

  const updateSession = (updatedSession: TrainingSession) => {
    setSessions(prev => {
      const existingSessionIndex = prev.findIndex(s => s.id === updatedSession.id);
      
      if (existingSessionIndex >= 0) {
        // Update existing session
        const existingSession = prev[existingSessionIndex];
        const newSessions = [...prev];
        newSessions[existingSessionIndex] = updatedSession;
        
        // Handle stats changes
        if (!existingSession.completed && updatedSession.completed) {
          // Session wurde abgeschlossen - Stats erhöhen
          const points = calculatePoints(updatedSession);
          
          setUserStats(prevStats => ({
            ...prevStats,
            totalSessions: prevStats.totalSessions + 1,
            totalDistance: prevStats.totalDistance + (updatedSession.distance || 0),
            totalDuration: prevStats.totalDuration + updatedSession.duration,
            points: prevStats.points + points
          }));
        } else if (existingSession.completed && !updatedSession.completed) {
          // Session wurde "entabgehakt" - Stats reduzieren
          const points = calculatePoints(existingSession);
          
          setUserStats(prevStats => ({
            ...prevStats,
            totalSessions: Math.max(0, prevStats.totalSessions - 1),
            totalDistance: Math.max(0, prevStats.totalDistance - (existingSession.distance || 0)),
            totalDuration: Math.max(0, prevStats.totalDuration - existingSession.duration),
            points: Math.max(0, prevStats.points - points)
          }));
        }
        
        return newSessions;
      } else {
        // Add new session
        if (updatedSession.completed) {
          const points = calculatePoints(updatedSession);
          
          setUserStats(prevStats => ({
            ...prevStats,
            totalSessions: prevStats.totalSessions + 1,
            totalDistance: prevStats.totalDistance + (updatedSession.distance || 0),
            totalDuration: prevStats.totalDuration + updatedSession.duration,
            points: prevStats.points + points
          }));
        }
        
        return [...prev, updatedSession];
      }
    });
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => {
      const sessionToDelete = prev.find(s => s.id === sessionId);
      if (sessionToDelete && sessionToDelete.completed) {
        // Update stats when deleting completed session
        const points = calculatePoints(sessionToDelete);
        setUserStats(prevStats => ({
          ...prevStats,
          totalSessions: Math.max(0, prevStats.totalSessions - 1),
          totalDistance: Math.max(0, prevStats.totalDistance - (sessionToDelete.distance || 0)),
          totalDuration: Math.max(0, prevStats.totalDuration - sessionToDelete.duration),
          points: Math.max(0, prevStats.points - points)
        }));
      }
      return prev.filter(s => s.id !== sessionId);
    });
  };

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

      // Neue Sessions hinzufügen
      const updatedSessions = [...prev, ...uniqueNewSessions];
      
      // Stats aktualisieren
      const totalDistance = uniqueNewSessions.reduce((sum, s) => sum + (s.distance || 0), 0);
      const totalDuration = uniqueNewSessions.reduce((sum, s) => sum + s.duration, 0);
      const totalPoints = uniqueNewSessions.reduce((sum, s) => sum + calculatePoints(s), 0);
      
      setUserStats(prevStats => ({
        ...prevStats,
        totalSessions: prevStats.totalSessions + uniqueNewSessions.length,
        totalDistance: prevStats.totalDistance + totalDistance,
        totalDuration: prevStats.totalDuration + totalDuration,
        points: prevStats.points + totalPoints
      }));

      return updatedSessions;
    });
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
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
  );
}

export default App;
