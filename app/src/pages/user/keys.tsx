import { CheckIcon, EyeOpenIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { Heading, Text } from '@radix-ui/themes'
import * as React from 'react'
import { UserContext } from '@app/context/UserContext'
import * as Form from '@radix-ui/react-form';

export default function Keys() {

  const [loading, setLoading] = React.useState(true)
  const [updateLoading, setUpdateLoading] = React.useState(false)
  const [name, setName] = React.useState('')
  const [keys, setKeys] = React.useState<any[]>([])
  const [showKey, setShowKey] = React.useState(false)

  const { user } = React.useContext(UserContext)

  const createApiKey = async () => {
    setLoading(true)
    await fetch(`/api/v1/keys`, {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id
      })
    })

    getKeys()
  }

  const updateApiKey = async (id = '', params = {}, reveal = false) => {
    setLoading(true)
    await fetch(`/api/v1/keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...params,
        name: params.name || name,
        viewed: true,
      })
    })

    if (!reveal) {
      getKeys()
    }
  }

  const deleteApiKey = async (id = '') => {
    await fetch(`/api/v1/keys/${id}`, {
      method: 'DELETE'
    })

    getKeys()
  }

  const getKeys = async () => {
    setLoading(true)
    const res = await fetch(`/api/v1/users/${user.id}/keys`)
    const keys = await res.json()
    setLoading(false)
    setKeys(keys)
  }

  React.useEffect(() => {
    getKeys()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading mb="2" size="4">API Keys {keys.length > 0 ? `(${keys.length})` : ''}</Heading>
        <button
          className="flex items-center gap-[4px]"
          onClick={createApiKey}
        >
          <PlusIcon />
          Create New API Key
        </button>
      </div>
      <div>
        <Text className="text-sm block my-[16px]">Once generated, API Key will not be visible again.</Text>
        <Text className="text-sm block mb-[32px]">
          To authenticate with the API, please use the headers:<br />
          <code>
            {`API_ID: <API_ID>`}<br />
            {`API_SECRET: <API_KEY>`}
          </code>
        </Text>
        {
          loading ?
            <Text>Loading...</Text> :
            keys.length > 0 ?
              <div className="flex flex-col gap-[8px]">
                {
                  keys.map((key, i) => {
                    return (
                      <div className={`px-[8px] py-[4px] ${i % 2 === 0 ? 'bg-[#f8f8f8]' : 'bg-white'}`}>
                        <p className="mb-[8px] text-xs">ID: {key.id}</p>
                        <div className={`flex items-center justify-between gap-[16px]`} key={i}>
                          <input
                            type="text"
                            placeholder={key.name || 'Name for key (optional)'}
                            defaultValue={key.name || ''}
                            onChange={e => setName(e.target.value)}
                            className="bg-transparent"
                          />
                          {
                            key.viewed ?
                              <input className="bg-transparent" type="password" disabled value={key.key} /> :
                              <p className="block text-xs p-[4px]">{key.key}</p>
                          }
                          <div>
                            <div className="flex items-center gap-[8px]">
                              {!key.viewed &&
                                <div
                                  className="cursor-pointer"
                                  onClick={() => {
                                    updateApiKey(key.id, {
                                      ...key,
                                      viewed: true
                                    }, true)
                                  }}
                                >
                                  <EyeOpenIcon />
                                </div>
                              }
                              <div className="cursor-pointer" onClick={() => deleteApiKey(key.id)}>
                                <TrashIcon className="text-[red]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </div> :
              <Text>No keys found</Text>
        }
      </div>
    </div >
  )
}
