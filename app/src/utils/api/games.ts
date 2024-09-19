import { PARTYKIT_URL, SERVER_URL } from "@app/constants/partykit"
import { buildUrl } from "../url";
import PartySocket from "partysocket";
import { SINGLETON_ROOM_ID } from "@app/constants/partykit";

type GAME_CONFIG = {
  id?: string,
  minPlayers: number,
  maxPlayers: number,
  autoStart?: boolean
}

const partyUrl = `${PARTYKIT_URL}/parties/tables/${SINGLETON_ROOM_ID}`;

function recordWinner(gameId: string, winnerId: string) {

  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(`/api/v1/games/${gameId}`, {
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
function deleteGame(gameId: string, gameType: string) {
  return new Promise(async (resolve, reject) => {
    try {
      // await fetch(`${PARTYKIT_URL}/parties/${gameType}/${gameId}`, {
      //   method: "DELETE",
      //   body: JSON.stringify({
      //     action: "delete",
      //     id: gameId
      //   })
      // })
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
function createGame(
  gameConfig: GAME_CONFIG,
  gameType: string
) {
  const uuid = crypto.randomUUID()

  return new Promise(async (resolve, reject) => {
    try {
      // d1
      const game = await fetch('/api/v1/games', {
        method: 'POST',
        body: JSON.stringify({
          gameType,
          ...gameConfig
        })
      });
      resolve(true)
    } catch (e) {
      throw new Error(e)
    }
  })
}

function listGames(url: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(url)
      const rooms = await res.json()
      resolve(rooms)
    } catch (e) {
      reject(e)
    }
  })
}

function getGame(gameId: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(`/api/v1/games/${gameId}`)
      const game = await res.json()
      resolve(game)
    } catch (e) {
      reject(e)
    }
  })
}

export const games = {
  recordWinner,
  get: getGame,
  delete: deleteGame,
  create: createGame,
  list: listGames
}