import * as React from 'react';
import { createRoot } from "react-dom/client";
import PartySocket from "partysocket";
import { ServerStateMessage, ServerUpdateMessage } from "./party/src/shared";
import '@static/styles/styles.css'
import Root from './routes/root';

export type ClientState = {
  isConnected: boolean;
  serverState: ServerStateMessage | null;
  lastServerState: ServerStateMessage | null;
  socket: PartySocket | null;
  playerId: string | null;
  updateLog: ServerUpdateMessage[];
};

window.addEventListener('load', () => {
  const rootDiv = document.getElementById("root");
  console.log('loaded')
  const root = createRoot(rootDiv!);
  root.render(<Root />);
});