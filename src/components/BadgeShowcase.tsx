import React from 'react';
import { Badge } from '../types';
import { Award } from 'lucide-react';

interface BadgeShowcaseProps {
  badges: Badge[];
}

const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({ badges }) => {
  const earnedBadges = badges.filter(badge => badge.earned);
  const unearnedBadges = badges.filter(badge => !badge.earned).slice(0, 3); // Show next 3 to earn

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Achievements
        </h2>
        <span className="badge badge-primary">
          {earnedBadges.length}/{badges.length}
        </span>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Errungene Badges 🏆
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {earnedBadges.map((badge) => (
              <div 
                key={badge.id}
                className="flex items-center gap-3 p-3 bg-success-50 border border-success-200 rounded-lg animate-bounce-in"
              >
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <div className="font-medium text-success-800 text-sm">
                    {badge.name}
                  </div>
                  <div className="text-xs text-success-600">
                    {badge.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Badges to Earn */}
      {unearnedBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Nächste Ziele 🎯
          </h3>
          <div className="space-y-2">
            {unearnedBadges.map((badge) => (
              <div 
                key={badge.id}
                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-60"
              >
                <span className="text-2xl grayscale">{badge.icon}</span>
                <div>
                  <div className="font-medium text-gray-700 text-sm">
                    {badge.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {badge.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {earnedBadges.length === 0 && (
        <div className="text-center py-6">
          <div className="text-gray-400 mb-2">
            <Award size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600 text-sm">
            Starte dein Training, um deine ersten Badges zu verdienen!
          </p>
        </div>
      )}
    </div>
  );
};

export default BadgeShowcase;
