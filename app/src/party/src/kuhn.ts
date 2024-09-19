import { SINGLETON_GAME_ID } from '@app/constants/partykit';
import * as Kuhn from '@app/party/src/game-logic/kuhn';
import type * as Party from 'partykit/server';
import { json, notFound } from '../../utils/response';
import { isAction } from './game-logic/shared';
import { Action, ClientMessage, ServerStateMessage, ServerUpdateMessage, TableState } from './shared';
import TablesServer from './tables';

export const AUTO_START = true;
export const MIN_PLAYERS_AUTO_START = 2;
export const MAX_PLAYERS = 2
export const MAX_GAME_ROUNDS = 100
export const DEMO_MODE = false

const defaultStack = 3;
export default class PartyServer extends TablesServer {
  public gameState: Kuhn.IPokerGame | null = null;
  public gameConfig: Kuhn.IPokerConfig = {
    dealerPosition: 0,
    maxPlayers: MAX_PLAYERS,
    autoStart: AUTO_START,
    minPlayers: MIN_PLAYERS_AUTO_START,
    maxGameRounds: MAX_GAME_ROUNDS,
    demoMode: DEMO_MODE
  };

  public stacks: Record<string, number> = {};
  public timeoutLoopInterval: NodeJS.Timeout | null = null;
  public queuedUpdates: ServerUpdateMessage[] = [];

  constructor(public readonly room: Party.Room) {
    super(room);
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
    console.log('this, onConnect')
    // console.log(this)
    if (this.gamePhase === 'final') {
      this.broadcastGameState();
      return
    }
    if (this.inGamePlayers.length < 2) {
      this.gamePhase = "pending";
    }

    const isBot = !!ctx.request.headers.get("tg-bot-authorization")
    this.addPlayer(conn.id, isBot);
    this.broadcastGameState();
  }

  async onRequest(req: Party.Request) {
    // Clients fetch list of rooms for server rendering pages via HTTP GET
    if (req.method === "GET") return json(await this.updateRoom(req));

    // Chatrooms report their connections via HTTP POST
    // update room info and notify all connected clients
    if (req.method === "POST") {
      const roomList = await this.updateRoom(req);
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
      if (data.type == "action" && isAction(data.action)) {
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

  handlePlayerAction(playerId: string, action: Action) {
    const player = this.inGamePlayers.find((p) => p.playerId === playerId);
    // this is firing before endgame which means that
    // endgame does not get a change to run
    // before handling action we need to check if game is over

    // validate action
    if (!player) { // this should not be a possibility via UI
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
      this.gameState.state.roundOver
    ) {
      console.log("Player attempted to make action out of turn", playerId);
      return;
    }
    // record action and advance game via step()
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
    if (this.gameState.state.roundOver) {
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
    if (this.gameState && !this.gameState.state.roundOver) {
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
    this.gameState = Kuhn.createGame(
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

  // endRound
  /* ends the current hand and handles:
  ** payouts, eliminations, and 
  ** ends the game if applicable
  */
  endRound(reason: "showdown" | "fold" | "system") {
    if (!this.gameState) {
      if (this.gamePhase === "final") {
        this.broadcastGameState();
      }
      return
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

    this.gameState = null;
    this.eliminatePlayers();
    // check if remaining players, for game winner
    if (this.inGamePlayers.length == 1) {
      this.queuedUpdates.push({
        type: "game-ended",
        payouts,
        reason,
      });

      if (!this.gameConfig.demoMode) {
        this.endGame();
        console.log("Winner")
      }
      this.broadcastGameState();
    } else if (this.gameConfig.autoStart && this.inGamePlayers.length >= MIN_PLAYERS_AUTO_START) {
      this.broadcastGameState();
      this.gameConfig.dealerPosition = (this.gameConfig.dealerPosition + 1) % this.inGamePlayers.length;
      this.startRound();
    } else {
      this.broadcastGameState();
    }
  }

  getStateMessage(playerId: string): ServerStateMessage {
    console.log('getStateMessage')
    const isSpectator =
      this.spectatorPlayers.map((s) => s.playerId).indexOf(playerId) !== -1;
    return {
      gameState: this.gameState?.state ?? null,
      hand: this.gameState?.hands?.[playerId] ?? null,
      inGamePlayers: this.inGamePlayers,
      winner: this.winner,
      spectatorPlayers: this.spectatorPlayers,
      queuedPlayers: this.queuedPlayers,
      config: this.gameConfig,
      gamePhase: this.gamePhase,
      clientId: playerId,
      lastUpdates: this.queuedUpdates,
    };
  }

  broadcastGameState() {
    console.log('kuhn broadcast')
    const allGamePlayers = this.inGamePlayers.concat(this.queuedPlayers, this.spectatorPlayers);
    console.log({ allGamePlayers })
    for (const player of allGamePlayers) {
      const message: ServerStateMessage = this.getStateMessage(player.playerId);

      // Send game state; ensure spectators do not receive any cards information
      const conn = this.room.getConnection(player.playerId);
      if (conn) {
        conn.send(JSON.stringify(message));
      }
    }
    this.queuedUpdates = [];
    console.log('this.inGamePlayers')
    console.log(this.inGamePlayers)

    const state: TableState = {
      queuedPlayers: this.queuedPlayers,
      spectatorPlayers: this.spectatorPlayers,
      inGamePlayers: this.inGamePlayers,
      config: this.gameConfig,
      gameState: this.gameState?.state ?? null,
      id: this.room.id,
      gameType: 'kuhn',
      winner: this.winner,
      gamePhase: this.gamePhase,
      version: 1
    }

    return this.room.context.parties.tables.get(SINGLETON_GAME_ID).fetch({
      method: "POST",
      body: JSON.stringify({
        id: this.room.id,
        action: 'update',
        state
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
    console.log('playerJoinGame')
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
    if (this.gameState?.state.roundOver) {
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
    return this.room.context.parties.tables.get(SINGLETON_GAME_ID).fetch({
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
    const id = await this.room.storage.get<string>("id");
    if (id) {
      // await this.removeRoomMessages();
      // await this.removeRoomFromRoomList(id);
    }
  }
}
