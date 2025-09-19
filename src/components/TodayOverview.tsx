import React, { useState, useEffect } from 'react';
import { TrainingSession } from '../types';
import { Calendar, Clock, AlertCircle, Play, Eye, ChevronRight, Target, Pause, Square, Timer, Edit } from 'lucide-react';
import TrainingCard from './TrainingCard';
import WorkoutDetails from './WorkoutDetails';
import ManualTracker from './ManualTracker';
import EmptyState from './EmptyState';
import storageManager from '../utils/storage';

interface TodayOverviewProps {
  sessions: TrainingSession[];
  onCompleteSession: (sessionId: string) => void;
  onUpdateSession: (updatedSession: TrainingSession) => void;
}

const TodayOverview: React.FC<TodayOverviewProps> = ({
  sessions,
  onCompleteSession,
  onUpdateSession
}) => {
  const [showWorkoutDetails, setShowWorkoutDetails] = useState(false);
  const [showManualTracker, setShowManualTracker] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState<{
    isRunning: boolean;
    startTime: Date | null;
    elapsedTime: number;
    sessionId: string | null;
  }>(() => {
    const savedTimer = storageManager.getUIState('workoutTimer', null);
    if (savedTimer && savedTimer.sessionId) {
      return {
        ...savedTimer,
        startTime: savedTimer.startTime ? new Date(savedTimer.startTime) : null
      };
    }
    return {
      isRunning: false,
      startTime: null,
      elapsedTime: 0,
      sessionId: null
    };
  });
  
  const today = new Date();
  const todayWeekday = today.getDay() || 7; // 1=Mo, 7=So
  
  // Debug logging
  console.log('Today:', today);
  console.log('Today weekday:', todayWeekday);
  console.log('All sessions:', sessions.length);
  console.log('Sessions sample:', sessions.slice(0, 3).map(s => ({ id: s.id, date: s.date, day: s.day })));
  
  // Sessions für heute - nur erste Session des heutigen Wochentags
  const allTodaySessions = sessions.filter(session => {
    const dayMatch = session.day === todayWeekday;
    console.log(`Heute-Filter: ${session.title}, Woche: ${session.week}, Session-Tag: ${session.day}, Heute-Tag: ${todayWeekday}, Match: ${dayMatch}`);
    return dayMatch;
  });
  
  console.log('🔄 TodayOverview aktualisiert - Sessions neu gefiltert nach Tausch');
  
  // Nur die erste Session für heute nehmen (aus der ersten Woche)
  const todaySessions = allTodaySessions.length > 0 
    ? [allTodaySessions.find(s => s.week === 1) || allTodaySessions[0]].filter(Boolean)
    : [];
  
  console.log('Alle Sessions für heute:', allTodaySessions.length);
  console.log('Gefiltert auf eine Session:', todaySessions.length);
  
  console.log('Today sessions found:', todaySessions.length);
  console.log('Today sessions:', todaySessions.map(s => ({ title: s.title, date: s.date, day: s.day })));
  
  const completedToday = todaySessions.filter(s => s.completed);
  const pendingToday = todaySessions.filter(s => !s.completed);
  
  // Sessions dieser Woche
  const thisWeek = Math.ceil(today.getDate() / 7) || 1;
  const thisWeekSessions = sessions.filter(s => s.week === thisWeek);
  const weekCompleted = thisWeekSessions.filter(s => s.completed);
  
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const todayName = dayNames[today.getDay()];
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Timer-Funktionen
  const startTimer = (sessionId: string) => {
    setWorkoutTimer({
      isRunning: true,
      startTime: new Date(),
      elapsedTime: 0,
      sessionId: sessionId
    });
    console.log('⏰ Timer gestartet für:', sessionId);
  };

  const pauseTimer = () => {
    if (workoutTimer.startTime) {
      const elapsed = Math.floor((Date.now() - workoutTimer.startTime.getTime()) / 1000);
      setWorkoutTimer(prev => ({
        ...prev,
        isRunning: false,
        elapsedTime: prev.elapsedTime + elapsed
      }));
    }
  };

  const resumeTimer = () => {
    setWorkoutTimer(prev => ({
      ...prev,
      isRunning: true,
      startTime: new Date()
    }));
  };

  const completeWorkout = () => {
    if (workoutTimer.sessionId) {
      const totalElapsed = workoutTimer.startTime 
        ? workoutTimer.elapsedTime + Math.floor((Date.now() - workoutTimer.startTime.getTime()) / 1000)
        : workoutTimer.elapsedTime;
      
      const session = todaySessions.find(s => s.id === workoutTimer.sessionId);
      
      if (session) {
        const actualDuration = Math.max(Math.ceil(totalElapsed / 60), 1); // Mindestens 1 Minute
        const updatedSession = {
          ...session,
          duration: actualDuration,
          completed: true,
          notes: session.notes ? `${session.notes} | Timer: ${formatTime(totalElapsed)}` : `Timer: ${formatTime(totalElapsed)}`
        };
        
        console.log('🏁 Workout beendet:', {
          session: session.title,
          duration: actualDuration,
          timerTime: formatTime(totalElapsed)
        });
        
        onUpdateSession(updatedSession);
        onCompleteSession(session.id);
      }
    }
    
    // Timer zurücksetzen
    setWorkoutTimer({
      isRunning: false,
      startTime: null,
      elapsedTime: 0,
      sessionId: null
    });
  };

  const stopTimer = () => {
    completeWorkout();
  };

  const resetTimer = () => {
    setWorkoutTimer({
      isRunning: false,
      startTime: null,
      elapsedTime: 0,
      sessionId: null
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer-Update useEffect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (workoutTimer.isRunning && workoutTimer.startTime) {
      interval = setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - workoutTimer.startTime!.getTime()) / 1000);
        // Force re-render für Timer-Anzeige
        setWorkoutTimer(prev => ({ ...prev, elapsedTime: prev.elapsedTime }));
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [workoutTimer.isRunning, workoutTimer.startTime]);

  // Timer-Persistierung
  useEffect(() => {
    storageManager.saveUIState('workoutTimer', {
      ...workoutTimer,
      startTime: workoutTimer.startTime ? workoutTimer.startTime.toISOString() : null
    });
  }, [workoutTimer]);

  const getCurrentTime = () => {
    if (!workoutTimer.isRunning || !workoutTimer.startTime) {
      return workoutTimer.elapsedTime;
    }
    return workoutTimer.elapsedTime + Math.floor((Date.now() - workoutTimer.startTime.getTime()) / 1000);
  };

  // If no sessions at all, show empty state
  if (sessions.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState onLoadPlan={(newSessions) => {
          newSessions.forEach(session => onUpdateSession(session));
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header mit Datum */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Heute • {formatDate(today)}
              </h2>
              <p className="text-gray-600">
                Dein Trainingsplan für {todayName}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            {workoutTimer.sessionId ? (
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 font-mono">
                  {formatTime(getCurrentTime())}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Timer size={14} />
                  {workoutTimer.isRunning ? 'Läuft...' : 'Pausiert'}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {completedToday.length}/{todaySessions.length}
                </div>
                <div className="text-sm text-gray-600">Heute erledigt</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Heutige Sessions */}
      {showWorkoutDetails ? (
        <div className="space-y-4">
          <button
            onClick={() => setShowWorkoutDetails(false)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors font-medium"
          >
            ← Zurück zur Übersicht
          </button>
            <WorkoutDetails
              session={todaySessions[0]}
              onUpdateSession={onUpdateSession}
              onComplete={() => {
                completeWorkout();
                setShowWorkoutDetails(false);
              }}
              timer={{
                isRunning: workoutTimer.isRunning && workoutTimer.sessionId === todaySessions[0].id,
                currentTime: workoutTimer.sessionId === todaySessions[0].id ? getCurrentTime() : 0,
                onStart: () => startTimer(todaySessions[0].id),
                onPause: pauseTimer,
                onResume: resumeTimer,
                onComplete: completeWorkout,
                onReset: resetTimer
              }}
            />
        </div>
      ) : todaySessions.length > 0 ? (
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Heutiges Training
            </h3>
            {pendingToday.length > 0 && (
              <span className="badge badge-primary">
                {pendingToday.length} offen
              </span>
            )}
          </div>

          <div className="space-y-4">
            {todaySessions.map((session) => (
              <div key={session.id} className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <TrainingCard
                      session={session}
                      onComplete={onCompleteSession}
                      onUpdate={onUpdateSession}
                    />
                  </div>
                  {!session.completed && (
                    <div className="flex flex-col gap-2 pt-4">
                      {/* Timer Controls */}
                      {workoutTimer.sessionId === session.id ? (
                        <div className="flex gap-2">
                          {workoutTimer.isRunning ? (
                            <button
                              onClick={pauseTimer}
                              className="flex-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Pause size={16} />
                              Pause
                            </button>
                          ) : (
                            <button
                              onClick={resumeTimer}
                              className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Play size={16} />
                              Weiter
                            </button>
                          )}
                          <button
                            onClick={stopTimer}
                            className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <Square size={16} />
                            Stopp
                          </button>
                          <button
                            onClick={resetTimer}
                            className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                            title="Timer zurücksetzen"
                          >
                            Reset
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startTimer(session.id)}
                          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Play size={16} />
                          Workout starten
                        </button>
                      )}
                      
                      {/* Quick Complete Button */}
                      <button
                        onClick={() => onCompleteSession(session.id)}
                        className="px-4 py-2 bg-success-500 hover:bg-success-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                        title="Als erledigt markieren"
                      >
                        <span className="text-xs">✓</span>
                        Schnell erledigt
                      </button>
                      
                      {/* Manual Tracking Button */}
                      <button
                        onClick={() => setShowManualTracker(true)}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        title="Detailliert tracken"
                      >
                        <Edit size={16} />
                        Detailliert tracken
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Workout Details Button */}
                {(session.type === 'strength' || session.workoutPlan) && (
                  <button
                    onClick={() => setShowWorkoutDetails(true)}
                    className="w-full bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Eye size={18} />
                    Workout-Details & Checkliste anzeigen
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Manual Tracker Modal */}
          {showManualTracker && todaySessions.length > 0 && (
            <ManualTracker
              session={todaySessions[0]}
              onSave={(updatedSession) => {
                onUpdateSession(updatedSession);
                setShowManualTracker(false);
              }}
              onCancel={() => setShowManualTracker(false)}
            />
          )}

          {completedToday.length === todaySessions.length && todaySessions.length > 0 && (
            <div className="mt-6 p-4 bg-success-50 rounded-lg border border-success-200">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-success-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-medium text-success-800">
                  Perfekt! Alle heutigen Trainings abgeschlossen! 🎉
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-8">
          <div className="text-gray-400 mb-4">
            <Calendar size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Kein Training für heute geplant
          </h3>
          <p className="text-gray-600">
            Heute ist ein Ruhetag oder du hast bereits alles erledigt!
          </p>
        </div>
      )}

      {/* Wochen-Fortschritt */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Diese Woche (Woche {thisWeek})
          </h3>
          <div className="text-sm text-gray-600">
            {weekCompleted.length}/{thisWeekSessions.length} Sessions
          </div>
        </div>

        <div className="mb-4">
          <div className="progress-bar">
            <div 
              className="progress-fill bg-primary-500"
              style={{ 
                width: `${thisWeekSessions.length > 0 ? (weekCompleted.length / thisWeekSessions.length) * 100 : 0}%` 
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day, index) => {
            const dayNumber = index + 1;
            const daySessions = thisWeekSessions.filter(s => s.day === dayNumber);
            const dayCompleted = daySessions.filter(s => s.completed);
            const isToday = dayNumber === todayWeekday;
            
            return (
              <div 
                key={day}
                className={`p-2 rounded-lg text-center transition-colors ${
                  isToday 
                    ? 'bg-primary-500 text-white' 
                    : daySessions.length > 0
                    ? dayCompleted.length === daySessions.length
                      ? 'bg-success-100 text-success-800'
                      : 'bg-gray-100 text-gray-700'
                    : 'bg-gray-50 text-gray-400'
                }`}
              >
                <div className="text-xs font-medium mb-1">{day}</div>
                <div className="text-xs">
                  {daySessions.length > 0 ? `${dayCompleted.length}/${daySessions.length}` : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivations-Bereich */}
      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Play className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Deine Woche im Überblick
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-600">
              {weekCompleted.length}
            </div>
            <div className="text-sm text-gray-600">Abgeschlossen</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {thisWeekSessions.length - weekCompleted.length}
            </div>
            <div className="text-sm text-gray-600">Verbleibend</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(thisWeekSessions.length > 0 ? (weekCompleted.length / thisWeekSessions.length) * 100 : 0)}%
            </div>
            <div className="text-sm text-gray-600">Fortschritt</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {thisWeekSessions.reduce((sum, s) => sum + (s.completed ? s.duration : 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Min trainiert</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayOverview;