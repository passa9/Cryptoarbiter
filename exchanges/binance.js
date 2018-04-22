const request = require("request-promise");
var tickers = require('./../common/variables').tickers;
var queueBinance = require('./../common/variables').queueBinance;


const  Binance = {
    getTickers: async function(inizializza) {
        const url =
          "https://api.binance.com/api/v3/ticker/bookTicker";
        return request.get(url, (error, response, body) => {
          if (error || response.statusCode != 200) {
            console.log("Errore binance");
            return;
          }
      
          let json = JSON.parse(body);
          var count = 0;
          json.forEach(element => {
      
            var basecurrency;
            var currency;
      
            if (element.symbol.endsWith("USDT")) {
              basecurrency = "USDT";
              currency = element.symbol.substring(0, element.symbol.length - 4);
            }
            else {
              basecurrency = element.symbol.substring(element.symbol.length - 3, element.symbol.length);
              currency = element.symbol.substring(0, element.symbol.length - 3);
            }
      
            var ticker = tickers.find(x => x.id === basecurrency + '-' + currency);
      
            if (ticker == null && inizializza) // nuovo, lo inserisco
            {
              tickers.push({
                id: basecurrency + '-' + currency,
                binance: {
                  last: element.price,
                  ask: parseFloat(element.askPrice),
                  bid: parseFloat(element.bidPrice)
                },
                exmo: {},
                liqui: {},
                bittrex: {},
                poloniex: {},
                cryptopia: {},
                hitbtc: {},
                livecoin: {},
                bitfinex: {}
              });
      
            }
            else if (ticker == null) {
              return;
            }
            else {
              ticker.binance.last = element.price;
              ticker.binance.ask = parseFloat(element.askPrice);
              ticker.binance.bid = parseFloat(element.bidPrice);
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
            if (queueBinance.length > 0) {
              var data = queueBinance.shift();
              var res = data.res;
              var json = await getOrderBookBinance(data.funct.market, data.funct.type);
              res.contentType('application/json');
              res.send(JSON.stringify({
                link: "https://www.binance.com/trade.html?symbol=" + data.funct.market.split("-")[1] + "_" + data.funct.market.split("-")[0],
                arr: json,
              }));
            }
          }, 1000);
    }
};

async function getOrderBookBinance(market, type) {
    
      var data;
      const url = "https://api.binance.com/api/v1/depth?limit=10&symbol=" + market.split("-")[1] + market.split("-")[0];
      await request.get(url, (error, response, body) => {
    
        if (error || response.statusCode != 200) {
          console.log("Errore Binance");
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


exports.Binance = Binance;