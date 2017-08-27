$(function () {
    "use strict";

    // parse locale Number because different locales use
    // different decimal seperator, returns a float
    var parseLocaleNumber = function (stringNumber) {
        var thousandSeparator = (1111).toLocaleString().replace(/1/g, "");
        var decimalSeparator = (1.1).toLocaleString().replace(/1/g, "");
        return parseFloat(stringNumber.replace(
            new RegExp("\\" + thousandSeparator, "g"), "").replace(
            new RegExp("\\" + decimalSeparator), ".")
        );
    };

    var calculateBasedOnDollars = function () {
        // get val from textbox containing limit in dollars
        var withdrawLimitDollars = parseLocaleNumber($("#withdrawLimit").val());
        if ($.isNumeric(withdrawLimitDollars)) {
            $(".input-dollars-form-group").removeClass("has-error");
            refreshdata(function (data) {
                var ratio;
                var valueInSelectedCrypto;
                var selectedCoin;
                var valueInBTC;
                // get val for usd > btc
                selectedCoin = $("#currencies").val();
                // set span groupaddon
                $(".selectedCrypto").text($("#currencies :selected").text());
                // ratio for USDT <> BTC is only available
                if (selectedCoin !== "USDT_BTC") {
                    valueInBTC = parseFloat(withdrawLimitDollars) / parseFloat(data.USDT_BTC.last);
                } else {
                    valueInBTC = parseFloat(withdrawLimitDollars);
                }
                ratio = parseFloat(data[selectedCoin].last);
                valueInSelectedCrypto = valueInBTC / ratio;

                $("#withdrawOutcome").val(
                        valueInSelectedCrypto.toLocaleString());
                $("#dateRetrieved").text(new Date());
                calculateExtraInfo(data);
                $("#resultHolder").show();
            });
        } else {
            // not numeric!
            $("#withdrawOutcome").val("");
            $(".input-dollars-form-group").addClass("has-error");
        }
    };
    var calculateBasedOnCrypto = function () {
        var crypto = parseLocaleNumber($("#withdrawOutcome").first().val());
        if ($.isNumeric(crypto)) {
            $("#resultHolder .form-group").removeClass("has-error");
            refreshdata(function (data) {
                var selectedCoin;
                var valueInDollar;
                var ratio;
                var result;
                // get val for usd > btc
                selectedCoin = $("#currencies").val();
                // set span groupaddon
                $("#selectedCrypto").text($("#currencies :selected").text());
                if (selectedCoin !== "USDT_BTC") {
                    valueInDollar = parseFloat(crypto) * parseFloat(data.USDT_BTC.last);
                } else {
                    valueInDollar = parseFloat(crypto);
                }

                ratio = parseFloat(data[selectedCoin].last);

                result = valueInDollar * ratio;

                $("#withdrawLimit").val(result.toLocaleString());
                $("#dateRetrieved").text(new Date());
                calculateExtraInfo(data);
            });
        } else {
            // not numeric!
            $("#withdrawLimit").val("");
            $("#resultHolder .form-group").addClass("has-error");
        }
    };
    // calculate extra info fields
    var calculateExtraInfo = function (data) {
        var extraInfo = $("#currencies :selected").text();
        // set value in btc
        if ($("#currencies").val() !== "USDT_BTC") {
            extraInfo += " = ";
            extraInfo += (data[$("#currencies").val()].last).toLocaleString(undefined, { maximumFractionDigits: 6 });
            extraInfo += " BTC = $ ";
            extraInfo += (data[$("#currencies").val()].last * data.USDT_BTC.last)
                    .toLocaleString();
        } else {
            extraInfo += " = $ ";
            // BTC is high enough to USDT to only use 2 decimals
            extraInfo += parseFloat(data.USDT_BTC.last).toLocaleString();
        }
        // calculate value of 1 crypto to dollar(s)
        $("#cryptoCalculated").text(extraInfo);
    };
    // gets data from poloniex and pass callback to handle the
    // received data
    var refreshdata = function (callback) {
        $.get("https://poloniex.com/public?command=returnTicker", callback);
    };

    // set initial data
    $("#withdrawLimit").val((25000).toLocaleString());
    $("#span2k").text("$ " + (2000.00).toLocaleString());
    $("#span25k").text("$ " + (25000.00).toLocaleString());
    // event listeners

    $("#currencies, #withdrawLimit").change(function () {
        calculateBasedOnDollars();
    });

    $("#withdrawOutcome").change(function () {
        calculateBasedOnCrypto();
    });

    $("#refreshCalculationBtn").click(function () {
        calculateBasedOnDollars();
    });

    $("#span2k").click(function () {
        $("#withdrawLimit").val((2000).toLocaleString());
        calculateBasedOnDollars();
    });
    $("#span25k").click(function () {
        $("#withdrawLimit").val((25000).toLocaleString());
        calculateBasedOnDollars();
    });
    // initial method to fill select
    refreshdata(function (data) {
        var listitems = "";
        // remove unnecessary entries and sort
        var keys = Object.keys(data).filter(function (k) {
            return k.startsWith("BTC_");
        }).sort();
        for (var i = 0; i < keys.length; i++) {
            listitems += "<option value=" + keys[i] + ">" + keys[i].substring(4) + "</option>";
        }
        $("#currencies").first().append(listitems);
        calculateBasedOnDollars();
    });
});