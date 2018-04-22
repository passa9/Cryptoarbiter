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