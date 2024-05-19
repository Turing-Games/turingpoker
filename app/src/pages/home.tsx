import PokerClient from '@app/components/PokerClient';
import Main from '@app/layouts/main';
import { useParams } from 'react-router-dom';


export default function Home() {
  console.log('main')

  let { gameId } = useParams();

  return (
    <Main>
      <PokerClient gameId={gameId} />
    </Main>
  )
}