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