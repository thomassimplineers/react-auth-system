import { useFplData } from '../../hooks/useFplData';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const FplDashboard: React.FC = () => {
  const { gameweekData, teamData, localLeaderboard, loading, error, refetch } = useFplData();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} retry={refetch} />;
  if (!gameweekData || !teamData) return null;

  return (
    <div className="space-y-8">
      {/* Current Gameweek Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          Gameweek {gameweekData.current.name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Average Score"
            value={gameweekData.current.average_entry_score}
            type="points"
          />
          <StatCard
            title="Highest Score"
            value={gameweekData.current.highest_scoring_entry}
            type="points"
          />
          <StatCard
            title="Status"
            value={gameweekData.current.finished ? 'Completed' : 'In Progress'}
            type="status"
          />
        </div>
      </div>

      {/* Local Leaderboard */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Kokillvägen League</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GW Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {localLeaderboard.map((entry, index) => (
                <tr key={entry.id} className={index === 0 ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.team_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.manager_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.gameweek_points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.total_points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Next Gameweek */}
      {gameweekData.next && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Next Gameweek</h2>
          <div className="text-gray-600">
            <p>Deadline: {new Date(gameweekData.next.deadline_time).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
interface StatCardProps {
  title: string;
  value: number | string;
  type: 'points' | 'status';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, type }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`mt-2 ${
        type === 'points' 
          ? 'text-2xl font-bold text-gray-900' 
          : 'text-lg font-medium text-gray-700'
      }`}>
        {type === 'points' ? value.toLocaleString() : value}
      </p>
    </div>
  );
};

export default FplDashboard; 