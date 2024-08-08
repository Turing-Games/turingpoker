import * as React from 'react'
import Main from '@app/layouts/main';
import { SignedIn, useUser } from '@clerk/clerk-react';
import { Heading, Text } from '@radix-ui/themes';
import TgTable from '@app/components/Table';
import { Link, useParams } from 'react-router-dom';


export default function Tournament() {

  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState<any[]>([])

  const { tournamentId } = useParams<{ tournamentId: string }>()

  const isAdmin = useUser()?.user?.organizationMemberships?.[0]?.role === 'org:admin'

  const getTournament = async () => {
    setLoading(true)

    setLoading(false)
  }

  React.useEffect(() => {
    getTournament()
  }, [])


  return (
    <Main pageTitle={`Tournament: ${data?.tournaments?.title}`}>
      <div className="p-[20px] w-full">
        <Heading mb="2" size="4">Tournament: {data?.tournaments?.title}</Heading>
      </div>
      <style>{`#root{overflow:auto!important`}</style>
    </Main >
  )
}
