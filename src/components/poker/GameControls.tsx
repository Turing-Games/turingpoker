import React from "react";
import { ClientState } from "@tg/Client";
import { sendMessage } from "@tg/utils/websocket";

function GameControls({ clientState }: { clientState: ClientState }) {
  const serverState = clientState?.serverState;
  const gameState = serverState?.gameState;

  if (!clientState.isConnected || !gameState) {
    return <p>Waiting for the game to start or connect...</p>;
  }

  // Retrieve the current bet and minimum raise amount
  const currentBet = gameState.targetBet;
  const minRaiseAmount = gameState.bigBlind;
  const currentPlayer = gameState?.players?.find(player => player.id === clientState?.playerId);
  const isPlayerEvenWithBet = currentPlayer.currentBet >= currentBet;
  const socket = clientState.socket

  // Function to handle raising
  const handleRaise = () => {
    const amount = prompt(`Enter amount to raise (minimum: $${minRaiseAmount}):`, minRaiseAmount.toString());
    if (amount && parseInt(amount, 10) >= minRaiseAmount) {
      sendMessage(socket, { type: "action", action: { type: "raise", amount: parseInt(amount, 10) } });
    } else {
      alert(`Invalid raise amount. You must raise at least $${minRaiseAmount}.`);
    }
  };

  // Render game controls
  return (
    <div className="tg-poker__controls">
      {/* Call button */}
      <button
        onClick={() => {
          if (!isPlayerEvenWithBet) {
            sendMessage(socket, { type: "action", action: { type: "call" } });
          }
        }}
        style={{
          pointerEvents: isPlayerEvenWithBet ? 'none' : 'auto',
          opacity: isPlayerEvenWithBet ? 0.5 : 1
        }}
      >
        Call
      </button>
      {/* Check button */}
      <button
        onClick={() => {
          if (currentBet === 0 || isPlayerEvenWithBet) {
            sendMessage(socket, { type: "action", action: { type: "call" } });
          }
        }}
        style={{
          pointerEvents: !isPlayerEvenWithBet ? 'none' : 'auto',
          opacity: !isPlayerEvenWithBet ? 0.5 : 1
        }}
      >
        Check
      </button>
      {/* Raise button */}
      <button
        onClick={handleRaise}
        style={{
          opacity: currentPlayer.stack >= minRaiseAmount ? 1 : 0.5,
          pointerEvents: currentPlayer.stack >= minRaiseAmount ? 'auto' : 'none',
        }}
      >
        Raise
      </button>
      {/* Fold button */}
      <button onClick={() => sendMessage(socket, { type: "action", action: { type: "fold" } })}>
        Fold
      </button>
    </div >
  );
}

export default GameControls;