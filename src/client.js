// Global state management
import PartySocket from "partysocket";
import header from "./components/header";
import poker from "./components/poker/poker";
import m from "mithril";
import admin from "./components/poker/admin";
import connect from "./components/connect";

const gameState = {
  isConnected: false,
  gameData: null,
  socket: null,
  playerId: null, // This will store the client's player ID
  joinedGame: false,

  connect: () => {
    this.socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: `turing-games-poker`,

    });

    this.socket.addEventListener("open", () => {
      gameState.isConnected = true;
      gameState.playerId = this.socket.id; // some issue here with properly setting this and using it for proper rendering logic
      if (process.env.NODE_ENV !== 'production') {
        console.log("Connected with ID:", this.socket.id);
      }
      m.redraw();
    });

    this.socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (process.env.NODE_ENV !== 'production') {
          console.log('event data', data)
        }
        gameState.gameData = data;
      } catch {
        gameState.gameData = event.data; // Handle plain text messages
      }
      m.redraw();
    });

    this.socket.addEventListener("close", () => {
      gameState.isConnected = false;
      console.log("WebSocket closed");
      m.redraw();
    });

    this.socket.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
    });
  },
  sendAction: (action, amount = 0) => {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      if (action === 'join' || action === 'spectate') {
        gameState.joinedGame = true
      }
      this.socket.send(JSON.stringify({ action, amount }));
    } else {
      console.error("WebSocket is not initialized or not open.");
    }
  }
};

const adminState = {
  games: []
}

const App = {
  oninit: gameState.connect,
  view: () => {
    return (
      m.fragment([
        // header
        m(header, {
          gameType: gameState?.gameData?.gameType
        }),
        gameState.isConnected && gameState.joinedGame ?
          m(poker, { gameState }) :
          m(connect, { gameState })
      ])
    )
  }
};

const Admin = {
  oninit: () => false,
  view: () => {
    return m(admin)
  }
}

m.mount(document.getElementById('app'), App)
// m.route(document.getElementById("app"), "/", {
//   "/": App,
//   "/admin": Admin,
// })
