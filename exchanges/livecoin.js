const request = require("request-promise");
var tickers = require('./../common/variables').tickers;
var queueLivecoin = require('./../common/variables').queueLivecoin;


const  Livecoin = {
    getTickers: async function(inizializza) {
        const url =
          "https://api.livecoin.net/exchange/ticker";
        return request.get(url, (error, response, body) => {
      
          if (error || response.statusCode != 200) {
            console.log("Errore livecoin");
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
      
           
            var basecurrency = element.symbol.split('/')[1];
            var currency = element.symbol.split('/')[0];
            var quote = element.symbol.split('/')[0];
      
            if (currency == "CRC") {
              currency = "CRC2";
            }
            else if (currency == "LDC") {
              currency = "Ladacoin";
            }
      
            var ticker = tickers.find(x => x.id === basecurrency + "-" + currency);
      
            if (ticker == null && inizializza) // nuovo, lo inserisco
            {
              tickers.push({
                id: basecurrency + "-" + currency,
                livecoin: {
                  last: element.last,
                  bid: element.best_bid,
                  ask: element.best_ask,
                  base: basecurrency,
                  quote: quote
                },
                exmo: {},
                liqui: {},
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
              if(inizializza)
              {
                ticker.livecoin.base =basecurrency;
                ticker.livecoin.quote = quote;
                ticker.livecoin.status = "ok";
              }
              ticker.livecoin.last = element.last;
              ticker.livecoin.bid = element.best_bid;
              ticker.livecoin.ask = element.best_ask;
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
    startDequequeOrderbook: function(){
        setInterval(async function () {
            if (queueLivecoin.length > 0) {
              var data = queueLivecoin.shift();
              var res = data.res;
              var json = await getOrderBookLivecoin(data.funct.market, data.funct.type);
              res.contentType('application/json');
              res.send(JSON.stringify({
                link: "https://www.livecoin.net/it/trade/index?currencyPair=" + data.funct.market.split("-")[1] + "%2F" + data.funct.market.split("-")[0],
                arr: json,
              }));
            }
          }, 1000);
    }
};


async function getOrderBookLivecoin(market, type) {
    
      var data;
      const url =
        "https://api.livecoin.net/exchange/order_book?depth=10&groupByPrice=true&currencyPair=" + market.split("-")[1] + "/" + market.split("-")[0];
      await request.get(url, (error, response, body) => {
    
        if (error || response.statusCode != 200) {
          console.log("Errore Livecoin");
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
          Rate: i[0].toString(),
          Quantity: i[1]
        }
      });
    }

exports.Livecoin = Livecoin;