#!/usr/bin/env python3
import asyncio
from websockets.sync.client import connect
import argparse
import time

parser = argparse.ArgumentParser(
    prog='Check or Call Bot',
    description='A Turing Games poker bot that always checks or calls, no matter what the target bet is (it never folds and it never raises)')

parser.add_argument('--port', type=int, default=1999, help='The port to connect to the server on')
parser.add_argument('--host', type=str, default='localhost', help='The host to connect to the server on')
parser.add_argument('--room', type=str, default='my-new-room', help='The room to connect to')
parser.add_argument('--api_token', type=str, default='', help='The token generated for the bot')

args = parser.parse_args()

async def main():
    ws = connect(f"ws://{args.host}:{str(args.port)}/party/{args.room}?api_token={args.api_token}")
    print(ws)
    ws.send('{"type": "join-game"}')
    while True:
        response = ws.recv()
        print(response)
        ws.send('{"type": "action", "action": {"type": "call"}}')
        time.sleep(1)


if __name__ == "__main__":
    asyncio.run(main())