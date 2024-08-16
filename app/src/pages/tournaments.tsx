import * as React from 'react'
import Main from '@app/layouts/main';
import { PARTYKIT_URL, SINGLETON_ROOM_ID } from '@app/constants/partykit';
import { ChevronDownIcon, Cross1Icon, DotsHorizontalIcon, ExitIcon, EyeOpenIcon, GearIcon, PlusIcon, Share1Icon, TrashIcon } from '@radix-ui/react-icons';
import { SignedIn, useUser } from '@clerk/clerk-react';
import { TABLE_STATE_VERSION, TableState } from '@tg/shared';
import { Heading, Text } from '@radix-ui/themes';
import PartySocket from 'partysocket';
import Modal from 'react-modal';
import Select from '@app/components/Select';
import { GAME_TYPE_FILTERS, GAMES, MODAL_STYLES } from '@app/constants/games/shared';
import { CONFIGURABLE_PROPERTIES as POKER_CONFIG } from '@app/constants/games/poker';
import { CONFIGURABLE_PROPERTIES as KUHN_CONFIG } from '@app/constants/games/kuhn';
import { DEFAULT_TABLE_STATE as POKER_DEFAULT_TABLE } from '@app/constants/games/poker';
import { DEFAULT_TABLE_STATE as KUHN_DEFAULT_TABLE } from '@app/constants/games/kuhn';
import TgTable from '@app/components/Table';
import queryClient from '@app/client/apiClient';
import { Link } from 'react-router-dom';


export default function Tournaments() {

  const [loading, setLoading] = React.useState(false)
  const [tournaments, setTournaments] = React.useState<any[]>([])
  const [gameType, setGameType] = React.useState('')
  const [gameTypeForm, setGameTypeForm] = React.useState('poker')
  const [isOpen, setIsOpen] = React.useState(false)
  const [title, setTitle] = React.useState('')
  const [tournamentConfig, setTournamentConfig] = React.useState({
    size: 2,
    private: false,
    min_players: 2,
    max_players: 2,
  })
  const [gameConfig, setGameConfig] = React.useState({})

  const isAdmin = useUser()?.user?.organizationMemberships?.[0]?.role === 'org:admin'

  const getTournaments = async () => {
    setLoading(true)
    try {
      const data = await queryClient('tournaments', 'GET')
      console.log(data)
      setTournaments(data?.tournaments || [])
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  const checkValidInput = () => {
    if (!title) return alert('Enter a tournament title')
    if (tournamentConfig['size'] < 2) return alert('Minimum pool size should be at least 2')
    if (tournamentConfig['size'] % 2 !== 0) return alert('Pool size must be an even number')
  }

  const configurableGameProperties = {
    'poker': POKER_CONFIG,
    'kuhn': KUHN_CONFIG
  } as any

  const configurableTournamentProperties = [
    { label: 'Pool Size', value: 'size', type: 'number', default: 2 },
    { label: 'Private?', value: 'private', type: 'checkbox', default: false },
  ] as any

  React.useEffect(() => {
    getTournaments()
  }, [])

  React.useEffect(() => {
    setGameConfig(
      configurableGameProperties[gameTypeForm].reduce((acc, property) => {
        acc[property.value] = property.default
        return acc
      }, {}))
  }, [gameTypeForm])

  return (
    <Main pageTitle='Tournaments'>
      <div className="p-[20px] w-full">
        <div className="flex items-center justify-between">
          <Heading mb="2" size="4">Tournaments</Heading>
          <button
            className="flex items-center gap-[6px] justify-between"
            onClick={() => setIsOpen(true)}
          >
            <PlusIcon />
            Start a tournament
          </button>
        </div>
        {/* filters */}
        <div className="flex items-center gap-[8px] mt-[16px] mb-[32px]">
          <Select
            options={GAME_TYPE_FILTERS}
            selected={gameType}
            placeholder="All Games"
            onChange={(value) => setGameType(value)}
          ></Select>
        </div>
        {
          loading ?
            <Text>Loading...</Text> :
            tournaments?.length > 0 ?
              <TgTable
                headers={[
                  { value: 'id', name: 'Tournament' },
                  { value: 'gameType', name: 'Game Type' },
                  { value: 'size', name: 'Pool Size' },
                ]}
                rows={tournaments.map(t => {
                  return {
                    id: (
                      <Link to={`/tournaments/${t.id}`}>
                        {t.title || t.id}
                      </Link>
                    ),
                    gameType: t.game_type,
                    size: t.games_count
                  }
                })}
              />
              :
              <Text>No tournaments found</Text>
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
          <h2 className="font-barlow font-medium text-[18px]">Create a tournament</h2>
          <div onClick={() => setIsOpen(false)}>
            <Cross1Icon />
          </div>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            checkValidInput()
            await queryClient('tournaments', 'POST', {
              title,
              gameType: gameTypeForm,
              gameConfig,
              tournamentConfig
            })
            getTournaments()
            setIsOpen(false)
          }}
          className="flex flex-col gap-[8px] mt-[16px]"
        >
          <div className="flex flex-col gap-[16px] mt-[16px]">
            <div>
              <p>Game Type:</p>
              <Select
                options={GAMES}
                selected={gameTypeForm}
                placeholder="Game type"
                onChange={(value) => {
                  setGameTypeForm(value)
                }}
              ></Select>
            </div>
            <h4>Tournament Configuration</h4>
            <div className="grid grid-cols-2 gap-[8px]">
              <div>
                <label htmlFor={'title'}>Title</label>
                <input
                  id={'title'}
                  min={0}
                  value={title}
                  required={true}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border border-black rounded-[4px] p-[8px] w-full text-sm"
                />
              </div>
              {
                configurableTournamentProperties.map((property, i) => {
                  return (
                    <div
                      key={i}
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
                        value={tournamentConfig[property.value]}
                        type={property.type}
                        onChange={(e) => {
                          setTournamentConfig({
                            ...tournamentConfig,
                            [property.value]: property.type === 'checkbox' ? e.target.checked : e.target.value
                          })
                        }}
                        className="border border-black rounded-[4px] p-[8px] w-full text-sm"
                      />
                    </div>
                  )
                })
              }
            </div>
            <h4>Game Configuration</h4>
            <div className="grid grid-cols-2 gap-[8px]">
              {
                configurableGameProperties[gameTypeForm].map((property, i) => {
                  return (
                    <div
                      key={i}
                      style={property.type === 'checkbox' ? {
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      } : {
                        display: property.type === 'hidden' ? 'none' : 'block',
                      }}
                    >
                      <label htmlFor={property.value}>{property.label}</label>
                      <input
                        id={property.value}
                        min={0}
                        value={gameConfig[property.value]}
                        type={property.type}
                        onChange={(e) => {
                          setGameConfig({
                            ...gameConfig,
                            [property.value]: property.type === 'checkbox' ? e.target.checked : e.target.value
                          })
                        }}
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
