import * as React from 'react'
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import Logo from '../../static/images/logo.png'


export default function Home() {
  return (
    <header>
      <Link to='/'>
        <img src={Logo} style={{ height: 40 }} />
      </Link>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  )
}