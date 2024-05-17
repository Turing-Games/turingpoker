import { useState, useEffect } from 'react'
import * as React from 'react';
import PartySocket from "partysocket";
import Poker from "./poker/Poker";
import * as PokerLogic from "..//party/src/game-logic/poker";
import { ServerStateMessage, ServerUpdateMessage } from "../party/src/shared";

import '@static/styles/styles.css'

export type ClientState = {
  isConnected: boolean;
  serverState: ServerStateMessage | null;
  socket: PartySocket | null;
  playerId: string | null;
  updateLog: ServerUpdateMessage[];
};

export default function PokerClient() {
  let [clientState, setClientState] = useState<ClientState>({
    isConnected: false,
    serverState: null,
    socket: null,
    playerId: null,
    updateLog: [],
  });

  const [previousActions, setPreviousActions] = useState<Record<string, PokerLogic.Action>>({});

  useEffect(() => {
    const connectSocket = () => {
      const socket = new PartySocket({
        host: import.meta.env.VITE_ENV == 'production' ? 'ws.turingpoker.com' : 'localhost:1999',
        room: "tgpoker"
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
              console.log('done')
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
  }, [setClientState]);

  return (
    <Poker clientState={clientState} previousActions={previousActions} />
  );
};