import json
from types import SimpleNamespace
from typing import Dict, Tuple

from websockets.client import connect
from . import types, util
from abc import abstractmethod
class Bot:
    @abstractmethod
    def act(self, state: types.PokerSharedState, hand: Tuple[types.Card, types.Card]) -> types.Action:
        raise NotImplementedError("Must override act")
    
    @abstractmethod
    def opponent_action(self, action: types.Action, player: types.PokerPlayer):
        raise NotImplementedError("Must override opponent_action")

    @abstractmethod
    def game_over(self, payouts: Dict[str, int]):
        raise NotImplementedError("Must override game_over")

    @abstractmethod
    def start_game(self, my_id: str):
        raise NotImplementedError("Must override start_game")

    def __init__(self, host: str, port: int, room: str):
        self.host = host
        self.port = port
        self.room = room

    async def start(self):
        async for ws in connect(f"ws://{self.host}:{str(self.port)}/party/{self.room}"):
            await ws.send(json.dumps({'type': 'join-game'}))
            async for message in ws:
                try:
                    state = json.loads(message, object_hook=lambda d: SimpleNamespace(**util.decamilize(d)))
                    should_act = False
                    for update in state.last_updates:
                        if update.type == types.ServerUpdateMessageType.ACTION.value:
                            if update.player.player_id != state.client_id:
                                self.opponent_action(update.action, update.player)
                                should_act = True
                        elif update.type == types.ServerUpdateMessageType.GAME_ENDED.value:
                            self.game_over(update.payouts)
                        elif update.type == types.ServerUpdateMessageType.GAME_STARTED.value:
                            self.start_game(state.client_id)
                            should_act = True
                        elif update.type == types.ServerUpdateMessageType.PLAYER_JOINED.value:
                            pass
                        elif update.type == types.ServerUpdateMessageType.PLAYER_LEFT.value:
                            should_act = True
                            pass
                    if state.game_state is not None and state.hand is not None:
                        # only move if we are responding to an opponent action
                        if state.game_state.whose_turn == state.client_id and should_act:
                            try:
                                action = self.act(state.game_state, state.hand)
                                await ws.send(json.dumps({'type': 'action', 'action': util.camelize(action)}))
                            except Exception as e:
                                raise e
                except Exception as e:
                    print(e)
                    print(message)
                    print('error parsing message', message)
                    raise e
