// Global state management

import PartySocket from "partysocket";
import header from "./components/header";
import poker from "./components/poker";

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

const App = {
  oninit: gameState.connect,
  view: () => {
    return (
      m.fragment([
        // header
        m(header, {
          gameType: gameState?.gameData?.gameType
        }),
        m(poker, { gameState })
      ])
    )
  }
};

m.mount(document.getElementById("app"), App);
