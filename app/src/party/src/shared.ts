import * as Poker from './game-logic/poker';
import { IPartyServerState, IPlayer } from './poker';

export type ClientMessage = {
    type: 'action',
    action: Poker.Action
} | {
    type: 'start-game'
} | {
    type: 'spectate'
} | {
    type: 'join-game'
} | {
    type: 'reset-game'
}
export type ServerUpdateMessage = {
    type: 'game-ended';
    payouts: { [playerId: string]: number };
    reason: 'showdown' | 'fold' | 'system';
} | {
    type: 'action',
    action: Poker.Action
    player: IPlayer
} | {
    type: 'player-joined',
    player: IPlayer
} | {
    type: 'player-left',
    player: IPlayer

} | {
    type: 'game-started',
    players: IPlayer[]
} | {
    type: 'engine-log',
    message: string
}

export type ServerStateMessage = {
    gameState: Poker.IPokerSharedState | null;
    hand: [Poker.Card, Poker.Card] | null;
    inGamePlayers: IPlayer[];
    spectatorPlayers: IPlayer[];
    queuedPlayers: IPlayer[];
    state: IPartyServerState;
    clientId: string;
    lastUpdates: ServerUpdateMessage[]
    config: Poker.IPokerConfig
}

export type TableState = {
    id: string;
    queuedPlayers: IPlayer[];
    spectatorPlayers: IPlayer[];
    inGamePlayers: IPlayer[];
    config: Poker.IPokerConfig;
    gameState: Poker.IPokerSharedState | null;
    gameType: string;
    // bump this when making breaking changes so the client doesn't try to render it
    version: number;
}
export const TABLE_STATE_VERSION = 0;
