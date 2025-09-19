import React from 'react';
import { Badge } from '../types';
import { Award, Lock } from 'lucide-react';

interface BadgeGalleryProps {
  badges: Badge[];
}

const BadgeGallery: React.FC<BadgeGalleryProps> = ({ badges }) => {
  const earnedBadges = badges.filter(badge => badge.earned);
  const unearnedBadges = badges.filter(badge => !badge.earned);

  const categoryColors = {
    consistency: 'from-green-400 to-green-600',
    distance: 'from-blue-400 to-blue-600',
    strength: 'from-red-400 to-red-600',
    special: 'from-purple-400 to-purple-600'
  };

  const categoryNames = {
    consistency: 'Beständigkeit',
    distance: 'Distanz',
    strength: 'Kraft',
    special: 'Besonders'
  };

  const groupedBadges = badges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Badge-Sammlung
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {earnedBadges.length} von {badges.length} Badges erreicht
        </p>
        <div className="mt-4 max-w-md mx-auto">
          <div className="progress-bar">
            <div 
              className="progress-fill bg-yellow-500"
              style={{ width: `${(earnedBadges.length / badges.length) * 100}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {Math.round((earnedBadges.length / badges.length) * 100)}% abgeschlossen
          </div>
        </div>
      </div>

      {/* Badge Categories */}
      {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${categoryColors[category as keyof typeof categoryColors]}`} />
            {categoryNames[category as keyof typeof categoryNames]}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-500">
              ({categoryBadges.filter(b => b.earned).length}/{categoryBadges.length})
            </span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryBadges.map((badge) => (
              <div
                key={badge.id}
                className={`card transition-all duration-300 ${
                  badge.earned
                    ? 'bg-gradient-to-br from-white to-yellow-50 border-yellow-200 shadow-lg animate-bounce-in'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="text-center">
                  {/* Badge Icon */}
                  <div className={`text-6xl mb-4 ${badge.earned ? '' : 'grayscale'}`}>
                    {badge.earned ? badge.icon : <Lock className="w-16 h-16 text-gray-400 mx-auto" />}
                  </div>
                  
                  {/* Badge Info */}
                  <h4 className={`font-semibold mb-2 ${
                    badge.earned ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {badge.name}
                  </h4>
                  
                  <p className={`text-sm mb-4 ${
                    badge.earned ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'
                  }`}>
                    {badge.description}
                  </p>
                  
                  {/* Status */}
                  <div className="flex items-center justify-center">
                    {badge.earned ? (
                      <div className="flex flex-col items-center">
                        <div className="badge badge-success mb-2">
                          ✓ Erreicht
                        </div>
                        {badge.earnedDate && (
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {formatDate(badge.earnedDate)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="badge badge-secondary">
                        🔒 Gesperrt
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Motivational Section */}
      {unearnedBadges.length > 0 && (
        <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🎯 Nächste Herausforderungen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {unearnedBadges.slice(0, 3).map((badge) => (
              <div key={badge.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl mb-2">{badge.icon}</div>
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{badge.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{badge.description}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Bleib dran und sammle alle Badges! 🏆
          </p>
        </div>
      )}

      {earnedBadges.length === badges.length && (
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold text-yellow-800 mb-2">
            Alle Badges erreicht!
          </h3>
          <p className="text-yellow-700">
            Fantastisch! Du hast alle verfügbaren Badges gesammelt. Du bist ein wahrer PeakForm Champion! 🎉
          </p>
        </div>
      )}
    </div>
  );
};

export default BadgeGallery;
