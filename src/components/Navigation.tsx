import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, TrendingUp, Zap, Activity, Clock, BookOpen } from 'lucide-react';
import SettingsMenu from './SettingsMenu';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/today', icon: Clock, label: 'Heute' },
    { path: '/log', icon: BookOpen, label: 'Log' },
    { path: '/calendar', icon: Calendar, label: 'Kalender' },
    { path: '/progress', icon: TrendingUp, label: 'Fortschritt' },
    { path: '/strava', icon: Activity, label: 'Strava' },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-3 rounded-xl shadow-lg">
              <Zap size={24} />
            </div>
            <div>
              <span className="font-bold text-2xl text-gray-900">PeakForm</span>
              <div className="text-xs text-gray-500 hidden sm:block">Hybrid Training Tracker</div>
            </div>
          </div>
          
          {/* Navigation Items - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-primary-500 text-white font-semibold shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
            
            {/* Settings Menu */}
            <SettingsMenu />
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <SettingsMenu />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden pb-4">
          <div className="grid grid-cols-3 gap-2">
            {navItems.slice(0, 6).map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-primary-500 text-white font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
