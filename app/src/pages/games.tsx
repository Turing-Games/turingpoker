import * as React from 'react'
import Main from '@app/layouts/main';
import { PARTYKIT_URL, SINGLETON_ROOM_ID } from '@app/constants/partykit';
import { TrashIcon } from '@radix-ui/react-icons';
import { SignedIn } from '@clerk/clerk-react';
import { sendMessage } from '@tg/utils/websocket';
import { useAuth } from '@clerk/clerk-react';


export default function Games() {

  const [loading, setLoading] = React.useState(false)
  const [tables, setTables] = React.useState([])

  const partyUrl = `${PARTYKIT_URL}/parties/tables/${SINGLETON_ROOM_ID}`;

  const isSignedIn = useAuth()?.isSignedIn

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
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {
            tables.map((table, i) => {
              return (
                <div style={{ cursor: 'pointer', background: '#fff', border: '1px solid #000', borderRadius: 4, padding: 20 }}>
                  <div
                    onClick={() => {
                      deleteTable(table.id)
                    }}
                  >
                    <TrashIcon />
                  </div>
                  <p style={{ margin: '8px 0' }}>Table: {table.id}</p>
                  <p>{table.connections} player{table.connections > 1 ? 's' : ''} in the room</p>
                  <SignedIn>
                    <button
                      onClick={() => {
                        sendMessage(socket, { type: "join-game" });
                      }}
                    >
                      Join game
                    </button>
                  </SignedIn>
                </div>
              )
            })
          }
        </div>
      </div>
    </Main >
  )
}