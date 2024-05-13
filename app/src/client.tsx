import React, { useState, useEffect } from "react";
import PartySocket from "partysocket";
import Header from "./components/Header";
import Poker from "./components/poker/Poker";

import { ClientMessage, ServerStateMessage, ServerUpdateMessage } from "../../party/src/shared";

export type ClientState = {
  isConnected: boolean;
  serverState: ServerStateMessage | null;
  socket: PartySocket | null;
  playerId: string | null;
  updateLog: ServerUpdateMessage[];
  connect: () => void,
  sendMessage: (action: ClientMessage) => void;
};

export class Client: React.FC = () => {

  const clientState: ClientState = {
    isConnected: false,
    serverState: null,
    socket: null,
    playerId: null,
    updateLog: [],
    connect() {
      this.socket = new PartySocket({
        host: PARTYKIT_HOST,
        room: "my-new-room"
      });

      this.socket.addEventListener("open", () => {
        this.isConnected = true,
          isConnected: true,
            playerId: socket.id,
              socket: socket,
      });

      this.socket.addEventListener("message", (event) => {
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

      this.socket.addEventListener("close", () => {
        setClientState((prevState) => ({
          ...prevState,
          isConnected: false,
        }));
      });

      this.socket.addEventListener("error", (event) => {
        console.error("WebSocket error:", event);
      });
    },
    sendMessage(message) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log(this.socket)
        this.socket.send(JSON.stringify(message));
      } else {
        console.error("WebSocket is not initialized or not open.");
      }
    }
  }

  useEffect(() => {
    const connectSocket = () => {
      const socket = new PartySocket({
        host: PARTYKIT_HOST,
        room: "my-new-room"
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
        players={clientState.serverState?.inGamePlayers || []}
        playerId={clientState.playerId}
        minPlayers={clientState.serverState?.config?.minPlayers || 2}
      />
      {/* <Poker clientState={clientState} /> */}
    </React.Fragment>
  );
};