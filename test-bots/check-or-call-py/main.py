#!/usr/bin/env python3
import asyncio
from websockets.sync.client import connect
import argparse

parser = argparse.ArgumentParser(
    prog='Check or Call Bot',
    description='A Turing Games poker bot that always checks or calls, no matter what the target bet is (it never folds and it never raises)')

parser.add_argument('--port', type=int, default=1999, help='The port to connect to the server on')
parser.add_argument('--host', type=str, default='localhost', help='The host to connect to the server on')
parser.add_argument('--room', type=str, default='my-new-room', help='The room to connect to')

args = parser.parse_args()

async def main():
    async with connect(f"ws://{args.host}:{str(args.port)}/party/{args.room}") as ws:
        await ws.send("check")
        response = await ws.recv()
        print(response)

if __name__ == "__main__":
    asyncio.run(main())