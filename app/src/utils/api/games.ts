import { PARTYKIT_URL } from "@app/constants/partykit"
import { SINGLETON_ROOM_ID } from "@tg/tables";

const partyUrl = `${PARTYKIT_URL}/parties/tables/${SINGLETON_ROOM_ID}`;

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

export function deleteGame(gameId: string) {
  console.log('deleting game', gameId)
  return new Promise(async (resolve, reject) => {
    try {
      await fetch(partyUrl, {
        method: "DELETE",
        body: JSON.stringify({
          action: "delete",
          id: gameId
        })
      })
      resolve(gameId)
    } catch (e) {
      console.log({ e })
      reject(e)
    }
  })
}