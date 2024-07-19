import React from 'react'
import GameClient from '@app/components/GameClient';
import Main from '@app/layouts/main';
import { useParams } from 'react-router-dom';
import LogoDark from '@static/images/logo-dark.png';
import Select from '@app/components/Select';


export default function Home() {

  const [game, setGame] = React.useState<string>('');
  const [join, setJoin] = React.useState<boolean>(false);
  let { gameId, gameType } = useParams();

  const games = [
    { label: 'Poker', value: 'poker' },
    { label: 'Kuhn', value: 'kuhn' }
  ]

  return (
    <Main>
      {
        (game && join) || gameId ?
          <GameClient gameId={gameId} gameType={game || gameType} /> :
          // select game type of poker or kuhn
          <div className="bg-white p-[16px] border flex flex-col items-center justify-center w-full max-w-[300px] m-auto">
            <img src={LogoDark} className="w-[150px] mx-auto mb-[32px]" />
            <div className="relative w-full max-w-[250px]">
              <Select options={games} selected={game} onChange={(value) => setGame(value)} placeholder="Select a game" width='100%' />
              <button className="w-full mt-[16px]" onClick={() => setJoin(true)}>Start</button>
            </div>
          </div>
      }
    </Main>
  )
}