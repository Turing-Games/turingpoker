import PartySocket from "partysocket";

export const sendMessage = (socket: PartySocket | null, message: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error("WebSocket is not initialized or not open.");
  }
}