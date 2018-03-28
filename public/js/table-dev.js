$(document).ready(function () {
    var table = $('#table').DataTable({
        "ajax": location.protocol + '//' + location.host + '/tickers',
        responsive: true,
        fixedHeader: true,
        iDisplayLength: 50,
        "order": [[8, "desc"]],

        "columns": [
            {
                "data": "id", "orderable": true,
            },
            {
                "data": "bittrex", "orderable": true, render: function (data, type, row, meta) {

                    if (data.bid == undefined)
                        return "-";

                    var differenceBid = compare(meta, data.bid, "bid");
                    var differenceAsk = compare(meta, data.ask, "ask");

                    var min = low(row, data.ask, "Bittrex");
                    var max = high(row, data.bid, "Bittrex");

                    var cell = "";
                    cell += '<div style="display:absolute;margin:0;padding:0">';

                    if (min && max) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:blue;right:2px;bottom:-2px;"></i>'; // style="position:absolute;left:2%;bottom:-0.8px;width:6px;color:green"
                    }
                    else if (min) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:red;right:2px;bottom:-2px;"></i>'; // style="position:absolute;left:2%;bottom:-0.8px;width:6px;color:green"
                    }
                    else if (max) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:green;right:2px;bottom:-2px;"></i>';
                    }
                    cell += '<div class="divTable"><div class="divTableBody"><div class="divTableRow"><div class="divTableCell">'
                    cell += '<font size="2">';
                    if (differenceAsk == 1) {
                        cell +=  '<a href="javascript:void(0)" data-exchange="Bittrex" data-type="ask" data-pair="'+ row.id +'"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Bittrex" data-type="ask" data-pair="'+ row.id +'"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Bittrex" data-type="ask" data-pair="'+ row.id +'" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    cell += '</font>'
                    cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                    cell += '<font size="2">';
                    if (differenceBid == 1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Bittrex" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Bittrex" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Bittrex" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    '</div></div></div></div>';

                    cell += '</div>';

                    return cell;

                }
            },
            {
                "data": "binance", "orderable": true, render: function (data, type, row, meta) {

                    if (data.bid == undefined)
                        return "-";

                    var differenceBid = compare(meta, data.bid, "bid");
                    var differenceAsk = compare(meta, data.ask, "ask");

                    var min = low(row, data.ask, "Binance");
                    var max = high(row, data.bid, "Binance");

                    var cell = "";
                    cell += '<div style="display:absolute;margin:0;padding:0">';

                    if (min && max) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:blue;right:2px;bottom:-2px;"></i>'; // style="position:absolute;left:2%;bottom:-0.8px;width:6px;color:green"
                    }
                    else if (min) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:red;right:2px;bottom:-2px;"></i>'; // style="position:absolute;left:2%;bottom:-0.8px;width:6px;color:green"
                    }
                    else if (max) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:green;right:2px;bottom:-2px;"></i>';
                    }
                    cell += '<div class="divTable"><div class="divTableBody"><div class="divTableRow"><div class="divTableCell">'
                    cell += '<font size="2">';
                    if (differenceAsk == 1) {
                        cell +=  '<a href="javascript:void(0)" data-exchange="Binance" data-type="ask" data-pair="'+ row.id +'"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Binance" data-type="ask" data-pair="'+ row.id +'"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Binance" data-type="ask" data-pair="'+ row.id +'" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    cell += '</font>'
                    cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                    cell += '<font size="2">';
                    if (differenceBid == 1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Binance" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Binance" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Binance" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    '</div></div></div></div>';

                    cell += '</div>';

                    return cell;

                }
            },
            {
                "data": "poloniex", "orderable": true, render: function (data, type, row, meta) {

                    if (data.bid == undefined)
                        return "-";

                    var differenceBid = compare(meta, data.bid, "bid");
                    var differenceAsk = compare(meta, data.ask, "ask");

                    var min = low(row, data.ask, "Bittrex");
                    var max = high(row, data.bid, "Bittrex");

                    var cell = "";
                    cell += '<div style="display:absolute;margin:0;padding:0">';

                    if (min && max) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:blue;right:2px;bottom:-2px;"></i>'; // style="position:absolute;left:2%;bottom:-0.8px;width:6px;color:green"
                    }
                    else if (min) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:red;right:2px;bottom:-2px;"></i>'; // style="position:absolute;left:2%;bottom:-0.8px;width:6px;color:green"
                    }
                    else if (max) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:green;right:2px;bottom:-2px;"></i>';
                    }
                    cell += '<div class="divTable"><div class="divTableBody"><div class="divTableRow"><div class="divTableCell">'
                    cell += '<font size="2">';
                    if (differenceAsk == 1) {
                        cell +=  '<a href="javascript:void(0)" data-exchange="Poloniex" data-type="ask" data-pair="'+ row.id +'"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Poloniex" data-type="ask" data-pair="'+ row.id +'"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Poloniex" data-type="ask" data-pair="'+ row.id +'" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    cell += '</font>'
                    cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                    cell += '<font size="2">';
                    if (differenceBid == 1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Poloniex" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Poloniex" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Poloniex" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    '</div></div></div></div>';

                    cell += '</div>';

                    return cell;

                }
            },
            {
                "data": "cryptopia", "orderable": true, render: function (data, type, row, meta) {

                    if (data.bid == undefined)
                        return "-";

                    var differenceBid = compare(meta, data.bid, "bid");
                    var differenceAsk = compare(meta, data.ask, "ask");

                    var min = low(row, data.ask, "Cryptopia");
                    var max = high(row, data.bid, "Cryptopia");

                    var cell = "";
                    cell += '<div style="display:absolute;margin:0;padding:0">';

                    if (min && max) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:blue;right:2px;bottom:-2px;"></i>'; // style="position:absolute;left:2%;bottom:-0.8px;width:6px;color:green"
                    }
                    else if (min) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:red;right:2px;bottom:-2px;"></i>'; // style="position:absolute;left:2%;bottom:-0.8px;width:6px;color:green"
                    }
                    else if (max) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:green;right:2px;bottom:-2px;"></i>';
                    }
                    cell += '<div class="divTable"><div class="divTableBody"><div class="divTableRow"><div class="divTableCell">'
                    cell += '<font size="2">';
                    if (differenceAsk == 1) {
                        cell +=  '<a href="javascript:void(0)" data-exchange="Cryptopia" data-type="ask" data-pair="'+ row.id +'"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Cryptopia" data-type="ask" data-pair="'+ row.id +'"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Cryptopia" data-type="ask" data-pair="'+ row.id +'" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    cell += '</font>'
                    cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                    cell += '<font size="2">';
                    if (differenceBid == 1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Cryptopia" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Cryptopia" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Cryptopia" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    '</div></div></div></div>';

                    cell += '</div>';

                    return cell;

                }
            },
            {
                "data": "livecoin", "orderable": true, render: function (data, type, row, meta) {

                    if (data.bid == undefined)
                        return "-";

                    var differenceBid = compare(meta, data.bid, "bid");
                    var differenceAsk = compare(meta, data.ask, "ask");

                    var min = low(row, data.ask, "Livecoin");
                    var max = high(row, data.bid, "Livecoin");

                    var cell = "";
                    cell += '<div style="display:absolute;margin:0;padding:0">';

                    if (min && max) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:blue;right:2px;bottom:-2px;"></i>'; // style="position:absolute;left:2%;bottom:-0.8px;width:6px;color:green"
                    }
                    else if (min) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:red;right:2px;bottom:-2px;"></i>'; // style="position:absolute;left:2%;bottom:-0.8px;width:6px;color:green"
                    }
                    else if (max) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:green;right:2px;bottom:-2px;"></i>';
                    }
                    cell += '<div class="divTable"><div class="divTableBody"><div class="divTableRow"><div class="divTableCell">'
                    cell += '<font size="2">';
                    if (differenceAsk == 1) {
                        cell +=  '<a href="javascript:void(0)" data-exchange="Livecoin" data-type="ask" data-pair="'+ row.id +'"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Livecoin" data-type="ask" data-pair="'+ row.id +'"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Livecoin" data-type="ask" data-pair="'+ row.id +'" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    cell += '</font>'
                    cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                    cell += '<font size="2">';
                    if (differenceBid == 1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Livecoin" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Livecoin" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Livecoin" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    '</div></div></div></div>';

                    cell += '</div>';

                    return cell;

                }
            },
            {
                "data": "liqui", "orderable": true, render: function (data, type, row, meta) {

                    if (data.bid == undefined)
                        return "-";

                    var differenceBid = compare(meta, data.bid, "bid");
                    var differenceAsk = compare(meta, data.ask, "ask");

                    var min = low(row, data.ask, "Liqui");
                    var max = high(row, data.bid, "Liqui");

                    var cell = "";
                    cell += '<div style="display:absolute;margin:0;padding:0">';

                    if (min && max) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:blue;right:2px;bottom:-2px;"></i>'; // style="position:absolute;left:2%;bottom:-0.8px;width:6px;color:green"
                    }
                    else if (min) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:red;right:2px;bottom:-2px;"></i>'; // style="position:absolute;left:2%;bottom:-0.8px;width:6px;color:green"
                    }
                    else if (max) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:green;right:2px;bottom:-2px;"></i>';
                    }
                    cell += '<div class="divTable"><div class="divTableBody"><div class="divTableRow"><div class="divTableCell">'
                    cell += '<font size="2">';
                    if (differenceAsk == 1) {
                        cell +=  '<a href="javascript:void(0)" data-exchange="Liqui" data-type="ask" data-pair="'+ row.id +'"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Liqui" data-type="ask" data-pair="'+ row.id +'"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Liqui" data-type="ask" data-pair="'+ row.id +'" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    cell += '</font>'
                    cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                    cell += '<font size="2">';
                    if (differenceBid == 1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Liqui" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Liqui" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Liqui" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    '</div></div></div></div>';

                    cell += '</div>';

                    return cell;

                }
            },
            {
                "data": "hitbtc", "orderable": true, render: function (data, type, row, meta) {

                    if (data.bid == undefined)
                        return "-";

                    var differenceBid = compare(meta, data.bid, "bid");
                    var differenceAsk = compare(meta, data.ask, "ask");

                    var min = low(row, data.ask, "HitBTC");
                    var max = high(row, data.bid, "HitBTC");

                    var cell = "";
                    cell += '<div style="display:absolute;margin:0;padding:0">';

                    if (min && max) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:blue;right:2px;bottom:-2px;"></i>'; // style="position:absolute;left:2%;bottom:-0.8px;width:6px;color:green"
                    }
                    else if (min) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:red;right:2px;bottom:-2px;"></i>'; // style="position:absolute;left:2%;bottom:-0.8px;width:6px;color:green"
                    }
                    else if (max) {
                        cell += '<i class="fas fa-circle" style="position:absolute;width:7px;color:green;right:2px;bottom:-2px;"></i>';
                    }
                    cell += '<div class="divTable"><div class="divTableBody"><div class="divTableRow"><div class="divTableCell">'
                    cell += '<font size="2">';
                    if (differenceAsk == 1) {
                        cell +=  '<a href="javascript:void(0)" data-exchange="HitBTC" data-type="ask" data-pair="'+ row.id +'"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="HitBTC" data-type="ask" data-pair="'+ row.id +'"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="HitBTC" data-type="ask" data-pair="'+ row.id +'" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    cell += '</font>'
                    cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                    cell += '<font size="2">';
                    if (differenceBid == 1) {
                        cell += '<a href="javascript:void(0)" data-exchange="HitBTC" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="HitBTC" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="HitBTC" data-type="bid" data-pair="'+ row.id +'"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    '</div></div></div></div>';

                    cell += '</div>';

                    return cell;

                }
            },
            {
                "data": "null", "orderable": true, render: function (data, type, row, meta) {


                    var min = getMin(row);
                    var max = getMax(row);

                    var percentage;
                    if (min == 0 || max == 0)
                        percentage = 0;
                    else
                        percentage = (((max / min) * 100) - 100);

                    // return '<span style="color:green">' + percentage.toFixed(2) + '</span>';

                    var difference = comparePercentage(percentage, row.id);

                    if (difference == 1) {
                        return '<span style="color:green">' + percentage.toFixed(2) + '</span>'
                    }
                    if (difference == 0) {
                        return '<span >' + percentage.toFixed(2) + '</span>'
                    }
                    if (difference == -1) {
                        return '<span style="color:red">' + percentage.toFixed(2) + '</span>'
                    }

                }
            },

        ],
    });
    var prevTable;
    var prevPercentage = [];


    function compare(meta, value, type) {

        if (prevTable !== undefined) {
            var prev_data;

            if (meta.col == 1) {
                prev_data = prevTable[meta.row].bittrex;
            }
            else if (meta.col == 2) {
                prev_data = prevTable[meta.row].binance;
            }
            else if (meta.col == 3) {
                prev_data = prevTable[meta.row].poloniex;
            }
            else if (meta.col == 4) {
                prev_data = prevTable[meta.row].cryptopia;
            }
            else if (meta.col == 5) {
                prev_data = prevTable[meta.row].livecoin;
            }
            else if (meta.col == 6) {
                prev_data = prevTable[meta.row].liqui;
            }
            else if (meta.col == 7) {
                prev_data = prevTable[meta.row].hitbtc;
            }

            if (prev_data == undefined)
                return 0;

            if (type == "bid") {
                prev_data = prev_data.bid;
            }
            else {
                prev_data = prev_data.ask;
            }

            if (prev_data < value)
                return 1;
            else if (prev_data == value)
                return 0;
            else return -1;

        }
        else
            return 0;

    }

    function comparePercentage(value, pair) {
        var index = prevPercentage.findIndex(x => x.id == pair);

        if (index == -1) {
            prevPercentage.push({ id: pair, value: value })
            return 0;
        }
        else {
            var percentage = prevPercentage[index];

            if (percentage.value < value) {
                prevPercentage[index].value = value;
                return 1;
            }
            else if (percentage.value == value) {
                return 0;
            }
            else {
                prevPercentage[index].value = value;
                return -1;
            }
        }

    }

    setInterval(function () {
        var json = table.ajax.json();
        prevTable = json.data;
        table.ajax.reload(null, false); // user paging is not reset on reload
    }, 3000);

    $('button.toggle-vis').on('click', function (e) {
        e.preventDefault();

        // Get the column API object
        var column = table.column($(this).attr('data-column'));

        // Toggle the visibility
        column.visible(!column.visible());
    });

});


function exchange(element) {
    var icon = element.children[0];

    element.children[0].classList.toggle('fa-square');
    element.children[0].classList.toggle('fa-check-square');
}

function low(row, value, exchange) {
    var arr = [];

    if (row.poloniex.ask != undefined && document.getElementById("btnPoloniex").children[0].classList.contains("fa-check-square"))
        arr.push(row.poloniex.ask);
    if (row.bittrex.ask != undefined && document.getElementById("btnBittrex").children[0].classList.contains("fa-check-square"))
        arr.push(row.bittrex.ask);
    if (row.cryptopia.ask != undefined && document.getElementById("btnCryptopia").children[0].classList.contains("fa-check-square"))
        arr.push(row.cryptopia.ask);
    if (row.binance.ask != undefined && document.getElementById("btnBinance").children[0].classList.contains("fa-check-square"))
        arr.push(row.binance.ask);
    if (row.livecoin.ask != undefined && document.getElementById("btnLivecoin").children[0].classList.contains("fa-check-square"))
        arr.push(row.livecoin.ask);
    if (row.liqui.ask != undefined && document.getElementById("btnLiqui").children[0].classList.contains("fa-check-square"))
        arr.push(row.liqui.ask);
    if (row.hitbtc.ask != undefined && document.getElementById("btnHitBTC").children[0].classList.contains("fa-check-square"))
        arr.push(row.hitbtc.ask);

    var min = Math.min(...arr);

    if (min == value && document.getElementById("btn" + exchange).children[0].classList.contains("fa-check-square"))
        return true;
    else
        return false;
}

function high(row, value, exchange) {
    var arr = [];

    if (row.poloniex.bid != undefined && document.getElementById("btnPoloniex").children[0].classList.contains("fa-check-square"))
        arr.push(row.poloniex.bid);
    if (row.bittrex.bid != undefined && document.getElementById("btnBittrex").children[0].classList.contains("fa-check-square"))
        arr.push(row.bittrex.bid);
    if (row.cryptopia.bid != undefined && document.getElementById("btnCryptopia").children[0].classList.contains("fa-check-square"))
        arr.push(row.cryptopia.bid);
    if (row.binance.bid != undefined && document.getElementById("btnBinance").children[0].classList.contains("fa-check-square"))
        arr.push(row.binance.bid);
    if (row.livecoin.bid != undefined && document.getElementById("btnLivecoin").children[0].classList.contains("fa-check-square"))
        arr.push(row.livecoin.bid);
    if (row.liqui.bid != undefined && document.getElementById("btnLiqui").children[0].classList.contains("fa-check-square"))
        arr.push(row.liqui.bid);
        if (row.hitbtc.bid != undefined && document.getElementById("btnHitBTC").children[0].classList.contains("fa-check-square"))
        arr.push(row.hitbtc.bid);

    var max = Math.max(...arr);

    if (max == value && document.getElementById("btn" + exchange).children[0].classList.contains("fa-check-square"))
        return true;
    else
        return false;
}

function getMin(row) {
    var arr = [];

    if (row.poloniex.ask != undefined && document.getElementById("btnPoloniex").children[0].classList.contains("fa-check-square"))
        arr.push(row.poloniex.ask);
    if (row.bittrex.ask != undefined && document.getElementById("btnBittrex").children[0].classList.contains("fa-check-square"))
        arr.push(row.bittrex.ask);
    if (row.cryptopia.ask != undefined && document.getElementById("btnCryptopia").children[0].classList.contains("fa-check-square"))
        arr.push(row.cryptopia.ask);
    if (row.binance.ask != undefined && document.getElementById("btnBinance").children[0].classList.contains("fa-check-square"))
        arr.push(row.binance.ask);
    if (row.livecoin.ask != undefined && document.getElementById("btnLivecoin").children[0].classList.contains("fa-check-square"))
        arr.push(row.livecoin.ask);
    if (row.liqui.ask != undefined && document.getElementById("btnLiqui").children[0].classList.contains("fa-check-square"))
        arr.push(row.liqui.ask);
        if (row.hitbtc.ask != undefined && document.getElementById("btnHitBTC").children[0].classList.contains("fa-check-square"))
        arr.push(row.hitbtc.ask);

    if (arr.length == 0)
        return 0;

    return Math.min(...arr);
}

function getMax(row) {
    var arr = [];

    if (row.poloniex.bid != undefined && document.getElementById("btnPoloniex").children[0].classList.contains("fa-check-square"))
        arr.push(row.poloniex.bid);
    if (row.bittrex.bid != undefined && document.getElementById("btnBittrex").children[0].classList.contains("fa-check-square"))
        arr.push(row.bittrex.bid);
    if (row.cryptopia.bid != undefined && document.getElementById("btnCryptopia").children[0].classList.contains("fa-check-square"))
        arr.push(row.cryptopia.bid);
    if (row.binance.bid != undefined && document.getElementById("btnBinance").children[0].classList.contains("fa-check-square"))
        arr.push(row.binance.bid);
    if (row.livecoin.bid != undefined && document.getElementById("btnLivecoin").children[0].classList.contains("fa-check-square"))
        arr.push(row.livecoin.bid);
    if (row.liqui.bid != undefined && document.getElementById("btnLiqui").children[0].classList.contains("fa-check-square"))
        arr.push(row.liqui.bid);
        if (row.hitbtc.bid != undefined && document.getElementById("btnHitBTC").children[0].classList.contains("fa-check-square"))
        arr.push(row.hitbtc.bid);

    if (arr.length == 0)
        return 0;

    return Math.max(...arr);

}
