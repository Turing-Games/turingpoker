let PARTYKIT_HOST = ''
let PARTYKIT_PROTOCOL = ''
if (typeof location !== 'undefined') {
  PARTYKIT_HOST = location.hostname !== 'localhost' ? 'ws.turingpoker.com' : 'localhost:1999'
  PARTYKIT_PROTOCOL = location.hostname !== 'localhost' ? 'https' : 'http'
}

let SERVER_HOST = ''
let SERVER_PROTOCOL = ''
if (typeof location !== 'undefined') {
  SERVER_HOST = location.hostname !== 'localhost' ? 'play.turingpoker.com' : 'localhost:5173'
  SERVER_PROTOCOL = location.hostname !== 'localhost' ? 'https' : 'http'
}


export const PARTYKIT_URL = `${PARTYKIT_PROTOCOL}://${PARTYKIT_HOST}`;
export const SERVER_URL = `${SERVER_PROTOCOL}://${SERVER_HOST}`;
export const SINGLETON_ROOM_ID = 'games'
