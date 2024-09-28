import { RoomCreateRequest, RoomDeleteRequest, RoomUpdateRequest } from "@app/types/message";
import type * as Party from "partykit/server";
import { json, notFound } from "../../utils/response";
import { IPlayer, TableState } from "./shared";

/**
 * The tables party's purpose is to keep track of all games, so we want
 * every client to connect to the same room instance by sharing the same room id.
 */
const defaultStack = 1000;

export default class TablesServer implements Party.Server {

  public player: IPlayer = { playerId: '', isBot: false }
  public inGamePlayers: IPlayer[] = [];
  public spectatorPlayers: IPlayer[] = [];
  public queuedPlayers: IPlayer[] = [];
  public eliminatedPlayers: IPlayer[] = [];
  public gamePhase = "pending"
  public lastActed: Record<string, number> = {};
  public winner: IPlayer = { playerId: '', isBot: false }
  public stacks: Record<string, number> = {};
  public stackSize = defaultStack;

  options: Party.ServerOptions = {
    hibernate: true,
    // this opts the chat room into hibernation mode, which
    // allows for a higher number of concurrent connections
  };

  constructor(readonly room: Party.Room) { }

  async onRequest(req: Party.Request) {
    // we only allow one instance of chatRooms party
    // if (this.party.id !== SINGLETON_ROOM_ID) return notFound();

    // Clients fetch list of rooms for server rendering pages via HTTP GET
    if (req.method === "GET") {
      return json(await this.getRoom());
    }

    // Chatrooms report their connections via HTTP POST
    // update room info and notify all connected clients
    if (req.method === "POST") {
      const roomList = await this.updateRoom(req);;
      // if (this.gamePhase !== 'final') {
      //   roomList = await this.updateRoom(req);
      // } else {
      //   roomList = await this.getRoom();
      // }
      this.room.broadcast(JSON.stringify(roomList));
      return json(roomList);
    }

    // admin api for clearing all rooms (not used in UI)
    if (req.method === "DELETE") {
      await this.room.storage.delete(this.room.id);
      return json({ message: "Room history cleared" });
    }

    return notFound();
  }

  async onError(connection: Party.Connection, error: Error) {
    console.log('onError', error)
    console.log(error)
  }

  /** Fetches list of active rooms */
  // await this.party.storage.deleteAll();
  async getRoom(): Promise<TableState[] | TableState> {
    const room = await this.room.storage?.get(this.room.id)
    return room;
  }
  /** Updates table with information received from game */
  async updateRoom(req: Party.Request) {
    const update = (await req.json()) as
      | RoomUpdateRequest
      | RoomDeleteRequest
      | RoomCreateRequest;

    if (update.action === "delete") {
      await this.room.storage.delete(update.id);
      return this.getRoom();
    }

    if (update.action === 'create' || update.action === 'update') {
      const info = update.state;
      const totalPlayers = info?.queuedPlayers?.length + info?.spectatorPlayers?.length + info?.inGamePlayers?.length;
      // await this.room.storage.put(update.id, info);
      await this.room.storage.put(update.id, info)
      // await this.room.context.parties[update.gameType]?.storage.put(update.id, info)
      return this.getRoom();
    }
  }

  // remove ingame players that have 0 chips
  eliminatePlayers() {
    console.log(this.stacks)
    this.eliminatedPlayers = this.inGamePlayers.filter((player) => this.stacks[player.playerId] <= 0)
    this.inGamePlayers = this.inGamePlayers.filter((player) => this.stacks[player.playerId] > 0);
  }

  addPlayer(playerId: string, isBot = false) {
    // console.log('addPlayer')
    if (!this.playerExists(playerId)) {
      this.stacks[playerId] = this.stackSize;
      this.spectatorPlayers.push({
        playerId,
        isBot
      });
    }
  }

  playerExists(playerId: string) {
    // console.log('playerExists') 
    const isInGamePlayer = this.inGamePlayers.find(p => p.playerId === playerId)
    const isSpectatorPlayer = this.spectatorPlayers.find(p => p.playerId === playerId)
    const isQueuedPlayer = this.queuedPlayers.find(p => p.playerId === playerId)
    // console.log(isQueuedPlayer)
    // console.log(isSpectatorPlayer)
    // console.log(isInGamePlayer)

    return !!isInGamePlayer || !!isSpectatorPlayer || !!isQueuedPlayer
  }

  // record winner to db
  endGame() {
    console.log('endGame()')
    if (this.inGamePlayers.length === 1 && this.gamePhase !== 'pending') {
      console.log('record winner')
      this.winner = this.inGamePlayers[0]
      this.gamePhase = "final"
    }
  }
}
