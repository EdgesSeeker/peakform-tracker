import React from 'react';
import { TrainingSession } from '../types';
import TrainingCard from './TrainingCard';
import { Calendar, Circle, Move } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface WeekCardProps {
  week: number;
  sessions: TrainingSession[];
  onCompleteSession: (sessionId: string) => void;
  onUpdateSession?: (updatedSession: TrainingSession) => void;
  onSwapSessions?: (sessionId1: string, sessionId2: string) => void;
  detailed?: boolean;
}

// Sortable Training Card Component
const SortableTrainingCard: React.FC<{
  session: TrainingSession;
  onComplete: (sessionId: string) => void;
  onUpdate?: (updatedSession: TrainingSession) => void;
  dayName: string;
  dayNumber: number;
}> = ({ session, onComplete, onUpdate, dayName, dayNumber }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            {dayName} - Tag {dayNumber}
          </span>
          {session.completed ? (
            <div className="w-4 h-4 bg-success-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          ) : (
            <Circle size={16} className="text-gray-400" />
          )}
        </div>
        <div
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <Move size={16} className="text-gray-400" />
        </div>
      </div>
      <TrainingCard 
        session={session}
        onComplete={onComplete}
        onUpdate={onUpdate}
      />
    </div>
  );
};

const WeekCard: React.FC<WeekCardProps> = ({ 
  week, 
  sessions, 
  onCompleteSession, 
  onUpdateSession,
  onSwapSessions,
  detailed = false 
}) => {
  const completedSessions = sessions.filter(s => s.completed).length;
  const totalSessions = sessions.length;
  const completionPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  // Calculate total distance and duration for the week
  const totalDistance = sessions.reduce((sum, s) => sum + (s.distance || 0), 0);
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);

  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('🔄 Drag ended:', { activeId: active.id, overId: over?.id });
    
    if (!over || active.id === over.id) {
      console.log('❌ Drag cancelled - no valid drop target');
      return;
    }

    if (!onSwapSessions) {
      console.log('❌ onSwapSessions function not provided');
      return;
    }

    // Find sessions to swap
    const activeSession = sessions.find(s => s.id === active.id);
    const overSession = sessions.find(s => s.id === over.id);

    console.log('🔍 Sessions to swap:', {
      active: activeSession ? `${activeSession.title} (Tag ${activeSession.day})` : 'Not found',
      over: overSession ? `${overSession.title} (Tag ${overSession.day})` : 'Not found'
    });

    if (activeSession && overSession) {
      console.log('✅ Calling onSwapSessions...');
      onSwapSessions(activeSession.id, overSession.id);
    } else {
      console.log('❌ Could not find sessions to swap');
    }
  };

  const getWeekPhase = (weekNumber: number) => {
    if (weekNumber <= 2) return { phase: 'Grundlage', color: 'bg-blue-100 text-blue-800' };
    if (weekNumber <= 4) return { phase: 'Aufbau', color: 'bg-yellow-100 text-yellow-800' };
    if (weekNumber <= 6) return { phase: 'Intensität', color: 'bg-orange-100 text-orange-800' };
    return { phase: 'Peak', color: 'bg-red-100 text-red-800' };
  };

  const { phase, color } = getWeekPhase(week);

  if (detailed) {
    return (
      <div className="space-y-6">
        {/* Week Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{completedSessions}/{totalSessions}</div>
            <div className="text-sm text-gray-600">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalDistance.toFixed(1)}km</div>
            <div className="text-sm text-gray-600">Gesamt-Distanz</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{Math.floor(totalDuration / 60)}h {totalDuration % 60}min</div>
            <div className="text-sm text-gray-600">Trainingszeit</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Wochenfortschritt</span>
            <span className="text-sm text-gray-500">{Math.round(completionPercentage)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill bg-primary-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Training Sessions with Drag & Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sessions.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sessions
                .sort((a, b) => a.day - b.day) // Sortiere nach Tag für korrekte Anzeige
                .map((session, index) => (
                <SortableTrainingCard
                  key={session.id}
                  session={session}
                  onComplete={onCompleteSession}
                  onUpdate={onUpdateSession}
                  dayName={dayNames[session.day - 1]} // Verwende session.day statt index
                  dayNumber={session.day} // Verwende session.day statt index + 1
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    );
  }

  return (
    <div className="card card-hover cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Woche {week}
          </h3>
        </div>
        <div className={`badge ${color}`}>
          {phase}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Fortschritt</span>
          <span className="text-sm font-medium text-gray-900">
            {completedSessions}/{totalSessions}
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill bg-primary-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {totalDistance.toFixed(1)}km
          </div>
          <div className="text-xs text-gray-600">Distanz</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.floor(totalDuration / 60)}h {totalDuration % 60}min
          </div>
          <div className="text-xs text-gray-600">Zeit</div>
        </div>
      </div>

      {/* Session Preview */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex -space-x-1">
          {sessions.slice(0, 7).map((session, index) => (
            <div
              key={session.id}
              className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium ${
                session.completed 
                  ? 'bg-success-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}
              title={`${dayNames[index]}: ${session.title}`}
            >
              {dayNames[index]?.[0]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekCard;
