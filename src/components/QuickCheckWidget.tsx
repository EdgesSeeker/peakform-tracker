import React from 'react';
import { QuickCheck } from '../types';
import { Moon, Apple, Brain } from 'lucide-react';

interface QuickCheckWidgetProps {
  quickCheck: QuickCheck;
  onUpdate: (field: keyof Omit<QuickCheck, 'date'>, value: 1 | 2 | 3 | 4 | 5) => void;
}

const QuickCheckWidget: React.FC<QuickCheckWidgetProps> = ({ quickCheck, onUpdate }) => {
  const checkItems = [
    {
      key: 'sleep' as const,
      icon: Moon,
      label: 'Schlaf',
      value: quickCheck.sleep
    },
    {
      key: 'nutrition' as const,
      icon: Apple,
      label: 'Ernährung',
      value: quickCheck.nutrition
    },
    {
      key: 'stress' as const,
      icon: Brain,
      label: 'Stress-Level',
      value: quickCheck.stress
    }
  ];

  const renderRatingButtons = (currentValue: number, onChange: (value: 1 | 2 | 3 | 4 | 5) => void) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => onChange(rating as 1 | 2 | 3 | 4 | 5)}
            className={`quick-check-button quick-check-${rating} ${
              currentValue === rating ? 'ring-2 ring-offset-2' : ''
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900">Quick-Check</h2>
        <span className="text-sm text-gray-500">
          Wie fühlst du dich heute?
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {checkItems.map((item) => (
          <div key={item.key} className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <item.icon className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <h3 className="font-medium text-gray-900 mb-3">{item.label}</h3>
            {renderRatingButtons(item.value, (value) => onUpdate(item.key, value))}
            <div className="mt-2 text-xs text-gray-500">
              {item.value === 1 && 'Sehr schlecht'}
              {item.value === 2 && 'Schlecht'}
              {item.value === 3 && 'Okay'}
              {item.value === 4 && 'Gut'}
              {item.value === 5 && 'Sehr gut'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickCheckWidget;
