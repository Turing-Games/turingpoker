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
import Games from '../pages/games';
import { SocketContext } from '../components/SocketContext';
import Learn from '../pages/learn';
import Account from 'src/pages/account';

export type ClientState = {
  isConnected: boolean;
  serverState: ServerStateMessage | null;
  socket: PartySocket | null;
  playerId: string | null;
  updateLog: ServerUpdateMessage[];
};


const PROD = import.meta?.env?.PROD
const PUBLISHABLE_KEY = PROD ? 'pk_live_Y2xlcmsudHVyaW5ncG9rZXIuY29tJA' : 'pk_test_YmVjb21pbmctc2hhcmstMTAuY2xlcmsuYWNjb3VudHMuZGV2JA'

// if (!PUBLISHABLE_KEY) {
//   throw new Error("Missing Publishable Key")
// }

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
  {
    path: "/account",
    element: <Account />,
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