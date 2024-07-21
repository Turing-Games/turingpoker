import { AUTO_START } from "@tg/poker";
import { TABLE_STATE_VERSION } from "@tg/shared";

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
  gameType: '',
  version: TABLE_STATE_VERSION
}

export const CONFIGURABLE_PROPERTIES = [
  { label: 'Dealer Position', key: 'dealerPosition', type: 'number', default: 0 },
  { label: 'Big Blind', key: 'bigBlind', type: 'number', default: 1 },
  { label: 'Small Blind', key: 'smallBlind', type: 'number', default: 1 },
  { label: 'Max Players', key: 'maxPlayers', type: 'number', default: 10 },
  { label: 'Min Players', key: 'minPlayers', type: 'number', default: 2 },
  { label: 'Auto Start', key: 'autoStart', type: 'checkbox', default: AUTO_START }
] as any