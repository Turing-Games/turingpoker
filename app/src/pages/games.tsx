import * as React from 'react'
import Main from '@app/layouts/main';
import { PARTYKIT_URL, SINGLETON_ROOM_ID } from '@app/constants/partykit';
import { ChevronDownIcon, Cross1Icon, DotsHorizontalIcon, ExitIcon, GearIcon, PlusIcon, Share1Icon, TrashIcon } from '@radix-ui/react-icons';
import { SignedIn, useUser } from '@clerk/clerk-react';
import { sendMessage } from '@tg/utils/websocket';
import { Link } from 'react-router-dom';
import { TABLE_STATE_VERSION, TableState } from '@tg/shared';
import { Heading, Text } from '@radix-ui/themes';
import PartySocket from 'partysocket';
import Modal from 'react-modal';
import Select from '@app/components/Select';
import { GAME_STATUS_FILTERS, GAME_TYPE_FILTERS, GAMES, MODAL_STYLES } from '@app/constants/games/shared';
import { CONFIGURABLE_PROPERTIES as POKER_CONFIG } from '@app/constants/games/poker';
import { CONFIGURABLE_PROPERTIES as KUHN_CONFIG } from '@app/constants/games/kuhn';
import { DEFAULT_TABLE_STATE as POKER_DEFAULT_TABLE } from '@app/constants/games/poker';
import { DEFAULT_TABLE_STATE as KUHN_DEFAULT_TABLE } from '@app/constants/games/kuhn';
import { Helmet } from "react-helmet";
import TgTable from '@app/components/Table';
import { TableCard } from '@app/components/TableCard';


export default function Games() {

  const [loading, setLoading] = React.useState(false)
  const [tables, setTables] = React.useState<TableState[]>([])
  const [gameType, setGameType] = React.useState('')
  const [gameTypeForm, setGameTypeForm] = React.useState('')
  const [gameStatus, setGameStatus] = React.useState('all')
  const [isOpen, setIsOpen] = React.useState(false)
  const [gameConfig, setGameConfig] = React.useState({})
  const [gameId, setGameId] = React.useState('')

  const partyUrl = `${PARTYKIT_URL}/parties/tables/${SINGLETON_ROOM_ID}`;
  const isAdmin = useUser()?.user?.organizationMemberships?.[0]?.role === 'org:admin'

  const deleteTable = async (id: string) => {
    await fetch(partyUrl, {
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
      let rooms = ((await res.json()) ?? []) as TableState[];
      if (gameStatus) {
        if (gameStatus === 'pending') {
          rooms = rooms.filter(room => !room.gameState)
        }

        if (gameStatus === 'active') {
          rooms = rooms.filter(room => room.gameState)
        }
      }
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
    <Main pageTitle='Games'>
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
            options={GAME_TYPE_FILTERS}
            selected={gameType}
            placeholder="Game type"
            onChange={(value) => setGameType(value)}
          ></Select>
          <Select
            options={GAME_STATUS_FILTERS}
            selected={gameStatus}
            placeholder="Game status"
            onChange={(value) => setGameStatus(value)}
          ></Select>
        </div>
        {
          loading ?
            <Text>Loading...</Text> :
            tables.length > 0 ?
              // <div className="h-[200px]">
              <TgTable
                headers={[
                  { value: 'id', name: 'Table ID' },
                  { value: 'gameType', name: 'Game Type' },
                  { value: 'gameState', name: 'Status' },
                  { value: 'spectatorPlayers', name: 'Spectators' },
                  { value: 'queuedPlayers', name: 'Queued' },
                  { value: 'players', name: 'In-Game' },
                  { value: 'dropdown', name: '' }
                ]}
                rows={tables.map(table => {
                  const spectatorCount = (table?.spectatorPlayers?.length + table?.queuedPlayers?.length) || 0;
                  return {
                    id: table.id,
                    gameType: table.gameType,
                    gameState: table.gameState ? `In game: ${table.gameState.round}` : `Waiting...`,
                    spectatorPlayers: spectatorCount,
                    queuedPlayers: table?.queuedPlayers?.length || 0,
                    players: table?.gameState?.players?.length || 0,
                    dropdown: <ChevronDownIcon />,
                  }
                })}
              />
              // </div> 
              :
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
          <h2 className="font-barlow font-medium text-[18px]">Create a game</h2>
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
