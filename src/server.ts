import type * as Party from 'partykit/server';
import * as Poker from '@tg/game-logic/poker'
import { ClientMessage, ServerStateMessage, ServerUpdateMessage } from './shared';

const Hand = require('pokersolver').Hand;

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
