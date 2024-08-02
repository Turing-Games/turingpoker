import React from 'react'
import { UserContext } from '@app/context/UserContext'
import { useUser } from '@clerk/clerk-react'

export default function User({ children }: { children: React.ReactNode }) {

  const [tgUser, setTgUser] = React.useState({})
  const { user } = useUser()

  const getDbUser = async (clerkUserId: string) => {
    const res: any = await fetch(`/api/v1/users/${clerkUserId}`)
    const user = await res.json()
    return user
  }

  const getUser = async () => {
    console.log('get user')
    if (user?.id) {
      const dbUser = await getDbUser(user?.id)
      const mergedUser = {
        ...user,
        clerk_id: dbUser?.clerk_id,
        id: dbUser?.id
      }
      setTgUser(mergedUser)
    } else {
      setTgUser({})
    }
  }

  React.useEffect(() => {
    getUser()
  }, [user?.id])

  return (
    <UserContext.Provider value={{ user: tgUser }}>
      {children}
    </UserContext.Provider>
  )
}