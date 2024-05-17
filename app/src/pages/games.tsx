import * as React from 'react'
import Main from '@app/layouts/main';


export default function Games() {

  const [tables, setTables] = React.useState([])

  React.useEffect(() => {

  }, [])

  return (
    <Main>
      <div style={{ padding: 20 }}>
        <h2>Tables ({tables.length})</h2>

      </div>
    </Main>
  )
}