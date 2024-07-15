import React from 'react'
import GameClient from '@app/components/GameClient';
import Main from '@app/layouts/main';
import { useParams } from 'react-router-dom';
import LogoDark from '@static/images/logo-dark.png';


export default function Home() {

  const [game, setGame] = React.useState<string>('');
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [join, setJoin] = React.useState<boolean>(false);
  let { gameId } = useParams();

  const games = [
    { label: 'Poker', value: 'poker' },
    { label: 'Kuhn', value: 'kuhn' }
  ]


  return (
    <Main>
      {
        game?.value && join === true ?
          <GameClient gameId={gameId} gameType={game.value} /> :
          // select game type of poker or kuhn
          <div className="bg-white p-[16px] border flex flex-col items-center justify-center w-full max-w-[300px] m-auto">
            <img src={LogoDark} className="w-[150px] mx-auto mb-[32px]" />
            <div className="relative w-full max-w-[250px]">
              <div
                className="p-[8px] cursor-pointer border rounded-lg w-full h-[40px]"
                onClick={() => setIsOpen(!isOpen)}
              >{game?.label || 'Select a game to start:'}
              </div>
              {isOpen &&
                <div className="bg-white border absolute top-[45px] left-0 shadow-md rounded-lg w-full">
                  {games.map(game => (
                    <div
                      key={game.value}
                      className="w-full p-[8px] hover:bg-gray-100 cursor-pointer w-full"
                      onClick={() => {
                        setGame(game)
                        setIsOpen(false)
                      }}
                    >{game.label}</div>
                  ))}
                </div>
              }
              <button className="w-full mt-[16px]" onClick={() => setJoin(true)}>Start</button>
            </div>
          </div>
      }
    </Main>
  )
}