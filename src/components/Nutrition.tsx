import React, { useState, useEffect } from 'react';
import { ProteinEntry, NutritionGoal } from '../types';
import { Plus, Trash2, Target, Utensils } from 'lucide-react';
import storageManager from '../utils/storage';
import ProteinInputModal from './ProteinInputModal';

const Nutrition: React.FC = () => {
  const [proteinEntries, setProteinEntries] = useState<ProteinEntry[]>([]);
  const [nutritionGoal, setNutritionGoal] = useState<NutritionGoal>({ dailyProtein: 140 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProteinEntry | null>(null);

  useEffect(() => {
    loadNutritionData();
  }, []);

  const loadNutritionData = () => {
    const entries = storageManager.loadProteinEntries();
    const goal = storageManager.loadNutritionGoal();
    
    setProteinEntries(entries);
    if (goal) {
      setNutritionGoal(goal);
    }
  };

  const getTodayProtein = (): number => {
    const today = new Date();
    const todayEntries = proteinEntries.filter(entry => 
      entry.date.toDateString() === today.toDateString()
    );
    return todayEntries.reduce((sum, entry) => sum + entry.protein, 0);
  };

  const getProteinByMeal = (meal: string): number => {
    const today = new Date();
    const todayEntries = proteinEntries.filter(entry => 
      entry.date.toDateString() === today.toDateString() && entry.meal === meal
    );
    return todayEntries.reduce((sum, entry) => sum + entry.protein, 0);
  };

  const getMealName = (meal: string): string => {
    const mealNames = {
      breakfast: 'Frühstück',
      lunch: 'Mittagessen',
      dinner: 'Abendessen',
      snack: 'Snack'
    };
    return mealNames[meal as keyof typeof mealNames] || meal;
  };

  const getMealIcon = (meal: string): string => {
    const mealIcons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return mealIcons[meal as keyof typeof mealIcons] || '🍽️';
  };

  const handleSaveProtein = (proteinEntry: ProteinEntry) => {
    storageManager.saveProteinEntry(proteinEntry);
    loadNutritionData();
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Möchtest du diesen Eintrag wirklich löschen?')) {
      storageManager.deleteProteinEntry(id);
      loadNutritionData();
    }
  };

  const todayProtein = getTodayProtein();
  const progressPercentage = (todayProtein / nutritionGoal.dailyProtein) * 100;
  const remainingProtein = Math.max(0, nutritionGoal.dailyProtein - todayProtein);

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0 pb-20 md:pb-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Ernährung 🍽️
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Verfolge deine tägliche Eiweißzufuhr
        </p>
      </div>

      {/* Täglicher Fortschritt */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Heute
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ziel: {nutritionGoal.dailyProtein}g Eiweiß
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            title="Eiweiß hinzufügen"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Fortschrittsbalken */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {todayProtein.toFixed(1)}g
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {remainingProtein > 0 ? `${remainingProtein.toFixed(1)}g übrig` : 'Ziel erreicht! 🎉'}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
          
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {progressPercentage.toFixed(1)}% des Tagesziels erreicht
          </div>
        </div>
      </div>

      {/* Mahlzeiten-Übersicht */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => {
          const mealProtein = getProteinByMeal(meal);
          return (
            <div key={meal} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
              <div className="text-2xl mb-2">{getMealIcon(meal)}</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {getMealName(meal)}
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {mealProtein.toFixed(1)}g
              </div>
            </div>
          );
        })}
      </div>

      {/* Heutige Einträge */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Heutige Einträge
          </h3>
        </div>
        
        <div className="p-4">
          {proteinEntries.filter(entry => 
            entry.date.toDateString() === new Date().toDateString()
          ).length > 0 ? (
            <div className="space-y-3">
              {proteinEntries
                .filter(entry => entry.date.toDateString() === new Date().toDateString())
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-lg flex-shrink-0">{getMealIcon(entry.meal)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {entry.food}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {getMealName(entry.meal)} • {entry.date.toLocaleTimeString('de-DE', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-green-600 dark:text-green-400 text-sm md:text-base">
                        {entry.protein.toFixed(1)}g
                      </span>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Löschen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Noch keine Einträge für heute
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Ersten Eintrag hinzufügen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Protein Input Modal */}
      <ProteinInputModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveProtein}
      />
    </div>
  );
};

export default Nutrition;

