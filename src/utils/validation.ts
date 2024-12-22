export const validateFplTeamId = (id: string): boolean => {
  // FPL team IDs är numeriska och vanligtvis 1-7 siffror
  const fplIdPattern = /^\d{1,7}$/;
  return fplIdPattern.test(id);
}; 