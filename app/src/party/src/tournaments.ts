import type * as Party from "partykit/server";
import { json, notFound } from "../../utils/response";
import PartyServer from "./main";
import { RoomDeleteRequest, RoomUpdateRequest } from "@app/types/message";

/**
 * The tables party's purpose is to keep track of all games, so we want
 * every client to connect to the same room instance by sharing the same room id.
 */
const SINGLETON_ROOM_ID = "tournaments";


export default class TournamentsServer extends PartyServer {
  options: Party.ServerOptions = {
    hibernate: true,
    // this opts the chat room into hibernation mode, which
    // allows for a higher number of concurrent connections
  };

  constructor(public room: Party.Room) {
    super(room)
  }

  async onConnect(connection: Party.Connection) {
    // when a websocket connection is established, send them a list of rooms
    connection.send(JSON.stringify(await this.getTournaments()));
  }

  async onRequest(req: Party.Request) {
    // we only allow one instance of chatRooms party
    if (this.room.id !== SINGLETON_ROOM_ID) return notFound();

    // Clients fetch list of rooms for server rendering pages via HTTP GET
    if (req.method === "GET") return json(await this.getTournaments(req));

    // Chatrooms report their connections via HTTP POST
    // update room info and notify all connected clients
    if (req.method === "POST") {
      const roomList = await this.updateRoomInfo(req);
      this.room.broadcast(JSON.stringify(roomList));
      return json(roomList);
    }

    // admin api for clearing all rooms (not used in UI)
    if (req.method === "DELETE") {
      await this.room.storage.deleteAll();
      return json({ message: "All room history cleared" });
    }

    return notFound();
  }

  /** Fetches list of active rooms */
  async getTournaments(req?: any): Promise<any[]> {
    const tournaments = await this.room.storage.list<any>();
    // if (gameType) {
    //   rooms = Array.from(rooms?.values())?.filter(room => {
    //     if (gameType && room.gameType !== gameType) return false;
    //     return true;
    //   })
    // }

    return [...tournaments.values()];
  }
  /** Updates list of active rooms with information received from chatroom */
  async updateRoomInfo(req: Party.Request) {
    const update = (await req.json()) as
      | RoomUpdateRequest
      | RoomDeleteRequest;

    if (update.action === "delete") {
      await this.room.storage.delete(update.id);
      return this.getTournaments();
    }

    const info = update.state;
    const totalPlayers = info?.queuedPlayers?.length + info?.spectatorPlayers?.length + info?.inGamePlayers?.length;

    this.room.storage.put(update.id, info);
    return this.getTournaments();
  }
}
