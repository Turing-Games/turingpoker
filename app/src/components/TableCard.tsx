import { Cross1Icon, DotsHorizontalIcon, GearIcon, Share1Icon, TrashIcon } from "@radix-ui/react-icons"
import { Text } from "@radix-ui/themes"
import { TableState } from "@tg/shared"
import React from "react"
import { Link } from "react-router-dom"

export function TableCard({
  table,
  onDelete,
  isAdmin,
  selected = false,
  setGameId = () => { },
}: {
  table: TableState,
  onDelete: (id: string) => void,
  isAdmin: boolean
  selected?: boolean
  setGameId?: (game?: any) => void
}) {

  const [showItems, setShowItems] = React.useState(false)

  const spectatorCount = (table?.spectatorPlayers?.length + table?.queuedPlayers?.length) || 0;
  const playerCount = table?.gameState?.players?.length || 0;

  const cardMenuOptions = [
    {
      label: (
        <>
          <TrashIcon />
          Delete
        </>
      ),
      onClick: () => onDelete(table.id), include: isAdmin
    },
    {
      label: (
        <>
          <Share1Icon />
          Invite URL
        </>
      ),
      onClick: () => {
        navigator.clipboard.writeText(`${location.origin}/games/${table.id}/${table.gameType}`)
        alert('Copied invite URL to clipboard')
      },
      include: true
    },
    {
      label: (
        <>
          <GearIcon />
          Python CLI
        </>
      ),
      onClick: () => {
        navigator.clipboard.writeText(`python3 main.py --party ${table.gameType} --room ${table.id}`)
        alert('Copied CLI command to clipboard')
      },
      include: true
    }
  ]

  const handleClickCardMenu = (id: any) => {
    setShowItems(false)
    if (selected) {
      setGameId('')
    } else {
      setGameId(id)
      setTimeout(() => {
        setShowItems(true)
      }, 150)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        className={`
        border border-black absolute top-[-10px] right-[-10px] bg-white 
        ${selected ? 'transition-[width,height] duration-300 w-[150px] h-[186px] rounded-[4px] p-[8px]' :
            'flex items-center justify-center w-[25px] h-[25px] rounded-[50px] cursor-pointer'
          }
      `}
        onClick={() => !selected ? handleClickCardMenu(table.id) : false}
      >
        {
          selected ?
            <div className={`flex flex-col gap-[8px] ${showItems ? 'transition-[opacity] opacity-100' : 'opacity-0'}`}>
              <div
                className="flex justify-end gap-[4px]"
              >
                <div onClick={() => handleClickCardMenu('')} className="cursor-pointer">
                  <Cross1Icon />
                </div>
              </div>
              {
                cardMenuOptions.filter(option => option.include).map((option, i) => {
                  return (
                    <div
                      className="flex gap-[4px] items-center cursor-pointer transition-[padding] duration-100 hover:pl-[4px]"
                      onClick={option.onClick}
                    >
                      {option.label}
                    </div>
                  )
                })
              }
            </div> :
            <DotsHorizontalIcon />
        }
      </div>
      <Link
        className="bg-white border border-black rounded-[4px] grid gap-[8px] p-[12px] pt-[20px]"
        to={`/games/${table.id}/${table.gameType}`}
        key={table.id}
      >
        <strong>{table?.gameType?.toUpperCase()}</strong>
        <Text>Table: {table.id}</Text>
        <Text>Status: {table.gameState ? `In game: ${table.gameState.round}` : `Waiting...`}</Text>
        <Text>Spectators: {spectatorCount}</Text>
        <Text>Players: {playerCount}</Text>
      </Link>
    </div>
  )
}