import useSmallScreen from '@app/hooks/useSmallScreen';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import { DiscordLogoIcon } from '@radix-ui/react-icons';
import { Link, NavLink } from 'react-router-dom'
import Logo from '@static/images/logo-dark.png'
import MobileLogo from '@static/images/logo.png'

export default function Header() {

  const smallScreen = useSmallScreen(1e9, 450);
  const { isSignedIn } = useUser();

  const menuItems = [
    { link: "/games", label: "Games", include: true },
    { link: "/tournaments", label: "Tournaments", include: true },
    { link: "/leaderboard", label: "Leaderboard", include: true },
    {
      link: "/resources",
      label: "Resources",
      submenu: [
        { link: "/resources/how-it-works", label: "How it works" },
        { link: "/resources/learn", label: "Learn" },
      ],
      include: true
    },
    { link: "https://discord.gg/kz5ed2Q4QP", label: <DiscordLogoIcon />, target: '_blank' },
  ];

  return (
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
          menuItems.filter(item => item.include).map((item, i) => {
            return (
              <div className="relative group ml-[8px] text-[16px]" key={i}>
                {!item.submenu ?
                  <NavLink
                    key={item.link}
                    to={!item.submenu ? item.link : ''}
                    target={item.target ?? '_self'}
                    className={({ isActive }: any) => isActive ? "font-bold" : ""}
                  >
                    {item.label}
                  </NavLink> :
                  <div
                    className="cursor-pointer"
                  >
                    {item.label}
                  </div>
                }
                {
                  item.submenu?.length &&
                  <div
                    className="absolute top-[102%] left-0 bg-white border border-black z-50 hidden group-hover:block"
                    style={{
                      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    {
                      item.submenu.map(subitem => (
                        <NavLink
                          key={subitem.link}
                          to={subitem.link}
                          className={`block p-[8px] hover:bg-gray-100 cursor-pointer w-full whitespace-nowrap`}
                        >
                          {subitem.label}
                        </NavLink>
                      ))
                    }
                  </div>
                }
              </div>
            )
          })
        }
        <div className="ml-[8px]">
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton
              userProfileMode='navigation'
              userProfileUrl='/user'
              appearance={{
                elements: {
                  userButtonAvatarBox: {
                    backgroundColor: '#CC1F00',
                    backgroundImage: 'url("https://play.turingpoker.com/assets/robot-white.png")',
                    backgroundPosition: 'center',
                    backgroundSize: '70%',
                    backgroundRepeat: 'no-repeat',
                    // border: '1px solid #000'
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
                  },
                  userButtonPopoverFooter: {
                    display: 'none'
                  }
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header >
  )
}