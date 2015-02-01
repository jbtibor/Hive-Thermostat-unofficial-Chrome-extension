// Copyright (c) 2015 Tibor Jakab-Barthi. All rights reserved.

var Ajax = {};

Ajax.json = function (method, url, credential, requestTimeoutSeconds, data) {
    var promise = new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();

        requestTimeoutSeconds = parseInt(requestTimeoutSeconds);

        if (isNaN(requestTimeoutSeconds)) {
            requestTimeoutSeconds = 3;
        }

        var requestTimeoutMilliseconds = requestTimeoutSeconds * 1000;

        var abortTimerId = window.setTimeout(function () {
            console.debug("Abort call to '" + url + "' after " + requestTimeoutMilliseconds + " milliseconds.")
            xhr.abort();  // synchronously calls onreadystatechange
        }, requestTimeoutMilliseconds);

        function handleSuccess(response) {
            window.clearTimeout(abortTimerId);

            resolve(response);
        }

        var invokedErrorCallback = false;
        function handleError(error) {
            window.clearTimeout(abortTimerId);
            if (!invokedErrorCallback) {
                reject(error);
            }
            invokedErrorCallback = true;
        }

        try {
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    var response = JSON.parse(xhr.responseText);

                    handleSuccess(response);
                }
            };

            xhr.onerror = function (xhrError) {
                var errorMessage = "Ready state: " + xhrError.target.readyState + ". Status: " + xhrError.target.status + ". Status text: '" + xhrError.target.statusText + "'.";;
                handleError(new Error(errorMessage));
            };

            var async = true;
            var username;
            var password;
            if (credential) {
                username = credential.username;
                password = credential.password;
            }
            else {
                username = undefined;
                password = undefined;
            }
            xhr.open(method, url, async, username, password);

            if (typeof data === 'undefined') {
                xhr.send();
            } else {
                xhr.setRequestHeader('Content-Type', "application/json;charset=UTF-8");
                var json = JSON.stringify(data);
                xhr.send(json);
            }
        } catch (e) {
            console.error(chrome.i18n.getMessage("Ajax_getData_Exception", e), e);
            handleError(e);
        }
    });

    return promise;
}