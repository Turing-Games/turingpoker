/** isBettingRoundComplete
 * determines if round is complete, all players have called, checked, ord folded
 * @param {number} bettingRound 
 * @param {Array} players 
 * @returns 
 */
export const isBettingRoundComplete = (bettingRound, players = []) => {
  const playerRounds = players.map(player => player.completedRound)
  // sum of rounds
  const roundSum = playerRounds.reduce((acc, val) => acc + val, 0)
  // checks if all players have completed betting roung
  return (roundSum / players.length) === bettingRound
}

/** getPlayersWithRemainingCall
 * finds players with who have yet to call current
 * betting round, returns player indexes
 * @param {Array} players 
 * @returns []
 */
export const getPlayersWithRemainingCall = (players = []) => {
  return []
}