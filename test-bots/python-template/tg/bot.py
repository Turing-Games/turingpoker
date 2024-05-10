from typing import Dict, Tuple
from . import connection, types
from abc import abstractmethod
class Bot(connection.PokerConnection):
    @abstractmethod
    def act(self, state: types.PokerSharedState, hand: Tuple[types.Card, types.Card]) -> types.Action:
        pass
    
    @abstractmethod
    def opponent_action(self, action: types.Action, player: types.PokerPlayer):
        pass

    @abstractmethod
    def game_over(self, payouts: Dict[str, int]):
        pass

    @abstractmethod
    def start_game(self, game: types.PokerGame, my_id: str):
        pass

    def __init__(self, host: str, port: int, room: str):
        super.__init__(self, host, port, room)
        while True:
            state = self.recv()
            if state.game_state is not None and state.hand is not None:
                self.act(state.game_state, state.hand)
