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


var tickers = [];

setInterval( function () {
  BittrexTickers();
}, 3000 );

function BittrexTickers() {
  const url =
    "https://bittrex.com/api/v1.1/public/getmarketsummaries";
  request.get(url, (error, response, body) => {

    let json = JSON.parse(body);

    if (!json.success)
      console.log(json.message);
    json.result.forEach(element => {
      var ticker = tickers.find(x => x.id === element.MarketName);

      if (ticker == null) // nuovo, lo inserisco
      {
        tickers.push({
          id: element.MarketName,
          bittrex: {
            last: element.Last
          }
        });

      }
      else {
        ticker.bittrex.last = element.Last;
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