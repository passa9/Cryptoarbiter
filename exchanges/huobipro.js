const request = require("request-promise");
var tickers = require('./../common/variables').tickers;
var queueHuobipro = require('./../common/variables').queueHuobipro;

var pairs = [];


const Huobipro = {
    fillPairs: async function () {
        const url =
            "https://api.huobi.pro/v1/common/symbols";
        return request.get(url, (error, response, body) => {

            if (error || response.statusCode != 200) {
                console.log("Errore huobipro");
                return;
            }
            let json;
            try {
                json = JSON.parse(body);
            }
            catch (e) {
                return;
            }
            json.data.forEach(pair => {
                var baseCurrency = pair["quote-currency"].toUpperCase();
                var quoteCurrency = pair["base-currency"].toUpperCase();
                var id = baseCurrency + "-" + quoteCurrency;
                var ticker = tickers.find(x => x.id === id);

                if (ticker == null) {
                    tickers.push({
                        id: id,
                        huobipro: {
                            base: baseCurrency,
                            quote: quoteCurrency,
                            status: "ok"
                        },
                        liqui: {},
                        binance: {},
                        poloniex: {},
                        cryptopia: {},
                        hitbtc: {},
                        exmo: {},
                        livecoin: {},
                        bitfinex: {},
                        bittrex: {}
                    });
                }
                else {

                    ticker.huobipro.base = baseCurrency;
                    ticker.huobipro.quote = quoteCurrency;
                    ticker.huobipro.status = "ok";
                }
                pairs.push({
                    baseCurrency: pair["base-currency"],
                    quoteCurrency: pair["quote-currency"]
                })
            });

        })
    },
    refreshTickers: async function () {
        while (true) {

            for (var i = 0; i < pairs.length; i++) {

                var pair = pairs[i].baseCurrency + pairs[i].quoteCurrency
                const url =
                    "https://api.huobi.pro/market/detail/merged?symbol=" + pair;
                await request.get(url, (error, response, body) => {

                    if (error || response.statusCode != 200) {
                        console.log("Errore huobi");
                        return;
                    }
                    let json;
                    try {
                        json = JSON.parse(body);
                    }
                    catch (e) {
                        return;
                    }
                    var id = (pairs[i].quoteCurrency + "-" + pairs[i].baseCurrency).toUpperCase();
                    var ticker = tickers.find(x => x.id === id);

                    if (ticker != undefined) {
                        ticker.huobipro.bid = json.tick.bid[0];
                        ticker.huobipro.ask = json.tick.ask[0];
                    }

                });
            }
        }
    },
    startDequequeOrderbook: function () {
        setInterval(async function () {
            if (queueHuobipro.length > 0) {
                var data = queueHuobipro.shift();
                var res = data.res;
                var json = await getOrderBookQueueHuobipro(data.funct.market, data.funct.type);
                res.contentType('application/json');
                res.send(JSON.stringify({
                    link: "https://www.huobi.pro/" + data.funct.market.split("-")[1] + "_" + data.funct.market.split("-")[0] + "/exchange/",
                    arr: json,
                }));
            }
        }, 1000);
    }
}

async function getOrderBookQueueHuobipro(market, type) {
    
    var data;
    const url = "https://api.huobi.pro/market/depth?symbol="+ market.split("-")[1].toLowerCase() + market.split("-")[0].toLowerCase() +"&type=step1";
    await request.get(url, (error, response, body) => {
  
      if (error || response.statusCode != 200) {
        console.log("Errore Huobi");
        return [];
      }
  
      let json = JSON.parse(body);
  
      if (type == "bid") {
        data = json.tick.bids;
      }
      else {
        data = json.tick.asks;
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


exports.Huobipro = Huobipro;