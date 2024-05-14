import PartySocket from "partysocket";
export const sendMessage = (socket, message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log(socket);
        socket.send(JSON.stringify(message));
    }
    else {
        console.error("WebSocket is not initialized or not open.");
    }
};
export const connect = (socket) => {
    socket = new PartySocket({
        host: PARTYKIT_HOST,
        room: "my-new-room"
    });
};
