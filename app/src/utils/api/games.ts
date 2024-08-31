import { PARTYKIT_URL, SERVER_URL } from "@app/constants/partykit"
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

// deleteGame deletes from partykit storage and d1
export function deleteGame(gameId: string) {
  console.log('deleting game', gameId)
  return new Promise(async (resolve, reject) => {
    try {
      await fetch(partyUrl, {
        method: "POST",
        body: JSON.stringify({
          action: "delete",
          id: gameId
        })
      })
      await fetch(`/api/v1/games/${gameId}`, {
        method: 'DELETE',
      })
      resolve(gameId)
    } catch (e) {
      console.log({ e })
      reject(e)
    }
  })
}

// createGame creates a game in partykit storage and d1
export function createGame(gameConfig: any, gameType: string) {
  const uuid = crypto.randomUUID()
  console.log({
    gameType,
    ...gameConfig
  })
  return new Promise(async (resolve, reject) => {
    try {
      // d1
      await fetch('/api/v1/games', {
        method: 'POST',
        body: JSON.stringify({
          gameType,
          ...gameConfig
        })
      });
      // partykit
      await fetch(partyUrl, {
        method: "POST",
        body: JSON.stringify({
          id: uuid,
          tableState: {
            ...gameConfig,
            gameType,
            id: uuid,
          },
          action: "create",
        })
      });

      resolve(true)
    } catch (e) {
      reject(e)
    }
  })
}