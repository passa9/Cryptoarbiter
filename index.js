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
  await YobitTickers();
  //  await KrakenTickers();
  update();
}
init();

var tickers = [];

function update() {
  setInterval(function () {
    BittrexTickers();
    BinanceTickers();
    PoloniexTickers();
  }, 3000);
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
            last: element.Last
          },
          binance: {},
          poloniex: {}
        });

      }
      else {
        ticker.bittrex.last = element.Last;
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
            last: obj[key].last
          },
          binance: {},
          bittrex: {}
        });

      }
      else {
        ticker.poloniex.last = obj[key].last;
      }
    });
  });
}

function BinanceTickers() {
  const url =
    "https://api.binance.com/api/v3/ticker/price";
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
            last: element.price
          },
          bittrex: {},
          poloniex: {}
        });

      }
      else {
        ticker.binance.last = element.price;
      }

    });

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


const port = 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});






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
            binance: {},
            bittrex: {}
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
            bittrex: {}
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














