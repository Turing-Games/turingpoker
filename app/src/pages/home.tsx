import * as React from 'react'
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";


export default function Home() {
  return (
    <header>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  )
}