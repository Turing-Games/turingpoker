from . import types
from websockets.sync.client import connect
import json
from types import SimpleNamespace

class PokerConnection:
    def __init__(self, host: str, port: int, room: str):
        self.host = host
        self.port = port
        self.room = room
        self.ws = connect(f"ws://{host}:{str(port)}/party/{room}")

    def send(self, message: types.ClientMessage):
        self.ws.send(message)

    def recv(self) -> types.ServerStateMessage:
        return json.loads(self.ws.recv(), object_hook=lambda d: SimpleNamespace(**d))

    def close(self):
        self.ws.close()
