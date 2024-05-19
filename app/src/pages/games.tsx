import * as React from 'react'
import Main from '@app/layouts/main';
import { PARTYKIT_URL, SINGLETON_ROOM_ID } from '@app/constants/partykit';
import { TrashIcon } from '@radix-ui/react-icons';
import { SignedIn, useUser } from '@clerk/clerk-react';
import { sendMessage } from '@tg/utils/websocket';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';


export default function Games() {

  const [loading, setLoading] = React.useState(false)
  const [tables, setTables] = React.useState([])

  const partyUrl = `${PARTYKIT_URL}/parties/tables/${SINGLETON_ROOM_ID}`;
  const isAdmin = useUser()?.user?.organizationMemberships?.[0]?.role === 'org:admin'

  const deleteTable = async (id: number) => {
    const res = await fetch(partyUrl, {
      method: "POST",
      body: JSON.stringify({
        action: "delete",
        id: id
      })
    });
    const rooms = ((await res.json()) ?? []);
    setTables(rooms)
  }

  React.useEffect(() => {
    const getData = async () => {
      const res = await fetch(partyUrl);
      const rooms = ((await res.json()) ?? []);
      setTables(rooms)
    }

    getData()
  }, [])

  return (
    <Main>
      <div style={{ padding: 20 }}>
        <h2>Tables ({tables.length})</h2>
        <div
          className="tg-poker__games-list"
        >
          {
            tables.map((table, i) => {
              return (
                <Link
                  className="tg-poker__games-list__card"
                  to={`/games/${table.id}`}
                  key={table.id}
                >
                  {isAdmin &&
                    <div
                      onClick={() => {
                        deleteTable(table.id)
                      }}
                    >
                      <TrashIcon />
                    </div>
                  }
                  <p>Table: {table.id}</p>
                  <p>{table.connections} player{table.connections > 1 ? 's' : ''} in the room</p>
                </Link>
              )
            })
          }
        </div>
      </div>
      <style>{`#root{overflow:auto!important`}</style>
    </Main >
  )
}