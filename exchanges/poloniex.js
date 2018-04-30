const request = require("request-promise");
var tickers = require('./../common/variables').tickers;
var queuePoloniex = require('./../common/variables').queuePoloniex;

const Poloniex = {
  getTickers: async function (inizializza) {
    const url =
      "https://poloniex.com/public?command=returnTicker";
    return request.get(url, (error, response, body) => {

      if (error || response.statusCode != 200) {
        console.log("Errore poloniex");
        return;
      }

      let obj = JSON.parse(body);
      var count = 0;
      Object.keys(obj).forEach(key => {

        var basecurrency = key.split('_')[0];
        var currency = key.split('_')[1];
        var quoteCurrency = key.split('_')[1];
        if (currency == "BTM") {
          currency = "Bitmark";
        }

        var ticker = tickers.find(x => x.id === (basecurrency + "-" + currency));

        if (ticker == null && inizializza) // nuovo, lo inserisco
        {
          tickers.push({
            id: (basecurrency + "-" + currency),
            poloniex: {
              base: basecurrency,
              quote: quoteCurrency,
              last: obj[key].last,
              ask: parseFloat(obj[key].lowestAsk),
              bid: parseFloat(obj[key].highestBid),
            },
            liqui: {},
            binance: {},
            bittrex: {},
            hitbtc: {},
            exmo: {},
            cryptopia: {},
            livecoin: {},
            bitfinex: {}
          });
        }
        else if (ticker == null) {
          return;
        }
        else {
          if (inizializza) {
            ticker.poloniex.base = basecurrency;
            ticker.poloniex.quote = quoteCurrency;
          }
          ticker.poloniex.last = obj[key].last;
          ticker.poloniex.bid = parseFloat(obj[key].highestBid);
          ticker.poloniex.ask = parseFloat(obj[key].lowestAsk);

        }
        count++;
      });

      if (inizializza) {
        while (count != Object.keys(obj).length) { }
      }
      return;
    });
  },
  startDequequeOrderbook: function () {
    setInterval(async function () {
      if (queuePoloniex.length > 0) {
        var data = queuePoloniex.shift();
        var res = data.res;
        var json = await getOrderBookPoloniex(data.funct.market, data.funct.type);
        res.contentType('application/json');
        res.send(JSON.stringify({
          link: "https://poloniex.com/exchange/#" + data.funct.market.replace("-", "_"),
          arr: json,
        }));
      }
    }, 1000);
  },
  getCurrencies: async function () {

    const url =
      "https://poloniex.com/public?command=returnCurrencies";
    return request.get(url, (error, response, body) => {

      if (error || response.statusCode != 200) {
        console.log("Errore poloniex");
        return;
      }

      let obj = JSON.parse(body);
      var count = 0;
      Object.keys(obj).forEach(currency => {

        var tickersFound = tickers.filter(x => x.poloniex.quote === currency);

        tickersFound.forEach(ticker => {
          if (ticker !== undefined) {
            ticker.poloniex.status = obj[currency].disabled == 1 ? "locked" : "ok";
          }
        });
      })
    })
  }
};

async function getOrderBookPoloniex(market, type) {

  var data;
  const url =
    "https://poloniex.com/public?command=returnOrderBook&currencyPair=" + market.replace("-", "_") + "&depth=10";
  await request.get(url, (error, response, body) => {

    if (error || response.statusCode != 200) {
      console.log("Errore poloniex");
      return [];
    }

    let json = JSON.parse(body);

    if (type == "bid") {
      data = json.bids;
    }
    else {
      data = json.asks;
    }
    var dim = (data.length - 1 < 10 ? data.length - 1 : 10);
    data = data.splice(0, dim);
  });

  return data.map(function (i) {
    return {
      Rate: i[0],
      Quantity: i[1]
    }
  });
}

exports.Poloniex = Poloniex;