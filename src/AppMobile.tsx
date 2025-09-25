import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import NavigationMobile from './components/NavigationMobile';
import PWAInstall from './components/PWAInstall';
import Nutrition from './components/Nutrition';
import QuickWorkout from './components/QuickWorkout';
import { ThemeProvider } from './contexts/ThemeContext';
import { TrainingSession, UserStats, QuickCheck, WeightGoal, ProteinEntry, NutritionGoal } from './types';
import { getAdjustedPlan, detailedHybridPlan } from './data/detailedHybridPlan';
import { badgeDefinitions, calculatePoints, checkMultiWorkoutBadges } from './data/badges';
import storageManager from './utils/storage';
import firebaseSync from './services/firebaseSync';

function AppMobile() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalSessions: 0,
    totalDistance: 0,
    totalDuration: 0,
    currentStreak: 0,
    longestStreak: 0,
    points: 0,
    badges: badgeDefinitions,
    personalRecords: [],
    weightEntries: [],
    weightGoal: {
      targetWeight: 70,
      startWeight: 75,
      startDate: new Date()
    },
    proteinEntries: [],
    nutritionGoal: {
      dailyProtein: 140
    }
  });
  const [quickCheck, setQuickCheck] = useState<QuickCheck>({
    sleep: 3,
    nutrition: 3,
    stress: 3,
    date: new Date()
  });

  // Load data from localStorage on mount
  useEffect(() => {
    console.log('🚀 Mobile App wird initialisiert...');
    
    // NOTFALL-BEREINIGUNG: Lösche falsch geparste Sessions
    const savedSessions = storageManager.loadSessions();
    console.log('💾 Geladene Sessions:', savedSessions?.length || 0);
    
    if (savedSessions && savedSessions.length > 0) {
      // Prüfe auf falsch geparste Sessions (zu viele Sessions in Woche 2)
      const week2Sessions = savedSessions.filter(s => s.week === 2);
      const hasFalselyParsedSessions = week2Sessions.length > 25 || 
        week2Sessions.some(s => s.title === 'Einrollen' || s.title === 'Ausrollen' || s.title === '300 m Einschwimmen');
      
      if (hasFalselyParsedSessions) {
        console.log('🚨 NOTFALL-BEREINIGUNG: Falsch geparste Sessions entdeckt!');
        // Behalte Woche 1, zusätzliche Workouts UND hochgeladene Pläne (nicht falsch geparste)
        const cleanSessions = savedSessions.filter(s => 
          s.week === 1 || 
          s.isAdditionalWorkout || 
          s.id.includes('strava') ||
          s.id.includes('plan-w') // Hochgeladene Pläne behalten
        );
        console.log(`🔧 Bereinigt: ${savedSessions.length} → ${cleanSessions.length} Sessions`);
        setSessions(cleanSessions);
        storageManager.saveSessions(cleanSessions);
      } else {
        setSessions(savedSessions);
        console.log('✅ Sessions geladen:', savedSessions.length);
      }
    } else {
      // Versuche Backup wiederherzustellen
      const backup = storageManager.restoreFromBackup();
      if (backup && backup.sessions.length > 0) {
        setSessions(backup.sessions);
        setUserStats(backup.userStats);
        setQuickCheck(backup.quickCheck);
        console.log('🔄 Backup wiederhergestellt mit', backup.sessions.length, 'Sessions');
      } else {
        // Nur laden wenn wirklich keine Sessions vorhanden sind (erste Installation)
        console.log('📅 Keine gespeicherten Sessions gefunden - lade Standard-Plan...');
        const detailedPlan = getAdjustedPlan(new Date());
        const onlyWeek1Sessions = detailedPlan.filter(s => s.week === 1);
        console.log(`🔒 Nur Woche 1 geladen: ${onlyWeek1Sessions.length} Sessions`);
        setSessions(onlyWeek1Sessions);
        storageManager.saveSessions(onlyWeek1Sessions);
      }
    }

    // Lade Gewichts-Daten
    const savedWeightEntries = storageManager.loadWeightEntries();
    const savedWeightGoal = storageManager.loadWeightGoal();
    
    if (savedWeightEntries.length > 0) {
      setUserStats(prev => ({
        ...prev,
        weightEntries: savedWeightEntries
      }));
    }
    
    if (savedWeightGoal) {
      setUserStats(prev => ({
        ...prev,
        weightGoal: savedWeightGoal
      }));
    }

    // Lade Ernährung-Daten
    const savedProteinEntries = storageManager.loadProteinEntries();
    const savedNutritionGoal = storageManager.loadNutritionGoal();
    
    if (savedProteinEntries.length > 0) {
      setUserStats(prev => ({
        ...prev,
        proteinEntries: savedProteinEntries
      }));
    }
    
    if (savedNutritionGoal) {
      setUserStats(prev => ({
        ...prev,
        nutritionGoal: savedNutritionGoal
      }));
    }

    // QuickCheck laden
    const savedQuickCheck = storageManager.loadQuickCheck();
    if (savedQuickCheck) {
      setQuickCheck(savedQuickCheck);
    }

    // Storage-Status loggen
    const status = storageManager.getStorageStatus();
    console.log('📊 Storage-Status:', status);

    // Firebase Auto-Sync starten
    firebaseSync.startAutoSync(
      () => sessions,
      () => userStats,
      () => quickCheck,
      handleDataUpdated
    );

    // Cleanup beim Unmount
    return () => {
      firebaseSync.stopAutoSync();
    };
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
    // Behalte bestehende Gewichts-Daten
    const currentWeightEntries = userStats.weightEntries;
    const currentWeightGoal = userStats.weightGoal;
    const completedSessions = allSessions.filter(s => s.completed && !s.excludeFromStats);
    
    const totalSessions = completedSessions.length;
    const totalDistance = completedSessions.reduce((sum, s) => sum + (s.distance || 0), 0);
    const totalDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    const points = completedSessions.reduce((sum, s) => sum + calculatePoints(s), 0);
    
    // Verbesserte Streak-Berechnung basierend auf Tagen (nicht Sessions)
    let currentStreak = 0;
    let longestStreak = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalisiere auf Tagesbeginn
    
    // Gruppiere Sessions nach Tagen
    const sessionsByDay = new Map<string, TrainingSession[]>();
    completedSessions.forEach(session => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      const dateKey = sessionDate.toDateString();
      
      if (!sessionsByDay.has(dateKey)) {
        sessionsByDay.set(dateKey, []);
      }
      sessionsByDay.get(dateKey)!.push(session);
    });
    
    // Sortiere Tage (neueste zuerst)
    const sortedDays = Array.from(sessionsByDay.keys())
      .map(dateKey => new Date(dateKey))
      .sort((a, b) => b.getTime() - a.getTime());
    
    console.log('🔥 Streak-Debug:');
    console.log('Heute:', today.toDateString());
    console.log('Trainingstage:', sortedDays.map(d => d.toDateString()));
    
    // Berechne aktuelle Serie
    let streakDays = [];
    for (let i = 0; i < sortedDays.length; i++) {
      const dayDate = sortedDays[i];
      const daysDiff = Math.floor((today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (i === 0) {
        // Erster Tag: Muss heute oder gestern sein
        if (daysDiff <= 1) {
          currentStreak = 1;
          streakDays.push(dayDate);
        } else {
          break; // Zu lange her, keine aktuelle Serie
        }
      } else {
        // Folgetage: Müssen aufeinanderfolgend sein
        const prevDay = sortedDays[i - 1];
        const daysBetween = Math.floor((prevDay.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysBetween === 1) {
          currentStreak++;
          streakDays.push(dayDate);
        } else {
          break; // Lücke in der Serie
        }
      }
    }
    
    // Berechne längste Serie
    let tempStreak = 0;
    let maxTempStreak = 0;
    
    for (let i = 0; i < sortedDays.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const currentDay = sortedDays[i];
        const prevDay = sortedDays[i - 1];
        const daysBetween = Math.floor((prevDay.getTime() - currentDay.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysBetween === 1) {
          tempStreak++;
        } else {
          maxTempStreak = Math.max(maxTempStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(maxTempStreak, tempStreak, currentStreak);
    
    console.log(`🔥 Aktuelle Serie: ${currentStreak} Tage`);
    console.log(`🏆 Längste Serie: ${longestStreak} Tage`);
    
    // Badge-Überprüfung mit Multi-Workout Support
    const updatedBadges = checkMultiWorkoutBadges(allSessions, badgeDefinitions);

    return {
      totalSessions,
      totalDistance,
      totalDuration,
      currentStreak,
      longestStreak,
      points,
      badges: updatedBadges,
      personalRecords: [],
      weightEntries: currentWeightEntries,
      weightGoal: currentWeightGoal,
      proteinEntries: userStats.proteinEntries,
      nutritionGoal: userStats.nutritionGoal
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

  const addMultipleWorkouts = (workouts: TrainingSession[]) => {
    setSessions(prev => {
      const newSessions = [...prev];
      workouts.forEach(workout => {
        const existingIndex = newSessions.findIndex(s => s.id === workout.id);
        if (existingIndex >= 0) {
          newSessions[existingIndex] = workout;
        } else {
          newSessions.push(workout);
        }
      });
      console.log(`➕ ${workouts.length} Multi-Workouts hinzugefügt`);
      return newSessions;
    });
  };

  const uncompleteSession = (sessionId: string) => {
    console.log('↩️ Session wird enthakt:', sessionId);
    
    const sessionToUncomplete = sessions.find(s => s.id === sessionId);
    if (sessionToUncomplete && sessionToUncomplete.completed) {
      const uncompletedSession = { ...sessionToUncomplete, completed: false };
      updateSession(uncompletedSession);
    }
  };

  // Intelligente Wochen-Zuordnung für Trainingsplan
  const getTrainingWeek = (date: Date): number => {
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    // Workouts der letzten 7 Tage = Woche 1
    if (daysDiff <= 7) {
      return 1; // Aktuelle Woche
    } else if (daysDiff <= 14) {
      return 2; // Letzte Woche 
    } else if (daysDiff <= 21) {
      return 3; // Vorletzte Woche
    } else if (daysDiff <= 28) {
      return 4; // 3 Wochen zurück
    } else {
      return Math.min(8, Math.ceil(daysDiff / 7)); // Max 8 Wochen
    }
  };

  // Korrigiere nur offensichtlich falsche Wochen (wie Woche 38)
  useEffect(() => {
    if (sessions.length > 0) {
      let needsUpdate = false;
      const correctedSessions = sessions.map(session => {
        // Nur korrigieren wenn Woche offensichtlich falsch ist (> 8)
        if (session.week > 8 && (session.isAdditionalWorkout || session.id.includes('strava'))) {
          const correctWeek = getTrainingWeek(new Date(session.date));
          console.log(`🔧 Korrigiere falsche Woche für ${session.title}: ${session.week} → ${correctWeek}`);
          needsUpdate = true;
          return { ...session, week: correctWeek };
        }
        return session;
      });

      if (needsUpdate) {
        setSessions(correctedSessions);
        console.log('✅ Falsche Wochen-Zuordnungen korrigiert');
      }
    }
  }, [sessions.length]); // Nur beim ersten Laden ausführen

  // Funktion zum Aktualisieren von Woche 2 mit dem neuen Triathlon-Plan
  const updateWeek2WithTriathlonPlan = () => {
    console.log('🔄 Starte SICHERES Woche 2 Update...');
    console.log('🔒 Woche 1 wird NICHT verändert!');
    
    // SCHRITT 1: Sichere Woche 1 Sessions (UNVERÄNDERT!)
    const week1Sessions = sessions.filter(s => s.week === 1);
    const otherSessions = sessions.filter(s => s.week !== 1 && s.week !== 2);
    
    console.log(`🛡️ Woche 1 gesichert: ${week1Sessions.length} Sessions`);
    console.log('🔍 Woche 1 Titles:', week1Sessions.map(s => s.title));
    console.log(`📦 Andere Wochen: ${otherSessions.length} Sessions`);
    
    // SCHRITT 2: Hole NUR Woche 2 Sessions direkt aus detailedHybridPlan
    const week2Start = new Date(2024, 8, 22); // 22.09.2024 (Montag) - Woche 2 Start
    const rawWeek2Sessions = detailedHybridPlan.filter(s => s.week === 2);
    
    // SCHRITT 3: Setze korrekte Daten und WIRKLICH eindeutige IDs
    const timestamp = Date.now();
    const newWeek2Sessions = rawWeek2Sessions.map((session, index) => {
      const sessionDate = new Date(week2Start);
      sessionDate.setDate(week2Start.getDate() + (session.day - 1));
      
      return {
        ...session,
        date: sessionDate,
        completed: false,
        id: `w2-final-${timestamp}-${index}-${session.day}-${Math.random().toString(36).substr(2, 9)}`
      };
    });
    
    console.log(`🆕 Neue Woche 2 Sessions: ${newWeek2Sessions.length}`);
    console.log('📋 Neue Titles:', newWeek2Sessions.map(s => s.title));
    
    // SCHRITT 4: Kombiniere SICHER: Woche 1 bleibt + Neue Woche 2
    const finalSessions = [
      ...week1Sessions,     // Woche 1 KOMPLETT UNVERÄNDERT
      ...newWeek2Sessions,  // Nur neue Woche 2 Sessions
      ...otherSessions      // Andere Wochen falls vorhanden
    ];
    
    setSessions(finalSessions);
    storageManager.saveSessions(finalSessions);
    
    console.log(`✅ SICHERES Update abgeschlossen:`);
    console.log(`   🔒 Woche 1: ${week1Sessions.length} Sessions (UNVERÄNDERT)`);
    console.log(`   🆕 Woche 2: ${newWeek2Sessions.length} Sessions (NEU)`);
    console.log(`   📦 Andere: ${otherSessions.length} Sessions`);
    console.log(`   📊 Gesamt: ${finalSessions.length} Sessions`);
    
    return true;
  };

  // Callback für Sync-Updates
  const handleDataUpdated = (newSessions: TrainingSession[], newUserStats: UserStats, newQuickCheck: QuickCheck) => {
    console.log('🔄 Daten von Sync aktualisiert:', {
      sessions: newSessions.length,
      completedSessions: newSessions.filter(s => s.completed).length,
      stats: newUserStats.totalSessions
    });
    
    setSessions(newSessions);
    setUserStats(newUserStats);
    setQuickCheck(newQuickCheck);
    
    // Speichere die aktualisierten Daten
    storageManager.saveSessions(newSessions);
    storageManager.saveStats(newUserStats);
    storageManager.saveQuickCheck(newQuickCheck);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateQuickCheck = (field: keyof Omit<QuickCheck, 'date'>, value: 1 | 2 | 3 | 4 | 5) => {
    setQuickCheck(prev => ({
      ...prev,
      [field]: value,
      date: new Date()
    }));
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
          <NavigationMobile 
            sessions={sessions} 
            userStats={userStats}
            quickCheck={quickCheck}
            onDataUpdated={handleDataUpdated}
          />
          <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-8">
            <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  sessions={sessions}
                  userStats={userStats}
                  onCompleteSession={completeSession}
                  onUpdateSession={updateSession}
                  onAddMultipleWorkouts={addMultipleWorkouts}
                  onUncompleteSession={uncompleteSession}
                  onDeleteSession={deleteSession}
                  onUpdateWeek2={updateWeek2WithTriathlonPlan}
                />
              } 
            />
            <Route 
              path="/quick-workout" 
              element={<QuickWorkout />} 
            />
            <Route 
              path="/nutrition" 
              element={<Nutrition />} 
            />
          </Routes>
          </main>
          
          {/* PWA Install Prompt */}
          <PWAInstall />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default AppMobile;
