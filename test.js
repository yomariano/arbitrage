"use strict";
var ccxt = require("ccxt");
const superagent = require("superagent");

/*

  Just a Sleep function
*/
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/*

Get minimum possible balance to make a purchase. Hardcoded.

*/
const getMinPossibleBalance = cryptoSymbol => {
  switch (cryptoSymbol) {
    case "ETH":
      return 0.05;
    case "BTC":
      return 0.001;
    case "USDT":
      return 10;
    default:
      return 0.001;
  }
};

/*

Check current balance

*/
const checkBalance = async (exchange, id) => {
  let keepChecking = true;
  while (keepChecking) {
    try {
      let order = await exchange.fetch_order_status(id);
      if (order !== "open") {
        keepChecking = false;
      }
      //await sleep(3000);
    } catch (e) {
      console.log(e);
    }
  }
  return;
};

/*

ETH/BTC => buy eth,sell eth
ETH/USDT => buy eth,sell eth
BTC/USDT => buy btc,sell btc

*/

const getAction = (cryptoToBuy, market) => {
  try {
    return cryptoToBuy === market.split("/")[0] ? "BUY" : "SELL";
  } catch (e) {
    console.log("market not found ", e);
  }
};

/*

Make the BUY or SELL

*/
const createLimitOrder = async (
  at,
  cryptoInBalance,
  exchange,
  market,
  action,
  valueInBalance,
  lastPrice
) => {
  let keepCreatingLimitOrder = true;
  while (keepCreatingLimitOrder) {
    try {
      let order = null;
      let quantity =
        (valueInBalance / lastPrice) * (1 - exchange.fees.trading.maker);
      if (action === "BUY") {
        console.log(
          `BUY ${cryptoInBalance} VALUE IN BALANCE: ${valueInBalance} / LASTPRICE: ${lastPrice} => QUANTITY: ${quantity} `
        );
        console.table(
          (order = await exchange.createLimitBuyOrder(
            market,
            quantity, //quantity
            lastPrice //price
          ))
        );
      } else {
        console.log(
          `SELL ${cryptoInBalance} VALUE IN BALANCE: ${valueInBalance} / LASTPRICE: ${lastPrice} => QUANTITY: ${quantity} `
        );
        console.table(
          (order = await exchange.createLimitSellOrder(
            market,
            valueInBalance,
            lastPrice
          ))
        );
      }
      if (order) {
        keepCreatingLimitOrder = false;
      }

      return order;
    } catch (e) {
      console.log(e);
    }
  }
};

const getArray = function(key) {
  if (key === "BTC") {
    return [
      {
        at: 38.48228043143298,
        exchange: "kucoin",
        from: "BTC",
        market: "ETH/BTC",
        to: "ETH",
        total: 38.48228043143298
      },
      {
        at: 215.35294117647,
        exchange: "kucoin",
        from: "ETH",
        market: "ETH/BTC",
        to: "BTC",
        total: 8273.52
      }
    ];
  }
  if (key === "ETH") {
    return [
      {
        at: 38.48228043143298,
        exchange: "kucoin",
        from: "ETH",
        market: "ETH/BTC",
        to: "BTC",
        total: 38.48228043143298
      },
      {
        at: 215.35294117647,
        exchange: "kucoin",
        from: "BTC",
        market: "ETH/BTC",
        to: "ETH",
        total: 8273.52
      }
    ];
  }
};

const trade = async function() {
  let exchange = new ccxt.kucoin({
    apiKey: "",
    secret: "",
    password: "",
    environment: "live"
  });
  //exchange.urls["api"] = exchange.urls["test"];

  let order = {};
  const res = await superagent.get(
    `http://127.0.0.1:5002/arbitrage/kucoin/ETH/1.0`
  );

  const j = JSON.stringify(res.body, null, "\t");
  const arr = JSON.parse(j)["legs"][0];

  //const arr = getArray("ETH");

  if (arr == null) {
    console.log(`arr was ${arr}... try again`);
    throw 500;
  } else {
    // ask if the 'from' in the first element is in your balance to arbitrage
    console.log(arr);
    if (arr[0].from !== "ETH" || arr.length > 3) {
      console.log("cryptoToSell is not USDT");
      throw 500;
    }
    // minBalance = getMinPossibleBalance(arr[0].from);

    // if (
    //   typeof balance[arr[0].from] === "undefined" ||
    //   balance[arr[0].from].free < minBalance
    // ) {
    //   console.log(
    //     `BALANCE TOO LOW `,
    //     arr[0].from + " " + balance[arr[0].from].free
    //   );
    // }

    // if balance too low repeat again until having the crypto we are looking for
    // if (
    //   typeof balance[arr[0].from] === "undefined" ||
    //   balance[arr[0].from].free < minBalance
    // ) {
    //   console.log(
    //     `BALANCE TOO LOW `,
    //     arr[0].from + " " + balance[arr[0].from].free
    //   );
    //   // we could buy the 'from' crypto and move fwd
    //   // first we look the possible coins to look for in our balance, we skip the one we dont have
    //   console.log(balance.total);

    //   const possibleInitCoinsInBalance = Object.entries(balance.total).filter(
    //     e => {
    //       return arr[0].from !== e[0] ? true : false;
    //     }
    //   );
    //   console.log("Possible coins to look for => ", possibleInitCoinsInBalance);

    //   let lastPrice = 0;
    //   let valueInBalance = 0;
    //   let order = null;
    //   for (let index = 0; index < possibleInitCoinsInBalance.length; index++) {
    //     //Object.entries(balance.total).length => creates array key ,value
    //     let cryptoInBalance = possibleInitCoinsInBalance[index][0];
    //     valueInBalance = possibleInitCoinsInBalance[index][1];
    //     console.log(
    //       `Fetching minimun possible coin in balance with ${cryptoInBalance} : ${valueInBalance}`
    //     );
    //     let minBal = getMinPossibleBalance(cryptoInBalance);
    //     console.log(`Minimun balance for ${cryptoInBalance} ${minBal}`);
    //     let marketAction = getMarket(arr[0].from, cryptoInBalance);
    //     lastPrice = await exchange.fetchTicker(marketAction.market);

    //     if (valueInBalance >= minBal) {
    //       console.log(`Market : ${marketAction.market}`);
    //       console.log(`Action: ${marketAction.action}`);

    //       await createLimitOrder(
    //         cryptoInBalance,
    //         order,
    //         exchange,
    //         marketAction,
    //         valueInBalance,
    //         lastPrice.info.last
    //       );
    //     }
    //     await checkBalance(
    //       order.amount,
    //       balance,
    //       exchange,
    //       marketAction.action,
    //       arr[0].from, // check if FROM balance is ok
    //       lastPrice.info.last
    //     );
    //     break;
    //   }
    // }
    for (let i = 0; i < arr.length; i++) {
      let cryptoToSell = arr[i].from;
      let cryptoToBuy = arr[i].to;
      let market = arr[i].market;
      let action = getAction(cryptoToBuy, market);
      let balance = await exchange.fetchBalance({ type: "trade" });
      let valueInBalance = balance[cryptoToSell].free;
      let ticker = await exchange.fetchTicker(market);

      //create limit order
      order = await createLimitOrder(
        arr[i].at,
        cryptoToSell,
        exchange,
        market,
        action,
        valueInBalance,
        ticker.info.last
      );

      // check whether order created has being filled
      await checkBalance(exchange, order.id);
    }
  }
};

(async function(delay, callback) {
  var loop = async function() {
    try {
      await callback();
    } catch (e) {
      // if the exception is thrown, it is "caught" and can be handled here
      // the handling reaction depends on the type of the exception
      // and on the purpose or business logic of your application
      if (e instanceof ccxt.NetworkError) {
        console.log("fetchTicker failed due to a network error:", e.message);
        // retry or whatever
        // ...
      } else if (e instanceof ccxt.ExchangeError) {
        console.log("fetchTicker failed due to exchange error:", e.message);
        // retry or whatever
        // ...
      } else {
        console.log("fetchTicker failed with:", e.message);
        // retry or whatever
        // ...
      }
    }

    setTimeout(loop, delay);
  };
  loop();
})(5000, trade);
