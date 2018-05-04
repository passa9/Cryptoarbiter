//This is not production quality, its just demo code.
var cookieList = function (cookieName) {
    //When the cookie is saved the items will be a comma seperated string
    //So we will split the cookie by comma to get the original array
    var cookie = $.cookie(cookieName);
    //Load the items or a new array if null.
    var items = cookie ? cookie.split(/,/) : new Array();

    //Return a object that we can use to access the array.
    //while hiding direct access to the declared items array
    //this is called closures see http://www.jibbering.com/faq/faq_notes/closures.html
    return {
        "add": function (val) {
            //Add to the items.
            items.push(val);


            //Save the items to a cookie.
            //EDIT: Modified from linked answer by Nick see 
            //      http://stackoverflow.com/questions/3387251/how-to-store-array-in-jquery-cookie
            $.cookie(cookieName, items.join(','), { expires: new Date(Date.now() + 2592000000) });
        },
        "remove": function (val) {
            //EDIT: Thx to Assef and luke for remove.
            indx = items.indexOf(val);
            if (indx != -1) items.splice(indx, 1);
            $.cookie(cookieName, items.join(','));
        },
        "clear": function () {
            items = null;
            //clear the cookie.
            $.cookie(cookieName, null);
        },
        "items": function () {
            //Get all the items.
            return items;
        }
    }
}


var table;
var cHiddenPair = cookieList("hiddenPair");
$(document).ready(function () {

    cHiddenPair.items().forEach(element => {
        document.getElementById("dvPairRemoved").innerHTML += ' <button style="margin:2px;" class="btn btn-danger btn-sm" data-pair="' + element + '" onclick="delistHiddenPair(this)">' + element + '<i style="margin-left:10px" class="fa fa-times" aria-hidden="true"></i></button>';
    });

    table = $('#table').DataTable({
        "ajax": location.protocol + '//' + location.host + '/tickers',
        "responsive": true,
        "fixedHeader": true,
        "iDisplayLength": 50,
        "order": [[9, "desc"]],
        "columns": [
            {
                "data": "id", "orderable": true, render: function (data, type, row, meta) {
                    return data + '<button style="opacity:0.8" data-name="Tiger Nixon" data-pair="' + data + '" onclick="hidePair(this)" class="btn btn-danger btn-sm m-0 pl-1 pr-1 pb-0 pt-0 float-right"><div style="font-size:8px"><i class="fa fa-times" aria-hidden="true"></i></div></button>';
                }
            },
            {
                "data": "bittrex", "orderable": true, render: function (data, type, row, meta) {

                    if (data.bid == undefined)
                        return "-";

                    var differenceBid = compare(meta, data.bid, "bid");
                    var differenceAsk = compare(meta, data.ask, "ask");

                    var min;
                    var max;

                    if(data.status  != "ok" && $('#btnExcludeLock').hasClass("btn-primary"))
                    {
                         min = false;
                         max = false;
                    }
                    else{
                         min = low(row, data.ask, "Bittrex");
                         max = high(row, data.bid, "Bittrex");
                    }

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
                        cell += '<a href="javascript:void(0)" data-exchange="Bittrex" data-type="ask" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Bittrex" data-type="ask" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Bittrex" data-type="ask" data-pair="' + data.base + "-" + data.quote + '" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    cell += '</font>'
                    cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                    cell += '<font size="2">';
                    if (differenceBid == 1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Bittrex" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Bittrex" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Bittrex" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    '</div></div></div></div>';
                    if (data.status == "locked") {
                        cell += '<i class="fas fa-lock" style="position:absolute;width:9px;color:#cc0000;right:3px;top:2px;"></i>'
                    }
                    else if (data.status == "delayed") {
                        cell += '<i class="fas fa-lock" style="position:absolute;width:9px;color:orange;right:3px;top:2px;"></i>'
                    }
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

                    var min;
                    var max;

                    if(data.status  != "ok"  && $('#btnExcludeLock').hasClass("btn-primary"))
                    {
                         min = false;
                         max = false;
                    }
                    else{
                         min = low(row, data.ask, "Binance");
                         max = high(row, data.bid, "Binance");
                    }

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
                        cell += '<a href="javascript:void(0)" data-exchange="Binance" data-type="ask" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Binance" data-type="ask" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Binance" data-type="ask" data-pair="' + data.base + "-" + data.quote + '" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    cell += '</font>'
                    cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                    cell += '<font size="2">';
                    if (differenceBid == 1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Binance" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Binance" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Binance" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
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

                    var min;
                    var max;

                    if(data.status  != "ok" && $('#btnExcludeLock').hasClass("btn-primary"))
                    {
                         min = false;
                         max = false;
                    }
                    else{
                         min = low(row, data.ask, "Poloniex");
                         max = high(row, data.bid, "Poloniex");
                    }

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
                        cell += '<a href="javascript:void(0)" data-exchange="Poloniex" data-type="ask" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Poloniex" data-type="ask" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Poloniex" data-type="ask" data-pair="' + data.base + "-" + data.quote + '" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    cell += '</font>'
                    cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                    cell += '<font size="2">';
                    if (differenceBid == 1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Poloniex" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Poloniex" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Poloniex" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    '</div></div></div></div>';
                    if (data.status == "locked") {
                        cell += '<i class="fas fa-lock" style="position:absolute;width:9px;color:#cc0000;right:3px;top:2px;"></i>'
                    }
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

                    var min;
                    var max;

                    if(data.status  != "ok" && $('#btnExcludeLock').hasClass("btn-primary"))
                    {
                         min = false;
                         max = false;
                    }
                    else{
                         min = low(row, data.ask, "Cryptopia");
                         max = high(row, data.bid, "Cryptopia");
                    }

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
                        cell += '<a href="javascript:void(0)" data-exchange="Cryptopia" data-type="ask" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Cryptopia" data-type="ask" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Cryptopia" data-type="ask" data-pair="' + data.base + "-" + data.quote + '" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    cell += '</font>'
                    cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                    cell += '<font size="2">';
                    if (differenceBid == 1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Cryptopia" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Cryptopia" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Cryptopia" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    '</div></div></div></div>';
                    if (data.status == "locked") {
                        cell += '<i class="fas fa-lock" style="position:absolute;width:9px;color:#cc0000;right:3px;top:2px;"></i>'
                    }
                    cell += '</div>';

                    return cell;

                }
            },
            {
                "data": "livecoin", "visible": false, "orderable": true, render: function (data, type, row, meta) {

                    if (data.bid == undefined)
                        return "-";

                    var differenceBid = compare(meta, data.bid, "bid");
                    var differenceAsk = compare(meta, data.ask, "ask");

                    var min;
                    var max;

                    if(data.status  != "ok" && $('#btnExcludeLock').hasClass("btn-primary"))
                    {
                         min = false;
                         max = false;
                    }
                    else{
                         min = low(row, data.ask, "Livecoin");
                         max = high(row, data.bid, "Livecoin");
                    }

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
                        cell += '<a href="javascript:void(0)" data-exchange="Livecoin" data-type="ask" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Livecoin" data-type="ask" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Livecoin" data-type="ask" data-pair="' + data.base + "-" + data.quote + '" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    cell += '</font>'
                    cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                    cell += '<font size="2">';
                    if (differenceBid == 1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Livecoin" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Livecoin" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Livecoin" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
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

                    var min;
                    var max;

                    if(data.status  != "ok" && $('#btnExcludeLock').hasClass("btn-primary"))
                    {
                         min = false;
                         max = false;
                    }
                    else{
                         min = low(row, data.ask, "Liqui");
                         max = high(row, data.bid, "Liqui");
                    }

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
                        cell += '<a href="javascript:void(0)" data-exchange="Liqui" data-type="ask" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Liqui" data-type="ask" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Liqui" data-type="ask" data-pair="' + data.base + "-" + data.quote + '" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    cell += '</font>'
                    cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                    cell += '<font size="2">';
                    if (differenceBid == 1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Liqui" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="Liqui" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="Liqui" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
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

                    var min;
                    var max;

                    if(data.status  != "ok" && $('#btnExcludeLock').hasClass("btn-primary"))
                    {
                         min = false;
                         max = false;
                    }
                    else{
                         min = low(row, data.ask, "HitBTC");
                         max = high(row, data.bid, "HitBTC");
                    }

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
                        cell += '<a href="javascript:void(0)" data-exchange="HitBTC" data-type="ask" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="HitBTC" data-type="ask" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    else if (differenceAsk == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="HitBTC" data-type="ask" data-pair="' + data.base + "-" + data.quote + '" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                    }
                    cell += '</font>'
                    cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                    cell += '<font size="2">';
                    if (differenceBid == 1) {
                        cell += '<a href="javascript:void(0)" data-exchange="HitBTC" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == 0) {
                        cell += '<a href="javascript:void(0)" data-exchange="HitBTC" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    if (differenceBid == -1) {
                        cell += '<a href="javascript:void(0)" data-exchange="HitBTC" data-type="bid" data-pair="' + data.base + "-" + data.quote + '"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                    }
                    '</div></div></div></div>';
                    if (data.status == "locked") {
                        cell += '<i class="fas fa-lock" style="position:absolute;width:9px;color:#cc0000;right:3px;top:2px;"></i>'
                    }
                    else if (data.status == "depositDisabled") {
                        cell += '<i class="fas fa-lock" style="position:absolute;width:7px;color:brown;right:3px;top:2px;"></i>'
                    }
                    else if (data.status == "withdrawalsDisabled") {
                        cell += '<i class="fas fa-lock" style="position:absolute;width:7px;color:black;right:3px;top:2px;"></i>'
                    }
                    cell += '</div>';

                    return cell;

                }
            },
            {
                     "data": "bitfinex", "orderable": true, render: function (data, type, row, meta) {
     
                         if (data.bid == undefined)
                             return "-";
     
                         var differenceBid = compare(meta, data.bid, "bid");
                         var differenceAsk = compare(meta, data.ask, "ask");
     
                         var min;
                         var max;
     
                         if(data.status  != "ok" && $('#btnExcludeLock').hasClass("btn-primary"))
                         {
                              min = false;
                              max = false;
                         }
                         else{
                              min = low(row, data.ask, "Bitfinex");
                              max = high(row, data.bid, "Bitfinex");
                         }
     
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
                             cell += '<a href="javascript:void(0)" data-exchange="Bitfinex" data-type="ask" data-pair="' + row.id + '"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                         }
                         else if (differenceAsk == 0) {
                             cell += '<a href="javascript:void(0)" data-exchange="Bitfinex" data-type="ask" data-pair="' + row.id + '"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                         }
                         else if (differenceAsk == -1) {
                             cell += '<a href="javascript:void(0)" data-exchange="Bitfinex" data-type="ask" data-pair="' + row.id + '" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                         }
                         cell += '</font>'
                         cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                         cell += '<font size="2">';
                         if (differenceBid == 1) {
                             cell += '<a href="javascript:void(0)" data-exchange="Bitfinex" data-type="bid" data-pair="' + row.id + '"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                         }
                         if (differenceBid == 0) {
                             cell += '<a href="javascript:void(0)" data-exchange="Bitfinex" data-type="bid" data-pair="' + row.id + '"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                         }
                         if (differenceBid == -1) {
                             cell += '<a href="javascript:void(0)" data-exchange="Bitfinex" data-type="bid" data-pair="' + row.id + '"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                         }
                         '</div></div></div></div>';
     
                         if (data.status == "locked") {
                            cell += '<i class="fas fa-lock" style="position:absolute;width:9px;color:#cc0000;right:3px;top:2px;"></i>'
                        }

                         cell += '</div>';
     
                         return cell;
     
                     }
                 }, /*    
                 {
                     "data": "exmo", "orderable": true, render: function (data, type, row, meta) {
     
                         if (data.bid == undefined)
                             return "-";
     
                         var differenceBid = compare(meta, data.bid, "bid");
                         var differenceAsk = compare(meta, data.ask, "ask");
     
                         var min = low(row, data.ask, "Exmo");
                         var max = high(row, data.bid, "Exmo");
     
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
                             cell += '<a href="javascript:void(0)" data-exchange="Exmo" data-type="ask" data-pair="' + row.id + '"  onclick="amountDetails(this)" style="color:green">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                         }
                         else if (differenceAsk == 0) {
                             cell += '<a href="javascript:void(0)" data-exchange="Exmo" data-type="ask" data-pair="' + row.id + '"  onclick="amountDetails(this)" style="color:black">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                         }
                         else if (differenceAsk == -1) {
                             cell += '<a href="javascript:void(0)" data-exchange="Exmo" data-type="ask" data-pair="' + row.id + '" onclick="amountDetails(this)" style="color:red">' + ((data.ask != undefined) ? data.ask.toFixed(8) : '0') + '</a>'
                         }
                         cell += '</font>'
                         cell += '</div></div><div class="divTableRow"><div class="divTableCell">';
                         cell += '<font size="2">';
                         if (differenceBid == 1) {
                             cell += '<a href="javascript:void(0)" data-exchange="Exmo" data-type="bid" data-pair="' + row.id + '"  onclick="amountDetails(this)" href="#" style="color:green">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                         }
                         if (differenceBid == 0) {
                             cell += '<a href="javascript:void(0)" data-exchange="Exmo" data-type="bid" data-pair="' + row.id + '"  onclick="amountDetails(this)" href="#" style="color:black">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                         }
                         if (differenceBid == -1) {
                             cell += '<a href="javascript:void(0)" data-exchange="Exmo" data-type="bid" data-pair="' + row.id + '"  onclick="amountDetails(this)" href="#" style="color:red">' + ((data.bid != undefined) ? data.bid.toFixed(8) : '0') + '</a>'
                         }
                         '</div></div></div></div>';
     
                         cell += '</div>';
     
                         return cell;
     
                     }
                 }, */
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
              else if (meta.col == 8) {
                    prev_data = prevTable[meta.row].bitfinex;
                }
                 /* 
                else if (meta.col == 9) {
                    prev_data = prevTable[meta.row].exmo;
                } */

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
    refreshDatatable();
}

function low(row, value, exchange) {
    var arr = [];

    if (row.poloniex.ask != undefined && document.getElementById("btnPoloniex").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.poloniex.status == "ok"))
        arr.push(row.poloniex.ask);
    if (row.bittrex.ask != undefined && document.getElementById("btnBittrex").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.bittrex.status == "ok"))
        arr.push(row.bittrex.ask);
    if (row.cryptopia.ask != undefined && document.getElementById("btnCryptopia").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.cryptopia.status == "ok"))
        arr.push(row.cryptopia.ask);
    if (row.binance.ask != undefined && document.getElementById("btnBinance").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.binance.status == "ok"))
        arr.push(row.binance.ask);
    if (row.livecoin.ask != undefined && document.getElementById("btnLivecoin").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.livecoin.status == "ok"))
        arr.push(row.livecoin.ask);
    if (row.liqui.ask != undefined && document.getElementById("btnLiqui").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.liqui.status == "ok"))
        arr.push(row.liqui.ask);
    if (row.hitbtc.ask != undefined && document.getElementById("btnHitBTC").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.hitbtc.status == "ok"))
        arr.push(row.hitbtc.ask);
    if (row.bitfinex.ask != undefined && document.getElementById("btnBitfinex").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.bitfinex.status == "ok"))
         arr.push(row.bitfinex.ask);
   /*  if (row.exmo.ask != undefined && document.getElementById("btnExmo").children[0].classList.contains("fa-check-square"))
         arr.push(row.exmo.ask); */

    var min = Math.min(...arr);

    if (min == value && document.getElementById("btn" + exchange).children[0].classList.contains("fa-check-square"))
        return true;
    else
        return false;
}

function high(row, value, exchange) {
    var arr = [];

    if (row.poloniex.bid != undefined && document.getElementById("btnPoloniex").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.poloniex.status == "ok"))
        arr.push(row.poloniex.bid);
    if (row.bittrex.bid != undefined && document.getElementById("btnBittrex").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.bittrex.status == "ok"))
        arr.push(row.bittrex.bid);
    if (row.cryptopia.bid != undefined && document.getElementById("btnCryptopia").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.cryptopia.status == "ok"))
        arr.push(row.cryptopia.bid);
    if (row.binance.bid != undefined && document.getElementById("btnBinance").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.binance.status == "ok"))
        arr.push(row.binance.bid);
    if (row.livecoin.bid != undefined && document.getElementById("btnLivecoin").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.livecoin.status == "ok"))
        arr.push(row.livecoin.bid);
    if (row.liqui.bid != undefined && document.getElementById("btnLiqui").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.liqui.status == "ok"))
        arr.push(row.liqui.bid);
    if (row.hitbtc.bid != undefined && document.getElementById("btnHitBTC").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.hitbtc.status == "ok"))
        arr.push(row.hitbtc.bid);
    if (row.bitfinex.bid != undefined && document.getElementById("btnBitfinex").children[0].classList.contains("fa-check-square")  && ($('#btnExcludeLock').hasClass("btn-secondary") || row.bitfinex.status == "ok"))
         arr.push(row.bitfinex.bid);
    /*  if (row.exmo.bid != undefined && document.getElementById("btnExmo").children[0].classList.contains("fa-check-square"))
         arr.push(row.exmo.bid); */

    var max = Math.max(...arr);

    if (max == value && document.getElementById("btn" + exchange).children[0].classList.contains("fa-check-square"))
        return true;
    else
        return false;
}

function getMin(row) {
    var arr = [];

    if (row.poloniex.ask != undefined && document.getElementById("btnPoloniex").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.poloniex.status == "ok"))
        arr.push(row.poloniex.ask);
    if (row.bittrex.ask != undefined && document.getElementById("btnBittrex").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.bittrex.status == "ok"))
        arr.push(row.bittrex.ask);
    if (row.cryptopia.ask != undefined && document.getElementById("btnCryptopia").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.cryptopia.status == "ok"))
        arr.push(row.cryptopia.ask);
    if (row.binance.ask != undefined && document.getElementById("btnBinance").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.binance.status == "ok"))
        arr.push(row.binance.ask);
    if (row.livecoin.ask != undefined && document.getElementById("btnLivecoin").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.livecoin.status == "ok"))
        arr.push(row.livecoin.ask);
    if (row.liqui.ask != undefined && document.getElementById("btnLiqui").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.liqui.status == "ok"))
        arr.push(row.liqui.ask);
    if (row.hitbtc.ask != undefined && document.getElementById("btnHitBTC").children[0].classList.contains("fa-check-square") && ($('#btnExcludeLock').hasClass("btn-secondary") || row.hitbtc.status == "ok"))
        arr.push(row.hitbtc.ask);
    if (row.bitfinex.ask != undefined && document.getElementById("btnBitfinex").children[0].classList.contains("fa-check-square")  && ($('#btnExcludeLock').hasClass("btn-secondary") || row.bitfinex.status == "ok"))
         arr.push(row.bitfinex.ask);
     /* if (row.exmo.ask != undefined && document.getElementById("btnExmo").children[0].classList.contains("fa-check-square"))
         arr.push(row.exmo.ask); */

    if (arr.length == 0)
        return 0;

    return Math.min(...arr);
}

function getMax(row) {
    var arr = [];

    if (row.poloniex.bid != undefined && document.getElementById("btnPoloniex").children[0].classList.contains("fa-check-square")  && ($('#btnExcludeLock').hasClass("btn-secondary") || row.poloniex.status == "ok"))
        arr.push(row.poloniex.bid);
    if (row.bittrex.bid != undefined && document.getElementById("btnBittrex").children[0].classList.contains("fa-check-square")  && ($('#btnExcludeLock').hasClass("btn-secondary") || row.bittrex.status == "ok"))
        arr.push(row.bittrex.bid);
    if (row.cryptopia.bid != undefined && document.getElementById("btnCryptopia").children[0].classList.contains("fa-check-square")  && ($('#btnExcludeLock').hasClass("btn-secondary") || row.cryptopia.status == "ok"))
        arr.push(row.cryptopia.bid);
    if (row.binance.bid != undefined && document.getElementById("btnBinance").children[0].classList.contains("fa-check-square")  && ($('#btnExcludeLock').hasClass("btn-secondary") || row.binance.status == "ok"))
        arr.push(row.binance.bid);
    if (row.livecoin.bid != undefined && document.getElementById("btnLivecoin").children[0].classList.contains("fa-check-square")  && ($('#btnExcludeLock').hasClass("btn-secondary") || row.livecoin.status == "ok"))
        arr.push(row.livecoin.bid);
    if (row.liqui.bid != undefined && document.getElementById("btnLiqui").children[0].classList.contains("fa-check-square")  && ($('#btnExcludeLock').hasClass("btn-secondary") || row.liqui.status == "ok"))
        arr.push(row.liqui.bid);
    if (row.hitbtc.bid != undefined && document.getElementById("btnHitBTC").children[0].classList.contains("fa-check-square")  && ($('#btnExcludeLock').hasClass("btn-secondary") || row.hitbtc.status == "ok"))
        arr.push(row.hitbtc.bid);
      if (row.bitfinex.bid != undefined && document.getElementById("btnBitfinex").children[0].classList.contains("fa-check-square")  && ($('#btnExcludeLock').hasClass("btn-secondary") || row.hitbtc.status == "ok"))
         arr.push(row.bitfinex.bid);
  /*  if (row.exmo.bid != undefined && document.getElementById("btnExmo").children[0].classList.contains("fa-check-square"))
         arr.push(row.exmo.bid); */

    if (arr.length == 0)
        return 0;

    return Math.max(...arr);
}




$.fn.dataTable.ext.search.push(
    function (settings, data, dataIndex) {
        var name = data[0]; // use data for the age column
        var minPerc = parseFloat(document.getElementById("minPerc").value);
        var maxPerc = parseFloat(document.getElementById("maxPerc").value);
        var val = parseFloat(data[8]);
        if (val < minPerc || val > maxPerc)
            return false;

        if (cHiddenPair.items().some(function (l) {
            return l.trim().toUpperCase() == name.trim().toUpperCase()
        })) {
            return false;
        }
        return true;
    }
);

function refreshDatatable() {
    table.draw();
}

function hidePair(e) {
    cHiddenPair.add(e.dataset.pair);
    document.getElementById("dvPairRemoved").innerHTML += '<button style="margin:2px;"  class="btn btn-danger btn-sm  ml-1" data-pair="' + e.dataset.pair + '" onclick="delistHiddenPair(this)">' + e.dataset.pair + '<i style="margin-left:10px" class="fa fa-times" aria-hidden="true"></i></button>';
    table.draw();
}

function delistHiddenPair(e) {
    cHiddenPair.remove(e.dataset.pair);
    e.parentNode.removeChild(e)
    table.draw();
}

$(document).ready(function () {

    var row = $("#table_wrapper").children()[0];
    var col = $(row).children()[0];
    col.classList.remove("col-md-6");
    col.classList.add("col-md-3");
    $('<div class="col-md-3"><button id="btnExcludeLock"class="btn btn-secondary btn-sm">Exclude <i class="fas fa-lock"></i></button></div>').insertAfter(col);

    $('#btnExcludeLock').click(function () {
        $('#btnExcludeLock').toggleClass('btn-secondary');
        $('#btnExcludeLock').toggleClass('btn-primary');

        table.draw();
    });
    //   $(row).append('<div class="col-md-3"><button class="btn btn-primary btn-sm">ciaooooooooooooooooooooo</button></div>')
    //  $(col).append('<button class="btn btn-primary">ciaooooooooooooooooooooo</button>');
});


