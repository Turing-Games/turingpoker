import { useState, useEffect } from 'react'
import * as React from 'react';
import * as ReactDOM from "react-dom";
import {
  createBrowserRouter,
  RouterProvider,
  Link
} from "react-router-dom";
import PartySocket from "partysocket";
import Poker from "../components/poker/Poker";
import * as PokerLogic from "../party/src/game-logic/poker";
import { ServerStateMessage, ServerUpdateMessage } from "../party/src/shared";
import { ClerkProvider } from '@clerk/clerk-react'
import '@static/styles/styles.css'
import Home from '../pages/home';
import PokerClient from '../components/PokerClient';

export type ClientState = {
  isConnected: boolean;
  serverState: ServerStateMessage | null;
  socket: PartySocket | null;
  playerId: string | null;
  updateLog: ServerUpdateMessage[];
};

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children: [
      {
        path: "games",
        element: <div>games</div>,
      },
    ],
  },
]);

export default function Root() {
  return (
    <RouterProvider router={router} />
    // <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    // </ClerkProvider>
  )
};