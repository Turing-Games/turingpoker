export const isBettingRoundComplete = (bettingRound, players = []) => {
  const playerRounds = players.map(player => player.completedRound)
  // sum of rounds
  const roundSum = playerRounds.reduce((acc, val) => acc + val, 0)
  // checks if all players have completed betting roung
  return (roundSum / players.length) === bettingRound
}

export const getPlayersWithRemainingCall = (players = []) => {
  return []
}