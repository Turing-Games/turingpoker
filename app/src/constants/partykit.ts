// const PARTYKIT_HOST = 'localhost:1999'
console.log('import?.meta?.env')
console.log(import.meta?.env)
console.log('process.env')
console.log(process?.env)
const PARTYKIT_HOST = 'ws.turingpoker.com'

// export const PARTYKIT_PROTOCOL = 'http'
export const PARTYKIT_PROTOCOL = 'https'

export const PARTYKIT_URL = `${PARTYKIT_PROTOCOL}://${PARTYKIT_HOST}`;

export const SINGLETON_ROOM_ID = 'tgpoker'
