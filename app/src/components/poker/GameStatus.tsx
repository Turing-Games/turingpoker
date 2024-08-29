import React from "react";
import { ClientState } from "@app/client";
import { sendMessage } from "@app/utils/websocket";

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

function GameStatus({ clientState, gameType = '' }: { clientState: ClientState, gameType?: string }) {
  const serverState = clientState?.serverState;
  const gameState = serverState?.gameState;

  if (!clientState.isConnected) {
    return <></>
  }

  if (!gameState) {
    return <></>;
  }

  return (
    <div className="p-[8px] bg-[black] rounded-[4px] w-[fit-content] flex gap-[8px] flex-wrap justify-between grid-auto grid-cols-[32px] sm:grid-cols-auto">
      <KV label="Pot" value={`$${gameState.pot.toFixed(2)}`} />
      {
        gameType !== 'kuhn' &&
        <>
          <KV label="Big blind" value={`$${gameState.bigBlind.toFixed(2)}`} />
          <KV label="Small blind" value={`$${gameState.smallBlind.toFixed(2)}`} />
        </>
      }
    </div>
  )
}

export default GameStatus;
