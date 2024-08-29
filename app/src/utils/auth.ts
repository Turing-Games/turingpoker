export default async function authBotConnection(request: any) {
  console.log('authbotconnection')
  // This function is used to authenticate a bot connection
  // to the server. It is called when a bot connects to the server.
  return new Promise(async (resolve, reject) => {
    try {
      const token = request.headers.get("Authorization") ?? "";
      const res = await fetch("http://127.0.0.1:5173/api/v1/auth/bots", {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
      })
      await res.json()
      resolve(request)
    } catch (e) {
      reject(e)
    }
  })
}