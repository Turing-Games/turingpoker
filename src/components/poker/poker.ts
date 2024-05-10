import { ClientState } from "@tg/client";
import card from "../card";
import loader from "../loader";
import player from "./player";
import m from "mithril";
import * as Poker from '@tg/game-logic/poker'

const GameControls = {
  view: ({ attrs }) => {
    console.log('test')
    const clientState: ClientState = attrs.clientState
    const serverState = clientState?.serverState
    const gameState = clientState.serverState?.gameState;

    if (!clientState.isConnected || !gameState) {
      return m("p", "Waiting for the game to start or connect...");
    }

    // Retrieve the current bet and minimum raise amount
    const currentBet = gameState.targetBet;
    const minRaiseAmount = gameState.bigBlind;
    const currentPlayer = gameState.players?.find(player => player.id === clientState?.playerId)
    console.log({ currentPlayer })
    const isPlayerEvenWithBet = currentPlayer.currentBet >= currentBet

    // Render game controls if it's the current player's turn
    return m("div.tg-poker__controls", [
      // call button
      m("button", {
        onclick: () => {
          if (!isPlayerEvenWithBet) {
            clientState.sendMessage({ type: "action", action: { type: "call" } })
          }
        },
        style: {
          pointerEvents: isPlayerEvenWithBet ? 'none' : 'auto',
          opacity: isPlayerEvenWithBet ? 0.5 : 1
        }
      }, "Call"),
      // check button
      m("button", {
        onclick: () => {
          if (currentBet === 0 || isPlayerEvenWithBet) {
            clientState.sendMessage({ type: "action", action: { type: "call" } })
          }
        },
        style: {
          pointerEvents: !isPlayerEvenWithBet ? 'none' : 'auto',
          opacity: !isPlayerEvenWithBet ? 0.5 : 1
        }
      }, "Check"),
      // raise button
      m("button", {
        onclick: () => {
          const amount = prompt(`Enter amount to raise (minimum: $${minRaiseAmount}):`, minRaiseAmount.toString());
          if (amount && parseInt(amount, 10) >= minRaiseAmount) {
            clientState.sendMessage({ type: "action", action: { type: "raise", amount: parseInt(amount, 10) } })
          } else {
            alert(`Invalid raise amount. You must raise at least $${minRaiseAmount}.`);
          }
        },
        style: {
          opacity: currentPlayer.stack >= minRaiseAmount ? 1 : 0.5,
          pointerEvents: currentPlayer.stack >= minRaiseAmount ? 'auto' : 'none',
        }
      }, "Raise"),
      // TODO: should this be greyed out if isPlayerEvenWithBet?
      m("button", {
        onclick: () => clientState.sendMessage({ type: "action", action: { type: "fold" } })
      }, "Fold")
    ]);
  }
};

export default {
  view: ({ attrs }) => {
    const clientState: ClientState = attrs.clientState;

    console.log(clientState)
    const serverState = clientState.serverState;
    if (!serverState) {
      return
    }
    const gameState = serverState.gameState;
    if (!gameState) {
      return m.fragment({}, [m("button", {
        onclick: () => clientState.sendMessage({ type: 'join-game' })
      }, "Join Game"), m("button", {
        onclick: () => clientState.sendMessage({ type: 'start-game' })
      }, "Start Game")]);
    } else {
      if (process.env.NODE_ENV !== 'production') {
        m("button", {
          onclick: () => clientState.sendMessage({ type: 'leave-game' })
        }, "Leave Game")
      }
    }

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

    if (gameState.players.length > 1) {
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
              (location.host.includes('localhost') &&
                m('div', {
                  onclick: () => clientState.sendMessage({ type: 'reset-game' }),
                  style: { textAlign: 'center', cursor: 'pointer', background: '#fff', position: 'absolute', top: 0, left: 0, color: '#000' }
                }, "Reset Game (dev)")),
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
                    m("p", `${getPlayerStatus(spectator.playerId)}}`)
                  ])
                )
              ]),
            ]) :
            m("div", { style: { height: 100, width: '100%' } }),
          serverState.state.lastWinners &&
          m.fragment({}, serverState.state.lastWinners.map((winner, i) =>
            m('div.tg-poker__winner',
              m("div", {
                stlye: {
                  marginBottom: '24px'
                }
              }, `Player #${winner} won`),
            )))
        ]);
    } else {
      return m("div")
    }
  }
};
