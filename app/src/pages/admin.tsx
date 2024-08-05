import * as React from 'react'
import Main from '@app/layouts/main';
import { TrashIcon } from '@radix-ui/react-icons';
import { useUser } from '@clerk/clerk-react';
import { Heading, Text } from '@radix-ui/themes';
import Select from '@app/components/Select';
import TgTable from '@app/components/Table';
import { RESOURCES } from '@app/constants/resources';


export default function Admin() {

  const [loading, setLoading] = React.useState(false)
  const [resource, setResource] = React.useState<any>('users')
  const [data, setData] = React.useState<any[]>([])

  const isAdmin = useUser()?.user?.organizationMemberships?.[0]?.role === 'org:admin'

  const deleteResource = async (id: string) => {
    await fetch(`/api/v1/${resource}/${id}`, {
      method: 'DELETE',
    });

    getData()
  }

  const getData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/${resource}`)
      const data = await res.json() ?? []
      setData(data)
      // setTables(rooms.filter(room => room.version >= TABLE_STATE_VERSION))
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  React.useEffect(() => {
    getData()
  }, [resource])

  return (
    <Main pageTitle='Admin'>
      <div className="p-[20px] w-full">
        <Heading className="capitalize" mb="2" size="4">{resource}</Heading>
        {/* resource type */}
        <div className="flex items-center gap-[8px] mt-[16px] mb-[32px]">
          <Select
            options={RESOURCES}
            selected={resource}
            placeholder='Select resource'
            onChange={(value) => setResource(value)}
          ></Select>
        </div>
        {
          data.length > 0 ?
            // <div className="h-[200px]">
            <TgTable
              loading={loading}
              selectableRows={false}
              headers={[
                { value: 'id', name: RESOURCES.find(r => r.value === resource)?.label },
                { value: 'username', name: 'Username' },
                { value: 'delete', name: '', align: 'center' },
              ]}
              rows={data.map(data => {
                return {
                  id: data.id,
                  username: data.username,
                  delete: (isAdmin &&
                    <div
                      className='cursor-pointer'
                      onClick={async () => {
                        await deleteResource(data.id)
                      }}
                    >
                      <TrashIcon className="text-[red]" />
                    </div>
                  ),
                }
              })}
            />
            // </div> 
            :
            <Text>No data found</Text>
        }
      </div>
      <style>{`#root{overflow:auto!important`}</style>
    </Main >
  )
}