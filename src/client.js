// Global state management

import PartySocket from "partysocket";
import header from "./components/header";

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
      console.log("Connected with ID:", this.playerId);
      console.log(gameState.playerId);
      m.redraw();
    });

    this.socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(event.data)
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
    const isCurrentPlayerTurn = gameState.gameData.players[gameState.gameData.currentPlayer].playerId === gameState.playerId;
    if (!isCurrentPlayerTurn) {
      return m("p", "Waiting for your turn...");
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

const App = {
  oninit: gameState.connect,
  view: () => {
    if (!gameState.gameData) {
      return m("p", "Loading...");
    }

    return m("div", [
      m(header),
      typeof gameState.gameData === "string" ?
        m("p", gameState.gameData) :
        m("div", [
          m("h2", `Table: ${gameState.gameData.gameType}`),
          m("div", `Current Pot: $${gameState.gameData.potTotal}`),
          m("div", `Current Bet: $${gameState.gameData.bettingRound.currentBet}`),
          m("div", `Dealer Position: Player ${gameState.gameData.dealerPosition + 1}`),
          m("h3", "Players:"),
          gameState.gameData.players.map((player, index) =>
            m("div.player", {
              class: gameState.playerId === player.playerId ? 'current-player' : ''
            }, [
              m("h4", `Player ${index + 1} (${player.status}) ${player.playerId === gameState.gameData.players[gameState.gameData.currentPlayer].playerId ? ' - Your Turn' : ''}`),
              m("div", `Stack: $${player.stackSize}`),
              m("div", `Current Bet: $${player.currentBet}`),
              m("div", `Cards: ${player.cards.join(', ')}`),
              gameState.playerId === player.playerId ? m("div", "This is You") : null
            ])
          ),
          m("h3", "Spectators:"),
          gameState.gameData.spectators.map((spectator, index) =>
            m("div.spectator", [
              m("h4", `Spectator ${index + 1}`),
              m("div", `Status: ${spectator.status}`)
            ])
          )
        ]),
      m(GameControls) // Render game controls as a child component
    ]);
  }
};

m.mount(document.getElementById("app"), App);
