import * as Poker from './game-logic/poker';
import { IPartyServerState, IPlayer } from './poker';

export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Card = { rank: Rank, suit: Suit };

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
    reason: 'showdown' | 'fold' | 'system' | 'final';
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
    hand: [Poker.Card, Poker.Card] | null | [Poker.Card];
    inGamePlayers: IPlayer[];
    winner: IPlayer;
    spectatorPlayers: IPlayer[];
    queuedPlayers: IPlayer[];
    state: IPartyServerState;
    clientId: string;
    lastUpdates: ServerUpdateMessage[]
    config: Poker.IPokerConfig
    gamePhase: string
}

export type TableState = {
    id: string;
    queuedPlayers: IPlayer[];
    spectatorPlayers: IPlayer[];
    inGamePlayers: IPlayer[];
    winner: IPlayer;
    config: Poker.IPokerConfig;
    gameState: Poker.IPokerSharedState | null;
    gameType: string;
    tournamentId?: string;
    gamePhase: string
    version: number;
}

export type TournamentState = {
    id: string;
    players: IPlayer[];
    eliminatedPlayers: IPlayer[];
    winner: IPlayer | null;
    // config: Poker.IPokerConfig;
    gameType: string;
}

export interface IPlayer {
    playerId: string;
    isBot?: boolean;
}

export interface GamePhase {
    gamePhase: 'pending' | 'active' | 'final'
}