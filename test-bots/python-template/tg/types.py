from enum import Enum, IntEnum
from dataclasses import dataclass, field
from typing import Optional, List, Union, Tuple, Dict

class PokerRound(Enum):
    PRE_FLOP = 'pre-flop'
    FLOP = 'flop'
    TURN = 'turn'
    RIVER = 'river'
    SHOWDOWN = 'showdown'

PlayerID = str
class Rank(IntEnum):
    ACE = 1
    TWO = 2
    THREE = 3
    FOUR = 4
    FIVE = 5
    SIX = 6
    SEVEN = 7
    EIGHT = 8
    NINE = 9
    TEN = 10
    JACK = 11
    QUEEN = 12
    KING = 13

class Suit(Enum):
    HEARTS = 'hearts'
    DIAMONDS = 'diamonds'
    CLUBS = 'clubs'
    SPADES = 'spades'

@dataclass
class Card:
    rank: Rank
    suit: Suit


@dataclass
class PokerPlayer:
    id: PlayerID
    stack: int
    folded: bool
    current_bet: int
    last_round: Optional[PokerRound] = None


@dataclass
class PokerConfig:
    dealer_position: int
    small_blind: int
    big_blind: int
    max_players: int

@dataclass
class PokerSharedState:
    dealer_position: int
    small_blind: int
    big_blind: int
    pot: int
    target_bet: int
    players: List[PokerPlayer]
    round: PokerRound
    done: bool
    cards: List[Card]
    whose_turn: Optional[PlayerID] = None

@dataclass
class PokerGame:
    state: PokerSharedState
    config: PokerConfig
    hands: Dict[PlayerID, Tuple[Card, Card]]
    deck: List[Card]

GameLog = List[str]

class ActionType(Enum):
    RAISE = 'raise'
    FOLD = 'fold'
    CALL = 'call'

@dataclass
class Action(dict):
    type: ActionType
    amount: Optional[int] = None

@dataclass
class ClientMessage(dict):
    type: str
    action: Optional[Action] = None

class ServerUpdateMessageType(Enum):
    GAME_STARTED = 'game-started'
    PLAYER_JOINED = 'player-joined'
    PLAYER_LEFT = 'player-left'
    ACTION = 'action'
    GAME_ENDED = 'game-ended'

@dataclass
class ServerUpdateMessage:
    type: ServerUpdateMessageType
    action: Optional[Action] = None
    player: Optional[PokerPlayer] = None
    players: Optional[List[PokerPlayer]] = None
    payouts: Optional[Dict[str, int]] = None
    reason: Optional[str] = None


@dataclass
class ServerStateMessage:
    client_id: str
    game_state: Optional[PokerSharedState] = None
    hand: Optional[Tuple[Card, Card]] = None
    in_game_players: List[PokerPlayer] = field(default_factory=list)
    spectator_players: List[PokerPlayer] = field(default_factory=list)
    queued_players: List[PokerPlayer] = field(default_factory=list)
    players: List[PokerPlayer] = field(default_factory=list)
    last_updates: List[ServerUpdateMessage] = field(default_factory=list)