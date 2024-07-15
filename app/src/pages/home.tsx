import React from 'react'
import GameClient from '@app/components/GameClient';
import Main from '@app/layouts/main';
import { useParams } from 'react-router-dom';


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
          <div className="bg-white p-[16px] border flex flex-col items-center justify-center w-full gap-[8px] h-[300px] max-w-[300px] m-auto">
            <div className="relative w-full max-w-[250px]">
              <div
                className="cursor-pointer border rounded-lg p-[8px] w-full"
                onClick={() => setIsOpen(!isOpen)}
              >{game?.label || 'Select a game to start:'}
              </div>
              {isOpen &&
                <div className="bg-white border absolute top-[40px] left-0 shadow-md rounded-lg w-full">
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