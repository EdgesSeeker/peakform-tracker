import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, TrendingUp, Zap, Activity, Clock, BookOpen } from 'lucide-react';
import SettingsMenu from './SettingsMenu';
// import { TrainingSession } from '../types';
import ThemeToggle from './ThemeToggle';

interface NavigationProps {
  sessions?: any[];
}

const Navigation: React.FC<NavigationProps> = ({ sessions = [] }) => {
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
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-2 md:p-3 rounded-xl shadow-lg">
              <Zap size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <span className="font-bold text-xl md:text-2xl text-gray-900 dark:text-gray-100">PeakForm</span>
              <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Hybrid Training Tracker</div>
            </div>
          </div>
          
          {/* Navigation Items - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-primary-500 text-white font-semibold shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{label}</span>
              </Link>
            ))}
            
            {/* Secondary Items Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                <BookOpen size={18} />
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
            
            {/* Theme Toggle & Settings Menu */}
            <ThemeToggle />
            <SettingsMenu sessions={sessions} />
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <SettingsMenu sessions={sessions} />
          </div>
        </div>

        {/* Mobile Navigation Menu - 5 Icons mit Namen darunter */}
        <div className="md:hidden pb-3">
          <div className="flex justify-between px-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 flex-1 mx-0.5 ${
                  isActive(path)
                    ? 'bg-primary-500 text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>
          
          {/* Secondary Items für Mobile */}
          {secondaryItems.length > 0 && (
            <div className="mt-2 px-2">
              <div className="flex justify-center">
                {secondaryItems.map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive(path)
                        ? 'bg-primary-500 text-white font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
