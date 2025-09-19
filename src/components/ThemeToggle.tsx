import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center gap-2 p-2 rounded-lg transition-all duration-200
        bg-gray-100 hover:bg-gray-200 text-gray-700
        dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200
        ${className}
      `}
      title={`Zu ${theme === 'light' ? 'Dark' : 'Light'} Mode wechseln`}
      aria-label={`Zu ${theme === 'light' ? 'Dark' : 'Light'} Mode wechseln`}
    >
      {theme === 'light' ? (
        <>
          <Moon size={18} />
          {showLabel && <span className="text-sm font-medium">Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun size={18} />
          {showLabel && <span className="text-sm font-medium">Light Mode</span>}
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
