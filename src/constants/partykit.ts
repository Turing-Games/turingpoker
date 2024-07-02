const PROD = import.meta?.env?.PROD
console.log(import.meta?.env)
console.log(process.env)
const PARTYKIT_HOST = PROD ? 'ws.turingpoker.com' : 'localhost:1999'
export const PARTYKIT_PROTOCOL = PROD ? 'https' : 'http'
export const PARTYKIT_URL = `${PARTYKIT_PROTOCOL}://${PARTYKIT_HOST}`;
export const SINGLETON_ROOM_ID = 'tgpoker'
