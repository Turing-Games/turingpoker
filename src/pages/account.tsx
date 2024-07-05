import * as React from 'react'
import Main from '../layouts/main';
import { PARTYKIT_URL, SINGLETON_ROOM_ID } from '../constants/partykit';
import { TrashIcon } from '@radix-ui/react-icons';
import { SignedIn, useUser } from '@clerk/clerk-react';
import { sendMessage } from '@tg/utils/websocket';
import { Link, Outlet } from 'react-router-dom';
import { TABLE_STATE_VERSION, TableState } from '@tg/shared';
import Sidebar from 'src/components/Sidebar';

export default function Account() {

  const [loading, setLoading] = React.useState(false)

  const isAdmin = useUser()?.user?.organizationMemberships?.[0]?.role === 'org:admin'

  React.useEffect(() => {
    const getData = async () => {
      // const res = await fetch(partyUrl);
      // const rooms = ((await res.json()) ?? []) as TableState[];
      // setTables(rooms.filter(room => room.version >= TABLE_STATE_VERSION))
      // setTables(rooms)
    }
    // getData()
  }, [])

  return (
    <Main>
      <div style={{ padding: 20 }}>
        <h2>Manage Account</h2>
        <div className="flex">
          {/* sidebar */}
          <Sidebar items={[
            { name: 'Test' },
            { name: 'Test 2' }
          ]} />
          {/* settings */}
          <Outlet />
        </div>
      </div>
      {/* <style>{`#root{overflow:auto!important`}</style> */}
    </Main >
  )
}
