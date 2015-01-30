// Copyright (c) 2015 Tibor Jakab-Barthi. All rights reserved.

function getMyHive() {
    var getMyHivePromise = new Promise(function (resolve, reject) {
        try {
            function getBackgroundPageCallback(backgroundPage) {
                if (backgroundPage) {
                    var myHive = backgroundPage.myHive;

                    resolve(myHive);
                } else {
                    reject(new Error('Call to get background page returned null.'));
                }
            };

            chrome.runtime.getBackgroundPage(getBackgroundPageCallback);
        } catch (error) {
            reject(error);
        }
    });

    return getMyHivePromise;
}

function getSelectedTargetTemperature() {
    return new Number(document.getElementById('targetTemperature').value);
}

function restoreOptions() {
    document.getElementById('targetTemperature').value = '';
    document.getElementById('refresh').addEventListener('click', restoreOptions);
    document.getElementById('status').innerText = 'Refreshing...';

    getMyHive().then(function (myHive) {
        var update = function (status) {
            document.getElementById('targetTemperature').value = status.Temperature.Target;
            document.getElementById('targetTemperature').addEventListener("input", targetTemperatureChanged)
            document.getElementById('targetTemperatureMinus').addEventListener('click', targetTemperatureMinus);
            document.getElementById('targetTemperaturePlus').addEventListener('click', targetTemperaturePlus);
            document.getElementById('status').innerText = '';
        };

        var error = function (error) {
            document.getElementById('targetTemperature').value = "";
            document.getElementById('status').innerText = 'Error.';
        };

        myHive.getStatus().then(update, error);
    }).catch(function (error) {
        console.error("Failed to get target temperature.", error);

        document.getElementById('status').innerText = error.message;
    });
}

function setTargetTemperature(targetTemperature) {
    getMyHive().then(function (myHive) {
        document.getElementById('targetTemperature').value = targetTemperature.toFixed(1);

        myHive.queueTargetTemperature(targetTemperature);
    });
}

function targetTemperatureChanged(e) {
    var targetTemperature = new Number(e.target.value);

    setTargetTemperature(targetTemperature);
}

function targetTemperatureMinus() {
    var selectedTargetTemperature = getSelectedTargetTemperature();

    selectedTargetTemperature = selectedTargetTemperature - 0.5;

    setTargetTemperature(selectedTargetTemperature);
}

function targetTemperaturePlus() {
    var selectedTargetTemperature = getSelectedTargetTemperature();

    selectedTargetTemperature = selectedTargetTemperature + 0.5;

    setTargetTemperature(selectedTargetTemperature);
}

document.addEventListener('DOMContentLoaded', restoreOptions);