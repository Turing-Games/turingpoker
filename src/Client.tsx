import React, { useState, useEffect } from "react";
import PartySocket from "partysocket";
import Header from "./components/Header";
import Poker from "./components/poker/poker";
import Admin from "./components/poker/admin";

import { ServerStateMessage, ClientMessage, ServerUpdateMessage } from "./shared";
import * as Poker from "@tg/game-logic/poker";

export type ClientState = {
  isConnected: boolean;
  serverState: ServerStateMessage | null;
  socket: PartySocket | null;
  playerId: string | null;
  updateLog: ServerUpdateMessage[];
  connect: () => void;
  sendMessage: (action: ClientMessage) => void;
};

const App: React.FC = () => {
  const [clientState, setClientState] = useState<ClientState>({
    isConnected: false,
    serverState: null,
    socket: null,
    playerId: null,
    updateLog: [],
    connect: () => { },
    sendMessage: () => { },
  });

  useEffect(() => {
    const connectSocket = () => {
      const socket = new PartySocket({
        host: PARTYKIT_HOST,
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

  return (
    <React.Fragment>
      <Header
        gameType="No Limit Texas Hold'em"
        players={clientState.serverState?.inGamePlayers}
        playerId={clientState.playerId}
        minPlayers={clientState.serverState?.config?.minPlayers}
      />
      <Poker clientState={clientState} />
    </React.Fragment>
  );
};