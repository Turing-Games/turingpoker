import { ClientState } from "@tg/client";
import m from "mithril";

export const GameControls = {
  view: ({ attrs }) => {
    console.log('test')
    const clientState: ClientState = attrs.clientState
    const serverState = clientState?.serverState
    const gameState = clientState.serverState?.gameState;

    if (!clientState.isConnected || !gameState) {
      return m("p", "Waiting for the game to start or connect...");
    }

    // Retrieve the current bet and minimum raise amount
    const currentBet = gameState.targetBet;
    const minRaiseAmount = gameState.bigBlind;
    const currentPlayer = gameState?.players?.find(player => player.id === clientState?.playerId)
    console.log({ currentPlayer })
    const isPlayerEvenWithBet = currentPlayer.currentBet >= currentBet

    // Render game controls if it's the current player's turn
    return m("div.tg-poker__controls", [
      // call button
      m("button", {
        onclick: () => {
          if (!isPlayerEvenWithBet) {
            clientState.sendMessage({ type: "action", action: { type: "call" } })
          }
        },
        style: {
          pointerEvents: isPlayerEvenWithBet ? 'none' : 'auto',
          opacity: isPlayerEvenWithBet ? 0.5 : 1
        }
      }, "Call"),
      // check button
      m("button", {
        onclick: () => {
          if (currentBet === 0 || isPlayerEvenWithBet) {
            clientState.sendMessage({ type: "action", action: { type: "call" } })
          }
        },
        style: {
          pointerEvents: !isPlayerEvenWithBet ? 'none' : 'auto',
          opacity: !isPlayerEvenWithBet ? 0.5 : 1
        }
      }, "Check"),
      // raise button
      m("button", {
        onclick: () => {
          const amount = prompt(`Enter amount to raise (minimum: $${minRaiseAmount}):`, minRaiseAmount.toString());
          if (amount && parseInt(amount, 10) >= minRaiseAmount) {
            clientState.sendMessage({ type: "action", action: { type: "raise", amount: parseInt(amount, 10) } })
          } else {
            alert(`Invalid raise amount. You must raise at least $${minRaiseAmount}.`);
          }
        },
        style: {
          opacity: currentPlayer.stack >= minRaiseAmount ? 1 : 0.5,
          pointerEvents: currentPlayer.stack >= minRaiseAmount ? 'auto' : 'none',
        }
      }, "Raise"),
      // TODO: should this be greyed out if isPlayerEvenWithBet?
      m("button", {
        onclick: () => clientState.sendMessage({ type: "action", action: { type: "fold" } })
      }, "Fold")
    ]);
  }
};