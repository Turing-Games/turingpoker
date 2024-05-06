import card from "../card";
import player from "./player";
import m from "mithril";

const GameControls = {
  view: ({ attrs }) => {
    const gameState = attrs.gameState
    if (!gameState.isConnected || !gameState.gameData) {
      return m("p", "Waiting for the game to start or connect...");
    }

    // Retrieve the current bet and minimum raise amount
    const currentBet = gameState.gameData.bettingRound.currentBet;
    const minRaiseAmount = currentBet > 0 ? currentBet + gameState.gameData.bigBlind : gameState.gameData.bigBlind;
    const currentPlayer = gameState?.gameData?.players?.find(player => player.playerId === gameState?.playerId)
    const isPlayerEvenWithBet = currentPlayer.currentBet >= currentBet

    // Render game controls if it's the current player's turn
    return m("div.tg-poker__controls", [
      // call button
      currentBet > 0 ? m("button", {
        onclick: () => gameState.sendAction("call", currentBet)
      }, "Call") : null,
      // check button
      m("button", {
        onclick: () => {
          if (currentBet === 0 && isPlayerEvenWithBet) {
            gameState.sendAction("check")
          }
        },
        style: {
          pointerEvents: !isPlayerEvenWithBet ? 'none' : 'auto',
          opacity: !isPlayerEvenWithBet > 0 ? 0.3 : 1
        }
      }, "Check"),
      // raise button
      m("button", {
        onclick: () => {
          const amount = prompt(`Enter amount to raise (minimum: $${minRaiseAmount}):`, minRaiseAmount);
          if (amount && parseInt(amount, 10) >= minRaiseAmount) {
            gameState.sendAction("raise", parseInt(amount, 10));
          } else {
            alert(`Invalid raise amount. You must raise at least $${minRaiseAmount}.`);
          }
        }
      }, "Raise"),
      m("button", {
        onclick: () => gameState.sendAction("fold")
      }, "Fold")
    ]);
  }
};

export default {
  view: ({ attrs }) => {
    const gameState = attrs.gameState;
    if (gameState?.gameData?.winner?.length) {
      alert(`Winner: Player #${gameState?.gameData?.winner[0].playerId} with ${gameState?.gameData?.winner[0].name}`)
    }

    const currentPlayer = gameState?.gameData?.players?.find(player => player.playerId === gameState?.playerId)
    const isCurrentPlayerTurn = currentPlayer?.playerId === gameState?.gameData?.players[gameState?.gameData?.currentPlayer]?.playerId;
    const opponents = gameState?.gameData?.players.filter(player => player.playerId !== currentPlayer?.playerId)

    const gameOverview = [
      { label: 'Current Pot:', value: gameState?.gameData?.potTotal, prefix: '$' },
      { label: 'Current Bet:', value: gameState?.gameData?.bettingRound?.currentBet, prefix: '$' },
      { label: 'Dealer Position:', value: gameState?.gameData?.dealerPosition + 1, prefix: '' }
    ]

    if (process.env.NODE_ENV != 'producion') {
      gameOverview.push({
        label: 'Betting Round',
        value: gameState?.gameData?.bettingRound?.round,
        prefix: ''
      })
    }

    if (process.env.NODE_ENV != 'production') {
      console.log('gameData', gameState?.gameData)
    }

    if (!gameState.gameData) {
      console.log({ gameState })
      return m("p", "Loading game...");
    } else {
      return m("div.tg-poker__table",
        [
          m("div.tg-poker__table__top",
            // game overview data
            typeof gameState.gameData === "string" ?
              m("p", gameState.gameData) :
              m("div.tg-poker__overview",
                gameOverview.map((stat, i) => {
                  return m("div", { style: { color: "#5cc133" } }, [
                    m("div", stat.label),
                    m("div", `${stat.prefix}${stat.value}`)
                  ])
                }),
                (location.host.includes('localhost') &&
                  m('div', {
                    onclick: () => gameState.sendAction("reset_game"),
                    style: { textAlign: 'center', cursor: 'pointer', background: '#fff', position: 'absolute', top: 0, left: 0, color: '#000' }
                  }, "Reset Game (dev)")),
              ),
            // opponents, filtered out current player
            opponents?.length > 0 &&
            m("div", { style: { display: 'flex', gap: '16px', margin: '0 12px' } },
              opponents.map((opp, index) => {
                // starts at 1 if spectator is viewing
                const playerNumberOffset = !currentPlayer ? 1 : 0
                return m(player, {
                  player: opp,
                  isCurrentPlayerTurn: opp.playerId === gameState.gameData.players[gameState.gameData.currentPlayer]?.playerId,
                  showCards: gameState.gameData.isFlop,
                  title: `Player ${index + 2 - playerNumberOffset} (${opp.status}) ${opp.playerId === gameState.gameData.players[gameState.gameData.currentPlayer]?.playerId ? ' - Their Turn' : ''}`,
                  className: ''
                })
              })
            ),
          ),
          // center of table / deck / dealer cards
          m("div.tg-poker__table__dealer", {},
            m(card, { style: { width: '70px' } }),
            gameState.gameData.communityCards.map((data, i) => {
              return m(card, {
                style: {
                  transform: `translateX(-${78 * (i + 1)}px)`
                },
                value: data.value
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
                  player: currentPlayer,
                  showCards: true,
                  isCurrentPlayerTurn,
                  title: `You (${currentPlayer.status}) ${isCurrentPlayerTurn ? ' - Your Turn' : ''}`
                }),
                // controls
                gameState.gameData?.players?.length < 2 ?
                  m("p", "Waiting for players to join...") :
                  isCurrentPlayerTurn ?
                    m(GameControls, {
                      gameState: gameState
                    }) :
                    m("p", { style: { height: '40px' } }, "Waiting for your turn..."),
              ]),
              // spectators
              m("div.tg-poker__table__spectators", [
                m("h4", "Spectators"),
                gameState.gameData.spectators.map((spectator, index) =>
                  m("div.tg-poker__table__spectators__spectator", [
                    m("p", `Spectator ${index + 1}:`),
                    m("p", `${spectator.status}`)
                  ])
                )
              ]),
            ]) :
            m("div", { style: { height: 100, width: '100%' } })
        ]);
    }
  }
};
