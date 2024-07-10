import * as React from 'react'

export default function Keys() {

  const [loading, setLoading] = React.useState(true)
  const [keys, setKeys] = React.useState<any[]>([])

  React.useEffect(() => {
    const getKeys = async () => {
      setLoading(true)
      const res = await fetch('/api/v1/keys')
      const keys = await res.json()
      console.log(keys)
      setLoading(false)
    }
  }, [])

  return (
    <div>
      <h2>API Keys {keys.length > 0 ? `(${keys.length})` : ''}</h2>
      <div className="text-center">
        {
          loading ?
            <p>Loading...</p> :
            <></>
        }
      </div>
    </div>
  )
}
