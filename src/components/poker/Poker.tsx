import React from "react";
import { ClientState } from "@tg/Client";
import card from "../Card";
import CardLoader from "../Loader";
import Player from "./Player";
import * as Poker from '@tg/game-logic/poker'
import GameControls from "./GameControls";
import GameLog from "./GameLog";
import Card from "../Card";
import { sendMessage } from "@tg/utils/websocket";

interface Props {
  clientState: ClientState;
}

const PokerTable: React.FC<Props> = ({ clientState }: { clientState: ClientState }) => {

  const serverState = clientState.serverState;
  if (!serverState) {
    return null;
  }

  const socket = clientState.socket
  const inGamePlayers = serverState?.inGamePlayers.map(player => player.playerId)
  const spectatorPlayers = serverState?.spectatorPlayers.map(player => player.playerId)
  const gameState = serverState.gameState;
  const gameHasEnoughPlayers = serverState?.inGamePlayers?.length >= serverState.config.minPlayers
  const remainingPlayersToJoin = serverState.config.minPlayers - serverState?.inGamePlayers?.length
  const isPlayerInGame = inGamePlayers.indexOf(clientState?.playerId) !== -1
  const isPlayerSpectating = spectatorPlayers.indexOf(clientState?.playerId) !== -1
  const isPlayerQueued = serverState.queuedPlayers.indexOf(clientState?.playerId) !== -1

  const currentPlayer = gameState?.players.find(player => player.id === clientState?.playerId)
  const isCurrentPlayerTurn = currentPlayer?.id === gameState?.whoseTurn;
  const opponents = serverState.gameState?.players?.filter(player => player.id !== currentPlayer?.id)
  const currentTurn = gameState?.whoseTurn
  const getPlayerStatus = (playerId: string) => {
    if (serverState.spectatorPlayers.find(player => player.playerId === playerId)) return 'spectator'
    if (serverState.queuedPlayers.find(player => player.playerId === playerId)) return 'queued'

    if (serverState.state.gamePhase == 'pending') return 'waiting'

    if (gameState?.players.find(player => player.id === playerId)?.folded)
      return 'folded'

    if (gameState?.players.find(player => player.id === playerId)?.currentBet === gameState?.targetBet)
      return 'checked'

    if (gameState?.players.find(player => player.id === playerId)?.currentBet > gameState?.targetBet)
      return 'raised'

    if (gameState?.players.find(player => player.id === playerId)?.currentBet < gameState?.targetBet)
      return 'called'
  }


  const gameOverview = [
    { label: 'Current Pot:', value: gameState?.pot.toString(), prefix: '$' },
    { label: 'Current Bet:', value: gameState?.targetBet.toString(), prefix: '$' },
    { label: 'Dealer Position:', value: (gameState?.dealerPosition + 1).toString(), prefix: '' }
  ]

  if (process.env.NODE_ENV != 'production') {
    gameOverview.push({
      label: 'Betting Round',
      value: gameState?.round,
      prefix: ''
    })
  }

  if (process.env.NODE_ENV != 'production') {
    console.log('gameState', gameState)
  }

  // show game table
  return (
    <div className="tg-poker__table">
      <GameLog gameLog={clientState.updateLog} />
      <div className="tg-poker__table__top">
        <div className="tg-poker__overview">
          {gameOverview.map((stat, i) => (
            <div key={i} style={{ color: "#5cc133" }}>
              <div>{stat.label}</div>
              <div>{`${stat.prefix}${stat.value}`}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="opponents">
        {opponents?.map((opp, index) => {
          const playerNumberOffset = !currentPlayer ? 1 : 0;
          let status = getPlayerStatus(opp.id);
          return (
            <Player
              key={index}
              player={opp}
              hand={[]}
              isCurrentPlayerTurn={opp.id === currentTurn}
              showCards={gameState?.round == "showdown" || isPlayerSpectating}
              title={`Player ${index + 2 - playerNumberOffset} (${status})`}
              className=""
            />
          );
        })}
      </div>
      <div className="tg-poker__table__dealer">
        <Card />
        <div>
          {gameState?.cards.map((data, i) => (
            <Card
              key={i}
              style={{ transform: `translateX(-${78 * (i + 1)}px)` }}
              value={Poker.formatCard(data)}
            />
          ))}
        </div>
      </div>
      <div className="tg-poker__table__bottom">
        {currentPlayer ? (
          <div>
            <Player
              className="tg-poker__player--1"
              hand={serverState.hand || []}
              player={currentPlayer}
              showCards={true}
              isCurrentPlayerTurn={isCurrentPlayerTurn}
              title={`You (${getPlayerStatus(currentPlayer.id)})`}
            />
            {serverState.state.gamePhase === "pending" ? (
              <p>Waiting for players to join...</p>
            ) : isCurrentPlayerTurn ? (
              <GameControls clientState={clientState} />
            ) : (
              <p style={{ height: "40px" }}>Waiting for your turn...</p>
            )}
          </div>
        ) : (
          <div style={{ height: 100, width: "100%" }} />
        )}

        <div className="tg-poker__table__join">
          <button
            style ={{
              width: "100%",
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
        </div>
        <div className="tg-poker__table__spectators">
          <h4>Spectators</h4>
          {serverState.spectatorPlayers
            .concat(serverState.queuedPlayers)
            .map((spectator, index) => (
              <div
                key={index}
                className="tg-poker__table__spectators__spectator"
              >
                <p>{`Spectator ${index + 1}:`}</p>
                <p>{`${getPlayerStatus(spectator.playerId)}`}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PokerTable;