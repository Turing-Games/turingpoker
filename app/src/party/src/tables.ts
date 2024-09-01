import type * as Party from "partykit/server";
import { json, notFound } from "../../utils/response";
import { IPlayer, TableState } from "./shared";
import authBotConnection from "../../utils/auth";

/**
 * The tables party's purpose is to keep track of all games, so we want
 * every client to connect to the same room instance by sharing the same room id.
 */
export const SINGLETON_ROOM_ID = "games";

/** Poker room sends an update whenever server state changes */
export type RoomCreateRequest = {
  action: 'create';
  id: string;
  tableState: TableState;
};

export type RoomUpdateRequest = {
  action: 'update';
  id: string;
  tableState: TableState;
};

export type RoomDeleteRequest = {
  id: string;
  action: "delete";
};

export default class TablesServer implements Party.Server {

  public inGamePlayers: IPlayer[] = [];
  public spectatorPlayers: IPlayer[] = [];
  public queuedPlayers: IPlayer[] = [];
  public eliminatedPlayers: IPlayer[] = [];
  public gamePhase = "pending"
  public lastActed: Record<string, number> = {};
  public winner: IPlayer = { playerId: '', isBot: false }

  options: Party.ServerOptions = {
    hibernate: true,
    // this opts the chat room into hibernation mode, which
    // allows for a higher number of concurrent connections
  };

  constructor(public party: Party.Party) { }

  async onRequest(req: Party.Request) {
    // we only allow one instance of chatRooms party
    // if (this.party.id !== SINGLETON_ROOM_ID) return notFound();

    // Clients fetch list of rooms for server rendering pages via HTTP GET
    if (req.method === "GET") return json(await this.getRoom());

    // Chatrooms report their connections via HTTP POST
    // update room info and notify all connected clients
    if (req.method === "POST") {
      let roomList = []
      if (this.gamePhase !== 'final') {
        roomList = await this.updateRoomInfo(req);
      } else {
        roomList = await this.getRoom();
      }
      this.party.broadcast(JSON.stringify(roomList));
      return json(roomList);
    }

    // admin api for clearing all rooms (not used in UI)
    if (req.method === "DELETE") {
      await this.party.storage.delete(this.party.id);
      return json({ message: "Room history cleared" });
    }

    return notFound();
  }

  /** Fetches list of active rooms */
  // await this.party.storage.deleteAll();
  async getRoom(): Promise<TableState> {
    const room = await this.party.storage.get<TableState>(this.party.id);
    return room;
  }
  /** Updates table with information received from game */
  async updateRoomInfo(req: Party.Request) {
    const update = (await req.json()) as
      | RoomUpdateRequest
      | RoomDeleteRequest
      | RoomCreateRequest;

    if (update.action === "delete") {
      await this.party.storage.delete(update.id);
      return this.getRoom();
    }

    const info = update.tableState;
    const totalPlayers = info?.queuedPlayers?.length + info?.spectatorPlayers?.length + info?.inGamePlayers?.length;

    await this.party.storage.put(update.id, info);
    return this.getRoom();
  }
}
