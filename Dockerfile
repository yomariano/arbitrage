FROM python:3-slim-stretch as build-peregrine
WORKDIR /peregrine

COPY ./peregrine .
RUN ls .
RUN apt-get update && \
    apt-get install git -y --no-install-recommends && \
    apt-get autoremove && \
    apt-get clean && \
    pip install --upgrade pip && \
    python -m pip install --no-warn-script-location --user -r ./requirements.txt && \
    pip install --user .

# =====================================================

FROM python:3-slim-stretch as build-env
WORKDIR /api

COPY ./*.py ./
COPY ./*.txt ./
COPY --from=build-peregrine /root/.local /root/.local
RUN python -m pip install --no-warn-script-location --user -r requirements.txt

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
