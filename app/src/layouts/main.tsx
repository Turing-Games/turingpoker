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
