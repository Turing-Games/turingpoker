export default async function authBotConnection(conn, ctx) {
  // This function is used to authenticate a bot connection
  // to the server. It is called when a bot connects to the server.
  const bearerToken = ctx.request.headers['authorization']
  const res = await fetch("http://127.0.0.1:5173/api/v1/auth/bots", {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': bearerToken
    },
  })

  // const data = await res.json()
  // console.log(data)
  return true
}