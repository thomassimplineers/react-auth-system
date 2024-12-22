export const validateFplTeamIdAgainstApi = async (teamId: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://fantasy.premierleague.com/api/entry/${teamId}/`);
    if (!response.ok) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error validating FPL team ID:', error);
    return false;
  }
}; 