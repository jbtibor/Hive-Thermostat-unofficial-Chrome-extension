// Copyright (c) 2015 Tibor Jakab-Barthi. All rights reserved.

function getMyHive() {
    var backgroundPage = chrome.extension.getBackgroundPage();
    var myHive = backgroundPage.myHive;

    return myHive;
}

function getSelectedTargetTemperature() {
    return new Number(document.getElementById('targetTemperature').value);
}

function restoreOptions() {
    var myHive = getMyHive();

    document.getElementById('targetTemperature').value = '';
    document.getElementById('refresh').addEventListener('click', restoreOptions);
    document.getElementById('status').innerText = 'Refreshing...';

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
}

function setTargetTemperature(targetTemperature) {
    var myHive = getMyHive();

    myHive.queueTargetTemperature(targetTemperature);

    document.getElementById('targetTemperature').value = targetTemperature.toFixed(1);
}

function targetTemperatureChanged(e) {
    var targetTemperature = new Number(e.target.value);

    e.target.value = targetTemperature.toFixed(1);
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