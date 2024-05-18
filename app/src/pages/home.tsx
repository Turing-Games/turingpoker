import PokerClient from '@app/components/PokerClient';
import Main from '@app/layouts/main';


export default function Home() {
  console.log('main')

  return (
    <Main>
      <PokerClient />
    </Main>
  )
}