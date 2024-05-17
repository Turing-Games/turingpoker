import type * as Party from 'partykit/server';
import * as Poker from '@app/party/src/game-logic/poker'
import { ClientMessage, ServerStateMessage, ServerUpdateMessage } from './shared';

export interface IPlayer {
  playerId: string;
}

export interface IPartyServerState {
  gamePhase: 'pending' | 'active'
}

export const AUTO_START = true;
export const MIN_PLAYERS_AUTO_START = 2;
export const MAX_PLAYERS = 8

const defaultStack = 1000;
export default class PartyServer implements Party.Server {
  public gameState: Poker.IPokerGame | null = null;
  public gameConfig: Poker.IPokerConfig = {
    dealerPosition: 0,
    bigBlind: 100,
    maxPlayers: MAX_PLAYERS,
    smallBlind: 50,
    autoStart: AUTO_START,
    minPlayers: MIN_PLAYERS_AUTO_START,
  };
  public inGamePlayers: IPlayer[] = [];
  public spectatorPlayers: IPlayer[] = [];
  public queuedPlayers: IPlayer[] = [];
  public stacks: Record<string, number> = {};
  public serverState: IPartyServerState = {
    gamePhase: 'pending'
  };
  public lastActed: Record<string, number> = {};

  public timeoutLoopInterval: NodeJS.Timeout | null = null;

  public queuedUpdates: ServerUpdateMessage[] = [];

  constructor(public readonly room: Party.Room, public readonly autoStart: boolean = true, public readonly party: Party.Party) {
    this.room = room;
    this.party = party
  }

  onStart(): void | Promise<void> {
    this.timeoutLoopInterval = setInterval(() => {
      // check if anyone should be disconnected
      for (const player of this.inGamePlayers) {
        if (this.serverState.gamePhase == 'active' && this.lastActed[player.playerId] && Date.now() - this.lastActed[player.playerId] > 300000) {
          this.playerSpectate(player.playerId);
        }
      }
    }, 1000);
  }

  // Start as soon as two players are in
  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext): void {
    this.updateRoomList("enter", conn);
    if (this.inGamePlayers.length < 2) {
      this.serverState.gamePhase = 'pending'
    }

    this.addPlayer(conn.id);
  }


  onClose(conn: Party.Connection) {
    this.removePlayer(conn.id);
    this.updateRoomList("leave", conn);
  }

  onMessage(message: string, websocket: Party.Connection): void {
    try {
      let data: ClientMessage;

      this.lastActed[websocket.id] = Date.now();
      if (typeof message === 'string') {  // Check if the message is string to parse it
        data = JSON.parse(message);
      }
      else {
        throw new Error("Invalid message type");
      }
      console.log("Action data: ", data, websocket.id);

      // TODO: you shouldn't be able to start/reset game unless you are an admin
      if (data.type == "action" && Poker.isAction(data.action)) {
        this.handlePlayerAction(websocket.id, data.action);
      }
      else if (data.type == 'join-game') {
        this.playerJoinGame(websocket.id);
      }
      else if (data.type == 'start-game') {
        this.startGame();
      }
      else if (data.type == 'spectate') {
        this.playerSpectate(websocket.id);
      }
      else if (data.type == 'reset-game') {
        this.endGame('system');
      }
      else {
        console.error("Invalid message type", data);
      }
    } catch (error) {
      console.error(`Error parsing message from ${websocket.id}:`, error);
      if (typeof websocket.send === 'function') {
        websocket.send(JSON.stringify({ error: "Error processing your action" }));
      } else {
        console.error('websocket.send is not a function', websocket);
      }
    }
  }

  handlePlayerAction(playerId: string, action: Poker.Action) {
    const player = this.inGamePlayers.find(p => p.playerId === playerId);
    if (!player) {
      console.log("Player attempted to make action while not in game", playerId);
      return;
    }
    if (!this.gameState) {
      console.log("Player attempted to make action while game is not active", playerId);
      return;
    }

    if (this.gameState.state.whoseTurn !== playerId) {
      console.log("Player attempted to make action out of turn", playerId);
      return;
    }

    this.gameState = Poker.step(this.gameState, action).next;
    this.queuedUpdates.push({
      type: 'action',
      action,
      player,
    });
    if (this.gameState.state.done) {
      this.endGame(this.gameState?.state?.round === 'showdown' ? 'showdown' : 'fold');
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


  startGame() {
    if (this.gameState && !this.gameState.state.done) {
      return;
    }
    // if anyone has zero chips just reset them to 1000
    for (const player of this.inGamePlayers.concat(this.queuedPlayers)) {
      this.lastActed[player.playerId] = Date.now();
      if (this.stacks[player.playerId] <= 0) {
        this.stacks[player.playerId] = defaultStack;
      }
    }
    this.processQueuedPlayers();
    this.gameState = Poker.createPokerGame(this.gameConfig, this.inGamePlayers.map(p => p.playerId), this.inGamePlayers.map(p => this.stacks[p.playerId]));
    this.serverState.gamePhase = 'active';

    this.queuedUpdates.push({
      type: 'game-started',
      players: this.inGamePlayers,
    });

    this.broadcastGameState();

    setTimeout(() => {
      this.broadcastGameState();
    }, 3000)
  }

  endGame(reason: 'showdown' | 'fold' | 'system') {
    if (!this.gameState) {
      return;
    }
    this.processQueuedPlayers();

    const payouts = Poker.payout(this.gameState.state, this.gameState.hands).payouts;
    for (const playerId in payouts) {
      this.stacks[playerId] = (this.gameState.state.players.find(player => player.id == playerId)?.stack ?? 0) + payouts[playerId];
    }
    this.serverState.gamePhase = 'pending';
    this.queuedUpdates.push({
      type: 'game-ended',
      payouts,
      reason
    });
    this.gameState = null;
    this.broadcastGameState();
    if (this.autoStart && this.inGamePlayers.length >= 2) {
      this.startGame();
    }
  }

  getStateMessage(playerId: string): ServerStateMessage {
    const isSpectator = this.spectatorPlayers.map(s => s.playerId).indexOf(playerId) !== -1
    return {
      gameState: this.gameState?.state ?? null,
      hand: this.gameState?.hands?.[playerId] ?? null,
      inGamePlayers: this.inGamePlayers,
      spectatorPlayers: this.spectatorPlayers,
      queuedPlayers: this.queuedPlayers,
      config: this.gameConfig,
      state: this.serverState,
      clientId: playerId,
      lastUpdates: this.queuedUpdates,
    }
  }

  broadcastGameState() {
    for (const player of this.inGamePlayers.concat(this.spectatorPlayers).concat(this.queuedPlayers)) {
      const message: ServerStateMessage = this.getStateMessage(player.playerId);

      // Send game state; ensure spectators do not receive any cards information
      const conn = this.room.getConnection(player.playerId);
      if (conn) {
        conn.send(JSON.stringify(message));
      }
    }
    this.queuedUpdates = [];
  }

  playerSpectate(playerId: string) {
    this.removePlayer(playerId);
    this.spectatorPlayers.push({
      playerId
    });
    this.queuedUpdates.push({
      type: 'player-left',
      player: {
        playerId
      }
    });
    this.broadcastGameState();
  }

  playerJoinGame(playerId: string) {
    if (this.queuedPlayers.find(player => player.playerId === playerId)
      || this.inGamePlayers.find(player => player.playerId === playerId)) return;

    this.spectatorPlayers = this.spectatorPlayers.filter(player => player.playerId !== playerId);
    if (this.serverState.gamePhase === 'pending') {
      this.inGamePlayers.push({
        playerId,
      });
      this.queuedUpdates.push({
        type: 'player-joined',
        player: {
          playerId,
        }
      });
    } else {
      this.queuedPlayers.push({
        playerId,
      });
    }

    if (this.autoStart && this.serverState.gamePhase === 'pending' && this.inGamePlayers.length >= MIN_PLAYERS_AUTO_START) {
      this.startGame();
    } else {
      this.broadcastGameState();
    }
  }

  addPlayer(playerId: string) {
    if (this.playerExists(playerId)) return;
    this.stacks[playerId] = defaultStack;
    this.spectatorPlayers.push({
      playerId
    });

    this.broadcastGameState();
  }

  playerExists(playerId: string) {
    return this.inGamePlayers.find(player => player.playerId === playerId) !== undefined
      || this.spectatorPlayers.find(player => player.playerId === playerId) !== undefined
      || this.queuedPlayers.find(player => player.playerId === playerId) !== undefined;
  }

  removePlayer(playerId: string) {
    // Attempt to remove from players list first
    // remove from all of spectatorPlayers, players, and inGamePlayers, and queuedPlayers
    if (this.gameState) {
      this.gameState = Poker.forcedFold(this.gameState, playerId);
    }
    this.spectatorPlayers = this.spectatorPlayers.filter(player => player.playerId !== playerId);
    this.inGamePlayers = this.inGamePlayers.filter(player => player.playerId !== playerId);
    this.queuedPlayers = this.queuedPlayers.filter(player => player.playerId !== playerId);
    this.queuedUpdates.push({
      type: 'player-left',
      player: {
        playerId
      }
    });

    if (this.inGamePlayers.length < 2) {
      this.endGame('fold');
    }

    this.broadcastGameState();
  }

  /** Remove this room from the room listing party */
  async removeRoomFromRoomList(id: string) {
    return this.party.context.parties.chatrooms.get(SINGLETON_ROOM_ID).fetch({
      method: "POST",
      body: JSON.stringify({
        id,
        action: "delete",
      }),
    });
  }

  /** Request the AI bot party to connect to this room, if not already connected */
  async ensureAIParticipant() {
    if (!this.botId) {
      this.botId = nanoid();
      this.party.context.parties.ai.get(this.party.id).fetch({
        method: "POST",
        body: JSON.stringify({
          action: "connect",
          roomId: this.party.id,
          botId: this.botId,
        }),
      });
    }
  }

  /** Send room presence to the room listing party */
  async updateRoomList(action: "enter" | "leave", connection: ChatConnection) {
    return this.party.context.parties.chatrooms.get(SINGLETON_ROOM_ID).fetch({
      method: "POST",
      body: JSON.stringify({
        id: this.party.id,
        connections: [...this.party.getConnections()].length,
        user: connection.state?.user,
        action,
      }),
    });
  }

  async authenticateUser(proxiedRequest: Party.Request) {
    // find the connection
    const id = new URL(proxiedRequest.url).searchParams.get("_pk");
    const connection = id && this.party.getConnection(id);
    if (!connection) {
      return error(`No connection with id ${id}`);
    }

    // authenticate the user
    const session = await getNextAuthSession(proxiedRequest);
    if (!session) {
      return error(`No session found`);
    }

    this.updateRoomList("enter", connection);

    connection.setState({ user: session });
    connection.send(
      newMessage({
        from: { id: "system" },
        text: `Welcome ${session.username}!`,
      })
    );

    if (!this.party.env.OPENAI_API_KEY) {
      connection.send(
        systemMessage("OpenAI API key not configured. AI bot is not available")
      );
    }
  }

  /**
   * Responds to HTTP requests to /parties/chatroom/:roomId endpoint
   */
  async onRequest(request: Party.Request) {
    const messages = await this.ensureLoadMessages();

    // mark room as created by storing its id in object storage
    if (request.method === "POST") {
      // respond to authentication requests proxied through the app's
      // rewrite rules. See next.config.js in project root.
      if (new URL(request.url).pathname.endsWith("/auth")) {
        await this.authenticateUser(request);
        return ok();
      }

      await this.party.storage.put("id", this.party.id);
      return ok();
    }

    // return list of messages for server rendering pages
    if (request.method === "GET") {
      if (await this.party.storage.get("id")) {
        return json<SyncMessage>({ type: "sync", messages });
      }
      return notFound();
    }

    // clear room history
    if (request.method === "DELETE") {
      await this.removeRoomMessages();
      this.party.broadcast(JSON.stringify(<ClearRoomMessage>{ type: "clear" }));
      this.party.broadcast(
        newMessage({
          from: { id: "system" },
          text: `Room history cleared`,
        })
      );
      return ok();
    }

    // respond to cors preflight requests
    if (request.method === "OPTIONS") {
      return ok();
    }

    return notFound();
  }

  /**
   * A scheduled job that executes when the room storage alarm is triggered
   */
  async onAlarm() {
    // alarms don't have access to room id, so retrieve it from storage
    const id = await this.party.storage.get<string>("id");
    if (id) {
      await this.removeRoomMessages();
      await this.removeRoomFromRoomList(id);
    }
  }
}
