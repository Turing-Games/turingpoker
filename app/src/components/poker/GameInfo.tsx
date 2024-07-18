import React, { useEffect } from "react";
import { ClientState } from "@app/client";
import GameLog from "./GameLog";
import Header from "../Header";
import { ServerStateMessage } from "@tg/shared";
import Collapse, { CollapseToggle } from "../Collapse";
import useSmallScreen from "@app/hooks/useSmallScreen";

export function GameInfo({
  clientState, serverState, getPlayerStatus
}: {
  clientState: ClientState;
  serverState: ServerStateMessage;
  getPlayerStatus: (playerId: string) => string;
}) {
  const collapsible = useSmallScreen();
  const [collapsed, setCollapsed] = React.useState(true);

  return <div style={{
    position: collapsible ? "absolute" : undefined,
    height: '100%'
  }}>
    <Collapse collapsed={collapsible && collapsed}>
      <div className="tg-poker__table__gameinfo">
        <Header
          // gameType={gameType}
          players={clientState.serverState?.inGamePlayers || []}
          playerId={clientState.playerId}
          minPlayers={clientState.serverState?.config?.minPlayers || 2} />
        <div className="tg-poker__table__players terminal_text">
          <h4 className="terminal_text">Players</h4>
          {serverState.spectatorPlayers
            .concat(serverState.queuedPlayers)
            .map((spectator, index) => (
              <div key={index} className="tg-poker__table__players__player">
                <p>{`Spectator ${index + 1}:`}</p>
                <p>{`${getPlayerStatus(spectator.playerId)}`}</p>
              </div>
            ))}
          {serverState.inGamePlayers
            .map((spectator, index) => (
              <div key={index} className="tg-poker__table__players__player">
                <p>{`Player ${index + 1}:`}</p>
                <p>{`${getPlayerStatus(spectator.playerId)}`}</p>
              </div>
            ))}
        </div>
        <GameLog gameLog={clientState.updateLog} />
      </div>
      {collapsible &&
        <CollapseToggle
          collapsed={collapsed}
          style={{
            top: '12px',
            transition: 'right 0.2s',
          }}
          content={collapsed ? "Show Info" : "Hide Info"}
          setCollapsed={setCollapsed}
        />
      }
    </Collapse>
  </div>;
}
