import * as React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import PartySocket from "partysocket";
import { ServerStateMessage, ServerUpdateMessage } from "../party/src/shared";
import { ClerkProvider } from '@clerk/clerk-react'
import '@static/styles/styles.css'
import Home from '../pages/home';
import Games from '@app/pages/games';
import { SocketContext } from '@app/components/SocketContext';
import Learn from '@app/pages/learn';

export type ClientState = {
  isConnected: boolean;
  serverState: ServerStateMessage | null;
  socket: PartySocket | null;
  playerId: string | null;
  updateLog: ServerUpdateMessage[];
};

const PUBLISHABLE_KEY = process.env.VITE_ENV === 'production' && location.host.split('.')[0] === 'play' ? 'pk_live_Y2xlcmsudHVyaW5ncG9rZXIuY29tJA' : 'pk_test_YmVjb21pbmctc2hhcmstMTAuY2xlcmsuYWNjb3VudHMuZGV2JA'
console.log({ PUBLISHABLE_KEY })

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/games/:gameId",
    element: <Home />,
  },
  {
    path: "/games",
    element: <Games />,
  },
  {
    path: "/learn",
    element: <Learn />,
  },
]);

export default function Root() {
  return (
    <React.StrictMode>
      <SocketContext.Provider value={{}}>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          <RouterProvider router={router} />
        </ClerkProvider>
      </SocketContext.Provider>
    </React.StrictMode>
  )
};