import m from "mithril";
import { ServerUpdateMessage } from "@tg/shared";
import * as Poker from '@tg/game-logic/poker'

function describeAction(action: Poker.Action) {
    switch (action.type) {
        case "raise":
            return `raised ${action.amount}`
        case "call":
            return `calls`
        case "fold":
            return `folds`
    }
}

function signChar(amount: number) {
    return amount > 0 ? "+" : "-"
}
function describePayouts(payouts: Record<string, number>) {
    return Object.entries(payouts).map(([player, amount]) => `${player}: ${amount}`).join(", ")
}

function getLogMessage(log: ServerUpdateMessage) {
  switch (log.type) {
    case "player-joined":
        return `${log.player.playerId.slice(0, 10)} has joined the game`
    case "player-left":
        return `${log.player.playerId.slice(0, 10)} has left the game`
    case "action":
        return `${log.player.playerId.slice(0, 10)} ${describeAction(log.action)}`
    case "game-started":
        return `Game has started`
    case "game-ended":
        return `Game has ended, ${describePayouts(log.payouts)}`
  }
}

export default {
    view: ({ attrs: { gameLog } }: {
        attrs: {
            gameLog: ServerUpdateMessage[];
        };
    }) => {
        return m("div.tg-poker__gamelog", [
          m("h4", "Game Log"),
          gameLog.map((log) =>
            m("div.tg-poker__gamelog__log", [
              m("p", `${getLogMessage(log)}`),
            ])
          ),
        ])
    },

    onupdate(vnode) {
        const el = vnode.dom as HTMLElement;
        el.scrollTop = el.scrollHeight;
    }
} satisfies m.Component<{ gameLog: ServerUpdateMessage[] }, {}>;