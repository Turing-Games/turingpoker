import * as React from 'react'
import Main from '@app/layouts/main';
import { SignedIn, useUser } from '@clerk/clerk-react';
import { Heading, Text } from '@radix-ui/themes';
import TgTable from '@app/components/Table';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import PartySocket from 'partysocket';
import { PARTYKIT_URL } from '@app/constants/partykit';
import { SINGLETON_ROOM_ID } from '@tg/tables';
import { TableState } from '@tg/shared';


export default function Tournament() {

  const [loading, setLoading] = React.useState(false)
  const [games, setGames] = React.useState<any[]>([])

  const { tournamentId } = useParams<{ tournamentId: string }>()
  const [searchParams, setSearchParams] = useSearchParams();

  const title = searchParams.get('title')
  // const isAdmin = useUser()?.user?.organizationMemberships?.[0]?.role === 'org:admin'

  const getTables = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await PartySocket.fetch(
          {
            host: PARTYKIT_URL,
            room: SINGLETON_ROOM_ID,
            party: 'tables',
          })
        let rooms = ((await res.json()) ?? []) as TableState[];
        resolve(rooms)
      } catch (err) {
        reject(err)
      }
    })
  }

  const getTournament = async () => {
    setLoading(true)
    const tables = await getTables() as any[]
    const data = await fetch('/api/v1/games?tournament_id=' + tournamentId)
    const games = await data.json() as any[]
    if (games.length > 0) {
      games.forEach((game: any) => {
        const table = tables.find((t: TableState) => t.id === game.id)
        game['queuedPlayers'] = table?.queuedPlayers || []
        game['spectatorPlayers'] = (table?.spectatorPlayers?.length + table?.queuedPlayers?.length) || 0;
        game['gameState'] = table?.gameState?.round ? `In game: ${table?.gameState?.round}` : `Waiting...`
        game['config'] = table?.config
      })
    }
    setGames(games)
    setLoading(false)
  }

  React.useEffect(() => {
    getTournament()
  }, [])


  return (
    <Main pageTitle={`Tournament: ${title}`}>
      <div className="p-[20px] w-full">
        <Heading mb="2" size="4">Tournament: {title}</Heading>
        {
          loading ?
            <Text>Loading...</Text> :
            games?.length > 0 ?
              <div className="mt-[32px]">
                <TgTable
                  headers={[
                    { value: 'id', name: 'Table' },
                    { value: 'gameType', name: 'Game Type' },
                    { value: 'gameState', name: 'Status' },
                    // { value: 'spectatorPlayers', name: 'Spectators', sortable: true },
                    { value: 'queuedPlayers', name: 'Queued', sortable: true },
                    { value: 'players', name: 'In-Game', sortable: true },
                    { value: 'view', name: '', align: 'center' },
                  ]}
                  rows={games.map(t => {
                    const spectatorCount = (t?.spectatorPlayers?.length + t?.queuedPlayers?.length) || 0;
                    return {
                      id: (
                        <Link to={`/games/${t.id}/${t.game_type}`}>
                          {t.title || t.id}
                        </Link>
                      ),
                      gameType: t.game_type,
                      gameState: t.gameState ? `In game: ${t.gameState.round}` : `Waiting...`,
                      spectatorPlayers: spectatorCount,
                      queuedPlayers: t?.queuedPlayers?.length || 0,
                      players: `${t?.gameState?.players?.length || 0}/${t.config?.maxPlayers || 0}`,
                      view: (
                        <button>
                          <Link to={`/games/${t.id}/${t.game_type}`}>View</Link>
                        </button>
                      )
                    }
                  })}
                />
              </div>
              :
              <Text>No games in tournament</Text>
        }
      </div>
      <style>{`#root{overflow:auto!important`}</style>
    </Main >
  )
}
