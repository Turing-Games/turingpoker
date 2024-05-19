import { useState, useEffect, startTransition } from 'react'
import * as React from 'react';
import PartySocket from "partysocket";
import Poker from "./poker/Poker";
import * as PokerLogic from "..//party/src/game-logic/poker";
import { ServerStateMessage, ServerUpdateMessage } from "../party/src/shared";

import '@static/styles/styles.css'

export type ClientState = {
  isConnected: boolean;
  serverState: ServerStateMessage | null;
  lastServerState: ServerStateMessage | null;
  socket: PartySocket | null;
  playerId: string | null;
  updateLog: ServerUpdateMessage[];
};

export default function PokerClient({ gameId }: { gameId?: string }) {
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
    const roomId = Math.round(Math.random() * 10000);
    const socket = new PartySocket({
      host: import.meta.env.VITE_ENV == "production"
          ? "ws.turingpoker.com"
          : "localhost:1999",
      room: gameId ?? roomId.toString(),
      party: "poker",
    });

    socket.addEventListener("open", () => {
      console.log('connect', socket)
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
        if (!data.state) return;
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


    return () => {
      socket.close();
    };
  }, [setClientState]);

  return (
    <Poker clientState={clientState} previousActions={previousActions} />
  );
};
