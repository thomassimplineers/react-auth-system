import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useFplData } from '../../hooks/useFplData';

export function FplOverview() {
  const { gameweekData, teamData, loading, error, refetch } = useFplData();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} retry={refetch} />;
  if (!gameweekData || !teamData) return null;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Gameweek {gameweekData.current.name}
      </h2>
      
      <div className="mb-6">
        <p className="text-gray-600">
          Average Score: {gameweekData.current.average_entry_score}
        </p>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Teams</h3>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {teamData.allTeams.map(team => (
          <li 
            key={team.id}
            className="p-3 bg-white shadow rounded hover:shadow-md transition-shadow"
          >
            {team.name}
          </li>
        ))}
      </ul>
    </div>
  );
} 