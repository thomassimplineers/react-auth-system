import React, { useEffect } from 'react';
import { checkFplUpdates } from '../../utils/fplUpdates';

// Intervall för att kolla FPL API (t.ex. var 5:e minut)
const FPL_CHECK_INTERVAL = 5 * 60 * 1000;

const FplEvents: React.FC = () => {
  useEffect(() => {
    // Initial check
    checkFplUpdates();

    // Sätt upp intervall för återkommande kontroller
    const interval = setInterval(checkFplUpdates, FPL_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return null; // Denna komponent behöver ingen UI
};

export default FplEvents;
