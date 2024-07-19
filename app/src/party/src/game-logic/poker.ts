import { AUTO_START, MAX_PLAYERS, MIN_PLAYERS_AUTO_START } from "@app/party/src/server";
import combinations from "@app/party/src/utils/combinations";

export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Card = { rank: Rank, suit: Suit };

const cardNames = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
const cardVals = { 'A': 1, 'T': 10, 'J': 11, 'Q': 12, 'K': 13 }

const eps = 1e-9;

export function parseCard(card: string): Card {
    const rank = card[0];
    const suit = card[1];

    let rankNum: Rank = 1;
    // Why is this casting bs necessary, 'in' should act as a type guard???
    if (rank in cardVals) rankNum = cardVals[rank as (keyof typeof cardVals)] as Rank;
    else rankNum = parseInt(rank) as Rank;

    let suitName: Suit = 'hearts';
    if (suit == 'c') suitName = 'clubs';
    else if (suit == 'd') suitName = 'diamonds';
    else if (suit == 's') suitName = 'spades';
    return { rank: rankNum, suit: suitName };
}
export function formatCard(card: Card): string {
    return `${card.suit}_${card.rank}`;
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
const roundOrder = [null, 'pre-flop', 'flop', 'turn', 'river', 'showdown'];

function nextRound(round: PokerRound | null): PokerRound {
    return roundOrder[roundOrder.indexOf(round) + 1] as PokerRound;
}

function prevRound(round: PokerRound | null): PokerRound {
    return roundOrder[roundOrder.indexOf(round) - 1] as PokerRound;
}

export type PlayerID = string;

export interface IPokerPlayer {
    id: PlayerID;
    stack: number;
    folded: boolean;
    currentBet: number;
    lastRound: PokerRound | null;
    shouldMove: boolean;
}

export interface IPokerConfig {
    dealerPosition: number;
    smallBlind: number;
    bigBlind: number;
    maxPlayers: number;
    autoStart: boolean
    minPlayers: number
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
    whoseTurn: PlayerID | null;
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
    const arr = new BigUint64Array(shuffledDeck.length);
    const nums = crypto.getRandomValues(arr);
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Number(arr[i] % BigInt(i));
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
    if (players.length < 2) throw new Error("Must have at least 2 players");
    if (players.length > config.maxPlayers) throw new Error("Too many players");
    const deck = shuffleDeck(createDeck());
    const hands = dealHands(players, deck);
    const playerCompletedRound: Record<PlayerID, PokerRound> = {};
    const playerCurrentBet: Record<PlayerID, number> = {};
    for (const player of players) {
        playerCompletedRound[player] = 'pre-flop';
        playerCurrentBet[player] = 0;
    }

    const sb = (config.dealerPosition - 1 + players.length) % players.length;
    const bb = (config.dealerPosition - 2 + players.length) % players.length;
    const out: IPokerGame = {
        state: { // shared state
            done: false,
            pot: 0,
            players: players.map((id, i) => ({ lastRound: null, id, stack: stacks[i], folded: false, currentBet: 0, shouldMove: true })),
            round: 'pre-flop',
            targetBet: config.bigBlind,
            dealerPosition: config.dealerPosition,
            smallBlind: config.smallBlind,
            bigBlind: config.bigBlind,
            cards: [],
            whoseTurn: players[(config.dealerPosition - 1 + players.length) % players.length],
        },
        deck,
        config,
        hands
    }
    out.state.players[sb].currentBet = Math.min(config.smallBlind, stacks[sb]);
    out.state.players[sb].stack -= out.state.players[sb].currentBet;
    out.state.players[bb].currentBet = Math.min(config.bigBlind, stacks[bb]);
    out.state.players[bb].stack -= out.state.players[bb].currentBet;
    out.state.pot = out.state.players[sb].currentBet + out.state.players[bb].currentBet;

    return out;
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
    payouts: Record<PlayerID, number>,
    log: GameLog
} {
    const out: Record<PlayerID, number> = {};
    for (const player of state.players) {
        out[player.id] = 0;
    }
    if (state.round == 'showdown') {
        const players = [...state.players];
        const bestHands: Record<PlayerID, Hand> = {};
        for (const player of players) {
            bestHands[player.id] = best5(hands[player.id].concat(state.cards));
        }
        const cmp = (a: IPokerPlayer, b: IPokerPlayer) => {
            if (a.folded && !b.folded) return -1;
            if (b.folded && !a.folded) return 1;
            return handCmp(bestHands[a.id], bestHands[b.id]);
        }
        players.sort(cmp);

        const groups: IPokerPlayer[][] = [];
        for (let i = 0; i < players.length; i++) {
            if (i == 0 || cmp(players[i - 1], players[i]) != 0) {
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
        const pots: PlayerID[][] = []
        const potVals: number[] = [];
        groups.reverse();
        for (const group of groups) {
            group.sort((a, b) => potShare[a.id] - potShare[b.id]);
            for (let i = 0; i < group.length; i++) {
                const amount = Math.min(potShare[group[i].id], pot / (group.length - i));
                if (amount > eps) {
                    pots.push([]);
                    potVals.push(amount);
                }
                for (let j = i; j < group.length; j++) {
                    out[group[j].id] += amount;
                    potShare[group[j].id] -= amount;
                    pot -= amount;
                    if (amount > eps) {
                        pots[pots.length - 1].push(group[j].id);
                    }
                }
            }
        }

        const log: GameLog = [];
        if (pots.length == 1) {
            log.push(`The pot is won by ${pots[0].join(', ')} (worth ${potVals[0].toFixed(2)})`);
        }
        else {
            for (let pot = 0; pot < pots.length; pot++) {
                log.push(`Pot ${pot + 1} is won by ${pots[pot].join(', ')} (worth ${potVals[pot].toFixed(2)})`);
            }
        }

        return {
            payouts: out,
            log
        }
    }
    else {
        // check if all players except for one have folded
        const remainingPlayers = state.players.filter(p => !p?.folded);
        if (remainingPlayers.length == 1) {
            out[remainingPlayers[0].id] = state.pot;
            return {
                payouts: out, log: [
                    `${remainingPlayers[0].id} wins the pot because all others folded`
                ]
            };
        }
    }
    // here the game isn't done
    // give everyone their chips back
    for (const player of state.players) {
        out[player.id] = player.currentBet;
    }
    return { payouts: out, log: [`Returning chips to players because the round ended prematurely`] };
}

/**
 * Make a move for the player whose id is given by @see gameState.whoseTurn. If the move is invalid, return the state unchanged.
 * @param state Poker game state
 * @param move The move to make
 * @throws If the move is a raise and the amount is negative
 * @throws If the game is over
 * @returns The new state after the move
 */
export function step(game: IPokerGame, move: Action): { next: IPokerGame, log: GameLog } {
    if (game.state.done) throw new Error("Game is over");
    const { state, config, hands, deck } = game;
    const log: GameLog = [];
    let out: { next: IPokerGame, log: GameLog } = {
        next: game,
        log
    };

    const who = game.state.whoseTurn;
    const player = state.players.find(p => p.id == who);
    if (player == undefined) {
        log.push(`Player ${who} not found`);
        return { next: { state, config, hands, deck }, log };
    }
    if (move.type == 'fold') {
        player.folded = true;
        log.push(`Player ${who} folded`);

        // set done to true if all players except one have folded
        const remainingPlayers = state.players.filter(p => !p?.folded);
        if (remainingPlayers.length == 1) {
            state.done = true;
        }
        out = { next: { state, config, hands, deck }, log };
    }
    else if (move.type == 'call' || move.type == 'raise') {
        let target = state.targetBet;
        if (move.type == 'raise') {
            if (move.amount < 0) throw new Error("Raise amount must be non-negative");
            let oldTarget = target;
            target = Math.max(target, Math.min(move.amount + target, player.stack + player.currentBet));
            if (target > oldTarget) {
                // update everyone's lastRound to the previous round
                for (const p of state.players) {
                    p.shouldMove = true;
                }
            }
            state.targetBet = target;
            log.push(`Player ${who} raises ${move.amount.toFixed(2)}`);
        }
        else {
            if (state.targetBet - player.currentBet > eps) {
                log.push(`Player ${who} calls ${(state.targetBet - player.currentBet).toFixed(2)}`);
            }
            else {
                log.push(`Player ${who} checks`);
            }
        }

        const toCall = target - player.currentBet;
        const amount = Math.min(toCall, player.stack);
        player.stack -= amount;
        player.currentBet += amount;
        player.lastRound = state.round;
        player.shouldMove = false;
        state.pot += amount;
        out = { next: { state, config, hands, deck }, log };
    }
    const playerIndex = state.players.findIndex(p => p.id == who);
    // find next not-folded player 
    let nextPlayerIndex = (playerIndex + 1) % state.players.length;
    while (state.players[nextPlayerIndex].folded) {
        nextPlayerIndex = (nextPlayerIndex + 1) % state.players.length;
    }
    const nextPlayer = state.players[nextPlayerIndex];

    let roundOver = !nextPlayer.shouldMove;
    if (roundOver) {
        // move the round forward
        if (state.round == 'pre-flop') {
            state.round = 'flop';
            for (let i = 0; i < 3; i++) state.cards.push(deck.pop() as Card)
        }
        else if (state.round == 'flop') {
            state.round = 'turn';
            state.cards.push(deck.pop() as Card)
        }
        else if (state.round == 'turn') {
            state.round = 'river';
            state.cards.push(deck.pop() as Card)
        }
        else if (state.round == 'river') {
            state.round = 'showdown';
            state.done = true;
        }
        if (state.round != 'showdown') {
            let idx = state.players.length - 1;
            while (state.players[idx].folded) {
                idx = (idx + 1) % state.players.length;
            }
            out.next.state.whoseTurn = out.next.state.players[idx].id;
        }
        for (const p of state.players) {
            p.shouldMove = true;
        }
        log.push(`Moving to ${state.round}`);
    }

    out.next.state.whoseTurn = state.players[nextPlayerIndex].id;
    return out;
}

/**
 * Force a player to fold, even if it's not their turn
 * @param game The game to apply to
 * @param playerId The id of the player to force to fold
 * @returns 
 */
export function forcedFold(game: IPokerGame, playerId: PlayerID): {
    next: IPokerGame,
    log: GameLog
} {
    const player = game.state.players.find(p => p.id == playerId);
    if (player == undefined) return { next: game, log: [] };
    if (player.id == game.state.whoseTurn) {
        return step(game, { type: 'fold' });
    }
    else {
        player.folded = true;
        if (game.state.players.filter(p => !p.folded).length == 1) {
            game.state.done = true;
        }
    }

    return {
        next: game,
        log: []
    }
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
    hist.sort((a, b) => -lexicoCompare(a, b));
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
        if (handCmp(comb as Hand, best) > 0) {
            best = comb as Hand;
        }
    }
    return best;
}
