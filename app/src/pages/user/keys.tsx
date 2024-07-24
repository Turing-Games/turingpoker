import { CheckIcon, CopyIcon, EyeOpenIcon, InfoCircledIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { Callout, Code, DataList, Flex, Heading, Text } from '@radix-ui/themes'
import * as React from 'react'
import { UserContext } from '@app/context/UserContext'
import * as Form from '@radix-ui/react-form';
import { Link } from 'react-router-dom';

export default function Keys() {

  const [loading, setLoading] = React.useState(true)
  const [updateLoading, setUpdateLoading] = React.useState(false)
  const [keys, setKeys] = React.useState<any[]>([])
  const [showKey, setShowKey] = React.useState<string>('') // key id
  const [openInfo, setOpenInfo] = React.useState(false)
  const [selectedKey, setSelectedKey] = React.useState({})

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

  const updateApiKey = async (id = '', params = {}) => {
    await fetch(`/api/v1/keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(params)
    })
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

  // const debouce = React.useCallback(() => {
  //   const timer = setTimeout(() => {
  //     updateApiKey(selectedKey.id, selectedKey)
  //   }, 2000)

  //   return () => clearTimeout(timer)
  // }, [JSON.stringify(selectedKey)])

  const updateKeyName = (name: any) => {
    if (name !== selectedKey.name) {
      setSelectedKey({
        ...selectedKey,
        name
      })
      setTimeout(() => {
        updateApiKey(selectedKey.id, {
          ...selectedKey,
          name
        })
      }, 1500)
    }
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
        <Callout.Root className="my-[32px]">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>Once generated, API Key will not be visible again.</Callout.Text>
        </Callout.Root>
        <div
          className="flex items-center gap-[8px] mb-[16px] cursor-pointer"
          onClick={() => setOpenInfo(!openInfo)}
        >
          <PlusIcon
            className='transition duration-300'
            style={{
              transform: openInfo ? 'rotate(45deg)' : 'rotate(0deg)'
            }}
          />
          <Heading size="4">Connecting a bot</Heading>
        </div>
        <div
          className='transition duration-300 overflow-hidden'
          style={{
            height: openInfo ? 'auto' : 0,
          }}
        >
          <div className="block mb-[32px] ml-[8px] pl-[16px] border-black border-l">
            <p className="mb-[16px]">To connect a bot to the game, follow these steps:</p>
            <ol className="list-decimal pl-[32px]">
              <li className="mb-[8px]">
                <Text>Create an API Key in your account.</Text>
              </li>
              <li className="mb-[8px]">
                <Text>
                  Provide the following arguments in your bot's Python template:<br />
                  <Text className='block' weight={'bold'}>--host <Code>ws.turingpoker.com</Code></Text>
                  <Text className='block' weight={'bold'}>--port <Code>1999</Code></Text>
                  <Text className='block'><strong>--room</strong> Numerical ID listed on the <Link to='/games'>games</Link> page</Text>
                  <Text className='block'><strong>--party</strong> Type of game {'(valid values are: "poker" or "kuhn")'}</Text>
                  <Text className='block'><strong>--key</strong> API Key generated for bot</Text>
                </Text>
              </li>
              <li>
                <Text>Run the script using <Code>screen</Code> or as a background process</Text>
              </li>
            </ol>
          </div>
        </div>
        {
          loading ?
            <Text>Loading...</Text> :
            keys.length > 0 ?
              <div className="flex flex-col gap-[8px]">
                {
                  keys.map((key, i) => {
                    return (
                      <div className={`px-[8px] py-[4px] ${i % 2 === 0 ? 'bg-[#f8f8f8]' : 'bg-white'}`} key={key.id}>
                        <div className={`flex items-center justify-between gap-[16px]`} key={i}>
                          <input
                            type="text"
                            placeholder={key.name || 'Name for key (optional)'}
                            defaultValue={key.name || ''}
                            onChange={e => updateKeyName(e.target.value)}
                            className="bg-transparent"
                            onFocus={() => setSelectedKey(key)}
                            onBlur={() => setSelectedKey({})}
                          />
                          <div className="flex items-center gap-[16px]">
                            {
                              key.viewed || key.id !== showKey ?
                                <input className="bg-transparent" type="password" disabled value={'1234567890123456789012345678901234567890'} /> :
                                <p className="block text-xs p-[4px] max-w-[177px] w-full truncate">{key.key}</p>
                            }
                            {!key.viewed ?
                              key.id === showKey ?
                                // copy
                                <div>
                                  <CopyIcon
                                    className="cursor-pointer"
                                    onClick={() => {
                                      navigator.clipboard.writeText(key.key)
                                      alert('Copied API key to clipboard')
                                    }}
                                  />
                                </div> :
                                // view
                                <div
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setShowKey(key.id)
                                    updateApiKey(key.id, {
                                      ...key,
                                      viewed: true
                                    })
                                  }}
                                >
                                  <EyeOpenIcon />
                                </div> :
                              <div className="opacity-0">
                                <EyeOpenIcon />
                              </div>
                            }
                          </div>
                          <div className="cursor-pointer" onClick={() => deleteApiKey(key.id)}>
                            <TrashIcon className="text-[red]" />
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
