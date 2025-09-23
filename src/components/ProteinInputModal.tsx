import React, { useState, useEffect } from 'react';
import { ProteinEntry } from '../types';
import { X, Save, Utensils, Clock } from 'lucide-react';

interface ProteinInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (proteinEntry: ProteinEntry) => void;
  editingEntry?: ProteinEntry | null;
}

const ProteinInputModal: React.FC<ProteinInputModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEntry = null
}) => {
  const [formData, setFormData] = useState({
    food: '',
    protein: '',
    meal: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    notes: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const time = now.toTimeString().slice(0, 5);
      
      if (editingEntry) {
        setFormData({
          food: editingEntry.food,
          protein: editingEntry.protein.toString(),
          meal: editingEntry.meal,
          notes: editingEntry.notes || '',
          date: editingEntry.date.toISOString().split('T')[0],
          time: editingEntry.date.toTimeString().slice(0, 5)
        });
      } else {
        setFormData({
          food: '',
          protein: '',
          meal: 'breakfast',
          notes: '',
          date: today,
          time: time
        });
      }
    }
  }, [isOpen, editingEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const proteinValue = parseFloat(formData.protein);
    if (isNaN(proteinValue) || proteinValue <= 0) {
      alert('Bitte gib eine gültige Eiweißmenge ein');
      return;
    }

    if (!formData.food.trim()) {
      alert('Bitte gib das Lebensmittel an');
      return;
    }

    const entryDate = new Date(`${formData.date}T${formData.time}`);
    
    const proteinEntry: ProteinEntry = {
      id: editingEntry?.id || `protein-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      protein: proteinValue,
      food: formData.food.trim(),
      date: entryDate,
      meal: formData.meal,
      notes: formData.notes.trim() || undefined
    };

    onSave(proteinEntry);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Utensils className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {editingEntry ? 'Eiweiß bearbeiten' : 'Eiweiß hinzufügen'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verfolge deine Proteinzufuhr
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Lebensmittel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lebensmittel
            </label>
            <input
              type="text"
              name="food"
              value={formData.food}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              placeholder="z.B. Hähnchenbrust, Quark, Eier..."
              required
            />
          </div>

          {/* Eiweiß-Menge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Eiweiß (Gramm)
            </label>
            <div className="relative">
              <input
                type="number"
                name="protein"
                value={formData.protein}
                onChange={handleChange}
                step="0.1"
                min="0.1"
                max="200"
                className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="25.5"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                g
              </span>
            </div>
          </div>

          {/* Mahlzeit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mahlzeit
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, meal: meal as any }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.meal === meal
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{getMealIcon(meal)}</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {getMealName(meal)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Datum und Zeit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock size={16} className="inline mr-1" />
                Datum
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zeit
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
          </div>

          {/* Notizen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notizen (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              placeholder="z.B. mit Reis, gekocht, roh..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {editingEntry ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProteinInputModal;

