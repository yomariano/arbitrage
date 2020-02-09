FROM python:3-slim-stretch as build-env

COPY ./requirements.txt .
RUN apt-get update && \
    apt-get install git -y --no-install-recommends && \
    apt-get autoremove && \
    apt-get clean && \
    python -m pip install  --user -r ./requirements.txt

# =====================================================

FROM python:3-alpine3.8 AS build

WORKDIR /arbitrage-api

COPY . .
COPY --from=build-env /root/.local /root/.local
RUN pip install --user .

# =====================================================

FROM python:3-alpine3.8

COPY --from=build /root/.local /root/.local

EXPOSE 5002
ENV PATH=/root/.local/bin:$PATH
ENTRYPOINT [ "arbitrage-api-server" ]
