import { useState, useEffect } from 'hono/jsx'
import PartySocket from "partysocket";
import Header from "./components/Header";
import Poker from "./components/poker/Poker";

import { render } from "hono/jsx/dom";

import { ServerStateMessage, ServerUpdateMessage } from "./party/src/shared";

import '@static/styles/styles.css'

export type ClientState = {
  isConnected: boolean;
  serverState: ServerStateMessage | null;
  socket: PartySocket | null;
  playerId: string | null;
  updateLog: ServerUpdateMessage[];
};

const debounce = (fn: Function, ms: number) => {
  let timeout: NodeJS.Timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this as any, arguments), ms);
  };
}

export default function Client() {
  const [clientState, setClientState] = useState<ClientState>({
    isConnected: false,
    serverState: null,
    socket: null,
    playerId: null,
    updateLog: [],
  });

  useEffect(() => {
    const connectSocket = () => {
      const socket = new PartySocket({
        host: 'localhost:1999',
        room: "my-new-room"
      });

      socket.addEventListener("open", () => {
        setClientState((prevState) => ({
          ...prevState,
          isConnected: true,
          playerId: socket.id,
          socket: socket,
        }));
      });

      socket.addEventListener("message", debounce((event) => {
        try {
          const data: ServerStateMessage = JSON.parse(event.data);
          setClientState((prevState) => ({
            ...prevState,
            serverState: data,
            updateLog: [...prevState.updateLog, ...data.lastUpdates],
          }));
        } catch {
          setClientState((prevState) => ({
            ...prevState,
            serverState: null,
          }));
        }
      }, 10));

      socket.addEventListener("close", () => {
        setClientState((prevState) => ({
          ...prevState,
          isConnected: false,
        }));
      });

      socket.addEventListener("error", (event) => {
        console.error("WebSocket error:", event);
      });

      setClientState((prevState) => ({
        ...prevState,
        socket: socket,
      }));
    };

    connectSocket();

    return () => {
      if (clientState.socket) {
        clientState.socket.close();
      }
    };
  }, []);

  return (
    <div>
      <Header
        gameType="No Limit Texas Hold'em"
        players={clientState.serverState?.inGamePlayers || []}
        playerId={clientState.playerId}
        minPlayers={clientState.serverState?.config?.minPlayers || 2}
      />
      <Poker clientState={clientState} />
    </div>
  );
};


const root = document.getElementById("root");
render(<Client />, root!);
