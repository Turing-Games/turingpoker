import { AUTO_START } from "@tg/poker"

export const DEFAULT_TABLE_STATE = {
  queuedPlayers: [],
  spectatorPlayers: [],
  inGamePlayers: [],
  config: {
    dealerPosition: 0,
    bigBlind: 1,
    maxPlayers: 2,
    smallBlind: 1,
    autoStart: AUTO_START,
    minPlayers: 2
  },
  gameState: null,
  gameType: '',
  gamePhase: 'pending',
}

export const CONFIGURABLE_PROPERTIES = [
  { label: 'Auto Start', value: 'auto_start', type: 'checkbox', default: AUTO_START }
] as any