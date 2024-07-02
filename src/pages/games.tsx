import * as React from 'react'
import Main from '@app/layouts/main';
import { PARTYKIT_URL, SINGLETON_ROOM_ID } from '@app/constants/partykit';
import { TrashIcon } from '@radix-ui/react-icons';
import { SignedIn, useUser } from '@clerk/clerk-react';
import { sendMessage } from '@tg/utils/websocket';
import { Link } from 'react-router-dom';
import { TABLE_STATE_VERSION, TableState } from '@tg/shared';

export function TableCard({
  table,
  onDelete,
  isAdmin,
}: {
  table: TableState,
  onDelete: (id: string) => void,
  isAdmin: boolean
}) {

  const spectatorCount = table.spectatorPlayers.length + table.queuedPlayers.length;

  return <div style={{ position: 'relative' }}>
    {isAdmin &&
      <div
        className="tg-poker__games-list__card__delete"
        onClick={() => {
          onDelete(table.id)
        }}
      >
        <TrashIcon />
      </div>
    }
    <Link
      className="tg-poker__games-list__card"
      to={`/games/${table.id}`}
      key={table.id}
    >
      <p>Table: {table.id}</p>
      <p>{table.gameState ? `In game: ${table.gameState.round}` : `Waiting to start`}</p>
      <p>{spectatorCount} spectator{spectatorCount > 1 ? 's' : ''} in the room</p>
      {table.gameState && <>
        <p>Players:</p>
        {table.gameState.players.map(player => <p key={player.id}>{player.id}: ${player.stack}</p>)}
      </>}
    </Link>
  </div>

}

export default function Games() {

  const [loading, setLoading] = React.useState(false)
  const [tables, setTables] = React.useState<TableState[]>([])

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
      const res = await fetch(partyUrl);
      const rooms = ((await res.json()) ?? []) as TableState[];
      // setTables(rooms.filter(room => room.version >= TABLE_STATE_VERSION))
      setTables(rooms)
    }
    getData()
  }, [])

  return (
    <Main>
      <div style={{ padding: 20 }}>
        <h2>Tables ({tables.length})</h2>
        <div className="tg-poker__games-list">
          {
            tables.map((table, i) => {
              return <TableCard table={table} isAdmin={isAdmin} onDelete={deleteTable} />
            })
          }
        </div>
      </div>
      <style>{`#root{overflow:auto!important`}</style>
    </Main >
  )
}
