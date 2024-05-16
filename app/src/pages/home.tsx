import * as React from 'react'
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import Logo from '../../static/images/logo.png'
import PokerClient from '@app/components/PokerClient';

const sharedItems = [
  { link: 'games', label: 'Games' },
  { link: 'learn', label: 'Learn' },
  { link: 'discord', label: 'Discord' }
]


export default function Home() {

  const isSignedIn = useAuth()?.isSignedIn

  const menuItems = isSignedIn ? [
    ...sharedItems,
    { link: 'play', label: 'Play' },
  ] :
    sharedItems

  return (
    <>
      <header>
        <Link to='/'>
          <img src={Logo} style={{ height: 40 }} />
        </Link>
        <div>
          {
            menuItems.map((item) => {
              return <Link key={item.link} to={item.link}>{item.label}</Link>
            })
          }
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <Link to='play'></Link>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      <div>
        <PokerClient />
      </div>
    </>
  )
}