import React from "react";
import { ClientState } from "@app/client";
import { sendMessage } from "@app/utils/websocket";
import { useAuth } from "@clerk/clerk-react";

function GameControls({ clientState, joinLeave, gameType }: { clientState: ClientState, joinLeave: boolean, gameType?: string }) {
  const serverState = clientState?.serverState;
  const gameState = serverState?.gameState;
  const gamePhase = serverState?.gamePhase;

  if (gamePhase === 'final') return <></>

  if (!clientState.isConnected) {
    return <p>Waiting for the game to start or connect...</p>;
  }

  // Retrieve the current bet and minimum raise amount
  const currentBet = gameState?.targetBet;
  const minRaiseAmount = gameState?.bigBlind;
  const currentPlayer = gameState?.players.find(player => player.id === clientState?.playerId);
  const isPlayerEvenWithBet = currentPlayer?.currentBet >= currentBet;
  const socket = clientState.socket
  const isPlayerSpectating = !!serverState.spectatorPlayers?.find(p => p.playerId === clientState?.playerId)
  const isPlayerInGame = !!serverState.inGamePlayers?.find(p => p.playerId === clientState?.playerId)

  // Function to handle raising
  const handleRaise = () => {
    if (gameType !== 'kuhn') {
      const amount = prompt(`Enter amount to raise (minimum: $${minRaiseAmount}):`, minRaiseAmount.toString());
      if (amount && parseInt(amount, 10) >= minRaiseAmount) {
        sendMessage(socket, { type: "action", action: { type: "raise", amount: parseInt(amount, 10) } });
      } else {
        alert(`Invalid raise amount. You must raise at least $${minRaiseAmount}.`);
      }
    } else {
      sendMessage(socket, { type: "action", action: { type: "raise", amount: parseInt('1', 10) } });
    }
  };

  const isSignedIn = useAuth()?.isSignedIn
  const playerCanJoin = isSignedIn && !isPlayerInGame

  // Render game controls
  return (
    <div className="flex gap-[5px] w-[200px] min-w-[200px]">
      <div className="flex flex-col w-full gap-[8px] items-stretch">
        {/* Call button */}
        <div className="flex gap-[8px] justify-between items-center">
          {/* Check button */}
          <button disabled={!gameState || gameState?.whoseTurn !== currentPlayer?.id || !isPlayerInGame}
            onClick={() => {
              sendMessage(socket, {
                type: "action",
                action: { type: "call" },
              });
            }}>
            {isPlayerEvenWithBet ? "Check" : "Call"}
          </button>
          {/* Raise button */}
          <button
            disabled={!gameState || gameState?.whoseTurn !== currentPlayer?.id || currentPlayer?.stack < (minRaiseAmount ?? 0) || !isPlayerInGame}
            onClick={handleRaise}
          >
            Raise
          </button>
          {/* Fold button */}
          <button
            disabled={!gameState || gameState?.whoseTurn !== currentPlayer?.id || !isPlayerInGame}
            onClick={() =>
              sendMessage(socket, {
                type: "action",
                action: { type: "fold" },
              })
            }
          >
            Fold
          </button>
        </div>

        {
          (joinLeave && gamePhase !== 'final') &&
          <button
            onClick={() => {
              if (playerCanJoin) {
                sendMessage(socket, { type: "join-game" });
              } else {
                sendMessage(socket, { type: "spectate" });
              }
            }}
          >
            {isPlayerSpectating
              ? "Join game"
              : isPlayerInGame
                ? "Leave game"
                : "Queued to join game"}
          </button>
        }
      </div>
    </div >
  );
}

export default GameControls;
