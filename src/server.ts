import type * as Party from 'partykit/server';
import * as Poker from '@tg/game-logic/poker'
import { getPlayersWithRemainingCall, isBettingRoundComplete } from './utils/poker_utilties';

const Hand = require('pokersolver').Hand;

export interface IPlayer {
  playerId: string;
  status: 'spectating' | 'waiting' | 'ready';
}

export interface IPartyServerState {
  gamePhase: 'pending' | 'active'
}

export default class PartyServer implements Party.Server {
  public gameState: Poker.IPokerGame | null = null;
  public gameConfig: Poker.IPokerConfig = {
    dealerPosition: 0,
    maxPlayers: 8,
    bigBlind: 100,
    smallBlind: 50,
  };
  public players: IPlayer[] = [];
  public serverState: IPartyServerState = {
    gamePhase: 'pending'
  };
  constructor(public readonly room: Party.Room) {
    this.room = room;
    // this.startBroadcastingGameState();
  }

  onConnect(conn, ctx) {
    if (process.env.NODE_ENV !== 'production') {
      console.log("client connected")
    }
    if (this.serverState.gamePhase === "active" || this.players.length >= this.gameConfig.maxPlayers) {
      // Add as a spectator if the game is active or player slots are full
      this.players.push({
        playerId: conn.id,
        status: "spectating"
      });
      conn.send("You are now spectating the game.");
    } else {
      // Add as a player if slots are available and game is not active
      this.players.push({
        playerId: conn.id,
        status: 'waiting'
      });
      conn.send("Welcome to the game!");
    }
    this.broadcastGameState(conn.id);
  }


  onClose(conn) {
    // Attempt to remove from players list first
    const playerIndex = this.gameState.players.findIndex(player => player.playerId === conn.id);
    if (playerIndex !== -1) {
      this.gameState.players.splice(playerIndex, 1);
      if (this.gameState.players.length < 2) {
        this.gameState.gamePhase = "pending";  // If not enough players, pause the game
      }
      if (this.gameState.currentPlayer === playerIndex) {
        this.gameState.currentPlayer = 0;  // Reset to the first player
      }
    } else {
      // If not a player, remove from spectators list
      const spectatorIndex = this.gameState.spectators.findIndex(spectator => spectator.playerId === conn.id);
      if (spectatorIndex !== -1) {
        this.gameState.spectators.splice(spectatorIndex, 1);
      }
    }

    this.room.broadcast("A participant has disconnected. Updating game state...");
    this.broadcastGameState();
  }

  onMessage(message, websocket) {
    try {
      let data = message;

      if (typeof message === 'string') {  // Check if the message is string to parse it
        data = JSON.parse(message);
        console.log("Parsed string: ", data);
      }
      console.log("Action data: ", data.action);

      if (data.action && typeof this.handlePlayerAction === 'function') {
        console.log("Handling action");
        this.handlePlayerAction(websocket.id, data.action, data.amount);
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

  findWinner() {
    const activePlayers = this.getActivePlayers()
    let playerHands = activePlayers.map((p) => {
      const playerCards = p.cards.map(c => c.value)
      const communityCards = this.gameState.communityCards.map(c => c.value)
      return Hand.solve([...playerCards, ...communityCards])
    })

    const winners = Hand.winners(playerHands);
    const winningHand = winners[0].descr
    playerHands = playerHands.map(hand => hand.descr)

    const playerIndex = playerHands.indexOf(winningHand)
    const winnerId = activePlayers[playerIndex]?.playerId

    this.gameState.winner = {
      id: winnerId,
      name: winningHand
    }

    this.allocateWinnings()
    this.broadcastGameState(); // Update all clients with the new state
  }

  allocateWinnings() {
    // allocate winnings
    this.gameState.players = this.gameState.players
      .map((p) => {
        return {
          ...p,
          stackSize: p.playerId === winnerId ? p.stackSize + this.gameState.potTotal : p.stackSize,
        }
      })
      .filter(p => p.stackSize > 0)
  }

  checkRoundCompleted() {
    // check for more than active one player to see if all others have folded
    let activePlayers = this.getActivePlayers()
    if (activePlayers.length > 1) {
      const isRoundComplete = isBettingRoundComplete(this.gameState.bettingRound.round, this.gameState.players)
      const playersWithRemaingCall = getPlayersWithRemainingCall(this.gameState.bettingRound.currentBet, this.gameState.players)
      if (playersWithRemaingCall.length > 0) {
        this.changeTurn(playersWithRemaingCall[0]); // Move to player who needs to call
      } else {
        if (isRoundComplete) {
          if (this.gameState.isLastRound) {
            this.findWinner()
            setTimeout(() => {
              this.startGame(this.gameState.handNumber + 1)
            }, 3000)
          } else {
            this.gameState.bettingRound.round += 1
            this.gameState.bettingRound.currentBet = 0
            this.gameState.players.forEach(player => player.currentBet = 0)
            this.dealCommunityCards()
            this.changeTurn(); // Move to the next player
          }
        } else {
          this.changeTurn(); // Move to the next player
        }
      }
    } else {
      this.findWinner()
    }
    this.broadcastGameState()
  }

  getRandomCard() {
    let card;
    let array = new Uint32Array(2);  // Create a Uint32Array to hold two random numbers

    do {
      crypto.getRandomValues(array);  // Generate cryptographically secure random numbers
      const rankIndex = array[0] % this.ranks.length;  // Secure random index for ranks
      const suitIndex = array[1] % this.suits.length;  // Secure random index for suits

      const rank = this.ranks[rankIndex];
      const suit = this.suits[suitIndex];
      card = {
        label: `${rank} of ${suit}`,
        value: `${rank}${suit}`
      }
    } while (this.usedCards.has(card.value)); // Check for duplicates

    this.usedCards.add(card.value);  // Add to used cards to prevent future duplicates
    return card;
  }

  dealInitialCards() {
    this.gameState.players.forEach(player => {
      player.cards = [this.getRandomCard(), this.getRandomCard()];
    });
  }

  handlePlayerAction(playerId, action, amount) {
    const player = this.gameState.players.find(p => p.playerId === playerId);

    // Check if it's this player's turn
    if (
      (!player || playerId !== this.gameState.players[this.gameState.currentPlayer].playerId) &&
      ['reset_game', 'next_hand'].indexOf(action) == -1
    ) {
      console.log("Not player's turn or player not found:", playerId);
      return; // It's not this player's turn or player not found
    }

    // Validate the action
    switch (action) {
      case 'raise':
        if (amount <= this.gameState.bettingRound.currentBet) {
          console.log("Raise amount too low:", amount, "current bet:", this.gameState.bettingRound.currentBet);
          return; // Raise amount must be greater than the current bet
        }
        if (amount > player.stackSize) {
          console.log("Not enough chips to raise:", amount, "stack size:", player.stackSize);
          return; // Not enough chips to raise
        }
        player.stackSize -= amount;
        player.currentBet += amount;
        this.gameState.potTotal += amount;
        this.gameState.bettingRound.currentBet = amount; // Update current bet to the raised amount
        player.completedRound += 1
        this.checkRoundCompleted()
        break;
      case 'call':
        const callAmount = this.gameState.bettingRound.currentBet - player.currentBet;
        if (callAmount > player.stackSize) {
          console.log("Not enough chips to call:", callAmount, "stack size:", player.stackSize);
          return; // Not enough chips to call
        }
        player.stackSize -= callAmount;
        player.currentBet += callAmount;
        player.completedRound = this.gameState.bettingRound.round // player completed round of betting
        this.gameState.potTotal += callAmount;
        this.checkRoundCompleted()
        break;
      case 'check':
        if (this.gameState.bettingRound.currentBet > player.currentBet) {
          console.log("Cannot check, current bet is higher than player's bet:", this.gameState.bettingRound.currentBet, "player's bet:", player.currentBet);
          return; // Cannot check because there is an outstanding bet
        } else {
          player.completedRound += 1 // player completed round of betting
        }
        this.checkRoundCompleted()
        break;
      case 'fold':
        player.status = 'folded';
        this.checkRoundCompleted()
        break;
      case 'next_hand':
        this.startGame(this.gameState.handNumber + 1)
        this.broadcastGameState()
        break;
      case 'reset_game':
        this.gameState = {
          gameType: "Texas Hold'em",
          maxPlayers: 8,
          bigBlind: 100,
          smallBlind: 50,
          dealerPosition: 0,
          currentPlayer: -1,
          gamePhase: "pending",
          communityCards: [],
          potTotal: 0,
          bettingRound: {
            currentBet: 0,
            totalBets: [],
            round: 1
          },
          isLastRound: false,
          lastAction: {},
          players: [],
          spectators: [],
          winner: null
        };
        this.broadcastGameState()
        break;
      default:
        console.log("Invalid action:", action);
        return; // Invalid action
    }
  }

  changeTurn(playerIndex = null) {
    // Find the next active player who has not folded
    if (!playerIndex && playerIndex !== 0) {
      let index = (this.gameState.currentPlayer + 1) % this.gameState.players.length;
      while (this.gameState.players[index].status === 'folded' && index !== this.gameState.currentPlayer) {
        index = (index + 1) % this.gameState.players.length;
      }
      this.gameState.currentPlayer = index;
    } else {
      this.gameState.currentPlayer = playerIndex;
    }

    this.broadcastGameState(); // Update all clients with the new state
  }

  dealCommunityCards() {
    if (this.gameState.communityCards.length === 0) { // Flop
      this.gameState.communityCards.push(this.getRandomCard(), this.getRandomCard(), this.getRandomCard());
    } else if (this.gameState.communityCards.length === 3) { // Turn
      this.gameState.communityCards.push(this.getRandomCard());
    } else if (this.gameState.communityCards.length === 4) { // River
      this.gameState.communityCards.push(this.getRandomCard());
      this.gameState.isLastRound = true
      this.gameState.isFlop = true
    }

    this.broadcastGameState();
  }

  startGame(handNumber = 1) {
    this.gameState.communityCards = []
    this.gameState.winner = null
    this.gameState.handNumber = handNumber
    this.gameState.gamePhase = "active";
    this.gameState.isLastRound = false
    this.gameState.bettingRound = {
      round: 1,
      currentBet: 0,
      totalBets: []
    };
    this.gameState.currentPlayer = 0;  // Assuming the first player in the array starts
    this.gameState.dealerPosition = 0;  // Could be randomized or set by some rule

    this.dealInitialCards();

    // Update all player statuses to 'active' and set the first player's turn
    this.gameState.players = this.gameState.players.map((player, index) => {
      return {
        ...player,
        status: 'active',
        turn: index === 0 ? true : false,
        currentBet: 0,
        completedRound: 0
      }
    });

    this.room.broadcast("The game has started!");
    this.broadcastGameState();
  }

  broadcastGameState(newConnectionId = null) {
    this.gameState.players.concat(this.gameState.spectators).forEach(person => {
      const personalizedGameState = {
        ...this.gameState,
        players: this.gameState.players.map(player => ({
          ...player,
          cards: player.playerId === person.playerId ? player.cards : []
        }))
      };

      // Send game state; ensure spectators do not receive any cards information
      const gameStateForBroadcast = person.status === "spectating" ? { ...personalizedGameState, players: personalizedGameState.players.map(p => ({ ...p, cards: [] })) } : personalizedGameState;

      const conn = this.room.getConnection(person.playerId);
      if (conn) {
        conn.send(JSON.stringify(gameStateForBroadcast));
      } else if (newConnectionId && person.playerId === newConnectionId) {
        // This is primarily for the new connection which might not yet be fully registered in the room's connection pool
        this.room.getConnection(newConnectionId).send(JSON.stringify(gameStateForBroadcast));
      }
    });
  }

  getActivePlayers() {
    return this.gameState.players.filter(p => p.status === 'active')
  }
}
