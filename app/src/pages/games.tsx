import * as React from 'react'
import Main from '@app/layouts/main';
import { PARTYKIT_URL, SINGLETON_ROOM_ID } from '@app/constants/partykit';
import { Cross1Icon, ExitIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { SignedIn, useUser } from '@clerk/clerk-react';
import { sendMessage } from '@tg/utils/websocket';
import { Link } from 'react-router-dom';
import { TABLE_STATE_VERSION, TableState } from '@tg/shared';
import { Heading, Text } from '@radix-ui/themes';
import PartySocket from 'partysocket';
import Modal from 'react-modal';
import Select from '@app/components/Select';
import { GAMES, MODAL_STYLES } from '@app/constants/games/shared';
import { CONFIGURABLE_PROPERTIES as POKER_CONFIG } from '@app/constants/games/poker';
import { CONFIGURABLE_PROPERTIES as KUHN_CONFIG } from '@app/constants/games/kuhn';
import { DEFAULT_TABLE_STATE as POKER_DEFAULT_TABLE } from '@app/constants/games/poker';
import { DEFAULT_TABLE_STATE as KUHN_DEFAULT_TABLE } from '@app/constants/games/kuhn';


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
        className="cursor-pointer border border-black rounded-[50px] inline-block justify-end p-[4px] absolute top-[-10px] right-[-10px] bg-white"
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
      <strong>{table?.gameType?.toUpperCase()}</strong>
      <Text>Table: {table.id}</Text>
      <Text>{table.gameState ? `In game: ${table.gameState.round}` : `Waiting to start`}</Text>
      <Text>{spectatorCount || 0} spectator{spectatorCount > 1 || spectatorCount === 0 ? 's' : ''} in the room</Text>
      <Text>Players: {table?.gameState?.players?.length || 0}</Text>
    </Link>
  </div>
}

export default function Games() {

  const [loading, setLoading] = React.useState(false)
  const [tables, setTables] = React.useState<TableState[]>([])
  const [gameType, setGameType] = React.useState('poker')
  const [gameTypeForm, setGameTypeForm] = React.useState('')
  const [gameStatus, setGameStatus] = React.useState('all')
  const [isOpen, setIsOpen] = React.useState(false)
  const [gameConfig, setGameConfig] = React.useState({})

  const partyUrl = `${PARTYKIT_URL}/parties/tables/${SINGLETON_ROOM_ID}`;
  // const isAdmin = useUser()?.user?.organizationMemberships?.[0]?.role === 'org:admin'
  const isAdmin = true

  const deleteTable = async (id: string) => {
    const res = await fetch(partyUrl, {
      method: "POST",
      body: JSON.stringify({
        action: "delete",
        id: id
      })
    });

    getTables()
  }

  const getTables = async () => {
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
      console.log({ rooms })
      setTables(rooms)
      // setTables(rooms.filter(room => room.version >= TABLE_STATE_VERSION))
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  React.useEffect(() => {
    getTables()
  }, [gameType, gameStatus])

  const gameTypeFilters = [
    { label: 'Game Type', value: '' },
    ...GAMES
  ]

  const gameStatusFilters = [
    { label: 'Game Status', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Active', value: 'active' },
  ]

  const checkValidInput = () => {
    if (gameTypeForm === '') return alert('Please select a game type')
    if (minPlayers < 2 || maxPlayers < 2) return alert('Minimum players should be at least 2')
    if (minPlayers > maxPlayers) return alert('Minimum players should be less than maximum players')
  }

  const configurableProperties = {
    'poker': POKER_CONFIG,
    'kuhn': KUHN_CONFIG
  } as any

  const defaultTableStates = {
    'poker': POKER_DEFAULT_TABLE,
    'kuhn': KUHN_DEFAULT_TABLE
  } as any

  return (
    <Main>
      <div className="p-[20px] w-full">
        <div className="flex items-center justify-between">
          <Heading mb="2" size="4">Games ({tables.length})</Heading>
          <button
            className="flex items-center gap-[6px] justify-between"
            onClick={() => setIsOpen(true)}
          >
            <PlusIcon />
            Create a game
          </button>
        </div>
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
      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        style={MODAL_STYLES}
      >
        <div
          className='flex justify-between items-center mb-[16px]'
        >
          <h2 className="text-[18px]">Create a game</h2>
          <div onClick={() => setIsOpen(false)}>
            <Cross1Icon />
          </div>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            checkValidInput()
            const roomId = Math.round(Math.random() * 10000);
            const socket = new PartySocket({
              host: PARTYKIT_URL,
              room: roomId.toString(),
              party: gameTypeForm
            });
            // console.log(socket)
            await fetch(partyUrl, {
              method: "POST",
              body: JSON.stringify({
                action: "create",
                id: roomId,
                ...gameConfig
              })
            });
            getTables()
            setIsOpen(false)
          }}
          className="flex flex-col gap-[8px] mt-[16px]"
        >
          <div className="flex flex-col gap-[16px] mt-[16px]">
            <div>
              <p>Game Type:</p>
              <Select
                options={[
                  { label: 'Game Type', value: '' },
                  ...GAMES
                ]}
                selected={gameTypeForm}
                placeholder="Game type"
                onChange={(value) => {
                  setGameTypeForm(value)
                  setGameConfig(defaultTableStates[value])
                }}
              ></Select>
            </div>
            <div className="grid grid-cols-2 gap-[8px]">
              {
                configurableProperties[gameTypeForm]?.map((property, i) => {
                  return (
                    <div
                      style={property.type === 'checkbox' ? {
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      } : {}}
                    >
                      <label htmlFor={property.value}>{property.label}</label>
                      <input
                        id={property.value}
                        min={0}
                        value={property.default}
                        type={property.type}
                        onChange={(e) => setGameConfig({ ...gameConfig, [property.value]: e.target.value })}
                        className="border border-black rounded-[4px] p-[8px] w-full text-sm"
                      />
                    </div>
                  )
                })
              }
            </div>
            <button
              className="bg-black text-white rounded-[4px] p-[8px] w-full"
              type="submit"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
      <style>{`#root{overflow:auto!important`}</style>
    </Main >
  )
}
