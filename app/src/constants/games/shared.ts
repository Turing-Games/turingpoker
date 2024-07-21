import { AUTO_START } from "@tg/poker"
import { TABLE_STATE_VERSION } from "@tg/shared"

export const GAMES = [
  { label: 'Poker', value: 'poker' },
  { label: 'Kuhn', value: 'kuhn' }
]

export const MODAL_STYLES = {
  overlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  content: {
    margin: 'auto',
    width: '100%',
    maxWidth: 400,
    bottom: 'unset',
    top: 'unset',
    overflow: 'visible'
  }
}

export const DEFAULT_CLIENT_STATE = {
  isConnected: false,
  serverState: null,
  socket: null,
  lastServerState: null,
  playerId: null,
  updateLog: [],
  gameType: ''
}