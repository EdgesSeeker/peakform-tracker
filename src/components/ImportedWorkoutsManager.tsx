import React, { useState } from 'react';
import { TrainingSession } from '../types';
import { 
  Trash2, 
  Filter, 
  Search, 
  Eye, 
  EyeOff, 
  Calendar, 
  Clock, 
  MapPin, 
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';

interface ImportedWorkoutsManagerProps {
  sessions: TrainingSession[];
  onUpdateSession: (session: TrainingSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

const ImportedWorkoutsManager: React.FC<ImportedWorkoutsManagerProps> = ({ 
  sessions, 
  onUpdateSession,
  onDeleteSession 
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());

  // Nur Strava-Workouts anzeigen
  const stravaWorkouts = sessions.filter(session => 
    session.id.includes('strava') || session.isAdditionalWorkout
  );

  const filteredWorkouts = stravaWorkouts.filter(session => {
    const matchesType = filterType === 'all' || session.type === filterType;
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase());
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

  const deleteSelectedSessions = () => {
    if (selectedSessions.size === 0) {
      alert('Bitte wähle mindestens ein Workout aus!');
      return;
    }

    if (window.confirm(`Möchtest du ${selectedSessions.size} importierte Workout(s) wirklich löschen?`)) {
      selectedSessions.forEach(sessionId => {
        onDeleteSession(sessionId);
      });
      setSelectedSessions(new Set());
      alert(`${selectedSessions.size} Workout(s) gelöscht!`);
    }
  };

  const toggleStatsInclusion = (session: TrainingSession) => {
    const updatedSession = {
      ...session,
      excludeFromStats: !session.excludeFromStats
    };
    onUpdateSession(updatedSession);
  };

  const excludeSelectedFromStats = () => {
    if (selectedSessions.size === 0) {
      alert('Bitte wähle mindestens ein Workout aus!');
      return;
    }

    selectedSessions.forEach(sessionId => {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        toggleStatsInclusion(session);
      }
    });
    setSelectedSessions(new Set());
  };

  if (stravaWorkouts.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Activity size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Keine importierten Workouts
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Importiere Workouts von Strava oder aus der Bibliothek
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Importierte Workouts verwalten
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {stravaWorkouts.length} importierte Workouts gefunden
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Alle', icon: '📋' },
              { id: 'strength', label: 'Kraft', icon: '💪' },
              { id: 'cardio', label: 'Ausdauer', icon: '❤️' },
              { id: 'swimming', label: 'Schwimmen', icon: '🏊‍♂️' },
              { id: 'yoga', label: 'Yoga', icon: '🧘‍♀️' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  filterType === filter.id
                    ? 'bg-orange-500 text-white shadow-md'
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Batch Actions */}
        {selectedSessions.size > 0 && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="flex items-center justify-between">
              <div className="text-orange-600 dark:text-orange-400 font-medium">
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
      <div className="space-y-3">
        {filteredWorkouts.map((session) => {
          const isSelected = selectedSessions.has(session.id);
          const sessionDate = new Date(session.date);
          const isExcluded = session.excludeFromStats;
          const isOldWeek = session.week > 10;

          return (
            <div
              key={session.id}
              className={`card transition-all ${
                isSelected ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20' : ''
              } ${isExcluded ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSessionSelection(session.id)}
                  className="mt-1 w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className={`font-semibold ${isExcluded ? 'text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                        {session.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {session.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {session.id.includes('strava') && (
                        <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                          Strava
                        </span>
                      )}
                      {isOldWeek && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                          KW {session.week}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
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

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-1 text-xs ${
                        isExcluded ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {isExcluded ? <XCircle size={12} /> : <CheckCircle size={12} />}
                        {isExcluded ? 'Nicht in Statistik' : 'In Statistik enthalten'}
                      </div>
                      
                      {isOldWeek && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <AlertTriangle size={12} />
                          Alte Kalenderwoche
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatsInclusion(session)}
                        className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                          isExcluded
                            ? 'bg-green-100 hover:bg-green-200 text-green-700'
                            : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                        }`}
                      >
                        {isExcluded ? <Eye size={12} /> : <EyeOff size={12} />}
                        {isExcluded ? 'Einbeziehen' : 'Ausschließen'}
                      </button>
                      
                      <button
                        onClick={() => {
                          if (window.confirm('Workout wirklich löschen?')) {
                            onDeleteSession(session.id);
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
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
        <div className="card text-center py-8">
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

export default ImportedWorkoutsManager;
