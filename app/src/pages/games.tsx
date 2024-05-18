import * as React from 'react'
import Main from '@app/layouts/main';
import { PARTYKIT_URL, SINGLETON_ROOM_ID } from '@app/constants/partykit';


export default function Games() {

  const [tables, setTables] = React.useState([])

  const host = import.meta.env.VITE_ENV == 'production' ? 'ws.turingpoker.com' : 'localhost:1999'
  const partyUrl = `${PARTYKIT_URL}/parties/tables/${SINGLETON_ROOM_ID}`;

  React.useEffect(() => {
    const getData = async () => {
      const res = await fetch(partyUrl);
      const rooms = ((await res.json()) ?? []);
      console.log(rooms)
    }

    getData()
  }, [])

  return (
    <Main>
      <div style={{ padding: 20 }}>
        <h2>Tables ({tables.length})</h2>

      </div>
    </Main>
  )
}