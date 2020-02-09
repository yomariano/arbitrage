import sys
import argparse
import asyncio
import math
from json import dumps

from flask import Flask, Response, request, jsonify
from flask_restful import Api, Resource
from peregrinearb import (bellman_ford_multi,
                          create_weighted_multi_exchange_digraph)

app = Flask(__name__)
api = Api(app)

def startServer (argsv):
    parser = argparse.ArgumentParser(description="Peregrine Arbitrage API")
    parser.add_argument("--debug", type=bool, default=True)
    parser.add_argument("--port", type=int, default=5002)
    parser.add_argument("--reloader", type=bool, default=True)
    args = parser.parse_args()

    app.run(host='0.0.0.0', debug=args.debug, use_reloader=args.reloader, port=args.port)

def formatToJson(graph, path, initialMoney):
    if (path  == None):
        return []

    steps = []
    money = initialMoney;
    for i in range(len(path)):
        if i + 1 < len(path):
            start = path[i]
            end = path[i + 1]
            rate = math.exp(-graph[start][end]['weight'])
            money *= rate
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

def get_set_event_loop():
    try:
        return asyncio.get_event_loop()
    except RuntimeError as e:
        if e.args[0].startswith('There is no current event loop'):
            asyncio.set_event_loop(asyncio.new_event_loop())
            return asyncio.get_event_loop()
        raise e

@app.route('/arbitrage/', defaults={'exchanges': 'binance,kraken,bittrex', 'start_coin': "BTC", 'initialMoney': 100 })
@app.route('/arbitrage/<string:exchanges>/<string:start_coin>/<float:initial>')
def get_arbitrage(exchanges, start_coin, initial):
    splitted_exchanges = str.split(exchanges, ',')

    print("Get Arbitrage called with:")
    print(f"\tstart_coin    = '{start_coin}'")
    print(f"\texchanges     = '{splitted_exchanges}'")
    print(f"\tinitial     = '{initial}'")

    try:
        # Get possibilities
        get_set_event_loop();
        graph = create_weighted_multi_exchange_digraph(splitted_exchanges, log=True, fees=True)
        # search paths
        graph, paths = bellman_ford_multi(graph, start_coin)
        legs = []
        for path in paths:
            current = formatToJson(graph, path, initial)
            if (current != None and current.__len__() > 0):
                legs.append(current)

        return jsonify({'legs': legs}), 200
    except RuntimeError as re:
        return re.args[0], 500

def main():
    print("Starting Arbitrage REST API.")
    startServer(sys.argv[1:])

if __name__ == "__main__":
    main()
