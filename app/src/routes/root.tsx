import * as React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import PartySocket from "partysocket";
import { ServerStateMessage, ServerUpdateMessage } from "../party/src/shared";
import { ClerkProvider, UserProfile, useUser } from '@clerk/clerk-react'
import '@static/styles/styles.css'
import Home from '../pages/home';
import Games from '@app/pages/games';
import _404 from '@app/pages/_404';
import { SocketContext } from '@app/components/SocketContext';
import Learn from '@app/pages/learn';
import Profile from '@app/layouts/profile';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { UserContext } from '@app/context/UserContext';
import User from '@app/components/User';
import Tournaments from '@app/pages/tournaments';
import Leaderboard from '@app/pages/leaderboard';
import Admin from '@app/pages/admin';
import Interactions from '@app/pages/interactions';
import Tournament from '@app/pages/tournament';

export type ClientState = {
  isConnected: boolean;
  serverState: ServerStateMessage | null;
  socket: PartySocket | null;
  playerId: string | null;
  updateLog: ServerUpdateMessage[];
};

let PUBLISHABLE_KEY = ''
if (typeof location !== 'undefined') {
  const isProduction = process.env.NODE_ENV === 'production' && location.host.split('.')[0] === 'play'
  PUBLISHABLE_KEY = isProduction ? 'pk_live_Y2xlcmsudHVyaW5ncG9rZXIuY29tJA' : 'pk_test_YmVjb21pbmctc2hhcmstMTAuY2xlcmsuYWNjb3VudHMuZGV2JA'

  if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key")
  }
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/games/:gameId/:gameType",
    element: <Home />,
  },
  {
    path: "/games",
    element: <Games />,
  },
  {
    path: '/tournaments',
    children: [
      {
        path: '',
        element: <Tournaments />
      },
      {
        path: ':tournamentId',
        element: <Tournament />
      }
    ]
  },
  {
    path: '/leaderboard',
    element: <Leaderboard />
  },
  // {
  //   path: '/interactions',
  //   element: <Interactions />
  // },
  {
    path: "/resources",
    // element: <Learn />,
    children: [
      {
        path: "learn",
        element: <Learn />
      }
    ]
  },
  {
    path: '/user',
    element: <Profile pageTitle='Profile' />,
    children: [
      { path: 'keys', element: <div>test</div> }
    ]
  },
  {
    path: '/admin',
    element: <Admin />
  },
  {
    path: '*',
    element: <_404 />
  }
]);

export default function Root() {

  return (
    <React.StrictMode>
      <Theme
        hasBackground={false}
      >
        <SocketContext.Provider value={{}}>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <User>
              <RouterProvider router={router} />
            </User>
          </ClerkProvider>
        </SocketContext.Provider>
      </Theme>

    </React.StrictMode>
  )
};