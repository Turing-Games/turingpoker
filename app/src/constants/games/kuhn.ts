import { AUTO_START } from "@tg/poker"

export const DEFAULT_TABLE_STATE = {
  queuedPlayers: [],
  spectatorPlayers: [],
  inGamePlayers: [],
  config: {
    dealerPosition: 0,
    bigBlind: 1,
    maxPlayers: 10,
    smallBlind: 1,
    autoStart: AUTO_START,
    minPlayers: 2
  },
  gameState: null,
  gameType: ''
}

export const CONFIGURABLE_PROPERTIES = [
  { label: 'Min Players', value: 'min_players', type: 'hidden', default: 2 },
  { label: 'Max Players', value: 'max_players', type: 'hidden', default: 2 },
  { label: 'Auto Start', value: 'auto_start', type: 'checkbox', default: AUTO_START }
] as any