import card from "../card";
import m from "mithril";

export default {
  view: ({ attrs }) => {
    const player = attrs.player;
    const hand = attrs.hand
    console.log({ player })

    return m(`div.tg-poker__player${attrs.className ? '.' + attrs.className : ''}`, [
      m("div.tg-poker__player__details", [
        m("h4", attrs.title),
        m("div", [
          m("div", `$${player.stackSize}`),
          m("div", `Bet: $${player.currentBet}`),
        ])
      ]),
      m("div", {
        style: { display: 'flex', gap: '6px', margin: '16px 0' }
      }, attrs.showCards ?
        hand.map((c, i) => {
          return m(card, { value: `${c.suit}_${c.rank}` })
        }) :
        hand.map((c, i) => {
          return m(card, { value: '' })
        })

      ),
    ])
  }
} 