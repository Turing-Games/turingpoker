#!/usr/bin/env python3
import asyncio
from websockets.sync.client import connect
import argparse
import time

from tg.bot import Bot

parser = argparse.ArgumentParser(
    prog='Template bot',
    description='A Turing Games poker bot that always checks or calls, no matter what the target bet is (it never folds and it never raises)')

parser.add_argument('--port', type=int, default=1999,
                    help='The port to connect to the server on')
parser.add_argument('--host', type=str, default='localhost',
                    help='The host to connect to the server on')
parser.add_argument('--room', type=str, default='my-new-room',
                    help='The room to connect to')

args = parser.parse_args()

class TemplateBot(Bot):
    def act(self, state, hand):
        time.sleep(1)
        print('acting', state, hand)
        return {'type': 'call'}

    def opponent_action(self, action, player):
        print('opponent action?', action, player)

    def game_over(self, payouts):
        print('game over', payouts)

    def start_game(self, my_id):
        print('start game', my_id)

if __name__ == "__main__":
    bot = TemplateBot(args.host, args.port, args.room)
    asyncio.run(bot.start())
