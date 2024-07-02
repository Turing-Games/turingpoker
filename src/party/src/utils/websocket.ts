import PartySocket from "partysocket";
import { PARTYKIT_URL } from "@app/constants/partykit";

export const sendMessage = (socket: PartySocket | null, message: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error("WebSocket is not initialized or not open.");
  }
}

export const connect = (socket: PartySocket | null) => {
  const roomId = Math.round(Math.random() * 10000)
  socket = new PartySocket({
    host: PARTYKIT_URL,
    room: `tgpoker-${roomId}`,
    party: 'poker'
  });
}