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
              bid: parseFloat(element[1]),
              status : "ok"
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
  
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });