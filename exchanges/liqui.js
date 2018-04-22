const request = require("request-promise");
var tickers = require('./../common/variables').tickers;
var queueLiqui = require('./../common/variables').queueLiqui;

var mappingLiqui = [];

const  Liqui = {
    getTickers:async function(inizializza) {

        if(inizializza)
        {
           await MappingIdLiqui();
        }

        const url =
          "https://cacheapi.liqui.io/Market/Tickers";
        return request.get(url, (error, response, body) => {
      
          if (error || response.statusCode != 200) {
            console.log("Errore liqui");
            return;
          }
          let json;
          try {
            json = JSON.parse(body);
          }
          catch (e) {
            return;
          }
          var count = 0;
          json.forEach(element => {
      
            var currency = mappingLiqui.find(function (x) { return x.id == element.PairId })
            var ticker = tickers.find(x => x.id === currency.pair);
      
            if (ticker == null && inizializza) // nuovo, lo inserisco
            {
              tickers.push({
                id: currency.pair,
                liqui: {
                  last: element.LastPrice,
                  bid: element.Buy,
                  ask: element.Sell,
                },
                exmo: {},
                livecoin: {},
                binance: {},
                poloniex: {},
                cryptopia: {},
                hitbtc: {},
                bittrex: {},
                bitfinex: {}
              });
      
            }
            else if (ticker == null) {
              return;
            }
            else {
              ticker.liqui.last = element.LastPrice;
              ticker.liqui.bid = element.Buy;
              ticker.liqui.ask = element.Sell;
            }
            count++;
          });
      
          if (inizializza) {
            while (count != json.length) { }
          }
          return;
      
        });
      }

    ,
    startDequequeOrderbook: function()
    {
        setInterval(async function () {
            if (queueLiqui.length > 0) {
              var data = queueLiqui.shift();
              var res = data.res;
              var json = await getOrderBookLiqui(data.funct.market, data.funct.type);
              res.contentType('application/json');
              res.send(JSON.stringify({
                link: "https://liqui.io/#/exchange/" + data.funct.market.split("-")[1] + "_" + data.funct.market.split("-")[0],
                arr: json,
              }));
            }
          }, 1000);
          
    }
};

async function getOrderBookLiqui(market, type) {
    
      var data;
      var setUpMarket = market.split("-")[1].toLowerCase() + "_" + market.split("-")[0].toLowerCase();
      const url =
        "https://api.liqui.io/api/3/depth/" + setUpMarket;
      await request.get(url, (error, response, body) => {
    
        if (error || response.statusCode != 200) {
          console.log("Errore poloniex");
          return [];
        }
    
        let json = JSON.parse(body);
    
        if (type == "bid") {
          data = json[setUpMarket].bids;
        }
        else {
          data = json[setUpMarket].asks;
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

    async function MappingIdLiqui() {
        const url =
          "https://cacheapi.liqui.io/Market/Pairs";
        return request.get(url, async (error, response, body) => {
      
          if (error || response.statusCode != 200) {
            console.log("Errore Liquimapping");
            return;
          }
          let json;
          try {
            json = JSON.parse(body);
          }
          catch (e) {
            return;
          }
      
          for (var i = 0; i < json.length; i++) {
            var element = json[i];
      
            var basecurrency = element.Name.split('/')[1];
            var currency = element.Name.split('/')[0];
      
            var pair = basecurrency + "-" + currency;
      
            mappingLiqui.push({
              id: element.Id,
              pair: pair
            });
          }
      
        });
      }


exports.Liqui = Liqui;