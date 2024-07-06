const PROD = import.meta?.env?.PROD || process?.env?.NODE_ENV === 'production'
console.log({ PROD })
const PARTYKIT_HOST = PROD ? 'ws.turingpoker.com' : 'localhost:1999'
export const PARTYKIT_PROTOCOL = PROD ? 'https' : 'http'
export const PARTYKIT_URL = `${PARTYKIT_PROTOCOL}://${PARTYKIT_HOST}`;
export const SINGLETON_ROOM_ID = 'tgpoker'
