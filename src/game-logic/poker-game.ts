export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Card = { rank: Rank, suit: Suit };
export type Action = {
    type: 'raise'
    amount: number
} | {
    type: 'fold' | 'call'
}

export type PokerRound = 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';

export type PlayerID = string;

export interface IPokerPlayer {
    id: PlayerID;
    stack: number;
    folded: boolean;
    currentBet: number;
    lastRound: PokerRound | null;
}

export interface IPokerConfig {
    dealerPosition: number;
    smallBlind: number;
    bigBlind: number;
    maxPlayers: number;
}

export interface IPokerSharedState {
    dealerPosition: number;
    smallBlind: number;
    bigBlind: number;
    pot: number;
    targetBet: number;
    // counterclockwise order
    players: IPokerPlayer[];
    // so big blind is (dealerPosition+1)%players.length
    // small blind is (dealerPosition+2)%players.length
    round: PokerRound;
    deck: Card[];
}

export interface IPokerGame {
    state: IPokerSharedState;
    config: IPokerConfig;
    hands: Record<PlayerID, [Card, Card]>;
}

export type GameLog = string[];

function createDeck(): Card[] {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    return suits.flatMap(suit => ranks.map(rank => ({ suit, rank })));
}

function shuffleDeck(deck: Card[]): Card[] {
    const shuffledDeck = deck.slice();
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    return shuffledDeck;
}

function dealHands(players: PlayerID[], deck: Card[]): Record<PlayerID, [Card, Card]> {
    const hands: Record<PlayerID, [Card, Card]> = {};
    for (const player of players) {
        hands[player] = [deck.pop()!, deck.pop()!];
    }
    return hands;
}

export function createPokerGame(config: IPokerConfig, players: PlayerID[], stacks: number[]): IPokerGame {
    const deck = shuffleDeck(createDeck());
    const hands = dealHands(players, deck);
    const playerCompletedRound: Record<PlayerID, PokerRound> = {};
    const playerCurrentBet: Record<PlayerID, number> = {};
    for (const player of players) {
        playerCompletedRound[player] = 'pre-flop';
        playerCurrentBet[player] = 0;
    }

    const out: IPokerGame = {
        state: {
            pot: 0,
            players: players.map((id, i) => ({ lastRound: null, id, stack: stacks[i], folded: false, currentBet: 0 })),
            round: 'pre-flop',
            deck,
            targetBet: config.bigBlind,
            dealerPosition: config.dealerPosition,
            smallBlind: config.smallBlind,
            bigBlind: config.bigBlind
        },
        config,
        hands
    }
    out.state.players[(config.dealerPosition + 1) % players.length].currentBet = 
        Math.min(config.smallBlind, stacks[(config.dealerPosition + 1) % players.length]);
    out.state.players[(config.dealerPosition + 2) % players.length].currentBet = 
        Math.min(config.bigBlind, stacks[(config.dealerPosition + 2) % players.length]);
    return out;
}

/**
 * Find the player who has the next turn. This is the first player who hasn't folded,
 * who has bet less than the current target, * or has not made a decision yet.
 * @param state Poker game state
 * @returns the id of the player who has the next turn, or null if the round is over, and any new lines that should be added to a log
 */
export function whoseTurn(state: IPokerSharedState): { whoseTurn: PlayerID | null, log: GameLog } {
    const log: string[] = [];
    if (state.round == 'showdown') {
        log.push('Round is over');
        return null;
    }

    let start = (state.dealerPosition + 1) % state.players.length;
    if (state.round === 'pre-flop') start = (start + 1) % state.players.length;

    for (let i = 0; i < state.players.length; i++) {
        // Use offset from the dealer to find the player whose turn it is
        const player = state.players[(start + i) % state.players.length];
        if (player.folded) {
            log.push(`Skipping because ${player.id} has folded`);
            continue;
        }
        if (player.stack == player.currentBet) {
            log.push(`Skipping because ${player.id} is all in`);
            continue;
        }
        if (player.currentBet == state.targetBet && player.lastRound == state.round) {
            log.push(`Skipping because ${player.id} has already called`);
            continue;
        }
        return { whoseTurn: player.id, log };
    }
    return { };
}

/**
 * Find the delta in number of chips for each player in the given game. This should be negative if 
 * they didn't win any chips.
 * 
 * Sort the player hands by the best hand they can make, and group by equivalent hands.
 * Then in descending order of groups, for each group we distribute the pot to the players in the group.
 * 
 * When distributing chips to a group we need to account for split pots. For this we iterate over players 
 * in the group in order of stack size. When a player has fewer chips than the target bet, we distribute
 * chips equal to their stack size to each member of the group, and then remove them.
 * @param state Poker game state. The current round must be 'showdown'
 * @param hands 
 */
export function payout(state: IPokerSharedState, hands: Record<PlayerID, [Card, Card]>): Record<PlayerID, number> {
}

/**
 * Make a move for the player whose id is given by @see whoseTurn. If the move is invalid, return the state unchanged.
 * @param state Poker game state
 * @param move The move to make
 * @returns The new state after the move
 */
export function step(state: IPokerSharedState, move: Action): IPokerSharedState {
}