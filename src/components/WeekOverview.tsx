import React, { useState } from 'react';
import { TrainingSession } from '../types';
import WorkoutContextMenu from './WorkoutContextMenu';
import WorkoutActionMenu from './WorkoutActionMenu';
import EditWorkoutModal from './EditWorkoutModal';

interface WeekOverviewProps {
  sessions: TrainingSession[];
  weekNumber: number;
  onCompleteSession: (sessionId: string) => void;
  onUpdateSession?: (updatedSession: TrainingSession) => void;
  onUncompleteSession?: (sessionId: string) => void;
  onDeleteSession?: (sessionId: string) => void;
  onAddWorkout?: (workout: TrainingSession) => void;
}

const WeekOverview: React.FC<WeekOverviewProps> = ({ 
  sessions, 
  weekNumber, 
  onCompleteSession,
  onUpdateSession,
  onUncompleteSession,
  onDeleteSession,
  onAddWorkout
}) => {
  // Kontextmenü State
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    targetDay: number;
    targetDate: Date;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    targetDay: 1,
    targetDate: new Date()
  });

  const [workoutActionMenu, setWorkoutActionMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    workout: TrainingSession | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    workout: null
  });

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    workout: TrainingSession | null;
  }>({
    isOpen: false,
    workout: null
  });
  // Debug: Log sessions für diese Woche
  console.log(`📅 WeekOverview Woche ${weekNumber}:`);
  sessions.forEach(s => {
    console.log(`- ${s.title}: Tag ${s.day} (${s.completed ? 'Erledigt' : 'Offen'})`);
  });
  
  const today = new Date();
  const todayWeekday = today.getDay() === 0 ? 7 : today.getDay(); // 0=So->7, 1=Mo->1, etc.
  console.log(`🗓️ Heute: ${today.toLocaleDateString('de-DE')}, Wochentag: ${todayWeekday} (${['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][today.getDay()]})`);
  const completedSessions = sessions.filter(s => s.completed).length;
  const totalSessions = sessions.length;
  const completionPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  // Calculate strength vs cardio ratio
  const strengthSessions = sessions.filter(s => s.type === 'strength').length;
  const cardioSessions = sessions.filter(s => ['cardio', 'swimming'].includes(s.type)).length;
  const strengthPercentage = totalSessions > 0 ? (strengthSessions / totalSessions) * 100 : 0;
  const cardioPercentage = totalSessions > 0 ? (cardioSessions / totalSessions) * 100 : 0;

  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  // Funktion um das passende Icon für ein Workout zu bekommen
  const getWorkoutIcon = (session: TrainingSession): string => {
    // Prüfe zuerst, ob das Workout bereits ein Icon hat (aus der Bibliothek)
    if (session.icon) {
      return session.icon;
    }

    // Fallback basierend auf Typ
    switch (session.type) {
      case 'cardio':
        if (session.subtype === 'running') return '🏃‍♂️';
        if (session.subtype === 'cycling') return '🚴‍♂️';
        if (session.subtype === 'intervals') return '⚡';
        return '❤️';
      case 'strength':
        if (session.subtype === 'legs') return '🦵';
        if (session.subtype === 'upper') return '🏋️‍♂️';
        if (session.subtype === 'fullbody') return '💪';
        return '💪';
      case 'swimming':
        return '🏊‍♂️';
      case 'yoga':
        if (session.subtype === 'stretching') return '🤸‍♀️';
        return '🧘‍♀️';
      case 'recovery':
        if (session.subtype === 'meditation') return '🧘';
        if (session.subtype === 'breathing') return '💨';
        if (session.subtype === 'stretching') return '🤸‍♀️';
        return '😌';
      default:
        return '💪';
    }
  };

  // Gruppiere Sessions nach Tagen (1=Mo, 2=Di, ..., 7=So)
  const sessionsByDay = sessions.reduce((acc, session) => {
    const day = session.day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(session);
    return acc;
  }, {} as { [key: number]: TrainingSession[] });

  // Handler für Rechtsklick
  const handleRightClick = (event: React.MouseEvent, dayNumber: number) => {
    event.preventDefault();
    
    console.log('🖱️ Rechtsklick auf Tag:', dayNumber, 'Woche:', weekNumber);
    
    // Berechne das Datum für diesen Tag
    const weekStartDate = new Date(2024, 8, 16); // 16.09.2024 (Montag Woche 1)
    const targetDate = new Date(weekStartDate);
    targetDate.setDate(weekStartDate.getDate() + ((weekNumber - 1) * 7) + (dayNumber - 1));
    
    console.log('📅 Ziel-Datum:', targetDate);
    
    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      targetDay: dayNumber,
      targetDate: targetDate
    });
    
    console.log('🔧 Kontextmenü State gesetzt:', { isOpen: true, targetDay: dayNumber });
  };

  // Handler für Workout hinzufügen
  const handleAddWorkout = (workout: TrainingSession) => {
    if (onAddWorkout) {
      onAddWorkout(workout);
    }
  };

  // Handler für Kontextmenü schließen
  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  const handleWorkoutRightClick = (e: React.MouseEvent, workout: TrainingSession) => {
    e.preventDefault();
    e.stopPropagation();
    
    setWorkoutActionMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      workout: workout
    });
  };

  const handleCloseWorkoutActionMenu = () => {
    setWorkoutActionMenu(prev => ({ ...prev, isOpen: false }));
  };

  const handleEditWorkout = (workout: TrainingSession) => {
    setEditModal({
      isOpen: true,
      workout: workout
    });
  };

  const handleCloseEditModal = () => {
    setEditModal({
      isOpen: false,
      workout: null
    });
  };

  const handleSaveWorkout = (updatedWorkout: TrainingSession) => {
    if (onUpdateSession) {
      onUpdateSession(updatedWorkout);
    }
  };

  const handleDeleteWorkout = (workoutId: string) => {
    if (onDeleteSession) {
      onDeleteSession(workoutId);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Woche {weekNumber} Übersicht
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {completedSessions}/{totalSessions} Sessions
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fortschritt</span>
          <span className="text-sm text-gray-500 dark:text-gray-500">{Math.round(completionPercentage)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill bg-primary-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Weekly Calendar View - 7 Columns */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6, 7].map((dayNumber) => {
          const dayName = dayNames[dayNumber - 1];
          const daySessions = sessionsByDay[dayNumber] || [];
          const isToday = dayNumber === todayWeekday;
          
          return (
            <div 
              key={dayNumber} 
              className={`min-h-[140px] p-3 rounded-lg border-2 transition-all cursor-context-menu ${
                isToday 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
              }`}
              onContextMenu={(e) => handleRightClick(e, dayNumber)}
              title="Rechtsklick für Workout hinzufügen"
            >
              {/* Day Header */}
              <div className={`text-center mb-3 pb-2 border-b ${
                isToday 
                  ? 'border-primary-300 text-primary-700 dark:text-primary-300' 
                  : 'border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-400'
              }`}>
                <div className={`text-sm font-bold ${isToday ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'}`}>
                  {dayName}
                </div>
                
                {/* Datum unter jedem Wochentag anzeigen */}
                {daySessions.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(daySessions[0].date).toLocaleDateString('de-DE', { 
                      day: '2-digit', 
                      month: '2-digit'
                    })}
                  </div>
                )}
                
                {isToday && (
                  <div className="text-xs text-primary-500 font-semibold mt-1 bg-primary-100 dark:bg-primary-800 px-2 py-1 rounded-full">
                    Heute
                  </div>
                )}
              </div>
              
              {/* Sessions for this day - stacked vertically */}
              <div className="space-y-2">
                {daySessions.length === 0 ? (
                  <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-6 italic">
                    Kein Training
                  </div>
                ) : (
                  daySessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-2 rounded-md text-xs cursor-pointer transition-all hover:shadow-md transform hover:-translate-y-0.5 ${
                        session.completed
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-l-4 border-green-500 shadow-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }`}
                      onClick={() => {
                        if (session.completed && onUncompleteSession) {
                          onUncompleteSession(session.id);
                        } else if (!session.completed) {
                          onCompleteSession(session.id);
                        }
                      }}
                      onContextMenu={(e) => handleWorkoutRightClick(e, session)}
                      title="Linksklick: Abhaken | Rechtsklick: Aktionen"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getWorkoutIcon(session)}</span>
                        <div className="font-semibold truncate" title={session.title}>
                          {session.title}
                        </div>
                      </div>
                      
                      <div className="text-xs opacity-80 flex items-center justify-between">
                        <span>{session.duration} min</span>
                        {session.distance && (
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 rounded">
                            {session.distance}km
                          </span>
                        )}
                      </div>
                      {session.completed ? (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-2 font-bold flex items-center gap-1">
                          <span className="text-green-500">✓</span> Erledigt
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 opacity-75">
                          Klick zum Abhaken
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Kraft vs Ausdauer Balance - kompakter */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-700 dark:text-gray-300 font-medium">Balance:</span>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full overflow-hidden h-2 w-24">
            <div 
              className="bg-red-400 transition-all duration-300"
              style={{ width: `${strengthPercentage}%` }}
            />
            <div 
              className="bg-blue-400 transition-all duration-300"
              style={{ width: `${cardioPercentage}%` }}
            />
            <div 
              className="bg-gray-200 dark:bg-gray-600"
              style={{ width: `${100 - strengthPercentage - cardioPercentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">
            💪 {Math.round(strengthPercentage)}% • 🏃‍♂️ {Math.round(cardioPercentage)}%
          </span>
        </div>
      </div>

      {/* Kontextmenü */}
      <WorkoutContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        targetDay={contextMenu.targetDay}
        targetWeek={weekNumber}
        targetDate={contextMenu.targetDate}
        onClose={handleCloseContextMenu}
        onAddWorkout={handleAddWorkout}
      />

      <WorkoutActionMenu
        isOpen={workoutActionMenu.isOpen}
        position={workoutActionMenu.position}
        workout={workoutActionMenu.workout}
        onClose={handleCloseWorkoutActionMenu}
        onEdit={handleEditWorkout}
        onDelete={handleDeleteWorkout}
      />

      <EditWorkoutModal
        isOpen={editModal.isOpen}
        workout={editModal.workout}
        onClose={handleCloseEditModal}
        onSave={handleSaveWorkout}
      />
    </div>
  );
};

export default WeekOverview;
