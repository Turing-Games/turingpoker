export default async function authBotConnection(request) {
  // This function is used to authenticate a bot connection
  // to the server. It is called when a bot connects to the server.
  return new Promise(async (resolve, reject) => {
    try {
      const token = request.headers.get("Authorization") ?? "";
      // const bearerToken = ctx.request.headers['authorization']
      const res = await fetch("http://localhost:5173/api/v1/auth/bots", {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
      })
      console.log({ res })
      const data = await res.json()
      resolve({
        ...request,
        data: data
      })
    } catch (e) {
      console.log(e)
      resolve({
        ...request,
        data: 'data'
      })
    }
  })
}