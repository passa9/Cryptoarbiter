
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const https = require('https');
const request = require("request-promise");

// https://api.kraken.com/0/public/Ticker?pair=BCHEUR,BCHUSD,BCHXBT,DASHEUR,DASHUSD,DASHXBT,EOSETH,EOSEUR,EOSUSD,EOSXBT,GNOETH,GNOEUR,GNOUSD,GNOXBT,USDTUSD,ETCETH,ETCXBT,ETCEUR,ETCUSD,ETHXBT,ETHXBT.d,ETHCAD,ETHCAD.d,ETHEUR,ETHEUR.d,ETHGBP,ETHGBP.d,ETHJPY,ETHJPY.d,ETHUSD,ETHUSD.d,ICNETH,ICNXBT,LTCXBT,LTCEUR,LTCUSD,MLNETH,MLNXBT,REPETH,REPXBT,REPEUR,REPUSD,XBTCAD,XBTCAD.d,XBTEUR,XBTEUR.d,XBTGBP,XBTGBP.d,XBTJPY,XBTJPY.d,XBTUSD,XBTUSD.d,XDGXBT,XLMXBT,XLMEUR,XLMUSD,XMRXBT,XMREUR,XMRUSD,XRPXBT,XRPCAD,XRPEUR,XRPJPY,XRPUSD,ZECXBT,ZECEUR,ZECJPY,ZECUSD

const app = express();

// Application insights
const appInsights = require("applicationinsights");
appInsights.setup("26c089d4-a984-4155-9dd3-6c3890d64b9b")
  .setAutoCollectDependencies(false)
  .start();

var queueBittrex = [];
var queuePoloniex = [];
var queueBinance = [];
var queueCryptopia = [];
var queueLivecoin = [];
var queueLiqui = [];
var queueHitBTC = [];

async function getOrderBook(exchange, type, market, res) {

  var params = {
    funct: {
      type: type,
      market: market
    },
    res: res
  };
  if (exchange == "Bittrex") {
    queueBittrex.push(params);

  }
  else if (exchange == "Poloniex") {
    queuePoloniex.push(params);
  }
  else if (exchange == "Binance") {
    queueBinance.push(params);
  }
  else if (exchange == "Cryptopia") {
    queueCryptopia.push(params);
  }
  else if (exchange == "Livecoin") {
    queueLivecoin.push(params);
  }
  else if (exchange == "Liqui") {
    queueLiqui.push(params);
  }
  else if (exchange == "HitBTC") {
    queueHitBTC.push(params);
  }
}
// Bittrex
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

// Poloniex
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

// Binance
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

// Cryptopia
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

// Livecoin
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

// Liqui
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

// HitBTC
setInterval(async function () {
  if (queueHitBTC.length > 0) {
    var data = queueHitBTC.shift();
    var res = data.res;
    var json = await getOrderBookHitBTC(data.funct.market, data.funct.type);
    res.contentType('application/json');
    res.send(JSON.stringify({
      link: "https://hitbtc.com/exchange/" + data.funct.market.split("-")[1] + "-to-" + data.funct.market.split("-")[0],
      arr: json,
    }));
  }
}, 1000);

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

async function getOrderBookCryptopia(market, type) {

  var data;

  const url = "https://www.cryptopia.co.nz/api/GetMarketOrders/" + market.split("-")[1] + "_" + market.split("-")[0] + "/10";

  var a = "asdasdasdasd";
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

async function getOrderBookHitBTC(market, type) {

  var data;
  const url =
    "https://api.hitbtc.com/api/2/public/orderbook/" + market.split("-", )[1] + market.split("-", )[0].replace("USDT", "USD") + "?limit=10";
  await request.get(url, (error, response, body) => {

    if (error || response.statusCode != 200) {
      console.log("Errore HitBTC");
      return [];
    }

    let json = JSON.parse(body);

    if (type == "bid") {
      data = json.bid;
    }
    else {
      data = json.ask;
    }
    var dim = (data.length - 1 < 10 ? data.length - 1 : 10);
    data = data.splice(0, dim);
  });

  return data.map(function (i) {
    return {
      Rate: i.price,
      Quantity: i.size
    }
  });
}

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

app.get('/getorderbook', async (req, res) => {

  var exchange = req.query.exchange;
  var type = req.query.type;
  var pair = req.query.market;
  getOrderBook(exchange, type, pair, res);
});

app.get('/tickers', (req, res) => {

  var json = {
    data: tickers
  };

  res.contentType('application/json');
  res.send(JSON.stringify(json));
});

async function init() {

  try {
    await BittrexTickers(true);
  }
  catch (e) { }
  try {
    await BinanceTickers(true);
  }
  catch (e) { }
  try {
    await PoloniexTickers(true);
  }
  catch (e) { }
  try {
    await CryptopiaTickers(true);
  }
  catch (e) { }
  try {
    await LivecoinTickers(true);
  }
  catch (e) { }
  try {
    await HitBTCTickers(true);
  }
  catch (e) { }
  try {
    await BitfinexTickers(true);
  }
  catch (e) { }
  try {
    await ExmoTickers(true);
  }
  catch (e) { }
  try {
    await MappingIdLiqui();
    await LiquiTickers(true);
  }
  catch (e) { }
  try {
    await RemoveAloneMarkets();
  }
  catch (e) { }
  update();


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
    ExmoTickers(false);

  }, 3000);
}
function updateLow() {
  setInterval(function () {
    BitfinexTickers(false);

  }, 5000);
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
    if (tickers[i].bitfinex.ask != undefined)
      arr.push(tickers[i].bitfinex.ask);
      if (tickers[i].exmo.ask != undefined)
      arr.push(tickers[i].exmo.ask);

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
      else if (element.symbol.endsWith("USD")) {
        basecurrency = "USDT"
        currency = element.symbol.substring(0, element.symbol.length - 3);
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
          exmo: {},
          liqui: {},
          bittrex: {},
          poloniex: {},
          cryptopia: {},
          livecoin: {},
          bitfinex: {}
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
          exmo: {},
          livecoin: {},
          bitfinex: {}
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

      var basecurrency = key.split('_')[0];
      var currency = key.split('_')[1];
      if (currency == "BTM") {
        currency = "Bitmark";
      }

      var ticker = tickers.find(x => x.id === (basecurrency + "-" + currency));

      if (ticker == null && inizializza) // nuovo, lo inserisco
      {
        tickers.push({
          id: (basecurrency + "-" + currency),
          poloniex: {
            last: obj[key].last,
            ask: parseFloat(obj[key].lowestAsk),
            bid: parseFloat(obj[key].highestBid)
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

async function ExmoTickers(inizializza) {
  const url =
    "https://api.exmo.com/v1/ticker/";
  return request.get(url, (error, response, body) => {

    if (error || response.statusCode != 200) {
      console.log("Errore exmo");
      return;
    }

    let obj = JSON.parse(body);
    var count = 0;
    Object.keys(obj).forEach(key => {

      var basecurrency = key.split('_')[1];
      var currency = key.split('_')[0];

      var ticker = tickers.find(x => x.id === (basecurrency + "-" + currency));

      if (ticker == null && inizializza) // nuovo, lo inserisco
      {
        tickers.push({
          id: (basecurrency + "-" + currency),
          exmo: {
            last: obj[key].last_trade,
            ask: parseFloat(obj[key].sell_price),
            bid: parseFloat(obj[key].buy_price)
          },
          poloniex: {},
          liqui: {},
          binance: {},
          bittrex: {},
          hitbtc: {},
          cryptopia: {},
          livecoin: {},
          bitfinex: {}
        });
      }
      else if (ticker == null) {
        return;
      }
      else {
        ticker.exmo.last = obj[key].last_trade;
        ticker.exmo.bid = parseFloat(obj[key].buy_price);
        ticker.exmo.ask = parseFloat(obj[key].sell_price);
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

async function BitfinexTickers(inizializza) {
  const url =
    "https://api.bitfinex.com/v2/tickers?symbols=BTCUSD,tLTCUSD,tLTCBTC,tETHUSD,tETHBTC,tETCBTC,tETCUSD,tRRTUSD,tRRTBTC,tZECUSD,tZECBTC,tXMRUSD,tXMRBTC,tDSHUSD,tDSHBTC,tBTCEUR,tBTCJPY,tXRPUSD,tXRPBTC,tIOTUSD,tIOTBTC,tIOTETH,tEOSUSD,tEOSBTC,tEOSETH,tSANUSD,tSANBTC,tSANETH,tOMGUSD,tOMGBTC,tOMGETH,tBCHUSD,tBCHBTC,tBCHETH,tNEOUSD,tNEOBTC,tNEOETH,tETPUSD,tETPBTC,tETPETH,tQTMUSD,tQTMBTC,tQTMETH,tAVTUSD,tAVTBTC,tAVTETH,tEDOUSD,tEDOBTC,tEDOETH,tBTGUSD,tBTGBTC,tDATUSD,tDATBTC,tDATETH,tQSHUSD,tQSHBTC,tQSHETH,tYYWUSD,tYYWBTC,tYYWETH,tGNTUSD,tGNTBTC,tGNTETH,tSNTUSD,tSNTBTC,tSNTETH,tIOTEUR,tBATUSD,tBATBTC,tBATETH,tMNAUSD,tMNABTC,tMNAETH,tFUNUSD,tFUNBTC,tFUNETH,tZRXUSD,tZRXBTC,tZRXETH,tTNBUSD,tTNBBTC,tTNBETH,tSPKUSD,tSPKBTC,tSPKETH,tTRXUSD,tTRXBTC,tTRXETH,tRCNUSD,tRCNBTC,tRCNETH,tRLCUSD,tRLCBTC,tRLCETH,tAIDUSD,tAIDBTC,tAIDETH,tSNGUSD,tSNGBTC,tSNGETH,tREPUSD,tREPBTC,tREPETH,tELFUSD,tELFBTC,tELFETH,tBTCGBP,tETHEUR,tETHJPY,tETHGBP,tNEOEUR,tNEOJPY,tNEOGBP,tEOSEUR,tEOSJPY,tEOSGBP,tIOTJPY,tIOTGBP";
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

      basecurrency = element[0].substring(element[0].length - 3, element[0].length);
      currency = element[0].substring(1, element[0].length - 3);

      var ticker = tickers.find(x => x.id === basecurrency + '-' + currency);

      if (ticker == null && inizializza) // nuovo, lo inserisco
      {
        tickers.push({
          id: basecurrency + '-' + currency,
          bitfinex: {
            last: element[7],
            ask: parseFloat(element[3]),
            bid: parseFloat(element[1])
          },
          binance: {},
          exmo: {},
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
        ticker.bitfinex.last = element.price;
        ticker.bitfinex.ask = parseFloat(element[3]);
        ticker.bitfinex.bid = parseFloat(element[1]);
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
            last: element.LastPrice,
            bid: element.BidPrice,
            ask: element.AskPrice
          },
          livecoin: {},
          hitbtc: {},
          bitfinex : {}
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














