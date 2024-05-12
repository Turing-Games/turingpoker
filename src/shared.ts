import * as Poker from './game-logic/poker';
import { IPartyServerState, IPlayer } from './server';

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
} | {
    type: 'leave-game'
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
}

export type ServerStateMessage = {
    gameState: Poker.IPokerSharedState | null;
    hand: [Poker.Card, Poker.Card] | null;
    inGamePlayers: IPlayer[];
    spectatorPlayers: IPlayer[];
    queuedPlayers: IPlayer[];
    winners: string[];
    state: IPartyServerState;
    clientId: string;
    lastUpdates: ServerUpdateMessage[]
    config: Poker.IPokerConfig
}