import { Link, NavLink, Outlet } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton, UserProfile } from "@clerk/clerk-react";
import Logo from '../../static/images/logo-dark.png'
import MobileLogo from '../../static/images/logo.png'
import { ReactNode } from 'react';
import useSmallScreen from '@app/hooks/useSmallScreen';
import { DiscordLogoIcon, GearIcon } from '@radix-ui/react-icons';
import Keys from '@app/pages/user/keys';
import Header from '@app/components/Header';
import { Helmet } from 'react-helmet';

const menuItems = [
  { link: "/games", label: "Games" },
  { link: "/learn", label: "Learn" },
  { link: "https://discord.gg/kz5ed2Q4QP", label: <DiscordLogoIcon />, target: '_blank' },
];

export default function Profile({ pageTitle = '' }) {

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
      <Helmet>
        <title>{pageTitle ? `${pageTitle} | Turing Poker` : 'Turing Poker'}</title>
      </Helmet>
      <Header />
      <main style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        flexGrow: 1
      }}>
        <UserProfile
          appearance={{
            elements: {
              profileSectionPrimaryButton: {
                display: 'none'
              },
              userPreviewAvatarBox: {
                backgroundColor: '#CC1F00',
                backgroundImage: 'url("https://play.turingpoker.com/assets/robot-white.png")',
                backgroundPosition: 'center',
                backgroundSize: '70%',
                backgroundRepeat: 'no-repeat',
                // border: '1px solid #000'
              },
              avatarImage: {
                display: 'none'
              }
            }
          }}
        >
          <UserProfile.Page label='API Keys' url='api-keys' labelIcon={<GearIcon />}>
            <Keys />
          </UserProfile.Page>
          <Outlet />
        </UserProfile>
      </main>
    </div >
  )
}
