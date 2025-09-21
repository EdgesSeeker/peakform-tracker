import React, { useState } from 'react';
import { TrainingSession } from '../types';
import { 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar, 
  Clock, 
  MapPin, 
  Zap, 
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface WorkoutManagerProps {
  sessions: TrainingSession[];
  onUpdateSession: (session: TrainingSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

const WorkoutManager: React.FC<WorkoutManagerProps> = ({ 
  sessions, 
  onUpdateSession,
  onDeleteSession 
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());

  // Filtere nur zusätzliche/importierte Workouts
  const additionalWorkouts = sessions.filter(session => 
    session.isAdditionalWorkout || session.id.includes('strava') || session.id.includes('template')
  );

  const filteredWorkouts = additionalWorkouts.filter(session => {
    const matchesType = filterType === 'all' || 
                       (filterType === 'strava' && session.id.includes('strava')) ||
                       (filterType === 'manual' && session.id.includes('manual')) ||
                       (filterType === 'template' && session.id.includes('template')) ||
                       session.type === filterType;
    
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const toggleSessionSelection = (sessionId: string) => {
    const newSelected = new Set(selectedSessions);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedSessions(newSelected);
  };

  const toggleSessionInStats = (session: TrainingSession) => {
    const updatedSession = {
      ...session,
      // Füge ein Flag hinzu um zu kennzeichnen, ob es in Stats gezählt werden soll
      excludeFromStats: !session.excludeFromStats
    };
    onUpdateSession(updatedSession);
  };

  const deleteSelectedSessions = () => {
    if (selectedSessions.size === 0) {
      alert('Bitte wähle mindestens ein Workout aus!');
      return;
    }

    if (window.confirm(`Möchtest du ${selectedSessions.size} Workout(s) wirklich löschen?`)) {
      selectedSessions.forEach(sessionId => {
        onDeleteSession(sessionId);
      });
      setSelectedSessions(new Set());
      alert(`${selectedSessions.size} Workout(s) gelöscht!`);
    }
  };

  const excludeSelectedFromStats = () => {
    if (selectedSessions.size === 0) {
      alert('Bitte wähle mindestens ein Workout aus!');
      return;
    }

    selectedSessions.forEach(sessionId => {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        toggleSessionInStats(session);
      }
    });
    setSelectedSessions(new Set());
  };

  const getWorkoutIcon = (session: TrainingSession) => {
    if (session.id.includes('strava')) return '🚴‍♂️';
    if (session.id.includes('template')) return '📚';
    if (session.id.includes('manual')) return '✍️';
    return '🏃‍♂️';
  };

  const getWorkoutSource = (session: TrainingSession) => {
    if (session.id.includes('strava')) return { label: 'Strava', color: 'bg-orange-100 text-orange-700' };
    if (session.id.includes('template')) return { label: 'Bibliothek', color: 'bg-blue-100 text-blue-700' };
    if (session.id.includes('manual')) return { label: 'Manuell', color: 'bg-green-100 text-green-700' };
    return { label: 'Unbekannt', color: 'bg-gray-100 text-gray-700' };
  };

  const getWeekLabel = (week: number) => {
    if (week > 10) return `KW ${week}`;
    return `Woche ${week}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
              <Filter size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Workout Manager
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Verwalte importierte und zusätzliche Workouts
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {additionalWorkouts.length} zusätzliche Workouts
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Alle', icon: '📋' },
              { id: 'strava', label: 'Strava', icon: '🚴‍♂️' },
              { id: 'template', label: 'Bibliothek', icon: '📚' },
              { id: 'manual', label: 'Manuell', icon: '✍️' },
              { id: 'strength', label: 'Kraft', icon: '💪' },
              { id: 'cardio', label: 'Ausdauer', icon: '❤️' },
              { id: 'swimming', label: 'Schwimmen', icon: '🏊‍♂️' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  filterType === filter.id
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter.icon} {filter.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Workout suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Batch Actions */}
        {selectedSessions.size > 0 && (
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div className="text-purple-600 dark:text-purple-400 font-medium">
                {selectedSessions.size} Workout(s) ausgewählt
              </div>
              <div className="flex gap-2">
                <button
                  onClick={excludeSelectedFromStats}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <EyeOff size={14} />
                  Aus Statistik ausschließen
                </button>
                <button
                  onClick={deleteSelectedSessions}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Löschen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workouts List */}
      <div className="space-y-4">
        {filteredWorkouts.map((session) => {
          const isSelected = selectedSessions.has(session.id);
          const source = getWorkoutSource(session);
          const sessionDate = new Date(session.date);
          const isExcluded = session.excludeFromStats;

          return (
            <div
              key={session.id}
              className={`card transition-all ${
                isSelected ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''
              } ${isExcluded ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSessionSelection(session.id)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div className="text-2xl">{getWorkoutIcon(session)}</div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className={`font-semibold ${isExcluded ? 'text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                          {session.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {session.description}
                        </p>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {sessionDate.toLocaleDateString('de-DE')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {session.duration} min
                          </span>
                          {session.distance && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {session.distance} km
                            </span>
                          )}
                          {session.calories && (
                            <span className="flex items-center gap-1">
                              <Zap size={12} />
                              {session.calories} kcal
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${source.color}`}>
                          {source.label}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          {getWeekLabel(session.week)}
                        </span>
                      </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className={`flex items-center gap-1 text-xs ${
                        isExcluded ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {isExcluded ? <XCircle size={12} /> : <CheckCircle size={12} />}
                        {isExcluded ? 'Nicht in Statistik' : 'In Statistik enthalten'}
                      </div>
                      
                      {session.week > 10 && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <AlertTriangle size={12} />
                          Alte Kalenderwoche
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => toggleSessionInStats(session)}
                        className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg transition-colors ${
                          isExcluded
                            ? 'bg-green-100 hover:bg-green-200 text-green-700'
                            : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                        }`}
                      >
                        {isExcluded ? <Eye size={12} /> : <EyeOff size={12} />}
                        {isExcluded ? 'In Statistik einbeziehen' : 'Aus Statistik ausschließen'}
                      </button>
                      
                      <button
                        onClick={() => {
                          if (window.confirm('Workout wirklich löschen?')) {
                            onDeleteSession(session.id);
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                      >
                        <Trash2 size={12} />
                        Löschen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWorkouts.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Keine Workouts gefunden
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Versuche einen anderen Filter oder Suchbegriff
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkoutManager;
