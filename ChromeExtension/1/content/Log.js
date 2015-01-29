// Copyright (c) 2015 Tibor Jakab-Barthi. All rights reserved.

var Log = {};

Log.debug = function (message, params) {
    var stack = new Error().stack.split('\n');
    var caller = stack[2];

    var date = new Date();
    var timeString = date.toLocaleTimeString();

    message = timeString + ": " + message;

    if (params) {
        console.debug(message, params);
    } else {
        console.debug(message);
    }

    console.debug(caller);
}