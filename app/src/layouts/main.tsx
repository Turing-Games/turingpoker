import { Link, NavLink } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
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
  { link: "/tournaments", label: "Tournaments" },
  // { link: "/learn", label: "Learn" },
  { link: "/leaderboard", label: "Leaderboard" },
  {
    link: "/resources",
    label: "Resources",
    submenu: [
      { link: "/resources/learn", label: "Learn" }
    ]
  },
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
      <header className={`
        bg-white border-black items-center flex text-left p-[20px] justify-between
        ${smallScreen ? 'flex-col p-[8px] border-r-1' : 'border-b'}
      `}>
        <Link to='/'>
          <img src={Logo} alt="Logo" className="hidden sm:block h-[40px] min-h-[40px]" />
          <img src={MobileLogo} alt="Logo" className="block sm:hidden w-[35px] min-w-[35px]" />
        </Link>
        <div
          className={`
            flex items-center gap-[8px] text-left
            ${smallScreen ? 'flex-col' : 'flex-row items-center'}
          `}>
          {
            menuItems.map((item) => {
              return (
                <NavLink
                  key={item.link}
                  to={item.link}
                  target={item.target ?? '_self'}
                  className={({ isActive }: any) => isActive ? "font-bold text-[16px] ml-[8px]" : "text-[16px] ml-[8px]"}
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
            <UserButton userProfileMode='navigation' userProfileUrl='/user' />
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
