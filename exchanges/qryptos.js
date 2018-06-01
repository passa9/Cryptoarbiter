const request = require("request-promise");
var tickers = require('./../common/variables').tickers;
var queueQryptos = require('./../common/variables').queueQryptos;
var lastupdateWs = require("./../index").lastUpdateWS;

var lstId = [];

const Qryptos = {
    getTickers: async function (inizializza) {
        const url =
            "https://api.qryptos.com/products";
        return request.get(url, (error, response, body) => {

            if (error || response.statusCode != 200) {
                console.log("Errore qryptos");
                return;
            }

            let json = JSON.parse(body);

            if (json == null)
                return;
            var count = 0;
            json = json.filter(x => { return !x.disabled });
            json.forEach(element => {

                if (element.disabled) {
                    return;
                }

                var basecurrency = element.quoted_currency;
                var currency = element.base_currency;
                var quoteCurrency = element.base_currency;

                if (inizializza) {

                    lstId.push({
                        id: element.id,
                        base: basecurrency,
                        quote: currency
                    }); 
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
                        cryptopia: {},
                        qryptos: {
                            base: basecurrency,
                            quote: quoteCurrency,
                            status: "ok",
                            last: 0,
                            bid: element.market_bid,
                            ask: element.market_ask
                        },
                        hitbtc: {},
                        bitfinex: {},
                        huobipro: {}
                    });
                }
                else if (ticker == null) {
                    return;
                }
                else {
                    if (inizializza) {
                        ticker.qryptos.base = basecurrency;
                        ticker.qryptos.quote = quoteCurrency;
                        ticker.qryptos.status = "ok";
                    }
                    ticker.qryptos.last = 0;
                    ticker.qryptos.bid = element.market_bid;
                    ticker.qryptos.ask = element.market_ask;
                }

                count++;
            });

            if (inizializza) {
                while (count != json.length) { }
            }
            lastupdateWs("qryptos");
            return;

        });
    }

    ,
    startDequequeOrderbook: function () {
        setInterval(async function () {
            if (queueQryptos.length > 0) {
                var data = queueQryptos.shift();
                var res = data.res;
                var json = await getOrderBookQryptos(data.funct.market, data.funct.type);
                res.contentType('application/json');
                res.send(JSON.stringify({
                    link: "https://home.qryptos.com/basic/" + data.funct.market.split("-")[1] + data.funct.market.split("-")[0],
                    arr: json,
                }));
            }
        }, 1000);
    }
};


async function getOrderBookQryptos(market, type) {

    var data;
    
        var basecurrency = market.split("-")[0];
        var quotecurrency = market.split("-")[1];
    
        var pair = lstId.filter(function (x) { return x.base == basecurrency && x.quote == quotecurrency });
        var id = pair[0].id;
    
        const url = "https://api.qryptos.com/products/" + id + "/price_levels";
    
        await request.get(url, (error, response, body) => {
    
            if (error || response.statusCode != 200) {
                console.log("Errore qryptos");
                return [];
            }
    
            let json = JSON.parse(body);
    
            if (type == "bid") {
                data = json.buy_price_levels;
            }
            else {
                data = json.sell_price_levels;
            }
    
            var dim = (data.length - 1 < 10 ? data.length - 1 : 10);
            data = data.splice(0, dim).map(function (i) {
                return {
                    Rate: i[0],
                    Quantity: i[1]
                }
            });
    
        });
    
        return data;
}

exports.Qryptos = Qryptos;