import React, { useState } from 'react';
import { TrainingSession } from '../types';
import { Plus, Save, X, Dumbbell, Heart, Waves, Flower, Clock, MapPin, Zap } from 'lucide-react';

interface AddTrainingProps {
  onAddTraining: (training: TrainingSession) => void;
}

const AddTraining: React.FC<AddTrainingProps> = ({ onAddTraining }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'strength' as 'strength' | 'cardio' | 'swimming' | 'yoga',
    title: '',
    description: '',
    duration: 60,
    distance: 0,
    notes: '',
    completed: true
  });

  const trainingTypes = [
    { value: 'strength', label: 'Krafttraining', icon: Dumbbell, color: 'text-red-600' },
    { value: 'cardio', label: 'Ausdauer', icon: Heart, color: 'text-blue-600' },
    { value: 'swimming', label: 'Schwimmen', icon: Waves, color: 'text-cyan-600' },
    { value: 'yoga', label: 'Yoga', icon: Flower, color: 'text-green-600' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Bitte gib einen Titel ein!');
      return;
    }

    const newTraining: TrainingSession = {
      id: `manual-${Date.now()}`,
      type: formData.type,
      title: formData.title,
      description: formData.description || `${formData.type === 'strength' ? 'Krafttraining' : formData.type === 'cardio' ? 'Ausdauertraining' : formData.type === 'swimming' ? 'Schwimmtraining' : 'Yoga-Session'}`,
      duration: formData.duration,
      distance: formData.distance > 0 ? formData.distance : undefined,
      notes: formData.notes || undefined,
      completed: formData.completed,
      date: new Date(),
      week: 1,
      day: new Date().getDay() || 7
    };

    onAddTraining(newTraining);
    
    // Form zurücksetzen
    setFormData({
      type: 'strength',
      title: '',
      description: '',
      duration: 60,
      distance: 0,
      notes: '',
      completed: true
    });
    
    setShowForm(false);
    alert('Training erfolgreich hinzugefügt! 🎉');
  };

  const selectedType = trainingTypes.find(t => t.value === formData.type);
  const Icon = selectedType?.icon || Dumbbell;

  if (!showForm) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="text-primary-500 mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <Plus size={32} />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Training hinzufügen
          </h3>
          <p className="text-gray-600 mb-8 max-w-sm mx-auto">
            Füge ein abgeschlossenes Training zu deiner Historie hinzu und sammle Punkte
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="w-full max-w-xs mx-auto bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            Neues Training hinzufügen
          </button>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Krafttraining</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Ausdauer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>Schwimmen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Yoga</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-gray-100 rounded-lg ${selectedType?.color}`}>
            <Icon size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Training hinzufügen
          </h3>
        </div>
        <button
          onClick={() => setShowForm(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Training Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Art des Trainings
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trainingTypes.map((type) => {
              const TypeIcon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                  className={`p-3 border rounded-lg transition-all ${
                    formData.type === type.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <TypeIcon size={20} className="mx-auto mb-1" />
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titel *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="z.B. Brust/Trizeps Training"
            required
          />
        </div>

        {/* Duration and Distance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} className="inline mr-1" />
              Dauer (Minuten) *
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              min="1"
              required
            />
          </div>

          {(formData.type === 'cardio' || formData.type === 'swimming') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-1" />
                Distanz (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.distance}
                onChange={(e) => setFormData(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                min="0"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beschreibung
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Kurze Beschreibung des Trainings"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notizen
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={3}
            placeholder="Wie war das Training? Besonderheiten?"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="btn-secondary flex-1"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className="btn-success flex-1"
          >
            <Save size={18} />
            Training hinzufügen
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTraining;
