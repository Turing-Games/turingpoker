import React from "react";
import { ClientState } from "@app/client";
import { sendMessage } from "@app/party/src/utils/websocket";

const KV = ({ label, value }: { label: string, value: string }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 'fit-content',
  }}>
    <div>{label}</div>
    <div>{value}</div>
  </div>
)

function GameStatus({ clientState }: { clientState: ClientState }) {
  const serverState = clientState?.serverState;
  const gameState = serverState?.gameState;

  if (!clientState.isConnected) {
    return <></>
  }

  if (!gameState) {
    return <></>;
  }

  return (
    <div className="tg-poker__table__gamestatus">
      <KV label="Pot" value={`$${gameState.pot.toFixed(2)}`} />
      <KV label="Bet" value={`$${gameState.targetBet.toFixed(2)}`} />
      <KV label="Round" value={gameState.round} />
      <KV label="Big blind" value={`$${gameState.bigBlind.toFixed(2)}`} />
      <KV label="Small blind" value={`$${gameState.smallBlind.toFixed(2)}`} />
    </div>
  )
}

export default GameStatus;