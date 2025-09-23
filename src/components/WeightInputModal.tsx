import React, { useState, useEffect } from 'react';
import { WeightEntry } from '../types';
import { X, Save, Scale, Target } from 'lucide-react';

interface WeightInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (weightEntry: WeightEntry) => void;
  currentWeight?: number;
  targetWeight?: number;
}

const WeightInputModal: React.FC<WeightInputModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentWeight,
  targetWeight = 70
}) => {
  const [weight, setWeight] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      setSelectedDate(today.toISOString().split('T')[0]);
      setWeight(currentWeight ? currentWeight.toString() : '');
      setNotes('');
    }
  }, [isOpen, currentWeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      alert('Bitte gib ein gültiges Gewicht ein');
      return;
    }

    const weightEntry: WeightEntry = {
      id: `weight-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      weight: weightValue,
      date: new Date(selectedDate),
      notes: notes.trim() || undefined
    };

    onSave(weightEntry);
    onClose();
  };

  if (!isOpen) return null;

  const progress = currentWeight ? ((currentWeight - targetWeight) / (currentWeight - targetWeight)) * 100 : 0;
  const remaining = currentWeight ? (currentWeight - targetWeight) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Gewicht eintragen
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ziel: {targetWeight}kg
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Gewichts-Eingabe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Aktuelles Gewicht (kg)
            </label>
            <div className="relative">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                step="0.1"
                min="30"
                max="200"
                className="w-full px-4 py-3 text-2xl font-bold text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="70.0"
                required
                autoFocus
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                kg
              </span>
            </div>
          </div>

          {/* Datum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Datum
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          {/* Notizen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notizen (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              placeholder="z.B. nach dem Training, morgens nüchtern..."
            />
          </div>

          {/* Fortschritt anzeigen */}
          {currentWeight && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fortschritt zum Ziel
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {remaining > 0 ? `${remaining.toFixed(1)}kg übrig` : 'Ziel erreicht! 🎉'}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, (currentWeight - targetWeight) / currentWeight * 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeightInputModal;

