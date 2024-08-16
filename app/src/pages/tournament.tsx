import * as React from 'react'
import Main from '@app/layouts/main';
import { SignedIn, useUser } from '@clerk/clerk-react';
import { Heading, Text } from '@radix-ui/themes';
import TgTable from '@app/components/Table';
import { Link, useParams, useSearchParams } from 'react-router-dom';


export default function Tournament() {

  const [loading, setLoading] = React.useState(false)
  const [games, setGames] = React.useState<any[]>([])

  const { tournamentId } = useParams<{ tournamentId: string }>()
  const [searchParams, setSearchParams] = useSearchParams();

  const title = searchParams.get('title')
  // const isAdmin = useUser()?.user?.organizationMemberships?.[0]?.role === 'org:admin'

  const getTournament = async () => {
    setLoading(true)

    const data = await fetch('/api/v1/games?tournament_id=' + tournamentId)
    const games = await data.json()
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
              <TgTable
                headers={[
                  { value: 'id', name: 'Game' },
                  { value: 'gameType', name: 'Game Type' },
                  // { value: 'size', name: 'Pool Size' },
                  { value: 'view', name: '' }
                ]}
                rows={games.map(t => {
                  return {
                    id: (
                      <Link to={`/games/${t.id}/${t.game_type}`}>
                        {t.title || t.id}
                      </Link>
                    ),
                    gameType: t.game_type,
                    size: t.games_count,
                    view: (
                      <button>
                        <Link to={`/games/${t.id}/${t.gameType}`}>View</Link>
                      </button>
                    )
                  }
                })}
              />
              :
              <Text>No games in tournament</Text>
        }
      </div>
      <style>{`#root{overflow:auto!important`}</style>
    </Main >
  )
}
