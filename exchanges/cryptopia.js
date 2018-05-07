const request = require("request-promise");
var tickers = require('./../common/variables').tickers;
var queueCryptopia = require('./../common/variables').queueCryptopia;

const Cryptopia = {
  getTickers: async function (inizializza) {
    const url =
      "https://www.cryptopia.co.nz/api/GetMarkets/";
    return request.get(url, (error, response, body) => {

      if (error || response.statusCode != 200) {
        console.log("Errore Cryptopia");
        return;
      }

      let json = JSON.parse(body);

      if (json == null)
        return;
      var count = 0;
      json.Data.forEach(element => {

        var basecurrency = element.Label.split("/")[1];
        var currency = element.Label.split("/")[0];
        var quoteCurrency = element.Label.split("/")[0];

        if (currency == "BAT") {
          currency = "BATCoin"
        }
        else if (currency == "NET") {
          currency = "NetCoin"
        }
        else if (currency == "BLZ") {
          currency = "BlazeCoin"
        }
        else if (currency == "FCN") {
          currency = "FacileCoin"
        }
        else if (currency == "BTG") {
          currency = "Bitgem"
        }
        else if (currency == "WRC") {
          currency = "Warcoin"
        }
        else if (currency == "LDC") {
          currency = "Ladacoin";
        }
        else if (currency == "CMT") {
          currency = "CometCoin";
        }
        var ticker = tickers.find(x => x.id === basecurrency + "-" + currency);

        if (ticker == null && inizializza) // nuovo, lo inserisco
        {
          tickers.push({
            id: basecurrency + "-" + currency,
            bittrex: {},
            binance: {},
            poloniex: {},
            liqui: {},
            exmo: {},
            cryptopia: {
              base: basecurrency,
              quote: quoteCurrency,
              status: "ok",
              last: element.LastPrice,
              bid: element.BidPrice,
              ask: element.AskPrice
            },
            livecoin: {},
            hitbtc: {},
            bitfinex: {}
          });
        }
        else if (ticker == null) {
          return;
        }
        else {
          if (inizializza) {
            ticker.cryptopia.base = basecurrency;
            ticker.cryptopia.quote = quoteCurrency;
            ticker.cryptopia.status = "ok";
          }
          ticker.cryptopia.last = element.LastPrice;
          ticker.cryptopia.bid = element.BidPrice;
          ticker.cryptopia.ask = element.AskPrice;
        }

        count++;
      });

      if (inizializza) {
        while (count != json.Data.length) { }
      }
      return;

    });
  }

  ,
  startDequequeOrderbook: function () {
    setInterval(async function () {
      if (queueCryptopia.length > 0) {
        var data = queueCryptopia.shift();
        var res = data.res;
        var json = await getOrderBookCryptopia(data.funct.market, data.funct.type);
        res.contentType('application/json');
        res.send(JSON.stringify({
          link: "https://www.cryptopia.co.nz/Exchange/?market=" + data.funct.market.split("-")[1] + "_" + data.funct.market.split("-")[0],
          arr: json,
        }));
      }
    }, 1000);
  },
  getCurrencies: async function () {
    const url =
      "https://www.cryptopia.co.nz/api/GetCurrencies";
    return request.get(url, (error, response, body) => {

      if (error || response.statusCode != 200) {
        console.log("Errore Cryptopia");
        return;
      }

      let json = JSON.parse(body);

      if (json == null)
        return;
      var count = 0;
      json.Data.forEach(element => {

        var quoteCurrency = element.Symbol;

        var tickersFound = tickers.filter(x => x.cryptopia.quote === quoteCurrency);

        tickersFound.forEach(ticker => {
          if (ticker != undefined) {
            if (element.Status != "OK") {
              ticker.cryptopia.status = "locked";
            }
            else
            {
              ticker.cryptopia.status = "ok";
            }
          }
        });
      })
    });
  }
};


async function getOrderBookCryptopia(market, type) {

  var data;

  const url = "https://www.cryptopia.co.nz/api/GetMarketOrders/" + market.split("-")[1] + "_" + market.split("-")[0] + "/10";

  await request.get(url, (error, response, body) => {

    if (error || response.statusCode != 200) {
      console.log("Errore Cryptopia");
      return [];
    }

    let json = JSON.parse(body);

    if (!json.Success) {
      console.log(json.message);
      data = [];
      return data;
    }
    if (json.Data == null) {
      data = [];
      return data;
    }

    if (type == "bid") {
      data = json.Data.Buy;
    }
    else {
      data = json.Data.Sell;
    }

    var dim = (data.length - 1 < 10 ? data.length - 1 : 10);
    data = data.splice(0, dim).map(function (i) {
      return {
        Rate: i.Price.toString(),
        Quantity: i.Volume
      }
    });

  });

  return data;
}

exports.Cryptopia = Cryptopia;