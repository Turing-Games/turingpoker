import { useState, useEffect, useMemo, startTransition } from 'react'
import * as React from 'react';
import PartySocket from "partysocket";
import Header from "./components/Header";
import Poker from "./components/poker/Poker";
import * as PokerLogic from "./party/src/game-logic/poker";

import { createRoot } from "react-dom/client";

import { ServerStateMessage, ServerUpdateMessage } from "./party/src/shared";

import '@static/styles/styles.css'

export type ClientState = {
  isConnected: boolean;
  serverState: ServerStateMessage | null;
  lastServerState: ServerStateMessage | null;
  socket: PartySocket | null;
  playerId: string | null;
  updateLog: ServerUpdateMessage[];
};

export default function Client() {
  let [clientState, setClientState] = useState<ClientState>({
    isConnected: false,
    serverState: null,
    socket: null,
    lastServerState: null,
    playerId: null,
    updateLog: [],
  });

  const [previousActions, setPreviousActions] = useState<Record<string, PokerLogic.Action>>({});

  useEffect(() => {
    console.log('opening')
    const connectSocket = () => {
      const socket = new PartySocket({
        host: window.location.hostname + ':1999',
        room: "my-new-room"
      });

      socket.addEventListener("open", () => {
        console.log('opened')
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
          startTransition(() => {
            setClientState((prevState) => ({
              ...prevState,
              serverState: data,
              updateLog: [...prevState.updateLog, ...data.lastUpdates].slice(-500),
            }));
          });
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
  }, [setClientState]);

  return (
    <Poker clientState={clientState} previousActions={previousActions} />
  );
};


window.addEventListener('load', () => {
  const rootDiv = document.getElementById("root");
  console.log(rootDiv, <Client />);
  const root = createRoot(rootDiv!);
  root.render(<Client />);
});