import React from 'react';
import { EventType } from '../../types/feed';

interface FeedFiltersProps {
  activeFilter: EventType | null;
  onFilterChange: (type: EventType | null) => void;
  disabled?: boolean;
}

const FeedFilters: React.FC<FeedFiltersProps> = ({ 
  activeFilter, 
  onFilterChange,
  disabled = false 
}) => {
  const filters: { type: EventType; label: string; color: string }[] = [
    { type: 'CHAT', label: 'Chat', color: 'bg-blue-500' },
    { type: 'FPL', label: 'Fantasy PL', color: 'bg-green-500' },
    { type: 'PROFILE', label: 'Profiler', color: 'bg-purple-500' }
  ];

  return (
    <div className="flex gap-2 p-4 border-b">
      <button
        onClick={() => onFilterChange(null)}
        disabled={disabled}
        className={`px-4 py-2 rounded-full transition-colors ${
          activeFilter === null 
            ? 'bg-gray-800 text-white' 
            : 'bg-gray-100 hover:bg-gray-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        Alla
      </button>
      {filters.map(({ type, label, color }) => (
        <button
          key={type}
          onClick={() => onFilterChange(type)}
          disabled={disabled}
          className={`px-4 py-2 rounded-full transition-colors ${
            activeFilter === type 
              ? `${color} text-white` 
              : 'bg-gray-100 hover:bg-gray-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default FeedFilters; 