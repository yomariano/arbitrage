import asyncio
import math
from json import dumps

from flask import Flask, Response, request
from flask_restful import Api, Resource
from peregrinearb import (bellman_ford_multi,
                          create_weighted_multi_exchange_digraph)

app = Flask(__name__)
api = Api(app)

class arbitrage(Resource):
    def get_set_event_loop(self):
        try:
            return asyncio.get_event_loop()
        except RuntimeError as e:
            if e.args[0].startswith('There is no current event loop'):
                asyncio.set_event_loop(asyncio.new_event_loop())
                return asyncio.get_event_loop()
            raise e

    def formatToJson(self, graph, path, initialMoney):
        if (path  == None):
            return []

        steps = []
        money = initialMoney;
        for i in range(len(path)):
            if i + 1 < len(path):
                start = path[i]
                end = path[i + 1]
                rate = math.exp(-graph[start][end]['weight'])
                money = rate
                step = {
                    'from': start,
                    'to': end,
                    'at': rate,
                    'total': money,
                    'exchange': graph[start][end]['exchange_name'],
                    'market': graph[start][end]['market_name']
                }
                steps.append(step)
        return steps

    def get_arbitrage(self):

        # Get posibilities
        graph = create_weighted_multi_exchange_digraph(['binance'], log=True)
        # search paths
        graph, paths = bellman_ford_multi(graph, 'BTC')

        steps = []
        for path in paths:
            current = self.formatToJson(graph, path, 0.01482684)
            if (current != None):
                steps.extend(current)

        return steps

    def get(self):
        self.get_set_event_loop()
        steps = self.get_arbitrage()
        return steps

api.add_resource(arbitrage, '/arbitrage')
app.run(debug=True, use_reloader=True, port='5002')
