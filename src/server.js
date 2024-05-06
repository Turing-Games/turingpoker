const Hand = require('pokersolver').Hand;
class PartyServer {
  constructor(room) {
    this.connection = null
    this.room = room;
    this.usedCards = new Set();
    this.suits = ['h', 'd', 'c', 's'];
    this.ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    this.gameState = {
      room: room,
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
      lastAction: {},
      players: [],
      spectators: [],
      isLastRound: false,
      winner: null,
      isFlop: false
    };
    // this.startBroadcastingGameState();
  }

  onConnect(conn, ctx) {
    if (process.env.NODE_ENV !== 'production') {
      console.log("client connected")
    }
    this.connection = conn
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

    this.broadcastGameState();
  }

  onMessage(message, websocket) {
    console.log({ message })
    try {
      let data = message;
      if (typeof message === 'string') {  // Check if the message is string to parse it
        data = JSON.parse(message);
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
    // console.log(hand.name); // Two Pair
    // console.log(hand.descr); // Two Pair, A's & Q's
    const playerHands = this.gameState.players.filter(player => player.status !== 'folded')
      .map((p) => {
        const playerCards = p.cards.map(c => c.value)
        const communityCards = this.gameState.communityCards.map(c => c.value)
        return Hand.solve([...playerCards, ...communityCards])
      })

    this.gameState.winner = Hand.winners(playerHands);
  }

  checkRoundCompleted() {
    // first check for one player to see if all others have folded
    // const activePlayers =

    // check all players to see if their completedRound is equal
    // to bettingRound of gameState
    const playerRounds = this.gameState.players.map(player => player.completedRound)
    // sum of rounds
    const roundSum = playerRounds.reduce((acc, val) => acc + val, 0)
    // round is complete if sum divided by players is same as gameData.bettingRound.round
    if ((roundSum / this.gameState.players.length) === this.gameState.bettingRound.round) {
      if (this.gameState.isLastRound) {
        this.findWinner()
      } else {
        this.gameState.bettingRound.round += 1
        this.gameState.bettingRound.currentBet = 0
        this.dealCommunityCards()
        this.changeTurn(0); // Move to the next player
      }
    } else {
      this.changeTurn(); // Move to the next player
    }

    this.broadcastGameState(); // Update all clients with the new state
  }

  ///TODO refactor out poker logic away from server logic 
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
    if (process.env.NODE_ENV !== 'production') {
      console.log('========================')
      console.log('dealing initial cards...')
      console.log(this.gameState.room.internalId)
      console.log('========================')
    }
    this.gameState.players.forEach(player => {
      if (!player.cards?.length) {
        player.cards = [this.getRandomCard(), this.getRandomCard()];
      }
    });
    // if (this.gameState.room.internalId) {
    // }
  }

  handlePlayerAction(playerId, action, amount) {
    console.log("Handling player action:", action, "Amount:", amount);
    const player = this.gameState.players.find(p => p.playerId === playerId);

    // Check if it's this player's turn
    if (
      (!player || playerId !== this.gameState.players[this.gameState.currentPlayer].playerId) &&
      ['join', 'spectate'].indexOf(action) === -1
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
        this.gameState.bettingRound.round += 1 // if raise, another round of betting to raise or call
        player.completedRound += 2 // player who raised, does not have to bet again
        break;
      case 'call':
        const callAmount = this.gameState.bettingRound.currentBet - player.currentBet;
        if (callAmount > player.stackSize) {
          console.log("Not enough chips to call:", callAmount, "stack size:", player.stackSize);
          return; // Not enough chips to call
        }
        player.stackSize -= callAmount;
        player.currentBet += callAmount;
        player.completedRound += 1 // player completed round of betting
        this.gameState.potTotal += callAmount;
        this.checkRoundCompleted()
        break;
      case 'check':
        if (this.gameState.bettingRound.currentBet !== player.currentBet) {
          console.log("Cannot check, current bet is higher than player's bet:", this.gameState.bettingRound.currentBet, "player's bet:", player.currentBet);
          return; // Cannot check because there is an outstanding bet
        } else {
          player.completedRound += 1 // player completed round of betting
          this.checkRoundCompleted()
        }
        break;
      case 'fold':
        player.status = 'folded';
        this.checkRoundCompleted()
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
          winner: null,
          isFlop: false
        };
        this.checkRoundCompleted()
        break;
      case 'join':
        this.joinGame()
        break;
      case 'spectate':
        this.spectateGame()
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

  getHandDetails(hand) {
    const order = "23456789TJQKA";
    const cards = hand.map(card => card[0] + card.slice(-1));  // Normalize cards to be in the format "5H", "TD", etc.
    const faces = cards.map(a => String.fromCharCode([77 - order.indexOf(a[0])])).sort();
    const suits = cards.map(a => a[1]).sort();
    const counts = faces.reduce((count, a) => {
      count[a] = (count[a] || 0) + 1;
      return count;
    }, {});
    const duplicates = Object.values(counts).reduce((count, a) => {
      count[a] = (count[a] || 0) + 1;
      return count;
    }, {});
    const flush = suits[0] === suits[4];
    const first = faces[0].charCodeAt(0);
    const straight = faces.every((f, index) => f.charCodeAt(0) - first === index);
    let rank =
      (flush && straight && 1) ||
      (duplicates[4] && 2) ||
      (duplicates[3] && duplicates[2] && 3) ||
      (flush && 4) ||
      (straight && 5) ||
      (duplicates[3] && 6) ||
      (duplicates[2] > 1 && 7) ||
      (duplicates[2] && 8) ||
      9;

    return { rank, value: faces.sort((a, b) => b.charCodeAt(0) - a.charCodeAt(0)).join("") };
  }


  compareHands(h1, h2) {
    if (h1.rank === h2.rank) {
      return h2.value.localeCompare(h1.value); // Assuming value comparison needs to be tailored to your game's logic
    }
    return h1.rank - h2.rank;
  }

  joinGame() {
    if (this.gameState.players.length >= this.gameState.maxPlayers) {
      // Add as a spectator if the game is active or player slots are full
      this.spectateGame()
    } else {
      // Add as a player if slots are available and game is not active
      const newPlayer = {
        playerId: this.connection,
        stackSize: 5000,
        currentBet: 0,
        status: "waiting",
        cards: [],
        completedRound: 0
      };
      this.gameState.players.push(newPlayer);
      if (this.gameState.players.length >= 2 && this.gameState.gamePhase === "pending") {
        this.startGame();
      }
    }
    this.broadcastGameState();
  }

  spectateGame() {
    this.gameState.spectators.push({
      playerId: this.connection.id,
      status: "spectating"
    });
    this.broadcastGameState();
  }

  startGame() {
    this.gameState.gamePhase = "active";
    this.gameState.currentPlayer = 0;  // Assuming the first player in the array starts
    this.gameState.dealerPosition = 0;  // Could be randomized or set by some rule

    this.dealInitialCards();

    // Update all player statuses to 'active' and set the first player's turn
    this.gameState.players.forEach((player, index) => {
      player.status = 'active';
      // Optionally, mark the first player's turn explicitly
      if (index === 0) player.turn = true;
    });

    this.broadcastGameState();
  }


  broadcastGameState(newConnectionId = null) {
    this.gameState.players.concat(this.gameState.spectators).forEach(person => {
      // Send game state; ensure spectators do not receive any cards information
      const gameStateForBroadcast = person.status === "spectating" ?
        {
          ...this.gameState,
          players: this.gameState.players.map(p => ({ ...p, cards: [] }))
        } : this.gameState;

      const conn = this.room.getConnection(person.playerId);
      if (conn) {
        conn.send(JSON.stringify(gameStateForBroadcast));
      } else if (newConnectionId && person.playerId === newConnectionId) {
        // This is primarily for the new connection which might not yet be fully registered in the room's connection pool
        this.room.getConnection(newConnectionId).send(JSON.stringify(gameStateForBroadcast));
      }
    });
  }


}
export default PartyServer;
