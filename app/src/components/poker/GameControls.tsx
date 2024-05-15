import { ClientState } from "@app/client";
import { sendMessage } from "@app/party/src/utils/websocket";

function GameControls({ clientState }: { clientState: ClientState }) {
  const serverState = clientState?.serverState;
  const gameState = serverState?.gameState;

  if (!clientState.isConnected) {
    return <p>Waiting for the game to start or connect...</p>;
  }
  console.log(gameState);

  // Retrieve the current bet and minimum raise amount
  const currentBet = gameState?.targetBet;
  const minRaiseAmount = gameState?.bigBlind;
  const currentPlayer = gameState?.players.find(player => player.id === clientState?.playerId);
  const isPlayerEvenWithBet = currentPlayer?.currentBet >= currentBet;
  const socket = clientState.socket
  const isPlayerSpectating = !!serverState.spectatorPlayers?.find(p => p.playerId === clientState?.playerId)
  const isPlayerInGame = !!serverState.inGamePlayers?.find(p => p.playerId === clientState?.playerId)
  console.log(isPlayerInGame, isPlayerSpectating, currentPlayer, gameState?.whoseTurn)

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
      <div
        style={{
          flexDirection: "column",
          width: "100%",
          display: "flex",
          alignItems: 'stretch',
          gap: "8px",
        }}
      >
        {/* Call button */}
        {isPlayerInGame && (
          <div
            style={{
              flexDirection: "row",
              display: "flex",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            {/* Check button */}
            <button
              disabled={!gameState || gameState?.whoseTurn !== currentPlayer?.id}
              onClick={() => {
                sendMessage(socket, {
                  type: "action",
                  action: { type: "call" },
                });
              }}
            >
              {isPlayerEvenWithBet ? "Check" : "Call"}
            </button>
            {/* Raise button */}
            <button
              disabled={!gameState || gameState?.whoseTurn !== currentPlayer?.id || currentPlayer?.stack < (minRaiseAmount ?? 0)}
              onClick={handleRaise}
            >
              Raise
            </button>
            {/* Fold button */}
            <button
              disabled={!gameState || gameState?.whoseTurn !== currentPlayer?.id}
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
        )}

        <button
          onClick={() => {
            if (isPlayerSpectating) {
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
      </div>
    </div>
  );
}

export default GameControls;