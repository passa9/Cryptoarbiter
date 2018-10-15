function calculatePrice(el) {
    alert(el.nextSibling);
}

function amountDetails(element) {

    var exchange = element.dataset.exchange;
    var type = element.dataset.type;
    var market = element.dataset.pair;

    var panel = document.getElementById(exchange + market + type);

    if (panel != undefined) {
        $(panel).remove();
        return;
    }

    var content = '<i class="fa fa-spinner fa-spin text-primary" style="font-size:40px;margin:40%"></i>';
    var position = $(element).offset(); //.getBoundingClientRect();

    var title = market + ' - ' + exchange + ' <button class="btn btn-sm btn-danger float-sm-right" onclick="$(this).parent().parent().remove();" value="close" style="padding:4px 6px;margin:-5px;"><i class="fa fa-times" aria-hidden="true"></i></button>';
    var template = '<div id="' + exchange + market + type + '" class="popover bs-popover-right" style="width: 330px;max-width: 330px;position:absolute;top:' + (position.top - 32) + 'px;left:' + (position.left + 70) + 'px" ><div class="arrow" style="top: 24px;"></div><h3 class="popover-header">' + title + '</h3><div class="popover-body"><div  id="' + exchange + market + type + '-content">' + content + '</div></div></div>';
    $(template).appendTo(document.body);

    var jqxhr = $.get("/getorderbook?exchange=" + exchange + "&market=" + market + "&type=" + type, function (data, status) {

        var idTable = uniqueId();
        content = '<table id="' + idTable + '" class="table table bordered table-sm">';
        content += '<thead><tr><th>PRICE</th><th>AMOUNT</th><th>(' + market.split('-')[0] + ')</th></thead>';
        content += '<tbody>';

        for (var i = 0; i < data.arr.length; i++) {
            content += '<tr>';
            content += '<td>' + data.arr[i].Rate;
            content += '</td>';
            content += '<td>' + data.arr[i].Quantity;
            content += '</td>';
            content += '<td>' + (data.arr[i].Quantity * data.arr[i].Rate).toFixed(6);
            content += '</td>';
            content += '</tr>';
        }
        var idAmount = uniqueId();
        var idPrice = uniqueId();

        var disabledClass = exchange == "Bitfinex" ? " disabled" : "";

        content += '</tbody></table>';
        content += '<div class="row mt-2 ml-1 mr-1 mb-2 bg-light">';
        content += '<input type="text" id="' + idAmount + '" class="form-control form-control-sm d-inline" value="0.00000" style="width:100px"> <span style="font-size:14px" class="d-inline ml-1  align-middle mt-1">' + market.split('-')[1] + '&nbsp; = &nbsp;</span>';
        content += '<input type="text" id="' + idPrice + '" class="form-control form-control-sm d-inline" value="0.00000" style="width:100px"><span style="font-size:14px" class="d-inline ml-1  align-middle mt-1">' + market.split('-')[0] + '</span>';
        content += '</div>';
        content += '<div class="row mt-2">';
        content += '<div class="col"  align="left">';
        content += '<h4>' + type + '</h4>';
        content += '</div>';
        content += '<div class="col" align="right">';
        content += '<a target="_blank" class="btn btn-primary btn-sm' + disabledClass + '" href="' + data.link + '">Vai <i class="fa fa-arrow-right" aria-hidden="true"></i></a>'
        content += '</div>';
        content += '</div>';

        document.getElementById(exchange + market + type + "-content").innerHTML = content;

        $("#" + idAmount).keyup(function () {

            var rows = document.getElementById(idTable).rows;

            for (var i = 1; i < rows.length; i++) {
                $(rows[i]).removeClass('bg-success');
            }

            var val = parseFloat(document.getElementById(idAmount).value);
            if (isNaN(val)) {
                document.getElementById(idPrice).value = '';
                return;
            }
            var currentAmount = 0;
            var currentTotalPrice = 0;
            var found = false;

            for (var i = 0; i < data.arr.length; i++) {

                $(rows[i + 1]).addClass('bg-success');

                if ((currentAmount + parseFloat(data.arr[i].Quantity)) >= val) {
                    currentTotalPrice += (val - currentAmount) * parseFloat(data.arr[i].Rate);
                    found = true;
                    break;
                }
                else {
                    currentAmount += parseFloat(data.arr[i].Quantity);
                    currentTotalPrice += parseFloat(data.arr[i].Quantity) * parseFloat(data.arr[i].Rate);
                }
            }

            if (found) {
                document.getElementById(idPrice).value = currentTotalPrice.toFixed(6);
            }
            else {
                for (var i = 1; i < rows.length; i++) {
                    $(rows[i]).removeClass('bg-success');
                }
                alert("Non ci sono abbastanza fondi");
            }

        });

        $("#" + idPrice).keyup(function () {

            var rows = document.getElementById(idTable).rows;

            for (var i = 1; i < rows.length; i++) {
                $(rows[i]).removeClass('bg-success');
            }

            var val = parseFloat(document.getElementById(idPrice).value);
            if (isNaN(val)) {
                document.getElementById(idAmount).value = '';
                return;
            }
            var currentAmount = 0;
            var currentTotalPrice = 0;
            var found = false;

            for (var i = 0; i < data.arr.length; i++) {

                $(rows[i + 1]).addClass('bg-success');

                if ((currentTotalPrice + (parseFloat(data.arr[i].Quantity) * parseFloat(data.arr[i].Rate))) >= val) {
                    currentAmount += (val - currentTotalPrice) / parseFloat(data.arr[i].Rate);
                    found = true;
                    break;
                }
                else {
                    currentAmount += parseFloat(data.arr[i].Quantity);
                    currentTotalPrice += parseFloat(data.arr[i].Quantity) * parseFloat(data.arr[i].Rate);
                }
            }

            if (found) {
                document.getElementById(idAmount).value = currentAmount.toFixed(6);
            }
            else {
                for (var i = 1; i < rows.length; i++) {
                    $(rows[i]).removeClass('bg-success');
                }
                alert("Non ci sono abbastanza fondi");
            }
        })
    });

}
function uniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 16);
};

const socket = new WebSocket('ws://' + window.location.hostname + ":" + location.port + "/lastupdate");

socket.onopen = () => {
    socket.send('ws open');
}
socket.onmessage = e => {
    var data = JSON.parse(event.data);
    document.getElementById("lu-" + data.exchange).innerText = js_yyyy_mm_dd_hh_mm_ss();
}

function js_yyyy_mm_dd_hh_mm_ss() {
    now = new Date();
    year = "" + now.getFullYear();
    month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
    hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}

