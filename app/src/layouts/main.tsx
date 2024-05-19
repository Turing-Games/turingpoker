import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import Logo from '../../static/images/logo-dark.png'
import { ReactNode } from 'react';
import useSmallScreen from '@app/hooks/useSmallScreen';

type Props = {
  children: ReactNode
}

const sharedItems = [
  { link: "/games", label: "Games" },
  { link: "/learn", label: "Learn" },
  { link: "https://discord.gg/kz5ed2Q4QP", label: "Discord" },
];

export default function Main({ children }: Props) {

  const isSignedIn = useAuth()?.isSignedIn

  const smallScreen = useSmallScreen(1e9, 450);

  const menuItems = isSignedIn ? [
    ...sharedItems,
    { link: '/play', label: 'Play' },
  ] : sharedItems;

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      ...(smallScreen ? {
        flexDirection: 'row',
      } : {
        flexDirection: 'column'
      })
    }}>
      <header style={{
        display: 'flex',
        alignItems: 'left',
        textAlign: 'left',
        ...(smallScreen ? {
          flexDirection: 'column',
          padding: '8px',
          borderBottom: 'none',
          borderRight: '1px solid black',
        } : {
          flexDirection: 'row'
        })
      }}>
        <Link to='/'>
          <img src={Logo} style={{ height: 40 }} />
        </Link>
        <div style={{
          gap: '8px',
          display: 'flex',
          textAlign: 'left',
          ...(smallScreen ? {
            alignItems: 'baseline',
            flexDirection: 'column',
          } : {
            alignItems: 'center',
            flexDirection: 'row'
          })
        }}>
          {
            menuItems.map((item) => {
              return <Link key={item.link} to={item.link}>{item.label}</Link>
            })
          }
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      <main style={{
        position: 'relative',
        flexGrow: 1
      }}>
        {children}
      </main>
    </div>
  )
}
