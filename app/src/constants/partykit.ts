const PARTYKIT_HOST = import.meta.env.VITE_ENV == 'production' ? 'ws.turingpoker.com' : 'localhost:1999'

export const PARTYKIT_PROTOCOL =
  import.meta.env.VITE_ENV === 'production'
    ? "https"
    : "http";

export const PARTYKIT_URL = `${PARTYKIT_PROTOCOL}://${PARTYKIT_HOST}`;

export const SINGLETON_ROOM_ID = 'tgpoker'
