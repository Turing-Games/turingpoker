export default function recordWinner(gameId: string, winnerId: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(`http://127.0.0.1:5173/api/v1/games/${gameId}`, {
        method: 'PUT',
        body: JSON.stringify({ winnerId }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      await res.json()
      resolve(true)
    } catch (e) {
      reject(e)
    }
  })
}