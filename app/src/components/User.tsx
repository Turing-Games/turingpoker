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
    if (user?.id) {
      try {
        const dbUser = await getDbUser(user?.id)
        const mergedUser = {
          ...user,
          clerk_id: user?.id,
          id: dbUser?.id
        }
        setTgUser(mergedUser)
      } catch (e) {
        console.log(e)
      }
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