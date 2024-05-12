// import type * as Party from "partykit/server";
// import { nanoid } from "nanoid";
// import { User, getNextAuthSession, isSessionValid } from "./utils/auth";
// import { SINGLETON_ROOM_ID } from "./tables";
// import type {
//   Message,
//   SyncMessage,
//   UserMessage,
//   ClearRoomMessage,
// } from "./utils/message";
// import {
//   editMessage,
//   newMessage,
//   syncMessage,
//   systemMessage,
// } from "./utils/message";
// import { error, json, notFound, ok } from "./utils/response";
// import { AI_USER } from "./ai";

// const DELETE_MESSAGES_AFTER_INACTIVITY_PERIOD = 1000 * 60 * 60 * 24; // 24 hours

// // track additional information on room and connection objects

// type ChatConnectionState = { user?: User | null };

// type ChatConnection = Party.Connection<ChatConnectionState>;

// /**
//  * This party manages the state and behaviour of an individual chat room
//  */
// export default class ChatRoomServer implements Party.Server {
//   messages?: Message[];
//   botId?: string;
//   constructor(public party: Party.Party) { }

//   /** Retrieve messages from room storage and store them on room instance */
//   async ensureLoadMessages() {
//     if (!this.messages) {
//       this.messages =
//         (await this.party.storage.get<Message[]>("messages")) ?? [];
//     }
//     return this.messages;
//   }

//   /** Clear room storage */
//   async removeRoomMessages() {
//     await this.party.storage.delete("messages");
//     this.messages = [];
//   }

//   /** Remove this room from the room listing party */
//   async removeRoomFromRoomList(id: string) {
//     return this.party.context.parties.chatrooms.get(SINGLETON_ROOM_ID).fetch({
//       method: "POST",
//       body: JSON.stringify({
//         id,
//         action: "delete",
//       }),
//     });
//   }

//   /** Request the AI bot party to connect to this room, if not already connected */
//   async ensureAIParticipant() {
//     if (!this.botId) {
//       this.botId = nanoid();
//       this.party.context.parties.ai.get(this.party.id).fetch({
//         method: "POST",
//         body: JSON.stringify({
//           action: "connect",
//           roomId: this.party.id,
//           botId: this.botId,
//         }),
//       });
//     }
//   }

//   /** Send room presence to the room listing party */
//   async updateRoomList(action: "enter" | "leave", connection: ChatConnection) {
//     return this.party.context.parties.chatrooms.get(SINGLETON_ROOM_ID).fetch({
//       method: "POST",
//       body: JSON.stringify({
//         id: this.party.id,
//         connections: [...this.party.getConnections()].length,
//         user: connection.state?.user,
//         action,
//       }),
//     });
//   }

//   async authenticateUser(proxiedRequest: Party.Request) {
//     // find the connection
//     const id = new URL(proxiedRequest.url).searchParams.get("_pk");
//     const connection = id && this.party.getConnection(id);
//     if (!connection) {
//       return error(`No connection with id ${id}`);
//     }

//     // authenticate the user
//     const session = await getNextAuthSession(proxiedRequest);
//     if (!session) {
//       return error(`No session found`);
//     }

//     this.updateRoomList("enter", connection);

//     connection.setState({ user: session });
//     connection.send(
//       newMessage({
//         from: { id: "system" },
//         text: `Welcome ${session.username}!`,
//       })
//     );

//     if (!this.party.env.OPENAI_API_KEY) {
//       connection.send(
//         systemMessage("OpenAI API key not configured. AI bot is not available")
//       );
//     }
//   }

//   /**
//    * Responds to HTTP requests to /parties/chatroom/:roomId endpoint
//    */
//   async onRequest(request: Party.Request) {
//     const messages = await this.ensureLoadMessages();

//     // mark room as created by storing its id in object storage
//     if (request.method === "POST") {
//       // respond to authentication requests proxied through the app's
//       // rewrite rules. See next.config.js in project root.
//       if (new URL(request.url).pathname.endsWith("/auth")) {
//         await this.authenticateUser(request);
//         return ok();
//       }

//       await this.party.storage.put("id", this.party.id);
//       return ok();
//     }

//     // return list of messages for server rendering pages
//     if (request.method === "GET") {
//       if (await this.party.storage.get("id")) {
//         return json<SyncMessage>({ type: "sync", messages });
//       }
//       return notFound();
//     }

//     // clear room history
//     if (request.method === "DELETE") {
//       await this.removeRoomMessages();
//       this.party.broadcast(JSON.stringify(<ClearRoomMessage>{ type: "clear" }));
//       this.party.broadcast(
//         newMessage({
//           from: { id: "system" },
//           text: `Room history cleared`,
//         })
//       );
//       return ok();
//     }

//     // respond to cors preflight requests
//     if (request.method === "OPTIONS") {
//       return ok();
//     }

//     return notFound();
//   }

//   /**
//    * Executes when a new WebSocket connection is made to the room
//    */
//   async onConnect(connection: ChatConnection) {
//     await this.ensureLoadMessages();
//     await this.ensureAIParticipant();

//     // if user is the bot we invited, mark them as an AI user
//     if (connection.id === this.botId) {
//       connection.setState({ user: AI_USER });
//     }

//     // send the whole list of messages to user when they connect
//     connection.send(syncMessage(this.messages ?? []));

//     // keep track of connections
//     this.updateRoomList("enter", connection);
//   }

//   async onMessage(
//     messageString: string,
//     connection: Party.Connection<{ user: User | null }>
//   ) {
//     const message = JSON.parse(messageString) as UserMessage;
//     // handle user messages
//     if (message.type === "new" || message.type === "edit") {
//       const user = connection.state?.user;
//       if (!isSessionValid(user)) {
//         return connection.send(
//           systemMessage("You must sign in to send messages to this room")
//         );
//       }

//       if (message.text.length > 1000) {
//         return connection.send(systemMessage("Message too long"));
//       }

//       const payload = <Message>{
//         id: message.id ?? nanoid(),
//         from: { id: user.username, image: user.image },
//         text: message.text,
//         at: Date.now(),
//       };

//       // send new message to all connections
//       if (message.type === "new") {
//         this.party.broadcast(newMessage(payload));
//         this.messages!.push(payload);
//       }

//       // send edited message to all connections
//       if (message.type === "edit") {
//         this.party.broadcast(editMessage(payload), []);
//         this.messages = this.messages!.map((m) =>
//           m.id == message.id ? payload : m
//         );
//       }
//       // persist the messages to storage
//       await this.party.storage.put("messages", this.messages);

//       // automatically clear the room storage after period of inactivity
//       await this.party.storage.deleteAlarm();
//       await this.party.storage.setAlarm(
//         new Date().getTime() + DELETE_MESSAGES_AFTER_INACTIVITY_PERIOD
//       );
//     }
//   }

//   async onClose(connection: Party.Connection) {
//     this.updateRoomList("leave", connection);
//   }

//   /**
//    * A scheduled job that executes when the room storage alarm is triggered
//    */
//   async onAlarm() {
//     // alarms don't have access to room id, so retrieve it from storage
//     const id = await this.party.storage.get<string>("id");
//     if (id) {
//       await this.removeRoomMessages();
//       await this.removeRoomFromRoomList(id);
//     }
//   }
// }

// ChatRoomServer satisfies Party.Worker;

import type * as Party from 'partykit/server';
import * as Poker from '@tg/game-logic/poker'
import { ClientMessage, ServerStateMessage, ServerUpdateMessage } from './shared';

export interface IPlayer {
  playerId: string;
}

export interface IPartyServerState {
  gamePhase: 'pending' | 'active'
}

export const AUTO_START = true;
export const MIN_PLAYERS_AUTO_START = 3;
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
    minPlayers: MIN_PLAYERS_AUTO_START
  };
  public inGamePlayers: IPlayer[] = [];
  public players: IPlayer[] = [];
  public spectatorPlayers: IPlayer[] = [];
  public queuedPlayers: IPlayer[] = [];
  public winners: string[] = []
  public stacks: Record<string, number> = {};
  public serverState: IPartyServerState = {
    gamePhase: 'pending'
  };
  public queuedUpdates: ServerUpdateMessage[] = [];
  constructor(public readonly room: Party.Room, public readonly autoStart: boolean = true) {
    this.room = room;
  }

  // Start as soon as two players are in
  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext): void {
    if (this.inGamePlayers.length < 2) {
      this.serverState.gamePhase = 'pending'
    }

    this.addPlayer(conn.id);
  }


  onClose(conn: Party.Connection) {
    this.removePlayer(conn.id);
  }

  onMessage(message: string, websocket: Party.Connection): void {
    try {
      let data: ClientMessage;

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
      else if (data.type == 'leave-game') {
        this.queuedPlayers = this.queuedPlayers.filter(player => player.playerId !== websocket.id);
        this.inGamePlayers = this.inGamePlayers.filter(player => player.playerId !== websocket.id);
        this.spectatorPlayers = this.spectatorPlayers.filter(player => player.playerId !== websocket.id);
        this.players = this.players.filter(player => player.playerId !== websocket.id);
        this.broadcastGameState();
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

  startGame() {
    if (this.gameState && !this.gameState.state.done) {
      return;
    }
    for (const p of this.queuedPlayers) {
      this.queuedUpdates.push({
        type: 'player-joined',
        player: {
          playerId: p.playerId,
        }
      });
      this.inGamePlayers.push(p);
    }
    this.queuedPlayers = [];
    this.gameState = Poker.createPokerGame(this.gameConfig, this.inGamePlayers.map(p => p.playerId), this.inGamePlayers.map(p => this.stacks[p.playerId]));
    this.serverState.gamePhase = 'active';

    this.queuedUpdates.push({
      type: 'game-started',
      players: this.inGamePlayers,
    });

    this.broadcastGameState();

    setTimeout(() => {
      this.winners = []
      this.broadcastGameState();
    }, 3000)
  }

  endGame(reason: 'showdown' | 'fold' | 'system') {
    if (!this.gameState) {
      return;
    }
    const payouts = Poker.payout(this.gameState.state, this.gameState.hands).payouts;
    this.winners = Object.keys(payouts).filter(id => payouts[id] > 0).map(id => id)
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
    console.log({ isSpectator })
    return {
      gameState: this.gameState?.state ?? null,
      hand: this.gameState?.hands?.[playerId] ?? null,
      inGamePlayers: this.inGamePlayers,
      spectatorPlayers: this.spectatorPlayers,
      queuedPlayers: this.queuedPlayers,
      players: this.players,
      config: this.gameConfig,
      state: this.serverState,
      clientId: playerId,
      lastUpdates: this.queuedUpdates,
      winners: this.winners,
      hands: isSpectator ? this?.gameState?.hands : []
    }
  }

  broadcastGameState() {
    for (const player of this.players) {
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
    this.spectatorPlayers.push({
      playerId
    });
    this.queuedPlayers = this.queuedPlayers.filter(player => player.playerId !== playerId);
    this.inGamePlayers = this.inGamePlayers.filter(player => player.playerId !== playerId);
    this.queuedUpdates.push({
      type: 'player-left',
      player: {
        playerId
      }
    });
    this.broadcastGameState();
  }

  playerJoinGame(playerId: string) {
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
    this.spectatorPlayers = this.spectatorPlayers.filter(player => player.playerId !== playerId);

    if (this.autoStart && this.serverState.gamePhase === 'pending' && this.inGamePlayers.length >= MIN_PLAYERS_AUTO_START) {
      this.startGame();
    } else {
      this.broadcastGameState();
    }
  }

  addPlayer(playerId: string) {
    this.stacks[playerId] = defaultStack;
    this.players.push({
      playerId
    });

    this.spectatorPlayers = this.spectatorPlayers.filter(player => player.playerId !== playerId);
    this.broadcastGameState();
  }

  removePlayer(playerId: string) {
    // Attempt to remove from players list first
    const playerIndex = this.players.findIndex(player => player.playerId === playerId);
    if (playerIndex !== -1) {
      // remove from all of spectatorPlayers, players, and inGamePlayers, and queuedPlayers
      if (this.gameState) {
        this.gameState = Poker.forcedFold(this.gameState, playerId);
      }
      this.spectatorPlayers = this.spectatorPlayers.filter(player => player.playerId !== playerId);
      this.players = this.players.filter(player => player.playerId !== playerId);
      this.inGamePlayers = this.inGamePlayers.filter(player => player.playerId !== playerId);
      this.queuedPlayers = this.queuedPlayers.filter(player => player.playerId !== playerId);
      this.queuedUpdates.push({
        type: 'player-left',
        player: {
          playerId
        }
      });
    }

    if (this.players.length < 2) {
      this.endGame('fold');
    }

    this.broadcastGameState();
  }
}
