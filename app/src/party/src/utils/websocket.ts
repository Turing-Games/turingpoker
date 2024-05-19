import PartySocket from "partysocket";

export const sendMessage = (socket: PartySocket | null, message: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log(socket)
    socket.send(JSON.stringify(message));
  } else {
    console.error("WebSocket is not initialized or not open.");
  }
}

export const connect = (socket: PartySocket | null) => {
  const roomId = Math.round(Math.random() * 10000)
  socket = new PartySocket({
    host: 'party.turingpoker.com',
    room: `tgpoker-${roomId}`,
    party: 'tables'
  });
}