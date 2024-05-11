import { ClientState } from "@tg/client";
import card from "../card";
import loader from "../loader";
import player from "./player";
import m from "mithril";
import * as Poker from '@tg/game-logic/poker'
import { GameControls } from "./game_controls";
import gamelog from "./gamelog";

export default {
  view: ({ attrs }) => {
    const clientState: ClientState = attrs.clientState;
    const serverState = clientState.serverState;
    if (!serverState) {
      return
    }

    const pokerPlayerTablePosition = [
      { bottom: 0, left: 0, right: 0, },
      { top: 0, left: 0 },
      { top: 0, left: 0, right: 0 },
      { top: 0, right: 0 },
      { top: 0, bottom: 0, right: 0 },
      { bottom: 0, right: 0 },
    ]

    const inGamePlayers = serverState?.inGamePlayers.map(player => player.playerId)
    const spectatorPlayers = serverState?.spectatorPlayers.map(player => player.playerId)
    const gameState = serverState.gameState;
    const gameHasEnoughPlayers = serverState?.inGamePlayers?.length >= serverState.config.minPlayers
    const remainingPlayersToJoin = serverState.config.minPlayers - serverState?.inGamePlayers?.length
    const isPlayerInGame = inGamePlayers.indexOf(clientState?.playerId) !== -1
    const isPlayerSpectating = spectatorPlayers.indexOf(clientState?.playerId) !== -1

    const currentPlayer = gameState?.players.find(player => player.id === clientState?.playerId)
    const isCurrentPlayerTurn = currentPlayer?.id === gameState?.whoseTurn;
    const opponents = clientState?.serverState.gameState?.players?.filter(player => player.id !== currentPlayer?.id)
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
      console.log('gameState', attrs)
    }

    // show game table
    if (gameHasEnoughPlayers && (isPlayerInGame || isPlayerSpectating)) {
      return m("div.tg-poker__table",
        [
          m(gamelog, { gameLog: clientState.updateLog }),
          m("div.tg-poker__table__top",
            // game overview data
            m("div.tg-poker__overview",
              gameOverview.map((stat, i) => {
                return m("div", { style: { color: "#5cc133" } }, [
                  m("div", stat.label),
                  m("div", `${stat.prefix}${stat.value}`)
                ])
              }),
            ),
          ),
          // center of table / deck / dealer cards
          m("div.tg-poker__table__dealer", {},
            // deck
            m(card),
            [
              // cards
              m("div",
                gameState?.cards.map((data, i) => {
                  return m(card, {
                    style: {
                      transform: `translateX(-${78 * (i + 1)}px)`
                    },
                    value: Poker.formatCard(data)
                  })
                })
              ),
              m("div.tg-poker__dealer-grid",
                // players around table
                opponents?.map((opp, index) => {
                  // starts at 1 if spectator is viewing
                  const playerNumberOffset = !currentPlayer ? 1 : 0
                  let status = getPlayerStatus(opp.id);
                  return m(player, {
                    player: opp,
                    hand: [],
                    isCurrentPlayerTurn: opp.id === currentTurn,
                    showCards: gameState?.round == 'showdown' || isPlayerSpectating,
                    title: `Player ${index + 2 - playerNumberOffset} (${status})`,
                    className: ''
                  })
                })
              )
            ]
          ),
          // bottom
          currentPlayer ? // else theyre a spectator
            m("div.tg-poker__table__bottom", [
              m("div", [
                // current player
                m(player, {
                  className: "tg-poker__player--1",
                  hand: serverState.hand || [],
                  player: currentPlayer,
                  showCards: true,
                  isCurrentPlayerTurn,
                  title: `You (${getPlayerStatus(currentPlayer.id)})`
                }),
                // controls
                serverState.state.gamePhase == "pending"
                  ? m("p", "Waiting for players to join...")
                  : isCurrentPlayerTurn
                    ? m(GameControls, {
                      clientState: clientState,
                    })
                    : m(
                      "p",
                      { style: { height: "40px" } },
                      "Waiting for your turn..."
                    ),
              ]),
              // spectators
              m("div.tg-poker__table__spectators", [
                m("h4", "Spectators"),
                serverState.spectatorPlayers
                  .concat(serverState.queuedPlayers)
                  .map((spectator, index) =>
                    m("div.tg-poker__table__spectators__spectator", [
                      m("p", `Spectator ${index + 1}:`),
                      m("p", `${getPlayerStatus(spectator.playerId)}`),
                    ])
                  ),
              ]),
            ])
            : m("div", { style: { height: 100, width: "100%" } }),
          serverState.winners.length > 0 &&
          m(
            "div.tg-poker__winner",
            m.fragment(
              {},
              m(
                "div",
                {
                  style: {
                    marginBottom: "24px",
                  },
                },
                serverState.winners.map((id, i) => m("p", `Player #${id} won`))
              )
            )
          ),
        ]);
    } else {
      if (!isPlayerInGame && !isPlayerSpectating) {
        return m.fragment({}, [
          // join game
          m("button", {
            onclick: () => clientState.sendMessage({ type: 'join-game' }),
            style: {
              pointerEvents: isPlayerInGame ? 'none' : 'auto',
              display: serverState.state.gamePhase === 'active' ? 'none' : 'block'
            },
          }, "Join Game"),
          // spectate
          m("button", {
            onclick: () => clientState.sendMessage({ type: 'spectate' }),
            style: {
              pointerEvents: isPlayerInGame ? 'none' : 'auto'
            },
          }, "Spectate"),
          // ui message
          m("button",
            remainingPlayersToJoin === 0 ?
              'Game has started' :
              `Waiting for ${remainingPlayersToJoin} more player${remainingPlayersToJoin > 1 ? 's' : ''} to join...`
          )
        ]);
      }
    }
  }
};
