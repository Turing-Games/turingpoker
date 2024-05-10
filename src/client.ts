// Global state management
import PartySocket from "partysocket";
import header from "./components/header";
import poker from "./components/poker/poker";
import m from "mithril";
import admin from "./components/poker/admin";
import connect from "./components/connect";
import { ServerStateMessage, ClientMessage } from "./shared";
import * as Poker from "@tg/game-logic/poker";

export type ClientState = {
  isConnected: boolean,
  serverState: ServerStateMessage,
  socket: PartySocket | null,
  playerId: string | null,
  connect: () => void,
  sendMessage: (action: ClientMessage) => void
}
const clientState: ClientState = {
  isConnected: false,
  serverState: null,
  socket: null,
  playerId: null, // This will store the client's player ID

  connect() {
    this.socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: "my-new-room"
    });

    this.socket.addEventListener("open", () => {
      clientState.isConnected = true;
      clientState.playerId = this.socket.id; // some issue here with properly setting this and using it for proper rendering logic
      console.log("Connected with ID:", clientState.playerId);
      m.redraw();
    });

    this.socket.addEventListener("message", (event) => {
      try {
        const data: ServerStateMessage = JSON.parse(event.data);
        clientState.serverState = data;
      } catch {
        clientState.serverState = null;
      }
      m.redraw();
    });

    this.socket.addEventListener("close", () => {
      clientState.isConnected = false;
      console.log("WebSocket closed");
      m.redraw();
    });

    this.socket.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
    });
  },
  sendMessage(message) {
    console.log(this)
    console.log('sending message', this.socket)
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log(this.socket)
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not initialized or not open.");
    }
  }
};

const adminState = {

}

const App = {
  oninit: () => clientState.connect(),
  view: () => {
    return (
      m.fragment({}, [
        // header
        m(header, {
          gameType: "No Limit Texas Hold'em",
          players: clientState?.serverState?.inGamePlayers,
          playerId: clientState?.playerId
        }),
        m(poker, { clientState })
      ])
    )
  }
};

const Admin = {
  oninit: () => false,
  view: () => {
    return m(admin, { adminState })
  }
}

// m.mount(document.getElementById('app'), App)
m.route(document.getElementById("app"), "/", {
  "/": App,
  "/admin": Admin,
})
