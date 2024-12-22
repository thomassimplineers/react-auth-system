import React from 'react';
import { Line } from 'react-chartjs-2';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface FplStatsProps {
  history: Array<{
    event: number;
    points: number;
    overall_rank: number;
  }>;
}

const FplStats: React.FC<FplStatsProps> = ({ history }) => {
  const chartData = {
    labels: history.map(h => `GW ${h.event}`),
    datasets: [
      {
        label: 'Points',
        data: history.map(h => h.points),
        borderColor: 'rgb(34, 197, 94)',
        tension: 0.1
      },
      {
        label: 'Rank',
        data: history.map(h => h.overall_rank),
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1,
        yAxisID: 'rank'
      }
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Season Progress</h3>
      <div className="h-64">
        <Line 
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              rank: {
                position: 'right',
                reverse: true
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default FplStats; 