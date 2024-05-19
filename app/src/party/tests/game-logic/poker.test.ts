import * as poker from '@app/party/src/game-logic/poker';
import combinations from '@app/party/src/utils/combinations';
const { handCmp } = poker;

//const Hand = require('pokersolver').Hand;

const names = " A23456789TJQK";
const suits = "cdhs";

/*
// Commented out because it's too slow
describe("Hand evaluation", () => {
    // generate a fraction of all 2.5M hands by choosing all 5-card combinations of 36 randomly chosen cards
    // I've run it on the full set of 2.5M hands, and it works
    test("All hands", () => {
        const cards = [];
        for (let i = 1; i <= 13; i++) {
            for (let j = 0; j < 4; j++) {
                cards.push(names[i] + suits[j]);
            }
        }
        while (cards.length > 36) {
            cards.splice(Math.floor(Math.random() * cards.length), 1);
        }
        const handsA: any[] = [], handsB: poker.Hand[] = [];
        const indexA = [], indexB = [];
        let i = 0;
        for (const hand of combinations(cards, 5)) {
            if (Math.random() > 0.1) continue;
            indexA.push(i);
            indexB.push(i);
            i++;
            handsA.push(Hand.solve(hand));
            handsB.push(hand.map(poker.parseCard) as poker.Hand);
        }
        indexA.sort((u, v) => {
            const a = handsA[u], b = handsA[v];
            const best = Hand.winners([a, b]);
            if (best.length == 2) return 0;
            if (best[0] == a) return 1;
            if (best[0] == b) return -1;
            return 0;
        });
        indexB.sort((a, b) => handCmp(handsB[a], handsB[b]));
        expect(indexA).toEqual(indexB);
    });
})*/

describe("Poker logic", () => {
    const defaultConfig: poker.IPokerConfig = {
        bigBlind: 2,
        smallBlind: 1,
        dealerPosition: 0,
        maxPlayers: 5,
        autoStart: true,
        minPlayers: 2
    }
    test("Game throws with negative raise", () => {
        const game = poker.createPokerGame(defaultConfig, ['0', '1'], [100, 100]);
        expect(() => poker.step(game, { type: 'raise', amount: -1 })).toThrow();
    })
    test("Game throws if created and there aren't the same number of stacks and players", () => {
        expect(() => poker.createPokerGame(defaultConfig, ['0'], [100, 100])).toThrow();
        expect(() => poker.createPokerGame(defaultConfig, ['0', '1'], [100])).toThrow();
    });
    test("Big blinds and small blinds are payed initially", () => {
        const game = poker.createPokerGame(defaultConfig, ['0', '1'], [100, 100]);
        const state = game.state;
        expect(state.pot).toBe(3);
        expect(state.players[0].stack).toBe(98);
        expect(state.players[1].stack).toBe(99);
        expect(state.players[0].currentBet).toBe(2);
        expect(state.players[1].currentBet).toBe(1);

    });

    test("Folding gets turn skipped in subsequent rounds", () => {
        let game = poker.createPokerGame(defaultConfig, ['0', '1', '2', '3', '4'], [100, 100, 100, 100, 100]);
        
        // player 3 is bb, so 4 should go first
        expect(game.state.whoseTurn).toBe('4');

        // 4 calls to 2
        game = poker.step(game, { type: 'raise', amount: 5 }).next;
        expect(game.state.whoseTurn).toBe('0');

        // 0 and 1 fold
        game = poker.step(game, { type: 'fold' }).next;
        expect(game.state.whoseTurn).toBe('1');
        game = poker.step(game, { type: 'fold' }).next;
        expect(game.state.whoseTurn).toBe('2');

        // 2 calls
        expect(game.state.players[2].currentBet).toBe(0);
        game = poker.step(game, { type: 'call' }).next;
        expect(game.state.players[2].currentBet).toBe(7);
        expect(game.state.players[2].stack).toBe(93);
        expect(game.state.whoseTurn).toBe('3');

        // 3 calls
        expect(game.state.players[3].currentBet).toBe(2);
        expect(game.state.players[3].stack).toBe(98);
        game = poker.step(game, { type: 'call' }).next;
        expect(game.state.players[3].currentBet).toBe(7);
        expect(game.state.players[3].stack).toBe(93);

        // 4 checks
        expect(game.state.whoseTurn).toBe('4');
        expect(game.state.round).toBe('flop');
        expect(game.state.players[4].currentBet).toBe(7);
        expect(game.state.players[4].stack).toBe(93);
        game = poker.step(game, { type: 'call' }).next;

        // now it should be 2's turn, since 0 and 1 folded
        expect(game.state.whoseTurn).toBe('2');
        game = poker.step(game, { type: 'call' }).next;
        expect(game.state.whoseTurn).toBe('3');
        game = poker.step(game, { type: 'call' }).next;

        expect(game.state.round).toBe("turn")
        expect(game.state.whoseTurn).toBe('4');
        game = poker.step(game, { type: 'fold' }).next;
        expect(game.state.whoseTurn).toBe('2');
        game = poker.step(game, { type: 'call' }).next;
        expect(game.state.whoseTurn).toBe('3');
        game = poker.step(game, { type: 'call' }).next;

        expect(game.state.round).toBe("river")
        expect(game.state.whoseTurn).toBe('2');
        game = poker.step(game, { type: 'fold' }).next;

        expect(game.state.done).toBeTruthy();
    });

    test("Small blind calling sets its bet to big blind", () => {
        let game = poker.createPokerGame(defaultConfig, ['0', '1', '2', '3', '4'], [100, 100, 100, 100, 100]);

        expect(game.state.players[4].stack).toBe(99);
        expect(game.state.players[4].currentBet).toBe(1);

        game = poker.step(game, { type: 'call' }).next;
        expect(game.state.players[4].stack).toBe(98);
        expect(game.state.players[4].currentBet).toBe(2);
    })
    test("Small blind folding immediately skips turn in subsequent rounds", () => {
        let game = poker.createPokerGame(defaultConfig, ['0', '1', '2', '3', '4'], [100, 100, 100, 100, 100]);

        expect(game.state.players[4].stack).toBe(99);
        expect(game.state.players[4].currentBet).toBe(1);
    })

    test("All others folding causes payout to last player standing", () => {
        let game = poker.createPokerGame(defaultConfig, ['0', '1', '2', '3', '4'], [100, 100, 100, 100, 100]);

        game = poker.step(game, { type: 'raise', amount: 5 }).next;
        game = poker.step(game, { type: 'fold' }).next;
        game = poker.step(game, { type: 'fold' }).next;
        game = poker.step(game, { type: 'fold' }).next;
        game = poker.step(game, { type: 'fold' }).next;
        expect(game.state.done).toBeTruthy();
        expect(poker.payout(game.state, game.hands).payouts).toMatchObject({ '4': game.state.pot });
    });

    test("The number of community cards is correct", () => {
        let game = poker.createPokerGame(defaultConfig, ['0', '1'], [100, 100]);
        expect(game.state.cards.length).toBe(0);
        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;
        expect(game.state.cards.length).toBe(3);
        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;
        expect(game.state.cards.length).toBe(4);
        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;
        expect(game.state.cards.length).toBe(5);
        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;
        expect(game.state.cards.length).toBe(5);
        expect(game.state.done).toBeTruthy();
    });

    test("Going to showdown causes payout to best hand", () => {
        for (let i = 0; i < 1000; i++) {
            let game = poker.createPokerGame(defaultConfig, ['0', '1', '2', '3', '4'], [100, 100, 100, 100, 100]);
            
            let iters = 0;
            while (!game.state.done) {
                // obviously it should never reach 1000 iterations
                expect(iters++).toBeLessThan(1000);
                // pre-flop, flop, turn, river => raised 4 times
                game = poker.step(game, { type: 'raise', amount: 5 }).next;
                game = poker.step(game, { type: 'call' }).next;
                game = poker.step(game, { type: 'call' }).next;
                game = poker.step(game, { type: 'call' }).next;
                game = poker.step(game, { type: 'call' }).next;
            }
            expect(game.state.pot).toBe((5*4+2)*5);
            
            const payouts = poker.payout(game.state, game.hands).payouts;
            
            // find the best hand
            let best = [];
            for (let i = 0; i < 5; i++) {
                let cmpVal = (Number(!best.length) || poker.handCmp(poker.best5(game.hands[i].concat(game.state.cards)), poker.best5(game.hands[best[0]].concat(game.state.cards))));
                if (cmpVal > 0) best = [];
                if (cmpVal >= 0) best.push(i);
            }
            // all of them should have the same payout, and it should be the pot
            for (let i = 0; i < 5; i++) {
                if (!best.includes(i)) expect(payouts[i]).toBe(0);
                else expect(payouts[i]).toBeCloseTo(game.state.pot / best.length);
            }
        }
    }, 10);

    test("Forced fold ends game if only one player remains", () => {
        let game = poker.createPokerGame(defaultConfig, ['0', '1', '2', '3', '4'], [100, 100, 100, 100, 100]);
        game = poker.step(game, { type: 'raise', amount: 5 }).next;
        game = poker.step(game, { type: 'fold' }).next;
        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'fold' }).next;
        game = poker.step(game, { type: 'fold' }).next;
        game = poker.forcedFold(game, '1').next;
        expect(game.state.done).toBeTruthy();
        // the only player left should get the pot
        expect(poker.payout(game.state, game.hands).payouts).toMatchObject({ '4': game.state.pot });
    });

    test("Forced fold updates whoseTurn", () => {
        let game = poker.createPokerGame(defaultConfig, ['0', '1', '2', '3', '4'], [100, 100, 100, 100, 100]);
        game = poker.step(game, { type: 'raise', amount: 5 }).next;
        game = poker.step(game, { type: 'fold' }).next;
        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'fold' }).next;
        game = poker.step(game, { type: 'fold' }).next;
        game = poker.forcedFold(game, '4').next;
        expect(game.state.whoseTurn).toBe('1');
        expect(game.state.done).toBeTruthy();
        // the only player left should get the pot
        expect(poker.payout(game.state, game.hands).payouts).toMatchObject({ '1': game.state.pot });
    });

    test("Player cannot bet more than they have", () => {
        let game = poker.createPokerGame(defaultConfig, ['0', '1'], [30, 100]);
        game = poker.step(game, { type: 'raise', amount: 101 }).next;
        expect(game.state.players[1].stack).toBe(0);
        expect(game.state.players[1].currentBet).toBe(100);
        expect(game.state.targetBet).toBe(100);
        game = poker.step(game, { type: 'call' }).next;
        expect(game.state.players[0].stack).toBe(0);
        expect(game.state.players[0].currentBet).toBe(30);
    });

    test("Player with 0 chips game proceeds normally", () => {
        let game = poker.createPokerGame(defaultConfig, ['0', '1'], [0, 100]);
        expect(game.state.whoseTurn).toBe('1');
        game = poker.step(game, { type: 'call' }).next;
        expect(game.state.whoseTurn).toBe('0');
        game = poker.step(game, { type: 'call' }).next;
    });

    test("Folded players don't get payouts even if they have the best hand", () => {
        let game = poker.createPokerGame(defaultConfig, ['0', '1', '2'], [100, 100, 100]);
        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;

        game = poker.step(game, { type: 'raise', amount: 5 }).next;
        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'fold' }).next;

        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;

        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;
        
        game.hands['1'] = [{ rank: 1, suit: 'clubs' }, { rank: 1, suit: 'diamonds' }];

        game.hands['2'] = [{ rank: 2, suit: 'hearts' }, { rank: 7, suit: 'spades' }];
        game.hands['0'] = [{ rank: 3, suit: 'spades' }, { rank: 8, suit: 'hearts' }];

        game.state.cards = [{ rank: 1, suit: 'hearts' }, { rank: 1, suit: 'spades' }, { rank: 2, suit: 'diamonds' }, { rank: 2, suit: 'clubs' }, { rank: 7, suit: 'clubs' }];
        const payouts = poker.payout(game.state, game.hands).payouts;
        expect(payouts).toMatchObject({
            '0': 0,
            '1': 0,
            '2': game.state.pot
        });
    })

    test("Player that was unable to call receives chips based on what they bet", () => {
        let game = poker.createPokerGame({
            ...defaultConfig,
            bigBlind: 20,
            smallBlind: 10
        }, ['0', '1', '2'], [10, 100, 100]);
        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;

        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;

        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;

        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;
        game = poker.step(game, { type: 'call' }).next;

        expect(game.state.done).toBeTruthy();

        game.hands['0'] = [{ rank: 1, suit: 'clubs' }, { rank: 1, suit: 'diamonds' }];

        game.hands['1'] = [{ rank: 3, suit: 'spades' }, { rank: 8, suit: 'hearts' }];
        game.hands['2'] = [{ rank: 2, suit: 'hearts' }, { rank: 7, suit: 'spades' }];

        game.state.cards = [{ rank: 1, suit: 'hearts' }, { rank: 1, suit: 'spades' }, { rank: 2, suit: 'diamonds' }, { rank: 2, suit: 'clubs' }, { rank: 7, suit: 'clubs' }];

        const payouts = poker.payout(game.state, game.hands).payouts;
        expect(payouts).toMatchObject({
            '0': 30,
            '1': 0,
            '2': 20
        });
    })

});
