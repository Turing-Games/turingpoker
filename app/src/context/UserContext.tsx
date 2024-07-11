import React from 'react'

const UserContext = React.createContext<any>({
  user: {},
  setUser: () => false
})

export {
  UserContext
}