import { Link, NavLink } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import Logo from '../../static/images/logo-dark.png'
import MobileLogo from '../../static/images/logo.png'
import { ReactNode } from 'react';
import useSmallScreen from '@app/hooks/useSmallScreen';
import { DiscordLogoIcon } from '@radix-ui/react-icons';

type Props = {
  children: ReactNode
}

const menuItems = [
  { link: "/games", label: "Games" },
  { link: "/learn", label: "Learn" },
  { link: "https://discord.gg/kz5ed2Q4QP", label: <DiscordLogoIcon />, target: '_blank' },
];

export default function Main({ children }: Props) {

  const smallScreen = useSmallScreen(1e9, 450);

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
          <img src={Logo} alt="Logo" className="desktop" style={{ height: 40 }} />
          <img src={MobileLogo} alt="Logo" className="mobile" style={{ height: 40 }} />
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
              return (
                <NavLink
                  key={item.link}
                  to={item.link}
                  target={item.target ?? '_self'}
                  className={({ isActive, isPending }) => isActive ? "menu-active" : ""}
                >
                  {item.label}
                </NavLink>
              )
            })
          }
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header >
      <main style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        flexGrow: 1
      }}>
        {children}
      </main>
    </div >
  )
}
