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
  gameType: '',
  socket: null
}

export const GAME_STATUS_FILTERS = [
  // { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Final', value: 'final' },
]

export const GAME_TYPE_FILTERS = [
  { label: 'All Games', value: '' },
  ...GAMES
]

export const DEFAULT_GAME_FILTERS = {
  gameStatus: 'active',
}