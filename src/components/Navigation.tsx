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
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-primary-500 text-white p-2 rounded-lg">
              <Zap size={20} />
            </div>
            <span className="font-bold text-xl text-gray-900">PeakForm</span>
          </div>
          
          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isActive(path)
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:block">{label}</span>
              </Link>
            ))}
            
            {/* Settings Menu */}
            <SettingsMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
