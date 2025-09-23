import React, { useRef, useEffect } from 'react';
import { TrainingSession } from '../types';
import { Edit, Trash2, X } from 'lucide-react';

interface WorkoutActionMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  workout: TrainingSession | null;
  onClose: () => void;
  onEdit: (workout: TrainingSession) => void;
  onDelete: (workoutId: string) => void;
}

const WorkoutActionMenu: React.FC<WorkoutActionMenuProps> = ({
  isOpen,
  position,
  workout,
  onClose,
  onEdit,
  onDelete
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !workout) return null;

  const handleEdit = () => {
    onEdit(workout);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Möchtest du "${workout.title}" wirklich löschen?`)) {
      onDelete(workout.id);
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[200px]"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -10px)'
      }}
    >
      <div className="p-2">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-600 mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {workout.title}
          </span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="space-y-1">
          <button
            onClick={handleEdit}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <Edit size={16} className="text-blue-500" />
            Bearbeiten
          </button>
          
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors"
          >
            <Trash2 size={16} className="text-red-500" />
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutActionMenu;
