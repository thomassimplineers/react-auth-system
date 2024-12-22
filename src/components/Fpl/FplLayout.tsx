import React from 'react';
import { Outlet } from 'react-router-dom';
import FplNavigation from './FplNavigation';

const FplLayout: React.FC = () => {
  return (
    <div>
      <FplNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
};

export default FplLayout; 