import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface Player {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  total_points: number;
  now_cost: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  saves?: number;
  is_captain: boolean;
  is_vice_captain: boolean;
}

interface TeamSquadProps {
  squad: {
    Goalkeepers: Player[];
    Defenders: Player[];
    Midfielders: Player[];
    Forwards: Player[];
  };
}

const TeamSquad: React.FC<TeamSquadProps> = ({ squad }) => {
  const renderPlayer = (player: Player) => (
    <div key={player.id} className="flex justify-between items-center p-2 hover:bg-gray-50">
      <div className="flex items-center space-x-2">
        <span className="font-medium">
          {player.web_name}
          {player.is_captain && <span className="ml-1 text-yellow-500">(C)</span>}
          {player.is_vice_captain && <span className="ml-1 text-gray-500">(V)</span>}
        </span>
      </div>
      <div className="text-sm text-gray-500 space-x-4">
        <span>{player.total_points} pts</span>
        <span>£{(player.now_cost / 10).toFixed(1)}m</span>
        {player.element_type === 1 ? (
          <span>{player.saves} saves</span>
        ) : (
          <span>{player.goals_scored}G {player.assists}A</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {Object.entries(squad).map(([position, players]) => (
        <div key={position}>
          <h3 className="text-lg font-medium mb-2">{position}</h3>
          <div className="bg-white rounded-lg shadow divide-y">
            {players.map(renderPlayer)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamSquad; 