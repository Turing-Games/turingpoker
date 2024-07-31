import { ReactNode } from 'react';
import useSmallScreen from '@app/hooks/useSmallScreen';
import Header from '@app/components/Header';
import { Helmet } from 'react-helmet';

type Props = {
  children: ReactNode
  pageTitle?: string
}

export default function Main({ children, pageTitle }: Props) {

  const smallScreen = useSmallScreen(1e9, 450);

  return (
    <div
      className={`flex ${smallScreen ? 'flex-row' : 'flex-col'} items-stretch justify-stretch w-full h-full`}

    >
      <Helmet>
        <title>{pageTitle ? `${pageTitle} | Turing Poker` : 'Turing Poker'}</title>
      </Helmet>
      <Header />
      <main
        className="flex relative items-stretch justify-stretch flex-grow max-w-[1400px]"
        style={location.pathname.startsWith('/games/') ? {
          backgroundImage: 'url("/static/images/poker-bg-tile.jpg")',
          backgroundRepeat: 'repeat',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backgroundBlendMode: 'lighten'
        } : {}}
      >
        {children}
      </main>
    </div >
  )
}
