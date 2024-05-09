import combinations from "@tg/utils/combinations";

export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Card = { rank: Rank, suit: Suit };
export function parseCard(card: string): Card {
    const rank = card[0];
    const suit = card[1];

    let rankNum: Rank = 1;
    if (rank == 'A') rankNum = 1;
    else if (rank == 'T') rankNum = 10;
    else if (rank == 'J') rankNum = 11;
    else if (rank == 'Q') rankNum = 12;
    else if (rank == 'K') rankNum = 13;
    else rankNum = parseInt(rank) as Rank;

    let suitName: Suit = 'hearts';
    if (suit == 'c') suitName = 'clubs';
    else if (suit == 'd') suitName = 'diamonds';
    else if (suit == 's') suitName = 'spades';
    return { rank: rankNum, suit: suitName };
}
export function formatCard(card: Card): string {
    let rank: string = '';
    if (card.rank == 1) rank = 'A';
    else if (card.rank == 10) rank = 'T';
    else if (card.rank == 11) rank = 'J';
    else if (card.rank == 12) rank = 'Q';
    else if (card.rank == 13) rank = 'K';
    else rank = card.rank.toString();
    let suit: string = card.suit[0];
    return rank + suit;
}
export type Action = {
    type: 'raise'
    amount: number
} | {
    type: 'fold' | 'call'
}

export function isAction(action: unknown): action is Action {
    if (typeof action != 'object' || action == null) return false;
    if (!('type' in action)) return false;
    if (typeof action['type'] != 'string') return false;
    if (action['type'] == 'raise') {
        if (!('amount' in action)) return false;
        if (typeof action['amount'] != 'number') return false;
    }
    return true;

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
    // clockwise order
    players: IPokerPlayer[];
    // so big blind is (dealerPosition-1)%players.length
    // small blind is (dealerPosition-2)%players.length
    round: PokerRound;
    done: boolean;
    cards: Card[];
}

export interface IPokerGame {
    state: IPokerSharedState;
    config: IPokerConfig;
    hands: Record<PlayerID, [Card, Card]>;
    deck: Card[];
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
    if (players.length != stacks.length) throw new Error("Number of players and stacks must be equal")
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
            done: false,
            pot: 0,
            players: players.map((id, i) => ({ lastRound: null, id, stack: stacks[i], folded: false, currentBet: 0 })),
            round: 'pre-flop',
            targetBet: config.bigBlind,
            dealerPosition: config.dealerPosition,
            smallBlind: config.smallBlind,
            bigBlind: config.bigBlind,
            cards: []
        },
        deck,
        config,
        hands
    }
    const sb = (config.dealerPosition - 1 + players.length) % players.length;
    const bb = (config.dealerPosition - 2 + players.length) % players.length;
    out.state.players[sb].currentBet = Math.min(config.smallBlind, stacks[sb]);
    out.state.players[sb].stack -= out.state.players[sb].currentBet;
    out.state.players[bb].currentBet = Math.min(config.bigBlind, stacks[bb]);
    out.state.players[bb].stack -= out.state.players[bb].currentBet;
    out.state.pot = config.smallBlind + config.bigBlind;

    return out;
}

/**
 * Find the player who has the next turn. This is the first player who hasn't folded,
 * who has bet less than the current target, * or has not made a decision yet.
 * @param state Poker game state
 * @returns the id of the player who has the next turn, or null if the round is over, and any new lines that should be added to a log
 */
export function whoseTurn(state: IPokerSharedState): { who: PlayerID | null, log: GameLog } {
    const log: string[] = [];
    if (state.round == 'showdown') {
        log.push('Round is over');
        return {
            who: null,
            log
        };
    }

    let start = (state.dealerPosition - 1 + state.players.length) % state.players.length;

    for (let i = 0; i < state.players.length; i++) {
        // Use offset from the dealer to find the player whose turn it is
        const player = state.players[(start + i) % state.players.length];
        if (player.folded) {
            log.push(`Skipping ${player.id}'s turn because they folded`);
            continue;
        }
        // If a player is all in we still allow them to move, but they can't raise
        if (player.stack == 0) {
            log.push(`${player.id} is all in, but not skipping their turn`);
            //continue;
        }
        if (player.currentBet == state.targetBet && player.lastRound == state.round) {
            log.push(`Skipping ${player.id}'s turn because they already called`);
            continue;
        }
        return { who: player.id, log };
    }
    return {
      who: null,
      log,
    };
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
 * @returns A record of player ids to the number of chips they won, and any new lines that should be added to a log. Payouts will be null if the game is not over.
 */
export function payout(state: IPokerSharedState, hands: Record<PlayerID, [Card, Card]>): { 
    payouts: Record<PlayerID, number> | null, 
    log: GameLog 
} {
    if (state.round == 'showdown') {
        const out: Record<PlayerID, number> = {};
        const players = [...state.players];
        const bestHands: Record<PlayerID, Hand> = {};
        for (const player of players) {
            out[player.id] = 0;
            bestHands[player.id] = best5(hands[player.id].concat(state.cards));
        }
        players.sort((a, b) => handCmp(bestHands[a.id], bestHands[b.id]));

        const groups: IPokerPlayer[][] = [];
        for (let i = 0; i < players.length; i++) {
            if (i == 0 || handCmp(bestHands[players[i].id], bestHands[players[i - 1].id]) != 0) {
                groups.push([]);
            }
            groups[groups.length - 1].push(players[i]);
        }

        const potShare: Record<PlayerID, number> = {};
        for (const player of players) {
            potShare[player.id] = 0;
            for (const p of state.players) {
                potShare[player.id] += Math.min(player.currentBet, p.currentBet);
            }
        }

        let pot = state.pot;
        groups.reverse();
        for (const group of groups) {
            group.sort((a, b) => a.stack - b.stack);
            for (let i = 0; i < group.length; i++) {
                const amount = Math.min(potShare[group[i].id], pot/(group.length - i));
                for (let j = i; j < group.length; j++) {
                    out[group[j].id] += amount;
                    potShare[group[j].id] -= amount;
                    pot -= amount;
                }
            }
        }

        return {
            payouts: out,
            log: []
        }
    }
    else {
        // check if all players except for one have folded
        const remainingPlayers = state.players.filter(p => !p.folded);
        if (remainingPlayers.length == 1) {
            const payouts: Record<PlayerID, number> = {};
            payouts[remainingPlayers[0].id] = state.pot;
            return { payouts, log: [
                `${remainingPlayers[0].id} wins the pot because all others folded`
            ] };
        }
    }
    return { payouts: null, log: [] };
}

/**
 * Make a move for the player whose id is given by @see whoseTurn. If the move is invalid, return the state unchanged.
 * @param state Poker game state
 * @param move The move to make
 * @throws If the move is a raise and the amount is negative
 * @throws If the game is over
 * @returns The new state after the move
 */
export function step(game: IPokerGame, move: Action): { next: IPokerGame, log: GameLog } {
    if (game.state.done) throw new Error("Game is over");
    const {state, config, hands, deck} = game;
    let { who, log } = whoseTurn(state);
    let out: { next: IPokerGame, log: GameLog };

    const player = state.players.find(p => p.id == who);
    if (player == undefined) {
        log.push(`Player ${who} not found`);
        return { next: { state, config, hands, deck }, log };
    }
    if (move.type == 'fold') {
        player.folded = true;
        log.push(`Player ${who} folded`);

        // set done to true if all players except one have folded
        const remainingPlayers = state.players.filter(p => !p.folded);
        if (remainingPlayers.length == 1) {
            state.done = true;
        }
        out = { next: { state, config, hands, deck }, log };
    }
    else if (move.type == 'call' || move.type == 'raise') {
        let target = state.targetBet;
        if (move.type == 'raise') {
            if (move.amount < 0) throw new Error("Raise amount must be non-negative");
            target += move.amount;
            state.targetBet = target;
            log.push(`Player ${who} raised ${move.amount}`);
        }
        else {
            log.push(`Player ${who} called ${state.targetBet - player.currentBet}`);
        }

        player.lastRound = state.round;

        const toCall = target - player.currentBet;
        const amount = Math.min(toCall, player.stack);
        player.stack -= amount;
        player.currentBet += amount;
        state.pot += amount;
        out = { next: { state, config, hands, deck }, log };
    }

    let roundOver = true;
    for (const player of state.players) {
        if (!player.folded && (player.currentBet != state.targetBet || player.lastRound != state.round)) {
            roundOver = false;
            break;
        }
    }
    if (roundOver) {
        // move the round forward
        if (state.round == 'pre-flop') {
            state.round = 'flop';
            for (let i = 0; i < 3; i++) state.cards.push(deck.pop())
        }
        else if (state.round == 'flop') {
            state.round = 'turn';
            state.cards.push(deck.pop())
        }
        else if (state.round == 'turn') {
            state.round = 'river';
            state.cards.push(deck.pop())
        }
        else if (state.round == 'river') {
            state.round = 'showdown';
            state.done = true;
        }
        log.push(`Moving to ${state.round}`);
    }
    
    return out;
}

function lexicoCompare(a: number[], b: number[]): number {
    for (let i = 0; i < a.length; i++) {
        if (a[i] < b[i]) return -1;
        if (a[i] > b[i]) return 1;
    }
    return 0;
}

export type Hand = [Card, Card, Card, Card, Card];
type HandVal = {
    handRank: number;
    counts: number[];
    vals: number[];
}

function handVal(cards: Hand): HandVal {
    const hist: [number, number][] = [];
    for (let i = 0; i <= 14; i++) {
        hist.push([0, i]);
    }
    for (const card of cards) {
        if (card.rank == 1) hist[14][0]++;
        else hist[card.rank][0]++;
    }
    // reverse sort by count, then by value
    hist.sort((a, b) => -lexicoCompare(a,b));
    let counts: number[] = [], vals: number[] = [];
    for (const [count, val] of hist) {
        if (count == 0) break;
        counts.push(count);
        vals.push(val);
    }

    // Check for flush
    const flushSuit = cards[0].suit;
    const isFlush = cards.every(card => card.suit == flushSuit);
    // Check for straight
    let isStraight = false;
    if (counts.length >= 5) {
        // vals are in decreasing order
        isStraight = vals[0] - vals[4] == 4;
    }
    // Check for low straight
    if (counts.length == 5 && vals[0] == 14 && vals[1] == 5) {
        isStraight = true;
        vals = [5, 4, 3, 2, 1];
    }

    // straight flush is highest
    if (isStraight && isFlush) {
        return { handRank: 4, counts, vals };
    }
    // full house/quad is next
    if (counts[0] + counts[1] == 5) {
        return { handRank: 3, counts, vals };
    }
    if (isFlush) {
        return { handRank: 2, counts, vals };
    }
    if (isStraight) {
        return { handRank: 1, counts, vals };
    }
    // three/two pair/pair/high is next
    return { handRank: 0, counts, vals };
}

export function handCmp(a: Hand, b: Hand): number {
    const valA = handVal(a), valB = handVal(b);
    if (valA.handRank != valB.handRank) return valA.handRank - valB.handRank;
    return lexicoCompare(valA.counts, valB.counts) || lexicoCompare(valA.vals, valB.vals);
}

export function best5(cards: Card[]): Hand {
    if (cards.length < 5) throw new Error("Not enough cards to make a hand");
    let best: Hand = cards.slice(0, 5) as Hand;
    for (const comb of combinations(cards, 5)) {
        if (handCmp(comb, best) > 0) {
            best = comb;
        }
    }
    return best;
}
