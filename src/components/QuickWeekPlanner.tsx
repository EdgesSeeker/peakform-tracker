import React, { useState } from 'react';
import { TrainingSession } from '../types';
import { workoutLibrary, createSessionFromTemplate } from '../data/workoutLibrary';
import { Calendar, Plus, Save, Target, Clock } from 'lucide-react';

interface QuickWeekPlannerProps {
  week: number;
  onAddWorkouts: (workouts: TrainingSession[]) => void;
}

interface DayPlan {
  day: number;
  dayName: string;
  workouts: string[]; // workout IDs
}

const QuickWeekPlanner: React.FC<QuickWeekPlannerProps> = ({ week, onAddWorkouts }) => {
  const [weekPlan, setWeekPlan] = useState<DayPlan[]>([
    { day: 1, dayName: 'Montag', workouts: [] },
    { day: 2, dayName: 'Dienstag', workouts: [] },
    { day: 3, dayName: 'Mittwoch', workouts: [] },
    { day: 4, dayName: 'Donnerstag', workouts: [] },
    { day: 5, dayName: 'Freitag', workouts: [] },
    { day: 6, dayName: 'Samstag', workouts: [] },
    { day: 7, dayName: 'Sonntag', workouts: [] }
  ]);

  // Vordefinierte Wochenpläne
  const predefinedPlans = {
    2: {
      name: 'Triathlon Intensiv-Woche',
      plan: [
        { day: 1, workouts: ['zone2-run-70min', 'yoga-mobility-20min', 'box-breathing-10min'] },
        { day: 2, workouts: ['legs-core-strength', 'stretching-legs-20min', 'meditation-relaxation-10min'] },
        { day: 3, workouts: ['swim-technique-70min', 'mobility-shoulder-15min'] },
        { day: 4, workouts: ['upper-body-strength', 'bike-ga1-30min', 'stretching-upper-10min'] },
        { day: 5, workouts: ['bike-intervals-80min', 'yoga-mobility-20min', 'breathing-technique-10min'] },
        { day: 6, workouts: ['brick-workout', 'fullbody-strength-45min', 'stretching-legs-glutes-10min'] },
        { day: 7, workouts: ['swim-recovery-30min', 'yoga-recovery-30min', 'meditation-guided-15min'] }
      ]
    }
  };

  const loadPredefinedPlan = () => {
    const plan = predefinedPlans[week as keyof typeof predefinedPlans];
    if (plan) {
      setWeekPlan(plan.plan.map(dayPlan => ({
        day: dayPlan.day,
        dayName: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'][dayPlan.day - 1],
        workouts: dayPlan.workouts
      })));
    }
  };

  const addWorkoutToDay = (day: number, workoutId: string) => {
    setWeekPlan(prev => prev.map(dayPlan => 
      dayPlan.day === day 
        ? { ...dayPlan, workouts: [...dayPlan.workouts, workoutId] }
        : dayPlan
    ));
  };

  const removeWorkoutFromDay = (day: number, workoutId: string) => {
    setWeekPlan(prev => prev.map(dayPlan => 
      dayPlan.day === day 
        ? { ...dayPlan, workouts: dayPlan.workouts.filter(id => id !== workoutId) }
        : dayPlan
    ));
  };

  const createWeekPlan = () => {
    const allWorkouts: TrainingSession[] = [];
    const baseDate = new Date();
    
    weekPlan.forEach(dayPlan => {
      if (dayPlan.workouts.length > 0) {
        dayPlan.workouts.forEach(workoutId => {
          const template = workoutLibrary.find(w => w.id === workoutId);
          if (template) {
            // Berechne Datum für nächste Woche
            const daysUntilTarget = (dayPlan.day - (baseDate.getDay() || 7) + 7) % 7;
            const targetDate = new Date(baseDate);
            targetDate.setDate(baseDate.getDate() + daysUntilTarget + 7); // +7 für nächste Woche
            
            const session = createSessionFromTemplate(template, targetDate);
            session.week = week;
            session.day = dayPlan.day;
            session.isAdditionalWorkout = false; // Als geplante Session markieren
            
            allWorkouts.push(session);
          }
        });
      }
    });

    if (allWorkouts.length === 0) {
      alert('Bitte füge mindestens ein Workout hinzu!');
      return;
    }

    onAddWorkouts(allWorkouts);
    
    // Reset
    setWeekPlan(prev => prev.map(day => ({ ...day, workouts: [] })));
    
    alert(`Woche ${week} erstellt mit ${allWorkouts.length} Workouts! 🎉`);
  };

  const getTotalWeekStats = () => {
    const totalDuration = weekPlan.reduce((sum, day) => 
      sum + day.workouts.reduce((daySum, workoutId) => {
        const workout = workoutLibrary.find(w => w.id === workoutId);
        return daySum + (workout?.duration || 0);
      }, 0), 0
    );
    
    const totalWorkouts = weekPlan.reduce((sum, day) => sum + day.workouts.length, 0);
    
    return { totalDuration, totalWorkouts };
  };

  const { totalDuration, totalWorkouts } = getTotalWeekStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Woche {week} Planer
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Erstelle deinen Trainingsplan für nächste Woche
              </p>
            </div>
          </div>
          
          {predefinedPlans[week as keyof typeof predefinedPlans] && (
            <button
              onClick={loadPredefinedPlan}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Target size={16} />
              Triathlon-Plan laden
            </button>
          )}
        </div>

        {/* Week Stats */}
        {totalWorkouts > 0 && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalWorkouts}</div>
              <div className="text-sm text-gray-600">Workouts geplant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</div>
              <div className="text-sm text-gray-600">Gesamtdauer</div>
            </div>
          </div>
        )}

        {totalWorkouts > 0 && (
          <button
            onClick={createWeekPlan}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Woche {week} mit {totalWorkouts} Workouts erstellen
          </button>
        )}
      </div>

      {/* Day Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {weekPlan.map((dayPlan) => (
          <div key={dayPlan.day} className="card">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-center">
              {dayPlan.dayName}
            </h4>
            
            {/* Planned Workouts */}
            <div className="space-y-2 mb-4 min-h-[100px]">
              {dayPlan.workouts.map((workoutId, index) => {
                const workout = workoutLibrary.find(w => w.id === workoutId);
                if (!workout) return null;
                
                return (
                  <div
                    key={index}
                    className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {workout.name}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          {workout.duration}min {workout.distance && `• ${workout.distance}km`}
                        </div>
                      </div>
                      <button
                        onClick={() => removeWorkoutFromDay(dayPlan.day, workoutId)}
                        className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-1 rounded"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {dayPlan.workouts.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Noch keine Workouts
                </div>
              )}
            </div>

            {/* Add Workout Dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addWorkoutToDay(dayPlan.day, e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full text-sm px-2 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">+ Workout hinzufügen</option>
              {workoutLibrary.map((workout) => (
                <option key={workout.id} value={workout.id}>
                  {workout.icon} {workout.name} ({workout.duration}min)
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickWeekPlanner;
