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
    id: PlayerID
    stack: number;
}

export interface IPokerConfig {
    smallBlind: number;
    bigBlind: number;
    maxPlayers: number;
    dealerPosition: number;
}

export interface IPokerSharedState {
    pot: number;
    targetBet: number;
    // counterclockwise order
    players: IPokerPlayer[];
    // so big blind is (dealerPosition+1)%players.length
    // small blind is (dealerPosition+2)%players.length
    round: PokerRound;
    deck: Card[];
    playerCompletedRound: Record<PlayerID, PokerRound>;
    playerCurrentBet: Record<PlayerID, number>;
}

export interface IPokerState {
    state: IPokerSharedState;
    config: IPokerConfig;
    hands: Record<PlayerID, [Card, Card]>;
}

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

function dealHands(players: IPokerPlayer[], deck: Card[]): Record<PlayerID, [Card, Card]> {
    const hands: Record<PlayerID, [Card, Card]> = {};
    for (const player of players) {
        hands[player.id] = [deck.pop()!, deck.pop()!];
    }
    return hands;
}

export function createPokerGame(config: IPokerConfig, players: IPokerPlayer[]): IPokerState {
    const deck = shuffleDeck(createDeck());
    const hands = dealHands(players, deck);
    const playerCompletedRound: Record<PlayerID, PokerRound> = {};
    const playerCurrentBet: Record<PlayerID, number> = {};
    for (const player of players) {
        playerCompletedRound[player.id] = 'pre-flop';
        playerCurrentBet[player.id] = 0;
    }
    return {
        state: {
            pot: 0,
            players,
            round: 'pre-flop',
            deck,
            playerCompletedRound,
            playerCurrentBet,
            targetBet: 0
        },
        config,
        hands
    }
}

/**
 * Find the player who has the next turn. This is the first player who hasn't folder,
 * who has bet less than the current target, * or has not made a decision yet.
 * @param state Poker game state
 * @returns the id of the player who has the next turn, or null if the round is over
 */
export function whoseTurn(state: IPokerSharedState): PlayerID | null {
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