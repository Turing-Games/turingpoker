import card from "./card";

const GameControls = {
  view: ({ attrs }) => {
    const gameState = attrs.gameState
    // Do not display controls until the game state is fully received and the game is active
    if (process.env.NODE_ENV != 'production') {
      console.log("Game controls rendered")
      console.log('isConnected', gameState.isConnected)
      // Determine if it's the current player's turn
      console.log('currentPlayer', gameState.gameData.currentPlayer)
      console.log('playerId', gameState.playerId)
    }

    if (!gameState.isConnected || !gameState.gameData) {
      return m("p", "Waiting for the game to start or connect...");
    }

    // Retrieve the current bet and minimum raise amount
    const currentBet = gameState.gameData.bettingRound.currentBet;
    const minRaiseAmount = currentBet > 0 ? currentBet + gameState.gameData.bigBlind : gameState.gameData.bigBlind;

    // Render game controls if it's the current player's turn
    return m("div", [
      currentBet > 0 ? m("button", {
        onclick: () => gameState.sendAction("call", currentBet)
      }, "Call") : null,
      m("button", {
        onclick: () => gameState.sendAction("check"),
        disabled: currentBet > 0
      }, "Check"),
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
  oninit: () => false,
  view: ({ attrs }) => {
    const gameState = attrs.gameState;

    console.log('players', gameState?.gameData?.players)
    const currentPlayer = gameState?.gameData?.players?.find(player => player.playerId === gameState?.playerId)
    const isCurrentPlayerTurn = currentPlayer?.playerId === gameState?.gameData?.players[gameState.gameData.currentPlayer].playerId;

    const gameOverview = [
      { label: 'Current Pot:', value: gameState?.gameData?.potTotal, prefix: '$' },
      { label: 'Current Bet:', value: gameState?.gameData?.bettingRound?.currentBet, prefix: '$' },
      { label: 'Dealer Position:', value: gameState?.gameData?.dealerPosition + 1, prefix: '' }
    ]

    if (!gameState.gameData) {
      return m("p", "Loading...");
    }

    console.log({ currentPlayer })

    return m("div.tg-poker__table",
      [
        // other players
        m("div.tg-poker__table__top",
          // game overview data
          typeof gameState.gameData === "string" ?
            m("p", gameState.gameData) :
            m("div.tg-poker__overview",
              gameOverview.map((stat, i) => {
                return (
                  m("div", { style: { color: "#5cc133" } }, [
                    m("div", stat.label),
                    m("div", `${stat.prefix}${stat.value}`)
                  ])
                )
              })
            ),
          // filter out current player
          gameState.gameData.players.filter(player => player.playerId !== currentPlayer?.playerId).map((player, index) => {
            return (
              m("div.tg-poker__player", {
                class: gameState.playerId === player.playerId ? 'current-player' : ''
              }, [
                m("h4", `Player ${index + 2} (${player.status}) ${player.playerId === gameState.gameData.players[gameState.gameData.currentPlayer]?.playerId ? ' - Their Turn' : ''}`),
                m("div", `Stack: $${player.stackSize}`),
                m("div", `Current Bet: $${player.currentBet}`),
                m("div", `Cards: ${player.cards.join(', ')}`),
                m("div", {
                  style: { display: 'flex', gap: '6px' }
                },
                  player?.cards.map((c, i) => {
                    return m(card, { value: c.value, style: { height: '80px' } })
                  })
                )
              ])
            )
          }),
        ),
        // current player and spectators
        currentPlayer &&
        m("div.tg-poker__table__bottom", [
          m("div.tg-poker__player.tg-poker__player--1", [
            m("div.tg-poker__player__details", [
              m("h4", `You (${currentPlayer?.status}) ${isCurrentPlayerTurn ? ' - Your Turn' : ''}`),
              m("div", [
                m("div", `$${currentPlayer?.stackSize}`),
                m("div", `Bet: $${currentPlayer?.currentBet}`),
              ])
            ]),
            m("div", {
              style: { display: 'flex', gap: '6px' }
            },
              currentPlayer?.cards.map((c, i) => {
                return m(card, { value: c.value, style: { height: '80px' } })
              })
            ),
            isCurrentPlayerTurn ?
              m(GameControls, { gameState }) :
              m("p", "Waiting for your turn...")
          ]),

          m("div.tg-poker__table__spectators", [
            m("h4", "Spectators"),
            gameState.gameData.spectators.map((spectator, index) =>
              m("div.tg-poker__table__spectators__spectator", [
                m("p", `Spectator ${index + 1}:`),
                m("p", `${spectator.status}`)
              ])
            )
          ]),
        ]),
      ]);
  }
};
