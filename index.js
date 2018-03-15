const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const https = require('https');
const request = require("request-promise");

const app = express();

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Public file
app.use(express.static('public'));

// Index Route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title: title
  });
});

function init() {
  BittrexTickers(true).then(() => {
    BinanceTickers(true).then(() => {
      PoloniexTickers(true).then(() => {
        CryptopiaTickers(true).then(() => {
          LivecoinTickers(true).then(() => {
            HitBTCTickers(true).then(() => {
              MappingIdLiqui().then(() => {
                LiquiTickers(true).then(() => {
                  RemoveAloneMarkets().then(() => {
                    update();
                  });
                });
              });
            });
          });
        });
      });
    });
  });

}
init();

var tickers = [];
var mappingLiqui = [];

function update() {
  setInterval(function () {

    BittrexTickers(false);
    BinanceTickers(false);
    PoloniexTickers(false);
    CryptopiaTickers(false);
    LivecoinTickers(false);
    LiquiTickers(false);
    HitBTCTickers(false);

  }, 3000);
}

async function RemoveAloneMarkets() {

  var arr = [];

  for (var i = 0; i < tickers.length; i++) {

    var arr = [];

    if (tickers[i].poloniex.ask != undefined)
      arr.push(tickers[i].poloniex.ask);
    if (tickers[i].bittrex.ask != undefined)
      arr.push(tickers[i].bittrex.ask);
    if (tickers[i].cryptopia.ask != undefined)
      arr.push(tickers[i].cryptopia.ask);
    if (tickers[i].binance.ask != undefined)
      arr.push(tickers[i].binance.ask);
    if (tickers[i].livecoin.ask != undefined)
      arr.push(tickers[i].livecoin.ask);
    if (tickers[i].liqui.ask != undefined)
      arr.push(tickers[i].liqui.ask);
    if (tickers[i].hitbtc.ask != undefined)
      arr.push(tickers[i].hitbtc.ask);

    if (arr.length < 2) {
      tickers.splice(i, 1);
      i = i - 1;
    }
  }

}

async function HitBTCTickers(inizializza) {
  const url =
    "https://api.hitbtc.com/api/2/public/ticker";
  return request.get(url, (error, response, body) => {

    if (error || response.statusCode != 200) {
      console.log("Errore hitbtc");
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
          binance: {},
          hitbtc: {
            last: element.last,
            ask: parseFloat(element.ask),
            bid: parseFloat(element.bid)
          },
          liqui: {},
          bittrex: {},
          poloniex: {},
          cryptopia: {},
          livecoin: {}
        });
      }
      else if (ticker == null) {
        return;
      }
      else {
        ticker.hitbtc.last = element.last;
        ticker.hitbtc.ask = parseFloat(element.ask);
        ticker.hitbtc.bid = parseFloat(element.bid);
      }
      count++;
    });

    if (inizializza) {
      while (count != json.length) { }
    }
    return;

  });
}

async function LivecoinTickers(inizializza) {
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

      var ticker = tickers.find(x => x.id === basecurrency + "-" + currency);

      if (ticker == null && inizializza) // nuovo, lo inserisco
      {
        tickers.push({
          id: basecurrency + "-" + currency,
          livecoin: {
            last: element.last,
            bid: element.best_bid,
            ask: element.best_ask,
          },
          liqui: {},
          binance: {},
          poloniex: {},
          cryptopia: {},
          hitbtc: {},
          bittrex: {}
        });

      }
      else if (ticker == null) {
        return;
      }
      else {
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

async function LiquiTickers(inizializza) {
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
          livecoin: {},
          binance: {},
          poloniex: {},
          cryptopia: {},
          hitbtc: {},
          bittrex: {}
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

async function BittrexTickers(inizializza) {
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
      var ticker = tickers.find(x => x.id === element.MarketName);

      if (ticker == null && inizializza) // nuovo, lo inserisco
      {
        tickers.push({
          id: element.MarketName,
          bittrex: {
            last: element.Last,
            bid: element.Bid,
            ask: element.Ask,
          },
          liqui: {},
          binance: {},
          poloniex: {},
          cryptopia: {},
          hitbtc: {},
          livecoin: {},
        });

      }
      else if (ticker == null) {
        return;
      }
      else {
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
}

async function PoloniexTickers(inizializza) {
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

      var ticker = tickers.find(x => x.id === key.replace('_', '-'));

      if (ticker == null && inizializza) // nuovo, lo inserisco
      {
        tickers.push({
          id: key.replace('_', '-'),
          poloniex: {
            last: obj[key].last,
            ask: parseFloat(obj[key].lowestAsk),
            bid: parseFloat(obj[key].highestBid)
          },
          liqui: {},
          binance: {},
          bittrex: {},
          hitbtc: {},
          cryptopia: {},
          livecoin: {},
        });
      }
      else if (ticker == null) {
        return;
      }
      else {
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
}

async function BinanceTickers(inizializza) {
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
          liqui: {},
          bittrex: {},
          poloniex: {},
          cryptopia: {},
          hitbtc: {},
          livecoin: {}
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

app.get('/tickers', (req, res) => {

  var json = {
    data: tickers
  };

  res.contentType('application/json');
  res.send(JSON.stringify(json));
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

async function CryptopiaTickers(inizializza) {
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

      var ticker = tickers.find(x => x.id === basecurrency + "-" + currency);

      if (ticker == null && inizializza) // nuovo, lo inserisco
      {
        tickers.push({
          id: basecurrency + "-" + currency,
          bittrex: {},
          binance: {},
          poloniex: {},
          liqui: {},
          cryptopia: {
            last: element.LastPrice,
            bid: element.BidPrice,
            ask: element.AskPrice
          },
          livecoin: {},
          hitbtc: {}
        });
      }
      else if (ticker == null) {
        return;
      }
      else {
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

function calcPerc(ticker) {
  var arr = [];

  if (ticker.poloniex.last != undefined)
    arr.push(ticker.poloniex.last);
  if (ticker.bittrex.last != undefined)
    arr.push(ticker.bittrex.last);
  if (ticker.cryptopia.last != undefined)
    arr.push(ticker.cryptopia.last);
  if (ticker.binance.last != undefined)
    arr.push(ticker.binance.last);

  var min = Math.min(...arr);
  var max = Math.max(...arr);

  return (((max / min) * 100) - 100);
}

async function YobitTickers() {
  var apiUrlAssetPairs = 'https://yobit.net/api/3/info',
    apiUrlTicker = 'https://yobit.net/api/3/ticker/'


  await request.get(apiUrlAssetPairs, (error, response, body) => {

    if (error || response.statusCode != 200)
      return;

    let assetPairs = JSON.parse(body);
    var assetPairsFiltered = Object.keys(assetPairs.pairs).filter(x => x.endsWith("_btc"));

    var urlTicker = apiUrlTicker + assetPairsFiltered.join('-');
    request.get(urlTicker, (error, response, body) => {

      if (error || response.statusCode != 200)
        return;

      let json = JSON.parse(body);

      if (json.error.length > 0) {
        console.log(json.error);
      }

      Object.keys(json.result).forEach(function (key) {

        var ticker = tickers.find(x => x.id === key.replace('_', '-'));

        if (ticker == null) // nuovo, lo inserisco
        {
          tickers.push({
            id: key.replace('_', '-'),
            poloniex: {
              last: obj[key].last
            },
            liqui: {},
            binance: {},
            bittrex: {},
            percentage: 0,
          });

        }
        else {
          ticker.poloniex.last = obj[key].last;
        }
      });

      var a = "a";
    });

  });
}

async function KrakenTickers() {
  var apiUrlAssetPairs = 'https://api.kraken.com/0/public/AssetPairs',
    apiUrlTicker = 'https://api.kraken.com/0/public/Ticker?pair='


  request.get(apiUrlAssetPairs, (error, response, body) => {

    if (error || response.statusCode != 200)
      return;

    let assetPairs = JSON.parse(body);
    var urlTicker = apiUrlTicker + Object.keys(assetPairs.result).join(',');
    request.get(urlTicker, (error, response, body) => {

      if (error || response.statusCode != 200)
        return;

      let json = JSON.parse(body);

      if (json.error.length > 0) {
        console.log(json.error);
      }

      Object.keys(json.result).forEach(function (key) {

        var ticker = tickers.find(x => x.id === key.replace('_', '-'));

        if (ticker == null) // nuovo, lo inserisco
        {
          tickers.push({
            id: key.replace('_', '-'),
            poloniex: {
              last: obj[key].last
            },
            binance: {},
            bittrex: {},
            percentage: 0,
          });

        }
        else {
          ticker.poloniex.last = obj[key].last;
        }
      });
    });
  });

}














