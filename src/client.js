// Global state management

import PartySocket from "partysocket";
import header from "./components/header";
import { getImagePath } from "./utils/string_utilities";
import card from './components/card'

const gameState = {
  isConnected: false,
  gameData: null,
  socket: null,
  playerId: null, // This will store the client's player ID

  connect: () => {
    this.socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: "my-new-room"
    });

    this.socket.addEventListener("open", () => {
      gameState.isConnected = true;
      gameState.playerId = this.socket.id; // some issue here with properly setting this and using it for proper rendering logic
      if (process.env.NODE_ENV !== 'production') {
        console.log("Connected with ID:", this.playerId);
        console.log(gameState.playerId);
      }
      m.redraw();
    });

    this.socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (process.env.NODE_ENV !== 'production') {
          console.log(event.data)
        }
        gameState.gameData = data;
      } catch {
        gameState.gameData = event.data; // Handle plain text messages
      }
      m.redraw();
    });

    this.socket.addEventListener("close", () => {
      this.isConnected = false;
      console.log("WebSocket closed");
      m.redraw();
    });

    this.socket.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
    });
  },
  sendAction: (action, amount = 0) => {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action, amount }));
    } else {
      console.error("WebSocket is not initialized or not open.");
    }
  }
};

const GameControls = {
  view: () => {
    // Do not display controls until the game state is fully received and the game is active
    console.log("here is the bug")
    console.log(gameState.isConnected)
    console.log(!gameState.gameData)
    if (!gameState.isConnected || !gameState.gameData) {
      return m("p", "Waiting for the game to start or connect...");
    }

    // Determine if it's the current player's turn
    console.log(gameState.gameData.currentPlayer)
    console.log(gameState.playerId)

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

const App = {
  oninit: gameState.connect,
  view: () => {

    console.log(gameState?.gameData?.players)
    const currentPlayer = gameState?.gameData?.players?.find(player => player.playerId === gameState?.playerId)
    const isCurrentPlayerTurn = gameState?.gameData?.players[gameState?.gameData?.currentPlayer]?.playerId === gameState.playerId;

    const gameOverview = [
      { label: 'Current Pot:', value: gameState?.gameData?.potTotal, prefix: '$' },
      { label: 'Current Bet:', value: gameState?.gameData?.bettingRound?.currentBet, prefix: '$' },
      { label: 'Dealer Position:', value: gameState?.gameData?.dealerPosition + 1, prefix: '' }
    ]

    if (!gameState.gameData) {
      return m("p", "Loading...");
    }

    console.log({ currentPlayer })

    return m.fragment([
      // header
      m(header, {
        gameType: gameState.gameData.gameType
      }),
      // game overview data
      typeof gameState.gameData === "string" ?
        m("p", gameState.gameData) :
        m("div.tg-poker__overview",
          gameOverview.map((stat, i) => {
            return (
              m("div", [
                m("div", stat.label),
                m("div", `${stat.prefix}${stat.value}`)
              ])
            )
          })
        ),
      m("div.tg-poker__table", [
        // other players
        m("div.tg-poker__table__bottom", [

        ]),
        // current player and spectators
        currentPlayer &&
        m("div.tg-poker__table__bottom", [
          m("div.tg-poker__player", [
            m("h4", `You (${currentPlayer.status}) ${currentPlayer.playerId === gameState.gameData.players[gameState.gameData.currentPlayer].playerId ? ' - Your Turn' : ''}`),
            m("div", `Stack: $${currentPlayer.stackSize}`),
            m("div", `Current Bet: $${currentPlayer.currentBet}`),
            m("div", {
              style: { display: 'flex', gap: '6px' }
            },
              currentPlayer.cards.map((c, i) => {
                return m(card, { value: c.value, style: { height: '80px' } })
              })
            )
          ]),

          m("div", [
            m("h4", "Spectators:"),
            gameState.gameData.spectators.map((spectator, index) =>
              m("div.spectator", [
                m("h4", `Spectator ${index + 1}`),
                m("div", `Status: ${spectator.status}`)
              ])
            )
          ])
        ]),
        isCurrentPlayerTurn ?
          m(GameControls) :
          m("p", "Waiting for your turn...")
      ]),
    ]);
  }
};

m.mount(document.getElementById("app"), App);
