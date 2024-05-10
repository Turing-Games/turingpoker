import { ClientState } from "@tg/client";
import card from "../card";
import loader from "../loader";
import player from "./player";
import m from "mithril";
import * as Poker from '@tg/game-logic/poker'
import { GameControls } from "./game_controls";

export default {
  view: ({ attrs }) => {
    const clientState: ClientState = attrs.clientState;
    console.log(clientState)
    const serverState = clientState.serverState;
    if (!serverState) {
      return
    }

    const inGamePlayers = serverState?.inGamePlayers.map(player => player.playerId)
    const gameState = serverState.gameState;
    const canGameStart = serverState?.inGamePlayers?.length > 1
    const remainingPlayersToJoin = serverState.config.minPlayers - serverState?.inGamePlayers?.length
    const isPlayerInGame = inGamePlayers.indexOf(clientState?.playerId) !== -1

    console.log({ canGameStart })
    console.log({ isPlayerInGame })
    console.log(serverState.state.gamePhase)

    const currentPlayer = gameState.players?.find(player => player.id === clientState?.playerId)
    const isCurrentPlayerTurn = currentPlayer?.id === Poker.whoseTurn(gameState).who;
    const opponents = clientState?.serverState.gameState?.players?.filter(player => player.id !== currentPlayer?.id)
    const { who: currentTurn } = Poker.whoseTurn(gameState);
    const getPlayerStatus = (playerId: string) => {
      if (serverState.spectatorPlayers.find(player => player.playerId === playerId)) return 'spectator'
      if (serverState.queuedPlayers.find(player => player.playerId === playerId)) return 'queued'

      if (serverState.state.gamePhase == 'pending') return 'waiting'

      if (gameState.players.find(player => player.id === playerId)?.folded)
        return 'folded'

      if (gameState.players.find(player => player.id === playerId).currentBet === gameState.targetBet)
        return 'checked'

      if (gameState.players.find(player => player.id === playerId).currentBet > gameState.targetBet)
        return 'raised'

      if (gameState.players.find(player => player.id === playerId).currentBet < gameState.targetBet)
        return 'called'
    }


    const gameOverview = [
      { label: 'Current Pot:', value: gameState.pot.toString(), prefix: '$' },
      { label: 'Current Bet:', value: gameState.targetBet.toString(), prefix: '$' },
      { label: 'Dealer Position:', value: (gameState.dealerPosition + 1).toString(), prefix: '' }
    ]

    if (process.env.NODE_ENV != 'production') {
      gameOverview.push({
        label: 'Betting Round',
        value: gameState.round,
        prefix: ''
      })
    }

    if (process.env.NODE_ENV != 'production') {
      console.log('gameState', attrs)
    }

    if (inGamePlayers.length > 1) {
      return m("div.tg-poker__table",
        [
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
            // opponents, filtered out current player
            opponents?.length > 0 &&
            m("div.opponents",
              opponents.map((opp, index) => {
                // starts at 1 if spectator is viewing
                const playerNumberOffset = !currentPlayer ? 1 : 0
                let status = getPlayerStatus(opp.id);
                return m(player, {
                  player: opp,
                  hand: [],
                  isCurrentPlayerTurn: opp.id === currentTurn,
                  showCards: gameState.round == 'showdown',
                  title: `Player ${index + 2 - playerNumberOffset} (${status}) ${opp.id == currentTurn ? ' - Their Turn' : ''}`,
                  className: ''
                })
              })
            ),
          ),
          // center of table / deck / dealer cards
          m("div.tg-poker__table__dealer", {},
            m(card),
            gameState.cards.map((data, i) => {
              console.log(Poker.formatCard(data))
              return m(card, {
                style: {
                  transform: `translateX(-${78 * (i + 1)}px)`
                },
                value: Poker.formatCard(data)
              })
            })
          ),
          // bottom
          currentPlayer ? // else theyre a spectator
            m("div.tg-poker__table__bottom", [
              m("div", { style: { margin: '12px' } }, [
                // current player
                m(player, {
                  className: 'tg-poker__player--1',
                  hand: serverState.hand || [],
                  player: currentPlayer,
                  showCards: true,
                  isCurrentPlayerTurn,
                  title: `You (${getPlayerStatus(currentPlayer.id)}) ${isCurrentPlayerTurn ? ' - Your Turn' : ''}`
                }),
                // controls
                serverState.state.gamePhase == 'pending' ?
                  m("p", "Waiting for players to join...") :
                  isCurrentPlayerTurn ?
                    m(GameControls, {
                      clientState: clientState
                    }) :
                    m("p", { style: { height: '40px' } }, "Waiting for your turn..."),
              ]),
              // spectators
              m("div.tg-poker__table__spectators", [
                m("h4", "Spectators"),
                serverState.spectatorPlayers.concat(serverState.queuedPlayers).map((spectator, index) =>
                  m("div.tg-poker__table__spectators__spectator", [
                    m("p", `Spectator ${index + 1}:`),
                    m("p", `${getPlayerStatus(spectator.playerId)}`)
                  ])
                )
              ]),
            ]) :
            m("div", { style: { height: 100, width: '100%' } }),
          serverState.winners.length > 0 &&
          m('div.tg-poker__winner',
            m.fragment({},
              m("div", {
                stlye: {
                  marginBottom: '24px'
                }
              }, [
                serverState.winners.map((id, i) => m("p", `Player #${id} won`)),
                m("div.tg-poker__winner__buttons", [
                  m("button", {
                    onclick: () => clientState.sendMessage({ type: 'join-game' })
                  }, "New Game"),
                  m("button", {
                    onclick: () => clientState.sendMessage({ type: 'leave-game' })
                  }, "Quit")
                ])
              ]
              )
            )
          )
        ]);
    } else {
      if (!isPlayerInGame || serverState.state.gamePhase == 'pending') {
        return m.fragment({}, [
          m("button", {
            onclick: () => clientState.sendMessage({ type: 'join-game' }),
            style: {
              pointerEvents: isPlayerInGame ? 'none' : 'auto'
            },
          },
            !isPlayerInGame ?
              canGameStart ?
                'Click "Start Game when you are ready' : 'Join Game' :
              `Waiting for ${remainingPlayersToJoin} more player${remainingPlayersToJoin > 1 ? 's' : ''} to join...`
          ),
          m("button", {
            onclick: () => clientState.sendMessage({ type: 'start-game' }),
            style: {
              pointerEvents: 'none'
            },
          }, "Game will auto-start when player minimum has been reached")
        ]);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          return m("button", {
            style: {
              backgroundColor: 'red',
              position: 'absolute',
              top: 0,
              right: 0
            },
            onclick: () => clientState.sendMessage({ type: 'leave-game' })
          }, "Leave Game")
        }
      }
    }
  }
};
