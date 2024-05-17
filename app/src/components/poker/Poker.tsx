import React from "react";
import { ClientState } from "@app/client";
import card from "../Card";
import CardLoader from "../Loader";
import Player from "./Player";
import * as Poker from '@app/party/src/game-logic/poker'
import GameControls from "./GameControls";
import GameLog from "./GameLog";
import Card from "../Card";
import Header from "../Header";
import GameStatus from "./GameStatus";
import Cards from "./Cards";

interface Props {
  clientState: ClientState;
  previousActions: Record<string, Poker.Action>;
}

const Poker = ({ clientState, previousActions }: Props) => {
  const serverState = clientState.serverState;
  if (!serverState) {
    return null;
  }

  console.log({ clientState })

  const socket = clientState.socket
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
  const getPlayerStatus = (playerId: string) => {
    if (serverState.spectatorPlayers.find(player => player.playerId === playerId)) return 'spectator'
    if (serverState.queuedPlayers.find(player => player.playerId === playerId)) return 'queued'

    if (serverState.state.gamePhase == 'pending') return 'waiting'

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


  const gameOverview = [
    { label: 'Current Pot:', value: gameState?.pot.toFixed(2), prefix: '$' },
    { label: 'Current Bet:', value: gameState?.targetBet.toFixed(2), prefix: '$' },
    { label: 'Dealer Position:', value: (gameState?.dealerPosition + 1).toString(), prefix: '' }
  ]

  if (process.env.NODE_ENV != 'production') {
    gameOverview.push({
      label: 'Betting Round',
      value: gameState?.round,
      prefix: ''
    })
  }

  const hands: Record<string, Poker.Card[]> = {};
  for (const player of gameState?.players ?? []) {
    hands[player.id] = [];
  }
  hands[serverState.clientId] = serverState.hand ?? [];



  const angleOffset = Math.PI * 2 / (inGamePlayers?.length ?? 1) / 2;
  const dealerAngle = (gameState?.dealerPosition ?? 0) / (inGamePlayers?.length ?? 1) * Math.PI * 2 + angleOffset;

  // show game table
  return (
    <div className="tg-poker__table">
      <div className="tg-poker__table__gameinfo">
        <Header
          gameType="No Limit Texas Hold'em"
          players={clientState.serverState?.inGamePlayers || []}
          playerId={clientState.playerId}
          minPlayers={clientState.serverState?.config?.minPlayers || 2}
        />
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

      <div
        style={{
          flex: 1,
          flexDirection: "column",
          display: "flex",
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="tg-poker__table__dealer" >
          <div
            className="opponents"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
          >
            {inGamePlayers?.map((opp, index) => {
              const angle = (index / inGamePlayers.length) * Math.PI * 2 + angleOffset;
              return (
                <div
                  className="tg-poker__table__player-container"
                  style={{
                    left:
                      Math.sin(angle) * 65 + 50 + "%",
                    bottom:
                      -Math.cos(angle) * 65 + 50 + "%",
                  }}
                >
                  <Player
                    key={index}
                    player={opp}
                    hand={hands[opp.id]}
                    isCurrentPlayerTurn={opp.id === currentTurn}
                    showCards
                    title={`Player ${index + 1}${clientState.playerId === opp.id ? " (You)" : ""
                      }`}
                  />
                </div>
              );
            })}
          </div>
          {
            gameState && <div className="tg-poker__table__dealer_marker" style={{
              left: Math.sin(dealerAngle) * 40 + 50 + "%",
              bottom: -Math.cos(dealerAngle) * 40 + 50 + "%",
            }}>
              D
            </div>
          }
          <GameStatus clientState={clientState} />
          <Cards cards={gameState?.cards ?? []} />
        </div>
        <div className="tg-poker__table__controlpanel">
          <GameControls clientState={clientState} />
        </div>
      </div>
    </div>
  );
};

export default PokerTable;