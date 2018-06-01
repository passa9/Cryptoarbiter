const request = require("request-promise");
var tickers = require('./../common/variables').tickers;
var queueHitBTC = require('./../common/variables').queueHitBTC;
var lastupdateWs = require("./../index").lastUpdateWS;

const HitBTC = {
    getTickers: async function (inizializza) {
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
                var base;
                var quote;
                var basecurrency;
                var currency;

                if (element.symbol.endsWith("USDT")) {
                    base = "USDT";
                    basecurrency = "USDT";
                    currency = element.symbol.substring(0, element.symbol.length - 4);
                }
                else if (element.symbol.endsWith("USD")) {
                    base = "USD";
                    basecurrency = "USDT"
                    currency = element.symbol.substring(0, element.symbol.length - 3);
                }
                else {
                    base =element.symbol.substring(element.symbol.length - 3, element.symbol.length);
                    basecurrency = element.symbol.substring(element.symbol.length - 3, element.symbol.length);
                    currency = element.symbol.substring(0, element.symbol.length - 3);
                }
                quote = currency;
                if (currency == 'EMGO') {
                    currency = 'MGO';
                }

                var ticker = tickers.find(x => x.id === basecurrency + '-' + currency);

                if (ticker == null && inizializza) // nuovo, lo inserisco
                {
                    tickers.push({
                        id: basecurrency + '-' + currency,
                        binance: {},
                        hitbtc: {
                            base: base,
                            quote: quote,
                            status: "ok",
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
                        bitfinex: {},
                        huobipro: {}
                    });
                }
                else if (ticker == null) {
                    return;
                }
                else {
                    if (inizializza) {
                        ticker.hitbtc.base = base;
                        ticker.hitbtc.quote = quote;
                        ticker.hitbtc.status = "ok";
                      }

                    ticker.hitbtc.last = element.last;
                    ticker.hitbtc.ask = parseFloat(element.ask);
                    ticker.hitbtc.bid = parseFloat(element.bid);
                }
                count++;
            });

            if (inizializza) {
                while (count != json.length) { }
            }
            lastupdateWs("hitbtc");
            return;

        });
    },
    startDequequeOrderbook: function () {
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
    },
    getCurrencies: async function (inizializza) {
        const url =
            "https://api.hitbtc.com/api/2/public/currency";
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
               
                var quoteCurrency = element.id;

                var tickersFound = tickers.filter(x => x.hitbtc.quote === quoteCurrency);

                tickersFound.forEach(ticker =>{
                    if(ticker != undefined)
                    {
                        if(!element.payinEnabled && !element.payoutEnabled)
                        {
                            ticker.hitbtc.status = "locked"
                        }
                        else if(!element.payinEnabled)
                        {
                            ticker.hitbtc.status = "depositDisabled"
                        }
                        else if(!element.payoutEnabled)
                        {
                            ticker.hitbtc.status = "withdrawalsDisabled"
                        }
                        else
                        {
                            ticker.hitbtc.status = "ok"
                        }
                    }
                });
               
            });
        });
    }
};

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

exports.HitBTC = HitBTC;