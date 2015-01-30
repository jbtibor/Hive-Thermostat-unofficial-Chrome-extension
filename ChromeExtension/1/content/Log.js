// Copyright (c) 2015 Tibor Jakab-Barthi. All rights reserved.

var Log = {};

Log.error = function (message, params) {
    Log.withStack(message, params, 'error');
}

Log.debug = function (message, params) {
    Log.withStack(message, params, 'debug');
}

Log.withStack = function (message, params, level) {
    var writer;

    var date = new Date();
    var timeString = date.toLocaleTimeString();

    message = timeString + ": " + message;

    if (typeof params === 'undefined') {
        params = '';
    }

    var stack = new Error().stack.split('\n');
    var caller = stack[3];

    if (level === 'error') {
        console.error(message, params);
        console.error(caller);
    } else {
        console.debug(message, params);
        console.debug(caller);
    }
}