const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const https = require('https');
const request = require("request");

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

async function init() {
  await BittrexTickers();
  await BinanceTickers();
  await PoloniexTickers();
  // await YobitTickers();
  await CryptopiaTickers();
  await LivecoinTickers();

  await MappingIdLiqui();
 
  // await YobitTickers();
  //  await KrakenTickers();
  update();
}
init();

var tickers = [];
var mappingLiqui = [];

function update() {
  setInterval(function () {
    BittrexTickers();
    BinanceTickers();
    PoloniexTickers();
    CryptopiaTickers();
    LivecoinTickers();
    LiquiTickers();

  }, 3000);
}

async function LivecoinTickers() {
  const url =
    "https://api.livecoin.net/exchange/ticker";
  request.get(url, (error, response, body) => {

    if (error || response.statusCode != 200)
      return;
    let json;
    try {
      json = JSON.parse(body);
    }
    catch (e) {
      return;
    }

    json.forEach(element => {

      var basecurrency = element.symbol.split('/')[1];
      var currency = element.symbol.split('/')[0];

      var ticker = tickers.find(x => x.id === basecurrency + "-" + currency);

      if (ticker == null) // nuovo, lo inserisco
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
          bittrex: {}
        });

      }
      else {
        ticker.livecoin.last = element.last;
        ticker.livecoin.bid = element.best_bid;
        ticker.livecoin.ask = element.best_ask;
      }

    });

  });
}

async function LiquiTickers() {
  const url =
    "https://cacheapi.liqui.io/Market/Tickers";
  request.get(url, (error, response, body) => {

    if (error || response.statusCode != 200)
      return;
    let json;
    try {
      json = JSON.parse(body);
    }
    catch (e) {
      return;
    }

    json.forEach(element => {

      var currency = mappingLiqui.find(function (x) { return x.id == element.PairId })

      var ticker = tickers.find(x => x.id === currency.pair);

      if (ticker == null) // nuovo, lo inserisco
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
          bittrex: {}
        });

      }
      else {
        ticker.liqui.last = element.LastPrice;
        ticker.liqui.bid = element.Buy;
        ticker.liqui.ask = element.Sell;
      }

    });

  });
}

async function BittrexTickers() {
  const url =
    "https://bittrex.com/api/v1.1/public/getmarketsummaries";
  request.get(url, (error, response, body) => {

    if (error || response.statusCode != 200)
      return;

    let json = JSON.parse(body);

    if (!json.success) {
      console.log(json.message);
      return;
    }
    json.result.forEach(element => {
      var ticker = tickers.find(x => x.id === element.MarketName);

      if (ticker == null) // nuovo, lo inserisco
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
          livecoin: {},
        });

      }
      else {
        ticker.bittrex.last = element.Last;
        ticker.bittrex.bid = element.Bid;
        ticker.bittrex.ask = element.Ask;
      }

    });

  });
}

async function PoloniexTickers() {
  const url =
    "https://poloniex.com/public?command=returnTicker";
  request.get(url, (error, response, body) => {

    if (error || response.statusCode != 200)
      return;

    let obj = JSON.parse(body);

    Object.keys(obj).forEach(function (key) {

      var ticker = tickers.find(x => x.id === key.replace('_', '-'));

      if (ticker == null) // nuovo, lo inserisco
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
          cryptopia: {},
          livecoin: {},
        });
      }
      else {
        ticker.poloniex.last = obj[key].last;
        ticker.poloniex.bid = parseFloat(obj[key].highestBid);
        ticker.poloniex.ask = parseFloat(obj[key].lowestAsk);
      }
    });
  });
}

function BinanceTickers() {
  const url =
    "https://api.binance.com/api/v3/ticker/bookTicker";
  request.get(url, (error, response, body) => {
    if (error)
      return;

    let json = JSON.parse(body);

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

      if (ticker == null) // nuovo, lo inserisco
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
          livecoin: {}
        });

      }
      else {
        ticker.binance.last = element.price;
        ticker.binance.ask = parseFloat(element.askPrice);
        ticker.binance.bid = parseFloat(element.bidPrice);
      }

    });

  });
}

async function MappingIdLiqui() {
  const url =
    "https://cacheapi.liqui.io/Market/Pairs";
  await request.get(url, async(error, response, body) => {

    if (error || response.statusCode != 200)
      return;
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

    await LiquiTickers();
  });
}

app.get('/tickers', (req, res) => {
  BittrexTickers();
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

async function CryptopiaTickers() {
  const url =
    "https://www.cryptopia.co.nz/api/GetMarkets/";
  request.get(url, (error, response, body) => {

    if (error || response.statusCode != 200)
      return;

    let json = JSON.parse(body);

    if (json == null)
      return;

    json.Data.forEach(element => {

      var basecurrency = element.Label.split("/")[1];
      var currency = element.Label.split("/")[0];

      var ticker = tickers.find(x => x.id === basecurrency + "-" + currency);

      if (ticker == null) // nuovo, lo inserisco
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
          livecoin: {}
        });

      }
      else {
        ticker.cryptopia.last = element.LastPrice;
        ticker.cryptopia.bid = element.BidPrice;
        ticker.cryptopia.ask = element.AskPrice;
      }

    });

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


  request.get(apiUrlAssetPairs, (error, response, body) => {

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














