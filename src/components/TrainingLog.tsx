import React, { useState, useEffect } from 'react';
import { TrainingSession } from '../types';
import storageManager from '../utils/storage';
import { 
  BookOpen, 
  Edit, 
  Trash2, 
  Filter, 
  Calendar, 
  Clock, 
  MapPin, 
  Dumbbell,
  Heart,
  Waves,
  Flower,
  Search,
  ChevronDown,
  ChevronUp,
  Timer,
  Watch
} from 'lucide-react';
import ManualTracker from './ManualTracker';

interface TrainingLogProps {
  sessions: TrainingSession[];
  onUpdateSession: (updatedSession: TrainingSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

const TrainingLog: React.FC<TrainingLogProps> = ({
  sessions,
  onUpdateSession,
  onDeleteSession
}) => {
  const [searchTerm, setSearchTerm] = useState(() => 
    storageManager.getUIState('trainingLog.searchTerm', '')
  );
  const [filterType, setFilterType] = useState<'all' | 'strength' | 'cardio' | 'swimming' | 'yoga'>(() =>
    storageManager.getUIState('trainingLog.filterType', 'all')
  );
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'completed' | 'pending'>(() =>
    storageManager.getUIState('trainingLog.filterCompleted', 'all')
  );
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'duration'>(() =>
    storageManager.getUIState('trainingLog.sortBy', 'date')
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() =>
    storageManager.getUIState('trainingLog.sortOrder', 'desc')
  );
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(() => {
    const saved = storageManager.getUIState('expandedSessions', []);
    return new Set(saved);
  });

  // Persistiere UI-Zustände
  useEffect(() => {
    storageManager.saveUIState('expandedSessions', Array.from(expandedSessions));
  }, [expandedSessions]);

  useEffect(() => {
    storageManager.saveUIState('trainingLog.searchTerm', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    storageManager.saveUIState('trainingLog.filterType', filterType);
  }, [filterType]);

  useEffect(() => {
    storageManager.saveUIState('trainingLog.filterCompleted', filterCompleted);
  }, [filterCompleted]);

  useEffect(() => {
    storageManager.saveUIState('trainingLog.sortBy', sortBy);
  }, [sortBy]);

  useEffect(() => {
    storageManager.saveUIState('trainingLog.sortOrder', sortOrder);
  }, [sortOrder]);

  // Filter and sort sessions
  const filteredSessions = sessions
    .filter(session => {
      // Search filter
      if (searchTerm && !session.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !session.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filterType !== 'all' && session.type !== filterType) {
        return false;
      }
      
      // Completed filter
      if (filterCompleted === 'completed' && !session.completed) {
        return false;
      }
      if (filterCompleted === 'pending' && session.completed) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getIcon = (type: string) => {
    switch (type) {
      case 'strength': return Dumbbell;
      case 'cardio': return Heart;
      case 'swimming': return Waves;
      case 'yoga': return Flower;
      default: return Clock;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return 'text-red-600 bg-red-50';
      case 'cardio': return 'text-blue-600 bg-blue-50';
      case 'swimming': return 'text-cyan-600 bg-cyan-50';
      case 'yoga': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const toggleExpanded = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const handleDelete = (sessionId: string, title: string) => {
    if (window.confirm(`Möchtest du "${title}" wirklich löschen?`)) {
      onDeleteSession(sessionId);
    }
  };

  const handleEdit = (session: TrainingSession) => {
    setEditingSession(session);
  };

  const handleSaveEdit = (updatedSession: TrainingSession) => {
    onUpdateSession(updatedSession);
    setEditingSession(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary-100 rounded-lg">
          <BookOpen className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Log</h1>
          <p className="text-gray-600">Alle deine Trainingseinheiten im Überblick</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Alle Typen</option>
            <option value="strength">Krafttraining</option>
            <option value="cardio">Ausdauer</option>
            <option value="swimming">Schwimmen</option>
            <option value="yoga">Yoga</option>
          </select>

          {/* Completed Filter */}
          <select
            value={filterCompleted}
            onChange={(e) => setFilterCompleted(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Alle Status</option>
            <option value="completed">Abgeschlossen</option>
            <option value="pending">Offen</option>
          </select>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="date">Datum</option>
              <option value="type">Typ</option>
              <option value="duration">Dauer</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {filteredSessions.length} von {sessions.length} Sessions
          </p>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-gray-400 mb-4">
              <BookOpen size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Sessions gefunden
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' || filterCompleted !== 'all' 
                ? 'Versuche andere Filter oder Suchbegriffe'
                : 'Füge deine erste Trainingseinheit hinzu!'}
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const Icon = getIcon(session.type);
            const colorClasses = getTypeColor(session.type);
            const isExpanded = expandedSessions.has(session.id);

            return (
              <div key={session.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon and Status */}
                    <div className="relative">
                      <div className={`p-3 rounded-lg ${colorClasses}`}>
                        <Icon size={24} />
                      </div>
                      {session.completed && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-success-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{session.title}</h3>
                        <span className={`badge ${session.completed ? 'badge-success' : 'badge-secondary'}`}>
                          {session.completed ? 'Abgeschlossen' : 'Offen'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{session.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {session.notes && session.notes.includes('Timer:') ? (
                            <Timer size={14} className="text-primary-600" />
                          ) : (
                            <Clock size={14} />
                          )}
                          <span>{session.duration} Min</span>
                          {session.notes && session.notes.includes('Timer:') && (
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                              ⏱️ Timer
                            </span>
                          )}
                        </div>
                        {session.distance && (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{session.distance.toFixed(1)} km</span>
                          </div>
                        )}
                        {session.exercises && (
                          <div className="flex items-center gap-1">
                            <Dumbbell size={14} />
                            <span>{session.exercises.length} Übungen</span>
                          </div>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          {session.exercises && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Übungen:</h4>
                              <div className="space-y-2">
                                {session.exercises.map((exercise, index) => (
                                  <div key={index} className="bg-gray-50 rounded p-3">
                                    <div className="font-medium text-gray-900 mb-1">{exercise.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {exercise.sets.map((set, setIndex) => (
                                        <span key={setIndex}>
                                          {set.reps && set.weight ? `${set.reps}x${set.weight}kg` : 
                                           set.time ? `${set.time}s` : 
                                           set.reps ? `${set.reps} reps` : ''}
                                          {setIndex < exercise.sets.length - 1 ? ', ' : ''}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {session.notes && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                                {session.notes.includes('Timer:') ? (
                                  <>
                                    <Watch size={16} className="text-primary-600" />
                                    Notizen & Timer-Info:
                                  </>
                                ) : (
                                  'Notizen:'
                                )}
                              </h4>
                              <div className="text-gray-600 text-sm">
                                {session.notes.includes('Timer:') ? (
                                  <div className="space-y-2">
                                    {session.notes.split(' | ').map((note, index) => (
                                      <div key={index} className={note.startsWith('Timer:') ? 'flex items-center gap-2 font-mono text-primary-700 bg-primary-50 px-3 py-2 rounded border border-primary-200' : 'text-gray-600'}>
                                        {note.startsWith('Timer:') && <Timer size={14} />}
                                        {note}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p>{session.notes}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpanded(session.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title={isExpanded ? 'Weniger anzeigen' : 'Details anzeigen'}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button
                      onClick={() => handleEdit(session)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Bearbeiten"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(session.id, session.title)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingSession && (
        <ManualTracker
          session={editingSession}
          onSave={handleSaveEdit}
          onCancel={() => setEditingSession(null)}
        />
      )}
    </div>
  );
};

export default TrainingLog;
