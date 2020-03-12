const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const request = require("request-promise");

var expressWs = require('express-ws')
expressWs = expressWs(express());
var app = expressWs.app;

app.ws('/lastupdate', function (ws, req) {});
lastupdateWs = expressWs.getWss('/lastupdate');

exports.lastUpdateWS = function (exchange) {
  lastupdateWs.clients.forEach(function (client) {

    var data = {
      exchange: exchange,
      date: new Date()
    }
    client.send(JSON.stringify(data));
  });
};

const Bittrex = require('./exchanges/bittrex').Bittrex;
const Binance = require('./exchanges/binance').Binance;
const Poloniex = require('./exchanges/poloniex').Poloniex;
const HitBTC = require('./exchanges/hitbtc').HitBTC;
const Bitfinex = require('./exchanges/bitfinex').Bitfinex;
const Exmo = require('./exchanges/exmo').Exmo;
const Qryptos = require('./exchanges/qryptos').Qryptos;

var tickers = require("./common/variables.js").tickers;

var queueBittrex = require("./common/variables.js").queueBittrex;
var queuePoloniex = require("./common/variables.js").queuePoloniex;
var queueBinance = require("./common/variables.js").queueBinance;
var queueHitBTC = require("./common/variables.js").queueHitBTC;
var queueBitfinex = require("./common/variables.js").queueBitfinex;
var queueExmo = require("./common/variables.js").queueExmo;
var queueQryptos = require("./common/variables.js").queueQryptos;


// Application insights
const appInsights = require("applicationinsights");
appInsights.setup("26c089d4-a984-4155-9dd3-6c3890d64b9b")
  .setAutoCollectDependencies(false)
  .start();

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
  } else if (exchange == "Poloniex") {
    queuePoloniex.push(params);
  } else if (exchange == "Binance") {
    queueBinance.push(params);
  } else if (exchange == "Hitbtc") {
    queueHitBTC.push(params);
  } else if (exchange == "Bitfinex") {
    queueBitfinex.push(params);
  } else if (exchange == "Exmo") {
    queueExmo.push(params);
  } else if (exchange == "Qryptos") {
    queueQryptos.push(params);
  }
}


Bittrex.startDequequeOrderbook();
Poloniex.startDequequeOrderbook();
Binance.startDequequeOrderbook();
HitBTC.startDequequeOrderbook();
Bitfinex.startDequequeOrderbook();
Exmo.startDequequeOrderbook();
Qryptos.startDequequeOrderbook();

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({
  extended: false
}));
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

// Index Route
app.post('/setAlert', (req, res) => {

  var options = {
    method: 'POST',
    uri: 'http://bot-crypto-arbitrage.herokuapp.com/setAlert',
    body: req.body,
    json: true // Automatically stringifies the body to JSON
  };

  request(options)
    .then(function (parsedBody) {
      // POST succeeded...
      res.json(parsedBody);
    })
    .catch(function (err) {
      // POST failed...
      res.json(err);
    });
});

// Notifications Route
app.get('/Notifications', (req, res) => {
  const title = 'Notifications';
  res.render('notifications', {
    title: title
  });
});

app.get('/Exchanges', (req, res) => {
  const title = 'Exchanges';
  res.render('exchanges', {
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
    await Bittrex.getTickers(true);
  } catch (e) {
    console.log(e);
  }
  try {
    await Binance.getTickers(true);
  } catch (e) {
    console.log(e);
  }
  try {
    await Poloniex.getTickers(true);
  } catch (e) {
    console.log(e);
  }
  try {
    await HitBTC.getTickers(true);
  } catch (e) {
    console.log(e);
  }
  try {
    await Bitfinex.getTickers(true);
  } catch (e) {
    console.log(e);
  }
  try {
    await Exmo.getTickers(true);
  } catch (e) {
    console.log(e);
  }
  try {
    await Qryptos.getTickers(true);
  } catch (e) {
    console.log(e);
  }

  try {
    setTimeout(function () {
      RemoveAloneMarkets().then(function () {
        updateStatus();
        updateTickers();
        updateTickersSlow();
      })
    }, 5000);

  } catch (e) {}
}

function updateStatus() {
  setInterval(function () {
    Poloniex.getCurrencies();
    Bittrex.getCurrencies();
    HitBTC.getCurrencies();
  }, 30000)
}

init();

function updateTickers() {
  setInterval(function () {
    Bittrex.getTickers(false);
    Binance.getTickers(false);
    Poloniex.getTickers(false);
    HitBTC.getTickers(false);
    Exmo.getTickers(false);
    Qryptos.getTickers(false);
  }, 4000);
}

function updateTickersSlow() {
  setInterval(function () {
    Bitfinex.getTickers(false);
  }, 6000);
}

async function RemoveAloneMarkets() {

  var arr = [];

  for (var i = 0; i < tickers.length; i++) {

    var arr = [];

    if (tickers[i].poloniex.ask != undefined)
      arr.push(1);
    if (tickers[i].bittrex.ask != undefined)
      arr.push(1);
    if (tickers[i].binance.ask != undefined)
      arr.push(1);
    if (tickers[i].hitbtc.ask != undefined)
      arr.push(1);
    if (tickers[i].bitfinex.ask != undefined)
      arr.push(1);
    if (tickers[i].exmo.ask != undefined)
      arr.push(1);
    if (tickers[i].qryptos.status != undefined)
      arr.push(1);

    if (arr.length < 2) {
      tickers.splice(i, 1);
      i = i - 1;
    }
  }
}

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});