const request = require("request-promise");
var tickers = require('./../common/variables').tickers;
var queueBitfinex = require('./../common/variables').queueBitfinex;
var lastupdateWs = require("./../index").lastUpdateWS;


const Bitfinex = {
  getTickers: async function (inizializza) {

    const url = "https://api.bitfinex.com/v2/tickers?symbols=BTCUSD,tLTCUSD,tLTCBTC,tETHUSD,tETHBTC,tETCBTC,tETCUSD,tRRTUSD,tRRTBTC,tZECUSD,tZECBTC,tXMRUSD,tXMRBTC,tDSHUSD,tDSHBTC,tBTCEUR,tBTCJPY,tXRPUSD,tXRPBTC,tIOTUSD,tIOTBTC,tIOTETH,tEOSUSD,tEOSBTC,tEOSETH,tSANUSD,tSANBTC,tSANETH,tOMGUSD,tOMGBTC,tOMGETH,tBCHUSD,tBCHBTC,tBCHETH,tNEOUSD,tNEOBTC,tNEOETH,tETPUSD,tETPBTC,tETPETH,tQTMUSD,tQTMBTC,tQTMETH,tAVTUSD,tAVTBTC,tAVTETH,tEDOUSD,tEDOBTC,tEDOETH,tBTGUSD,tBTGBTC,tDATUSD,tDATBTC,tDATETH,tQSHUSD,tQSHBTC,tQSHETH,tYYWUSD,tYYWBTC,tYYWETH,tGNTUSD,tGNTBTC,tGNTETH,tSNTUSD,tSNTBTC,tSNTETH,tIOTEUR,tBATUSD,tBATBTC,tBATETH,tMNAUSD,tMNABTC,tMNAETH,tFUNUSD,tFUNBTC,tFUNETH,tZRXUSD,tZRXBTC,tZRXETH,tTNBUSD,tTNBBTC,tTNBETH,tSPKUSD,tSPKBTC,tSPKETH,tTRXUSD,tTRXBTC,tTRXETH,tRCNUSD,tRCNBTC,tRCNETH,tRLCUSD,tRLCBTC,tRLCETH,tAIDUSD,tAIDBTC,tAIDETH,tSNGUSD,tSNGBTC,tSNGETH,tREPUSD,tREPBTC,tREPETH,tELFUSD,tELFBTC,tELFETH,tBTCGBP,tETHEUR,tETHJPY,tETHGBP,tNEOEUR,tNEOJPY,tNEOGBP,tEOSEUR,tEOSJPY,tEOSGBP,tIOTJPY,tIOTGBP";

    return request.get(url, (error, response, body) => {
      if (error || response.statusCode != 200) {
        console.log("Errore bitfinex");
        return;
      }

      let json = JSON.parse(body);
      var count = 0;
      json.forEach(element => {

        var basecurrency;
        var currency;

        var quote;

        basecurrency = element[0].substring(element[0].length - 3, element[0].length);
        currency = element[0].substring(1, element[0].length - 3);

          quote = currency;

        if(currency == "DSH")
        {
          currency = "DASH";
        }

        var ticker = tickers.find(x => x.id === basecurrency + '-' + currency);

        if (ticker == null && inizializza) // nuovo, lo inserisco
        {
          tickers.push({
            id: basecurrency + '-' + currency,
            bitfinex: {
              last: element[7],
              ask: parseFloat(element[3]),
              bid: parseFloat(element[1]),
              base: basecurrency,
              quote: quote,
              status: "ok"
            },
            binance: {},
            exmo: {},
            liqui: {},
            bittrex: {},
            poloniex: {},
            cryptopia: {},
            hitbtc: {},
            livecoin: {},
            huobipro: {},
            qryptos: {}
          });

        }
        else if (ticker == null) {
          return;
        }
        else {
          if (inizializza) {
            ticker.bitfinex.base = basecurrency;
            ticker.bitfinex.quote = quote;
            ticker.bitfinex.status = "ok";
          }

          ticker.bitfinex.last = element.price;
          ticker.bitfinex.ask = parseFloat(element[3]);
          ticker.bitfinex.bid = parseFloat(element[1]);
        }

        count++;
      });

      if (inizializza) {
        while (count != json.length) { }
      }
      lastupdateWs("bitfinex");
      return;

    });
  },
  startDequequeOrderbook: function () {
    setInterval(async function () {
      if (queueBitfinex.length > 0) {
        var data = queueBitfinex.shift();
        var res = data.res;
        var json = await getOrderBookBitfinex(data.funct.market, data.funct.type);
        res.contentType('application/json');
        res.send(JSON.stringify({
          link: "https://bittrex.com/Market/Index?MarketName=" + data.funct.market,
          arr: json,
        }));
      }
    }, 1000);
  },
}

async function getOrderBookBitfinex(market, type) {

  var data;
  var basecurrency = market.split("-")[0];
  var currency= market.split("-")[1];
  const url =
    "https://api.bitfinex.com/v1/book/" + currency + basecurrency;
  await request.get(url, (error, response, body) => {

    if (error || response.statusCode != 200) {
      console.log("Errore bitfinex");
      return [];
    }

    let json = JSON.parse(body);

if(type == "bid")
{
  json = json.bids;
}
else
{
  json = json.asks;
}

    var dim = (json.length - 1 < 10 ? json.length - 1 : 10);
    data = json.splice(0, dim).map(function (i) {
      return {
        Rate: i.price.toString(),
        Quantity: i.amount
      }
    });;

  });

  return data;
}

exports.Bitfinex = Bitfinex;
