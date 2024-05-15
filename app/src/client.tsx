import { useState, useEffect } from 'hono/jsx'
import PartySocket from "partysocket";
import Header from "./components/Header";
import Poker from "./components/poker/Poker";
import * as PokerLogic from "./party/src/game-logic/poker";

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

function debounceState<T>(fn: (arg: (arg: T) => T) => void, ms: number) {
  let timeout: NodeJS.Timeout;
  const updates: ((arg: T) => T)[] = [];
  let lastUpdate = Date.now();
  return (upd: (arg: T) => T) => {
    if (Date.now() - lastUpdate < ms*10) clearTimeout(timeout);
    updates.push(upd)
    timeout = setTimeout(() => {
      lastUpdate = Date.now();
      const up = (val: T) => updates.reduce((acc, update) => update(acc), val);
      fn(up);
      updates.length = 0
    }, ms);
  };
}

export default function Client() {
  let [clientState, setClientState_] = useState<ClientState>({
    isConnected: false,
    serverState: null,
    socket: null,
    playerId: null,
    updateLog: [],
  });
  const setClientState = debounceState(setClientState_, 2)

  const [previousActions, setPreviousActions] = useState<Record<string, PokerLogic.Action>>({});

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

      socket.addEventListener("message", (event) => {
        try {
          const data: ServerStateMessage = JSON.parse(event.data);
          for (const update of data.lastUpdates) {
            if (update.type == 'game-ended') {
              setPreviousActions({})
            }
            if (update.type == 'action') {
              setPreviousActions((prevState) => ({
                ...prevState,
                [update.player.playerId]: update.action,
              }));
            }
          }
          setClientState((prevState) => ({
            ...prevState,
            serverState: data,
            updateLog: [...prevState.updateLog, ...data.lastUpdates].slice(-1000),
          }));
        } catch {
          setClientState((prevState) => ({
            ...prevState,
            serverState: null,
          }));
        }
      });

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
  console.log(clientState);

  return (
    <Poker clientState={clientState} previousActions={previousActions} />
  );
};


const root = document.getElementById("root");
render(<Client />, root!);
