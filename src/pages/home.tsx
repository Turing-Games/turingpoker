import PokerClient from '../components/PokerClient';
import Main from '../layouts/main';
import { useParams } from 'react-router-dom';


export default function Home() {

  let { gameId } = useParams();

  return (
    <Main>
      <PokerClient gameId={gameId} />
    </Main>
  )
}