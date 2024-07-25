import React, { useEffect } from "react";
import { ClientState } from "@app/client";
import GameLog from "./GameLog";
import { ServerStateMessage } from "@tg/shared";
import Collapse, { CollapseToggle } from "../Collapse";
import useSmallScreen from "@app/hooks/useSmallScreen";
import { Text } from "@radix-ui/themes";
import Logo from '@static/images/logo.png'

export function GameInfo({
  clientState, serverState, getPlayerStatus
}: {
  clientState: ClientState;
  serverState: ServerStateMessage;
  getPlayerStatus: (playerId: string) => string;
}) {
  const collapsible = useSmallScreen();
  const [collapsed, setCollapsed] = React.useState(true);

  return (
    <div className={`${collapsible ? 'absolute' : ''} h-full`}>
      <Collapse collapsed={collapsible && collapsed}>
        <div className="flex flex-col h-0 min-h-full gap-[8px] max-w-[450px] p-[16px] justify-between items-stretch bg-[black] overflow-x-hidden">
          <div className="flex flex-col items-center font-mono">
            <div className="flex justify-left px-[12px] py-[8px] text-left relative bg-[black] left-0 border border-2 border-green-100" >
              <div className='m-[8px] z-[2]'>
                <img className="w-[35px] min-w-[35px]" src={Logo} alt="Logo" />
              </div>
              {/* text */}
              <div className='relative z-[3] text-center flex items-center flex-col' >
                <h2 className="m-0">{false ? `Table: ${'gameType'}` : 'Welcome!'}</h2>
                <Text>Turing Games</Text>
              </div>
              <div className='m-[8px] z-[2]'>
                <img className="w-[35px] min-w-[35px]" src={Logo} alt="Logo" />
              </div>
              {
                Array(4).fill('_').map((_, i) => (
                  <div className={`tg-header__squares tg-header__squares--${i}`} key={i} > </div>
                ))}
            </div>
          </div>
          <div className="bg-[black] top-0 overflow-y-auto p-[12px] right-0 text-green-100 border-2 border-green-100">
            <h4 className="font-mono text-green-100">Players</h4>
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
    </div>
  )
}
