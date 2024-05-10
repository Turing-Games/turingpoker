import type * as Party from 'partykit/server';
import * as Poker from '@tg/game-logic/poker'
import { ClientMessage, ServerStateMessage } from './shared';

const Hand = require('pokersolver').Hand;

export interface IPlayer {
  playerId: string;
}

export interface IPartyServerState {
  gamePhase: 'pending' | 'active'
}

const AUTO_START = true;

const defaultStack = 1000;
export default class PartyServer implements Party.Server {
  public gameState: Poker.IPokerGame | null = null;
  public gameConfig: Poker.IPokerConfig = {
    dealerPosition: 0,
    maxPlayers: 8,
    bigBlind: 100,
    smallBlind: 50,
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
  constructor(public readonly room: Party.Room) {
    this.room = room;
  }

  // Start as soon as two players are in
  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log("client connected")
    }
    this.stacks[conn.id] = defaultStack;
    this.players.push({
      playerId: conn.id,
    });
    if (this.serverState.gamePhase === "active" || this.players.length >= this.gameConfig.maxPlayers) {
      // Add as a spectator if the game is active or player slots are full
      this.spectatorPlayers.push({
        playerId: conn.id,
      });
    }
    this.broadcastGameState();
  }


  onClose(conn: Party.Connection) {
    // Attempt to remove from players list first 
    const playerIndex = this.players.findIndex(player => player.playerId === conn.id);
    if (playerIndex !== -1) {
      // remove from all of spectatorPlayers, players, and inGamePlayers, and queuedPlayers
      this.gameState?.state?.players?.map?.((player) => {
        return {
          ...player,
          folded: player.id === conn.id
        }
      })
      this.spectatorPlayers = this.spectatorPlayers.filter(player => player.playerId !== conn.id);
      this.players = this.players.filter(player => player.playerId !== conn.id);
      this.inGamePlayers = this.inGamePlayers.filter(player => player.playerId !== conn.id);
      this.queuedPlayers = this.queuedPlayers.filter(player => player.playerId !== conn.id);

      // Remove from stacks
      delete this.stacks[conn.id];
    }

    this.broadcastGameState();
  }

  onMessage(message: string, websocket: Party.Connection): void {
    try {
      let data: ClientMessage;

      if (typeof message === 'string') {  // Check if the message is string to parse it
        data = JSON.parse(message);
        console.log("Parsed string: ", data);
      }
      else {
        throw new Error("Invalid message type");
      }
      console.log("Action data: ", data);

      // TODO: you shouldn't be able to start/reset game unless you are an admin
      if (data.type == "action" && Poker.isAction(data.action)) {
        console.log("Handling action");
        this.handlePlayerAction(websocket.id, data.action);
      }
      else if (data.type == 'join-game') {
        if (this.serverState.gamePhase === 'pending') {
          this.inGamePlayers.push({
            playerId: websocket.id,
          });
        }
        else {
          this.queuedPlayers.push({
            playerId: websocket.id,
          });
        }
        this.spectatorPlayers = this.spectatorPlayers.filter(player => player.playerId !== websocket.id);
        if (AUTO_START && this.serverState.gamePhase === 'pending' && this.inGamePlayers.length >= 2) {
          this.startGame();
        }
      }
      else if (data.type == 'start-game') {
        this.startGame();
      }
      else if (data.type == 'leave-game') {
        this.queuedPlayers = this.queuedPlayers.filter(player => player.playerId !== websocket.id);
        this.inGamePlayers = this.inGamePlayers.filter(player => player.playerId !== websocket.id);
        this.players = this.players.filter(player => player.playerId !== websocket.id);
      }
      else if (data.type == 'spectate') {
        this.spectatorPlayers.push({
          playerId: websocket.id,
        });
        this.queuedPlayers = this.queuedPlayers.filter(player => player.playerId !== websocket.id);
        this.inGamePlayers = this.inGamePlayers.filter(player => player.playerId !== websocket.id);
      }
      else if (data.type == 'reset-game') {
        this.serverState.gamePhase = 'pending';
        this.endGame();
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

    const { who, log } = Poker.whoseTurn(this.gameState.state);
    if (who !== playerId) {
      console.log("Player attempted to make action out of turn", playerId);
      return;
    }

    this.gameState = Poker.step(this.gameState, action).next;
    if (this.gameState.state.done) {
      this.endGame();
    }
    this.broadcastGameState();
  }

  startGame() {
    this.inGamePlayers = this.inGamePlayers.concat(this.queuedPlayers);
    this.queuedPlayers = [];
    this.winners = []
    this.gameState = Poker.createPokerGame(this.gameConfig, this.inGamePlayers.map(p => p.playerId), this.inGamePlayers.map(p => this.stacks[p.playerId]));
    this.serverState.gamePhase = 'active';

    this.room.broadcast("The game has started!");
    this.broadcastGameState();
  }

  endGame() {
    if (!this.gameState) {
      return;
    }
    const payouts = Poker.payout(this.gameState.state, this.gameState.hands).payouts;
    this.winners = Object.keys(payouts)
    for (const playerId in payouts) {
      this.stacks[playerId] = (this.gameState.state.players.find(player => player.id == playerId)?.stack ?? 0) + payouts[playerId];
    }
  }

  broadcastGameState() {
    for (const player of this.players) {
      const message: ServerStateMessage = {
        gameState: this.gameState?.state ?? null,
        hand: this.gameState?.hands?.[player.playerId] ?? null,
        inGamePlayers: this.inGamePlayers,
        spectatorPlayers: this.spectatorPlayers,
        queuedPlayers: this.queuedPlayers,
        players: this.players,
        winners: this.winners,
        state: this.serverState
      };

      // Send game state; ensure spectators do not receive any cards information
      const conn = this.room.getConnection(player.playerId);
      if (conn) {
        conn.send(JSON.stringify(message));
      }
    }
  }
}
