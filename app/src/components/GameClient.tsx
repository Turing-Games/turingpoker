import { useState, useEffect, startTransition } from 'react'
import * as React from 'react';
import PartySocket from "partysocket";
import PokerGame from "./poker/PokerGame";
import KuhnGame from "./poker/KuhnGame";
import * as PokerLogic from "../party/src/game-logic/poker";
import { ServerStateMessage, ServerUpdateMessage } from "../party/src/shared";

import '@static/styles/styles.css'
import { PARTYKIT_URL } from '@app/constants/partykit';
import { DEFAULT_CLIENT_STATE } from '@app/constants/games/shared';
import { games } from '@app/utils/api/games';

export type ClientState = {
  isConnected: boolean;
  serverState: ServerStateMessage | null;
  lastServerState: ServerStateMessage | null;
  socket: PartySocket | null;
  playerId: string | null;
  updateLog: ServerUpdateMessage[];
  gameType?: string;
};

export default function GameClient({ gameId, gameType = 'poker' }: { gameId?: string, gameType?: string }) {

  const [clientState, setClientState] = useState<ClientState>(DEFAULT_CLIENT_STATE);
  const [socket, setSocket] = useState<any>()

  const gamesComponents = {
    'poker': PokerGame,
    'kuhn': KuhnGame,
  } as any

  const [previousActions, setPreviousActions] = useState<Record<string, PokerLogic.Action>>({});

  const handleSocket = (socket: PartySocket) => {
    socket.addEventListener("open", () => {
      setClientState((prevState) => ({
        ...prevState,
        isConnected: true,
        playerId: socket.id,
        socket: socket,
        gameType: gameType
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
  }

  const initializeGame = async (id?: string) => {
    const roomId = crypto.randomUUID();

    if (!id) { // no id to create or join game with
      await games.create(
        {
          id: roomId,
          autoStart: true,
          minPlayers: 2,
          maxPlayers: gameType === 'kuhn' ? 2 : 10,
        },
        gameType
      )
      window.history.pushState({}, '', `/games/${roomId}/${gameType}`);
    } else { // there is an id in url
      const game = await games.get(id)
      if (game.id) { // game in found in d1
        const socket = new PartySocket({
          host: PARTYKIT_URL,
          room: id,
          party: gameType
        });
        handleSocket(socket)
      } else { // game not found in d1

      }
    }

  }

  useEffect(() => {
    initializeGame(gameId)
    return () => {
      clientState?.socket?.close()
    }
  }, []);

  if (gamesComponents[gameType]) {
    return (
      React.createElement(gamesComponents[gameType], { clientState, previousActions })
    );
  } else {
    return <p className="m-[8px]">Invalid game selected</p>
  }
};
