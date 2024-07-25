import { ReactNode } from 'react';
import useSmallScreen from '@app/hooks/useSmallScreen';
import Header from '@app/components/Header';

type Props = {
  children: ReactNode
}

export default function Main({ children }: Props) {

  const smallScreen = useSmallScreen(1e9, 450);

  return (
    <div
      className={`flex ${smallScreen ? 'flex-row' : 'flex-col'} items-stretch justify-stretch w-full h-full`}

    >
      <Header />
      <main
        className="flex relative items-stretch justify-stretch flex-grow"
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
