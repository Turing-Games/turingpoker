import * as React from 'react'
import Main from '@app/layouts/main';
import { SignedIn, useUser } from '@clerk/clerk-react';
import { Heading, Text } from '@radix-ui/themes';
import PartySocket from 'partysocket';
import Modal from 'react-modal';
import Select from '@app/components/Select';
import { GAME_TYPE_FILTERS, GAMES, MODAL_STYLES } from '@app/constants/games/shared';
import TgTable from '@app/components/Table';
import queryClient from '@app/client/apiClient';


export default function Leaderboard() {

  const [loading, setLoading] = React.useState(false)
  const [players, setPlayers] = React.useState<any[]>([])
  const [gameType, setGameType] = React.useState('')

  const isAdmin = useUser()?.user?.organizationMemberships?.[0]?.role === 'org:admin'

  const getPlayers = async () => {
    setLoading(true)
    const params = gameType ? `gameType=${gameType}` : ''
    try {
      const players = await queryClient('users', 'GET')
      setPlayers(players)
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  React.useEffect(() => {
    getPlayers()
  }, [gameType])

  return (
    <Main pageTitle='Leaderboard'>
      <div className="p-[20px] w-full">
        <Heading mb="2" size="4">Leaderboard</Heading>
        <div className="my-[32px]">
          <Select
            options={GAME_TYPE_FILTERS}
            selected={gameType}
            placeholder="All Games"
            onChange={(value) => setGameType(value)}
          ></Select>
        </div>
        <TgTable
          progressPending={loading}
          selectableRows={false}
          headers={[
            { value: 'username', name: 'User' },
            { value: 'wins', name: 'Wins' },
            { value: 'losses', name: 'Losses' },
          ]}
          rows={(players || []).map(t => {
            return {
              username: t.username,
              wins: t.wins || 0,
              losses: t.losses || 0
            }
          })}
        />
      </div>
      <style>{`#root{overflow:auto!important`}</style>
    </Main >
  )
}
