const request = require("request-promise");
var tickers = require('./../common/variables').tickers;
var queueExmo = require('./../common/variables').queueExmo;

const Exmo = {
    getTickers: async function (inizializza) {
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
                            bid: parseFloat(obj[key].buy_price),
                            base: basecurrency,
                            quote: currency,
                            status: "ok"
                        },
                        poloniex: {},
                        liqui: {},
                        binance: {},
                        bittrex: {},
                        hitbtc: {},
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
                        ticker.exmo.base = basecurrency;
                        ticker.exmo.quote = currency;
                        ticker.exmo.status = "ok";
                    }
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
    },
    startDequequeOrderbook: function () {
        setInterval(async function () {
            if (queueExmo.length > 0) {
                var data = queueExmo.shift();
                var res = data.res;
                var json = await getOrderBookExmo(data.funct.market, data.funct.type);
                res.contentType('application/json');
                res.send(JSON.stringify({
                    link: "https://exmo.com/en/trade#?pair=" + data.funct.market,
                    arr: json,
                }));
            }
        }, 1000);
    },
}

async function getOrderBookExmo(market, type) {

    var data;
    const url = "https://api.exmo.com/v1/order_book/?pair=" + market.split("-")[1] + "_" + market.split("-")[0] + "&limit=10";

    await request.get(url, (error, response, body) => {

        if (error || response.statusCode != 200) {
            console.log("Errore Exmo");
            return [];
        }

        let json = JSON.parse(body);
        var key = Object.keys(json)[0];


        if (type == "bid") {
            data = json[key].bid;
        }
        else {
            data = json[key].ask;
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

exports.Exmo = Exmo;