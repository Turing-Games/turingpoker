import React, { useEffect } from "react";
import { ClientState } from "@app/client";
import card from "../Card";
import CardLoader from "../Loader";
import Player from "./Player";
import * as Kuhn from '@app/party/src/game-logic/kuhn'
import GameControls from "./GameControls";
import Card from "../Card";
import GameStatus from "./GameStatus";
import Cards from "./Cards";
import { GameInfo } from "./GameInfo";
import { sendMessage } from "@app/utils/websocket";
import useSmallScreen from "@app/hooks/useSmallScreen";
import ConnectionFailed from "../ConnectionFailed";
import { Action } from "@tg/shared";

interface Props {
  clientState: ClientState;
  previousActions: Record<string, Action>;
}

const PokerGame = ({ clientState, previousActions }: Props) => {

  const serverState = clientState.serverState;
  if (!serverState) {
    return <ConnectionFailed />;
  }

  const socket = clientState.socket
  const playerId = clientState.playerId
  const spectatorPlayers = serverState?.spectatorPlayers.map(player => player.playerId)
  const gameState = serverState.gameState;
  const gameHasEnoughPlayers = serverState?.inGamePlayers?.length >= serverState.config.minPlayers
  const remainingPlayersToJoin = serverState.config.minPlayers - serverState?.inGamePlayers?.length
  const inGamePlayers = serverState.gameState?.players
  const isPlayerInGame = !!inGamePlayers?.find(p => p.id == clientState?.playerId)
  const isPlayerSpectating = !!serverState.spectatorPlayers?.find(p => p.playerId == clientState?.playerId)
  const isPlayerQueued = !!serverState.queuedPlayers?.find(p => p.playerId == clientState?.playerId)
  const currentPlayer = gameState?.players.find(player => player.id === clientState?.playerId)
  const isCurrentPlayerTurn = currentPlayer?.id === gameState?.whoseTurn;
  const currentTurn = gameState?.whoseTurn
  const gamePhase = serverState.gamePhase

  const getPlayerStatus = (playerId: string) => {
    if (serverState.spectatorPlayers.find(player => player.playerId === playerId)) return 'spectator'
    if (serverState.queuedPlayers.find(player => player.playerId === playerId)) return 'queued'

    if (serverState.gamePhase == 'pending') return 'waiting'

    if (gameState?.players.find(player => player.id === playerId)?.folded)
      return 'folded'

    if (previousActions[playerId]) {
      const action = previousActions[playerId];
      if (action.type == 'fold') return 'folded'
      else if (action.type == 'call') return 'called'
      else if (action.type == 'raise') return 'raised ' + action.amount.toFixed(2);
    }
    return "in game"
  }

  const smallScreen = useSmallScreen();

  const gameOverview = [
    { label: 'Current Pot:', value: gameState?.pot.toFixed(2), prefix: '$' },
    { label: 'Current Bet:', value: gameState?.targetBet.toFixed(2), prefix: '$' },
    { label: 'Dealer Position:', value: (gameState?.dealerPosition + 1).toString(), prefix: '' }
  ]

  if (import.meta.env.DEV) {
    gameOverview.push({
      label: 'Betting Round',
      value: gameState?.round,
      prefix: ''
    })
  }

  const hands: Record<string, Kuhn.Card[]> = {};
  for (const player of gameState?.players ?? []) {
    hands[player.id] = [];
  }
  hands[serverState.clientId] = serverState.hand ?? [];

  const currentPlayerIndex = gameState?.players.findIndex(player => player.id === clientState.playerId) ?? 0
  const angleOffset = -currentPlayerIndex * Math.PI * 2 / (inGamePlayers?.length ?? 1);
  const dealerIndex = (gameState?.dealerPosition ?? 0)

  const JoinButton = () => {
    return (
      <button
        style={{
          position: "absolute",
          ...(
            smallScreen
              ? { top: "12px", right: "12px" }
              : { bottom: "12px", left: "50%", transform: "translateX(-50%)", width: '100%' }
          ),
        }}
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
    )
  };

  const verticalScreen = useSmallScreen(500, 1e9);
  const getPlayerPosition: (index: number) => {
    left: string;
    bottom: string;
  } = (index: number) => {
    const cnt = inGamePlayers?.length ?? 1;
    const angle =
      (index / cnt) * Math.PI * 2 + angleOffset;
    let x = Math.sin(angle);
    let y = Math.cos(angle);

    const lo = Math.max(x, y, -x, -y);
    // on small screens project onto edge of rectangle
    if (smallScreen) {
      x /= lo;
      y /= lo;
    }

    const scaleX = smallScreen ? 70 : 65;
    let scaleY = smallScreen ? 75 : 65;

    const offsetX = 0;
    let offsetY = smallScreen ? -15 : 0;
    const scale = 1;
    if (verticalScreen) {
      scaleY *= 0.9;
      offsetY *= 0.9;
    }
    return {
      left: ((x * scaleX + offsetX) * scale + 50) + "%",
      bottom: ((-y * scaleY + offsetY) * scale + 50) + "%",
    }
  }

  console.log('clientState.serverState', clientState.serverState)

  // show game table
  return (
    <div className="p-0 flex flex-grow items-stretch justify-between text-green-100 overflow-hidden">
      <GameInfo
        clientState={clientState}
        serverState={serverState}
        getPlayerStatus={getPlayerStatus}
      />

      <div
        style={{
          flex: 1,
          flexDirection: "column",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* spacer so that game board is centered minus height of controlpanel*/}
        <div style={{ height: '12px', width: '100%' }}></div>
        <div className="tg-poker__table__dealer">
          <div
            className="flex gap-[16px]"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
          >
            {inGamePlayers?.map((opp, index) => {
              return (
                <div
                  key={index}
                  className="absolute flex justify-center items-center"
                  style={{
                    transform: 'translate(-50%, 50%)',
                    ...(getPlayerPosition(index))
                  }}
                >
                  <Player
                    key={index}
                    player={opp}
                    hand={hands[opp.id]}
                    isCurrentPlayerTurn={opp.id === currentTurn}
                    showCards={clientState.playerId === opp.id}
                    title={`Player ${index + 1}${clientState.playerId === opp.id ? " (You)" : ""
                      }`}
                    dealer={index === gameState?.dealerPosition}
                  />
                </div>
              );
            })}
          </div>
          <GameStatus clientState={clientState} gameType={'kuhn'} />
        </div>
        {inGamePlayers?.map(p => p.id).indexOf(playerId) !== -1 &&
          <div className="p-[8px]">
            <GameControls clientState={clientState} joinLeave={!smallScreen} gameType={'kuhn'} />
          </div>
        }
      </div>
      {(smallScreen && gamePhase !== 'final') && <JoinButton />}
    </div>
  );
};

export default PokerGame;
