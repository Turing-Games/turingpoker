import { useUser } from '@clerk/clerk-react';
import { PlusIcon } from '@radix-ui/react-icons'
import { Heading, Text } from '@radix-ui/themes'
import * as React from 'react'

export default function Keys() {

  const { user } = useUser();
  console.log(user)

  const [loading, setLoading] = React.useState(true)
  const [keys, setKeys] = React.useState<any[]>([])

  React.useEffect(() => {
    const getKeys = async () => {
      setLoading(true)
      const res = await fetch(`/api/v1/users/${user.id}/keys`)
      console.log(res)
      const keys = await res.json()
      console.log(keys)
      setLoading(false)
    }

    getKeys()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading mb="2" size="4">API Keys {keys.length > 0 ? `(${keys.length})` : ''}</Heading>
        <button
          className="flex items-center gap-[4px]"
        >
          <PlusIcon />
          Create New API Key
        </button>
      </div>
      <div className="mb-[33px]">
        {
          loading ?
            <Text>Loading...</Text> :
            keys.length > 0 ?
              <div className="flex flex-col gap-[8px]">
                {
                  keys.map((key, i) => {
                    return (
                      <div className="flex items-center justify-between" key={i}>
                        <h3>{key.name}</h3>
                        <p>{key.key}</p>
                      </div>
                    )
                  })
                }
              </div> :
              <Text>No keys found</Text>
        }
      </div>
    </div>
  )
}
