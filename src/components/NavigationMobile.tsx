import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, Utensils, Dumbbell } from 'lucide-react';
import SettingsMenu from './SettingsMenu';
import { TrainingSession, UserStats, QuickCheck } from '../types';
import ThemeToggle from './ThemeToggle';

interface NavigationMobileProps {
  sessions?: TrainingSession[];
  userStats?: UserStats;
  quickCheck?: QuickCheck;
  onDataUpdated?: (sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck) => void;
}

const NavigationMobile: React.FC<NavigationMobileProps> = ({ 
  sessions = [], 
  userStats, 
  quickCheck, 
  onDataUpdated 
}) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  // Mobile App Navigation: Dashboard, Quick Workout und Ernährung
  const mainNavItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/quick-workout', icon: Dumbbell, label: 'Quick Workout' },
    { path: '/nutrition', icon: Utensils, label: 'Ernährung' },
  ];

  return (
    <>
      {/* Kompakter Header oben */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-2 rounded-lg shadow">
                <Zap size={16} />
              </div>
              <div>
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">PeakForm</span>
                <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Mobile App</div>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SettingsMenu 
                sessions={sessions} 
                userStats={userStats}
                quickCheck={quickCheck}
                onDataUpdated={onDataUpdated}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation für Mobile - Nur Hauptmenü */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30 transition-colors duration-200">
        <div className="flex justify-around py-2">
          {mainNavItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive(path)
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Icon size={20} className={isActive(path) ? 'text-primary-600 dark:text-primary-400' : ''} />
              <span className={`text-xs font-medium text-center leading-tight ${
                isActive(path) ? 'text-primary-600 dark:text-primary-400 font-semibold' : ''
              }`}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default NavigationMobile;
