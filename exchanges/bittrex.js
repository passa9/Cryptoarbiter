const request = require("request-promise");
var tickers = require('./../common/variables').tickers;
var queueBittrex = require('./../common/variables').queueBittrex;

const Bittrex = {
  getTickers: async function (inizializza) {
    const url =
      "https://bittrex.com/api/v1.1/public/getmarketsummaries";
    return request.get(url, (error, response, body) => {

      if (error || response.statusCode != 200) {
        console.log("Errore bittrex");
        return;
      }

      let json = JSON.parse(body);

      if (!json.success) {
        console.log(json.message);
        return;
      }
      var count = 0;
      json.result.forEach(element => {
        var baseCurrency = element.MarketName.split('-')[0];
        var quoteCurrency = element.MarketName.split('-')[1];
        var ticker = tickers.find(x => x.id === element.MarketName);

        if (ticker == null && inizializza) // nuovo, lo inserisco
        {
          tickers.push({
            id: element.MarketName,
            bittrex: {
              base: baseCurrency,
              quote: quoteCurrency,
              last: element.Last,
              bid: element.Bid,
              ask: element.Ask,
              status: "ok"
            },
            liqui: {},
            binance: {},
            poloniex: {},
            cryptopia: {},
            hitbtc: {},
            exmo: {},
            livecoin: {},
            bitfinex: {}
          });

        }
        else if (ticker == null) {
          return;
        }
        else {
          if (inizializza) {
            ticker.bittrex.base = baseCurrency;
            ticker.bittrex.quote = quoteCurrency;
            ticker.bittrex.status = "ok";
          }

          ticker.bittrex.last = element.Last;
          ticker.bittrex.bid = element.Bid;
          ticker.bittrex.ask = element.Ask;
        }

        count++;
      });

      if (inizializza) {
        while (count != json.result.length) { }
      }
      return;

    });
  },
  startDequequeOrderbook: function () {
    setInterval(async function () {
      if (queueBittrex.length > 0) {
        var data = queueBittrex.shift();
        var res = data.res;
        var json = await getOrderBookBittrex(data.funct.market, data.funct.type);
        res.contentType('application/json');
        res.send(JSON.stringify({
          link: "https://bittrex.com/Market/Index?MarketName=" + data.funct.market,
          arr: json,
        }));
      }
    }, 1000);
  },

  getCurrencies: async function () {
    const url =
      "https://bittrex.com/api/v2.0/pub/currencies/GetWalletHealth";
    return request.get(url, (error, response, body) => {

      if (error || response.statusCode != 200) {
        console.log("Errore bittrex");
        return;
      }

      let json = JSON.parse(body);

      if (!json.success) {
        console.log(json.message);
        return;
      }

      json.result.forEach(element => {
        var tickerFound = tickers.filter(x => x.bittrex.quote == element.Health.Currency);

        tickerFound.forEach(ticker => {
          if (ticker != undefined) {
            if (!element.Health.IsActive) {
              ticker.bittrex.status = "locked";
            }
            else if (element.Health.MinutesSinceBHUpdated > 60) {
              ticker.bittrex.status = "locked";
            }
            else if (element.Health.MinutesSinceBHUpdated > 30) {
              ticker.bittrex.status = "delayed";
            }
            else
            {
              ticker.bittrex.status = "ok";
            }
          }
        });

      });
    });

  }
}

async function getOrderBookBittrex(market, type) {

  if (type == "bid") {
    type = "buy";
  }
  else if (type == "ask") {
    type = "sell";
  }
  var data;
  const url =
    "https://bittrex.com/api/v1.1/public/getorderbook?market=" + market + "&type=" + type;
  await request.get(url, (error, response, body) => {

    if (error || response.statusCode != 200) {
      console.log("Errore bittrex");
      return [];
    }

    let json = JSON.parse(body);

    if (!json.success) {
      console.log(json.message);
      data = [];
      return data;
    }
    if (json.result == null) {
      data = [];
      return data;
    }

    var dim = (json.result.length - 1 < 10 ? json.result.length - 1 : 10);
    data = json.result.splice(0, dim);

  });

  return data;
}


exports.Bittrex = Bittrex;