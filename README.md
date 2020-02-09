# Peregrine Arbitrage API.

## Install requirements

`python -m pip install -r ./requirements.txt`

## Run

`python server.py`

## Command line arguments

1. `--port`: to specify in which port we want to run the app. [default 5002]
2. `--debug`: to tell Flask whether to run in debug mode or not. [default True]
3. `--reload`: to tell Flask whether to run with auto-reload or not. [default True]

## Docker

### Build

`docker build -t arbitrage_api .`

### Run

`docker run -d --name arbitrage_api -p 5002:5002 arbitrage_api`
