import React, { useState, useEffect } from 'react';
import { WeightEntry, WeightGoal } from '../types';
import { Scale, Target, TrendingDown, TrendingUp, Calendar, Plus } from 'lucide-react';
import WeightInputModal from './WeightInputModal';
import storageManager from '../utils/storage';

interface WeightProgressProps {
  className?: string;
}

const WeightProgress: React.FC<WeightProgressProps> = ({ className = '' }) => {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [weightGoal, setWeightGoal] = useState<WeightGoal | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);

  useEffect(() => {
    loadWeightData();
  }, []);

  const loadWeightData = () => {
    const entries = storageManager.loadWeightEntries();
    const goal = storageManager.loadWeightGoal();
    
    setWeightEntries(entries);
    setWeightGoal(goal);
  };

  const handleSaveWeight = (weightEntry: WeightEntry) => {
    storageManager.saveWeightEntry(weightEntry);
    loadWeightData();
  };

  const getCurrentWeight = (): number | null => {
    if (weightEntries.length === 0) return null;
    return weightEntries[weightEntries.length - 1].weight;
  };

  const getWeightChange = (): { change: number; percentage: number; isPositive: boolean } | null => {
    if (weightEntries.length < 2) return null;
    
    const current = weightEntries[weightEntries.length - 1].weight;
    const previous = weightEntries[weightEntries.length - 2].weight;
    const change = current - previous;
    const percentage = (change / previous) * 100;
    
    return {
      change: Math.abs(change),
      percentage: Math.abs(percentage),
      isPositive: change > 0
    };
  };

  const getProgressToGoal = (): { progress: number; remaining: number } | null => {
    if (!weightGoal || weightEntries.length === 0) return null;
    
    const current = getCurrentWeight();
    if (!current) return null;
    
    const totalChange = current - weightGoal.startWeight;
    const targetChange = weightGoal.targetWeight - weightGoal.startWeight;
    const progress = Math.min(100, Math.max(0, (totalChange / targetChange) * 100));
    const remaining = weightGoal.targetWeight - current;
    
    return { progress, remaining };
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).format(date);
  };

  const currentWeight = getCurrentWeight();
  const weightChange = getWeightChange();
  const progressToGoal = getProgressToGoal();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Gewichts-Fortschritt
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {weightGoal ? `Ziel: ${weightGoal.targetWeight}kg` : 'Ziel: 70kg'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInputModal(true)}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            title="Gewicht eintragen"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {currentWeight ? (
          <>
            {/* Aktuelles Gewicht */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {currentWeight.toFixed(1)}kg
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(weightEntries[weightEntries.length - 1].date)}
              </div>
            </div>

            {/* Gewichts-Änderung */}
            {weightChange && (
              <div className="flex items-center justify-center gap-2">
                {weightChange.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                )}
                <span className={`text-sm font-medium ${
                  weightChange.isPositive ? 'text-red-600' : 'text-green-600'
                }`}>
                  {weightChange.isPositive ? '+' : '-'}{weightChange.change.toFixed(1)}kg
                  ({weightChange.percentage.toFixed(1)}%)
                </span>
              </div>
            )}

            {/* Fortschritt zum Ziel */}
            {progressToGoal && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Fortschritt zum Ziel</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {progressToGoal.remaining > 0 
                      ? `${progressToGoal.remaining.toFixed(1)}kg übrig`
                      : 'Ziel erreicht! 🎉'
                    }
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, progressToGoal.progress))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Letzte Einträge */}
            {weightEntries.length > 1 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Letzte Einträge
                </h4>
                <div className="space-y-1">
                  {weightEntries.slice(-3).reverse().map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatDate(entry.date)}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {entry.weight.toFixed(1)}kg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Scale className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Noch keine Gewichtsdaten vorhanden
            </p>
            <button
              onClick={() => setShowInputModal(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Erstes Gewicht eintragen
            </button>
          </div>
        )}
      </div>

      <WeightInputModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        onSave={handleSaveWeight}
        currentWeight={currentWeight || undefined}
        targetWeight={weightGoal?.targetWeight || 70}
      />
    </div>
  );
};

export default WeightProgress;

