import * as React from 'react'
import Main from '@app/layouts/main';
import { PARTYKIT_URL, SINGLETON_ROOM_ID } from '@app/constants/partykit';
import { TrashIcon } from '@radix-ui/react-icons';
import { SignedIn, useUser } from '@clerk/clerk-react';
import { sendMessage } from '@tg/utils/websocket';
import { Link } from 'react-router-dom';
import { TABLE_STATE_VERSION, TableState } from '@tg/shared';
import { Heading, Text } from '@radix-ui/themes';
import PartySocket from 'partysocket';
import Select from '@app/components/Select';

export function TableCard({
  table,
  onDelete,
  isAdmin,
}: {
  table: TableState,
  onDelete: (id: string) => void,
  isAdmin: boolean
}) {

  const spectatorCount = table?.spectatorPlayers?.length + table?.queuedPlayers?.length;

  return <div style={{ position: 'relative' }}>
    {isAdmin &&
      <div
        className="cursor-pointer border border-black rounded-[50px] inline-block justify-end p-[4px] abslute top-[-10px] right-[-10px] bg-white"
        onClick={() => {
          onDelete(table.id)
        }}
      >
        <TrashIcon />
      </div>
    }
    <Link
      className="bg-white border border-black rounded-[4px] grid gap-[8px] p-[12px]"
      to={`/games/${table.id}/${table.gameType}`}
      key={table.id}
    >
      <strong>{table.gameType.toUpperCase()}</strong>
      <Text>Table: {table.id}</Text>
      <Text>{table.gameState ? `In game: ${table.gameState.round}` : `Waiting to start`}</Text>
      <Text>{spectatorCount || 0} spectator{spectatorCount > 1 ? 's' : ''} in the room</Text>
      {table.gameState && <>
        <Text>Players:</Text>
        {table.gameState.players.map(player => <Text key={player.id}>{player.id}: ${player.stack}</Text>)}
      </>}
    </Link>
  </div>
}

export default function Games() {

  const [loading, setLoading] = React.useState(false)
  const [tables, setTables] = React.useState<TableState[]>([])
  const [gameType, setGameType] = React.useState('poker')
  const [gameStatus, setGameStatus] = React.useState('all')

  const partyUrl = `${PARTYKIT_URL}/parties/tables/${SINGLETON_ROOM_ID}`;
  const isAdmin = useUser()?.user?.organizationMemberships?.[0]?.role === 'org:admin'

  const deleteTable = async (id: string) => {
    const res = await fetch(partyUrl, {
      method: "POST",
      body: JSON.stringify({
        action: "delete",
        id: id
      })
    });
    const rooms = ((await res.json()) ?? []) as TableState[];
    setTables(rooms)
  }

  React.useEffect(() => {
    const getData = async () => {
      setLoading(true)
      try {
        const res = await PartySocket.fetch(
          {
            host: PARTYKIT_URL,
            room: SINGLETON_ROOM_ID,
            party: 'tables',
            query: async () => {
              return {
                gameType: gameType,
                gameStatus: gameStatus,
              }
            }
          })
        const rooms = ((await res.json()) ?? []) as TableState[];
        setTables(rooms)
        // setTables(rooms.filter(room => room.version >= TABLE_STATE_VERSION))
      } catch (err) {
        console.log(err)
      }
      setLoading(false)
    }

    getData()
  }, [gameType, gameStatus])

  const gameTypeFilters = [
    { label: 'Game Type', value: '' },
    { label: 'Poker', value: 'poker' },
    { label: 'Kuhn', value: 'kuhn' },
  ]

  const gameStatusFilters = [
    { label: 'Game Status', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Active', value: 'active' },
  ]

  return (
    <Main>
      <div style={{ padding: 20 }}>
        <Heading mb="2" size="4">Tables ({tables.length})</Heading>
        {/* filters */}
        <div className="flex items-center gap-[8px] mt-[16px] mb-[32px]">
          <Select
            options={gameTypeFilters}
            selected={gameType}
            placeholder="Game type"
            onChange={(value) => setGameType(value)}
          ></Select>
          <Select
            options={gameStatusFilters}
            selected={gameStatus}
            placeholder="Game status"
            onChange={(value) => setGameStatus(value)}
          ></Select>
        </div>
        {
          loading ?
            <Text>Loading...</Text> :
            tables.length > 0 ?
              <div className="flex flex-wrap gap-[16px]">
                {
                  tables.map((table, i) => {
                    return <TableCard key={i} table={table} isAdmin={isAdmin} onDelete={deleteTable} />
                  })
                }
              </div> :
              <Text>No tables found</Text>
        }
      </div>
      <style>{`#root{overflow:auto!important`}</style>
    </Main >
  )
}
