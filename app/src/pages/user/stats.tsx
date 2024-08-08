import { CheckIcon, CopyIcon, EyeOpenIcon, InfoCircledIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { Callout, Code, DataList, Flex, Heading, Text } from '@radix-ui/themes'
import * as React from 'react'
import { UserContext } from '@app/context/UserContext'
import * as Form from '@radix-ui/react-form';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export default function Stats() {

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
        <Heading mb="2" size="4">Game Statistics</Heading>
      </div>
      <div>
      </div>
    </div >
  )
}
