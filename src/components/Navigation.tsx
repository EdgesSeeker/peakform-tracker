import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, TrendingUp, Zap, Activity, Clock, BookOpen } from 'lucide-react';
import SettingsMenu from './SettingsMenu';
import { TrainingSession, UserStats, QuickCheck } from '../types';
import ThemeToggle from './ThemeToggle';

interface NavigationProps {
  sessions?: TrainingSession[];
  userStats?: UserStats;
  quickCheck?: QuickCheck;
  onDataUpdated?: (sessions: TrainingSession[], userStats: UserStats, quickCheck: QuickCheck) => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  sessions = [], 
  userStats, 
  quickCheck, 
  onDataUpdated 
}) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/today', icon: Clock, label: 'Heute' },
    { path: '/calendar', icon: Calendar, label: 'Kalender' },
    { path: '/progress', icon: TrendingUp, label: 'Fortschritt' },
    { path: '/strava', icon: Activity, label: 'Strava' },
  ];

  const secondaryItems = [
    { path: '/log', icon: BookOpen, label: 'Log' },
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
                <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Training Tracker</div>
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

      {/* Bottom Navigation für Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 transition-colors duration-200">
        <div className="flex justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => (
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

      {/* Desktop Navigation (in Sidebar oder Header) */}
      <nav className="hidden md:block bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 py-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-primary-500 text-white font-semibold shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={16} />
                <span className="font-medium text-sm">{label}</span>
              </Link>
            ))}
            
            {/* Secondary Items Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                <BookOpen size={16} />
                <span className="font-medium text-sm">Mehr</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {secondaryItems.map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Icon size={16} />
                    <span className="text-sm">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
