import React from 'react'
import { Hono } from 'hono'
import { Client } from './client'

const app = new Hono()


const Top: React.FC<{ messages: string[] }> = (props: { messages: string[] }) => {
  return (
    <React.Fragment>
      <h1>Hello Hono!</h1>
      <ul>
        {props.messages.map((message) => {
          return <li>{message}!!</li>
        })}
      </ul>
    </React.Fragment>
  )
}

app.get('/', (c) => {
  const messages = ['Good Morning', 'Good Evening', 'Good Night']
  return c.html(<Client />)
})

export default app