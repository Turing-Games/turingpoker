import * as poker from '@tg/game-logic/poker';
import combinations from '@tg/utils/combinations';
const { handCmp } = poker;

const Hand = require('pokersolver').Hand;

const names = " A23456789TJQK";
const suits = "cdhs";

describe("Hand evaluation", () => {
    // generate a fraction of all 2.5M hands, sort, and compare with pokersolver
    // I've run it with 50% of hands before but we downsample to 5% for CI
    test("All hands", () => {
        const cards = [];
        for (let i = 1; i <= 13; i++) {
            for (let j = 0; j < 4; j++) {
                cards.push(names[i] + suits[j]);
            }
        }
        console.log(cards);
        const handsA = [], handsB = [];
        const indexA = [], indexB = [];
        let i = 0;
        for (const hand of combinations(cards, 5)) {
            if (Math.random() > 0.05) continue;
            indexA.push(i);
            indexB.push(i);
            i++;
            handsA.push(Hand.solve(hand));
            handsB.push(hand.map(poker.parseCard));
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
})