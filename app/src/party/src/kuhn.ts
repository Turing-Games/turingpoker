import type * as Party from 'partykit/server';
import * as Kuhn from '@app/party/src/game-logic/kuhn'
import { ClientMessage, TableState, ServerStateMessage, ServerUpdateMessage, IPlayer, GamePhase } from './shared';
import { SINGLETON_ROOM_ID } from '@app/constants/partykit';
import { json, notFound } from './utils/response';
import { RoomDeleteRequest, RoomUpdateRequest } from './tables';
import MainPartyServer from './main';

export const AUTO_START = true;
export const MIN_PLAYERS_AUTO_START = 2;
export const MAX_PLAYERS = 2

const defaultStack = 3;
export default class PartyServer extends MainPartyServer {
  public gameState: Kuhn.IPokerGame | null = null;
  public gameConfig: Kuhn.IPokerConfig = {
    dealerPosition: 0,
    bigBlind: 1,
    maxPlayers: MAX_PLAYERS,
    smallBlind: 1,
    autoStart: AUTO_START,
    minPlayers: MIN_PLAYERS_AUTO_START
  };
  public inGamePlayers: IPlayer[] = [];
  public spectatorPlayers: IPlayer[] = [];
  public queuedPlayers: IPlayer[] = [];
  public eliminatedPlayers: IPlayer[] = [];
  public stacks: Record<string, number> = {};
  public gamePhase = "pending"
  public lastActed: Record<string, number> = {};

  public timeoutLoopInterval: NodeJS.Timeout | null = null;

  public queuedUpdates: ServerUpdateMessage[] = [];

  constructor(public readonly party: Party.Party) {
    super(party);
  }

  onStart(): void | Promise<void> {
    this.timeoutLoopInterval = setInterval(() => {
      // check if anyone should be disconnected
      for (const player of this.inGamePlayers) {
        // if it's not this players turn then we don't want to disconnect them
        if (this.gameState?.state.whoseTurn != player.playerId)
          this.lastActed[player.playerId] = Date.now();
        if (
          this.gamePhase == "active" &&
          this.lastActed[player.playerId] &&
          Date.now() - this.lastActed[player.playerId] > 300000
        ) {
          this.playerSpectate(player.playerId);
        }
      }
    }, 1000);
  }

  // Start as soon as two players are in
  // get random game if they exist, show to user
  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext): void {
    if (this.gamePhase === 'final') return
    if (this.inGamePlayers.length < 2) {
      this.gamePhase = "pending";
    }

    const isBot = !!ctx.request.headers.get("tg-bot-authorization")
    this.addPlayer(conn.id, isBot);
  }

  async onRequest(req: Party.Request) {
    // Clients fetch list of rooms for server rendering pages via HTTP GET
    if (req.method === "GET") return json(await this.getActiveRooms());

    // Chatrooms report their connections via HTTP POST
    // update room info and notify all connected clients
    if (req.method === "POST") {
      const roomList = await this.updateRoomInfo(req);
      this.party.broadcast(JSON.stringify(roomList));
      return json(roomList);
    }

    // admin api for clearing all rooms (not used in UI)
    if (req.method === "DELETE") {
      await this.party.storage.deleteAll();
      return json({ message: "All room history cleared" });
    }

    return notFound();
  }

  onClose(conn: Party.Connection) {
    this.removePlayer(conn.id);
  }

  onMessage(message: string, websocket: Party.Connection): void {
    try {
      let data: ClientMessage;

      this.lastActed[websocket.id] = Date.now();
      if (typeof message === "string") {
        // Check if the message is string to parse it
        data = JSON.parse(message);
      } else {
        throw new Error("Invalid message type");
      }

      // TODO: you shouldn't be able to start/reset game unless you are an admin
      if (data.type == "action" && Kuhn.isAction(data.action)) {
        this.handlePlayerAction(websocket.id, data.action);
      } else if (data.type == "join-game") {
        this.playerJoinGame(websocket.id);
      } else if (data.type == "start-game") {
        this.startRound();
      } else if (data.type == "spectate") {
        this.playerSpectate(websocket.id);
      } else if (data.type == "reset-game") {
        this.endRound("system");
      } else {
        console.error("Invalid message type", data);
      }
    } catch (error) {
      console.error(`Error parsing message from ${websocket.id}:`, error);
      if (typeof websocket.send === "function") {
        websocket.send(
          JSON.stringify({ error: "Error processing your action" })
        );
      } else {
        console.error("websocket.send is not a function", websocket);
      }
    }
  }

  handlePlayerAction(playerId: string, action: Kuhn.Action) {
    const player = this.inGamePlayers.find((p) => p.playerId === playerId);
    if (!player) {
      console.log(
        "Player attempted to make action while not in game",
        playerId
      );
      return;
    }
    if (!this.gameState) {
      console.log(
        "Player attempted to make action while game is not active",
        playerId
      );
      return;
    }

    if (
      this.gameState.state.whoseTurn !== playerId ||
      this.gameState.state.done
    ) {
      console.log("Player attempted to make action out of turn", playerId);
      return;
    }

    try {
      const { next, log } = Kuhn.step(this.gameState, action);
      for (const message of log) {
        this.queuedUpdates.push({
          type: "engine-log",
          message,
        });
      }
      this.gameState = next;
      this.queuedUpdates.push({
        type: "action",
        action,
        player,
      });
    } catch (err) {
      console.log(err);
    }
    if (this.gameState.state.done) {
      this.endRound(
        this.gameState?.state?.round === "showdown" ? "showdown" : "fold"
      );
    }
    this.broadcastGameState();
  }

  processQueuedPlayers() {
    for (const p of this.queuedPlayers) {
      this.queuedUpdates.push({
        type: "player-joined",
        player: {
          playerId: p.playerId,
        },
      });
      this.inGamePlayers.push(p);
    }
    this.queuedPlayers = [];
  }

  startRound() {
    if (this.gameState && !this.gameState.state.done) {
      return;
    }

    // if anyone has zero chips just reset them to 1000
    // for (const player of this.inGamePlayers.concat(this.queuedPlayers)) {
    //   this.lastActed[player.playerId] = Date.now();
    //   if (this.stacks[player.playerId] <= 0) {
    //     this.stacks[player.playerId] = defaultStack;
    //   }
    // }

    this.processQueuedPlayers();
    this.gameState = Kuhn.createPokerGame(
      this.gameConfig,
      this.inGamePlayers,
      this.inGamePlayers.map((p) => this.stacks[p.playerId])
    );
    this.gamePhase = "active";

    this.queuedUpdates.push({
      type: "game-started",
      players: this.inGamePlayers,
    });

    this.broadcastGameState();

    setTimeout(() => {
      this.broadcastGameState();
    }, 3000);
  }

  endRound(reason: "showdown" | "fold" | "system") {
    if (!this.gameState) {
      return;
    }
    this.processQueuedPlayers();

    const { payouts, log } = Kuhn.payout(
      this.gameState.state,
      this.gameState.hands
    );

    for (const message of log) {
      this.queuedUpdates.push({
        type: "engine-log",
        message,
      });
    }
    for (const playerId in payouts) {
      this.stacks[playerId] =
        (this.gameState.state.players.find((player) => player.id == playerId)
          ?.stack ?? 0) + payouts[playerId];
    }
    this.gamePhase = "pending";
    this.queuedUpdates.push({
      type: "game-ended",
      payouts,
      reason,
    });
    this.gameState = null;
    this.eliminatePlayers();
    this.broadcastGameState();
    this.gameConfig.dealerPosition = (this.gameConfig.dealerPosition + 1) % this.inGamePlayers.length;
    if (this.gameConfig.autoStart && this.inGamePlayers.length >= MIN_PLAYERS_AUTO_START) {
      this.startRound();
    }
  }

  // remove ingame players that have 0 chips
  eliminatePlayers() {
    this.inGamePlayers = this.inGamePlayers.filter(
      (player) => this.stacks[player.playerId] > 0
    );
  }

  getStateMessage(playerId: string): ServerStateMessage {
    const isSpectator =
      this.spectatorPlayers.map((s) => s.playerId).indexOf(playerId) !== -1;
    return {
      gameState: this.gameState?.state ?? null,
      hand: this.gameState?.hands?.[playerId] ?? null,
      inGamePlayers: this.inGamePlayers,
      spectatorPlayers: this.spectatorPlayers,
      queuedPlayers: this.queuedPlayers,
      config: this.gameConfig,
      gamePhase: this.gamePhase,
      clientId: playerId,
      lastUpdates: this.queuedUpdates,
    };
  }

  broadcastGameState() {
    for (const player of this.inGamePlayers
      .concat(this.spectatorPlayers)
      .concat(this.queuedPlayers)) {
      const message: ServerStateMessage = this.getStateMessage(player.playerId);

      // Send game state; ensure spectators do not receive any cards information
      const conn = this.party.getConnection(player.playerId);
      if (conn) {
        conn.send(JSON.stringify(message));
      }
    }
    this.queuedUpdates = [];

    const tableState: TableState = {
      queuedPlayers: this.queuedPlayers,
      spectatorPlayers: this.spectatorPlayers,
      inGamePlayers: this.inGamePlayers,
      config: this.gameConfig,
      gameState: this.gameState?.state ?? null,
      id: this.party.id,
      gameType: 'kuhn'
    }

    return this.party.context.parties.tables.get(SINGLETON_ROOM_ID).fetch({
      method: "POST",
      body: JSON.stringify({
        id: this.party.id,
        action: 'update',
        tableState
      }),
    });
  }

  playerSpectate(playerId: string) {
    this.removePlayer(playerId);
    this.spectatorPlayers.push({
      playerId,
    });
    this.queuedUpdates.push({
      type: "player-left",
      player: {
        playerId,
      },
    });
    this.broadcastGameState();
  }

  playerJoinGame(playerId: string) {
    const allPlayers = [...this.inGamePlayers, ...this.spectatorPlayers, ...this.queuedPlayers];
    const newPlayer = allPlayers.find((player) => player.playerId === playerId) || { playerId };
    if (
      this.queuedPlayers.find((player) => player.playerId === playerId) ||
      this.inGamePlayers.find((player) => player.playerId === playerId)
    )
      return;

    this.spectatorPlayers = this.spectatorPlayers.filter(
      (player) => player.playerId !== playerId
    );
    if (this.gamePhase === "pending") {
      this.inGamePlayers.push(newPlayer);
      this.queuedUpdates.push({
        type: "player-joined",
        player: newPlayer,
      });
    } else {
      this.queuedPlayers.push(newPlayer);
    }

    if (
      this.gameConfig.autoStart &&
      this.gamePhase === "pending" &&
      this.inGamePlayers.length >= MIN_PLAYERS_AUTO_START
    ) {
      this.startRound();
    } else {
      this.broadcastGameState();
    }
  }

  addPlayer(playerId: string, isBot = false) {
    if (this.playerExists(playerId)) return;
    this.stacks[playerId] = defaultStack;
    this.spectatorPlayers.push({
      playerId,
      isBot,
    });

    this.broadcastGameState();
  }

  playerExists(playerId: string) {
    return (
      this.inGamePlayers.find((player) => player.playerId === playerId) !==
      undefined ||
      this.spectatorPlayers.find((player) => player.playerId === playerId) !==
      undefined ||
      this.queuedPlayers.find((player) => player.playerId === playerId) !==
      undefined
    );
  }

  removePlayer(playerId: string) {
    // Attempt to remove from players list first
    // remove from all of spectatorPlayers, players, and inGamePlayers, and queuedPlayers
    if (this.gamePhase == "active" && this.gameState) {
      try {
        const { next, log } = Kuhn.forcedFold(this.gameState, playerId);
        this.gameState = next;
        for (const message of log) {
          this.queuedUpdates.push({
            type: "engine-log",
            message,
          });
        }
      } catch (e) {
        console.error("Error in forced fold", e);
      }
    }
    this.spectatorPlayers = this.spectatorPlayers.filter(
      (player) => player.playerId !== playerId
    );
    this.inGamePlayers = this.inGamePlayers.filter(
      (player) => player.playerId !== playerId
    );
    this.queuedPlayers = this.queuedPlayers.filter(
      (player) => player.playerId !== playerId
    );
    this.queuedUpdates.push({
      type: "player-left",
      player: {
        playerId,
      },
    });

    // it's important to remove the players before ending the game since if autostart is on
    // we don't want the removed player to get added
    if (this.gameState?.state.done) {
      this.endRound(
        this.gameState?.state?.round === "showdown" ? "showdown" : "fold"
      );
    } else if (this.inGamePlayers.length < 2) {
      this.endRound("fold");
    }

    this.broadcastGameState();
  }

  /** Remove this room from the room listing party */
  async removeRoomFromRoomList(id: string) {
    return this.party.context.parties.tables.get(SINGLETON_ROOM_ID).fetch({
      method: "POST",
      body: JSON.stringify({
        id,
        action: "delete",
      }),
    });
  }

  /**
   * A scheduled job that executes when the room storage alarm is triggered
   */
  async onAlarm() {
    // alarms don't have access to room id, so retrieve it from storage
    const id = await this.party.storage.get<string>("id");
    if (id) {
      // await this.removeRoomMessages();
      // await this.removeRoomFromRoomList(id);
    }
  }

  /** Fetches list of active rooms */
  async getActiveRooms(): Promise<TableState[]> {
    const rooms = await this.party.storage.list<TableState>();
    return [...rooms.values()];
  }

  /** Updates list of active rooms with information received from chatroom */
  async updateRoomInfo(req: Party.Request) {
    const update = (await req.json()) as
      | RoomUpdateRequest
      | RoomDeleteRequest;

    if (update.action === "delete") {
      await this.party.storage.delete(update.id);
      return this.getActiveRooms();
    }

    const info = update.tableState;
    if (info.queuedPlayers.length + info.spectatorPlayers.length + info.inGamePlayers.length == 0) {
      // if no users are present, delete the room
      await this.party.storage.delete(update.id);
      return this.getActiveRooms();
    }

    this.party.storage.put(update.id, info);

    await this.party.storage.put(update.id, info);
    return this.getActiveRooms();
  }
}
