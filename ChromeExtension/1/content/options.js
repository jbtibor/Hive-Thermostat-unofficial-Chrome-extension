// Copyright (c) 2015 Tibor Jakab-Barthi. All rights reserved.

function getMyHive() {
    var backgroundPage = chrome.extension.getBackgroundPage();
    var myHive = backgroundPage.myHive;

    return myHive;
}

function getSettings() {
    var myHive = getMyHive();
    var settings = myHive.settings;

    return settings;
}

function restartApp() {
    var myHive = getMyHive();
    myHive.refresh();
}

function save(newSettings) {
    var settings = getSettings();

    settings.save(newSettings);

    restartApp();

    showSaveConfirmation();
}

function saveLogin() {
    var password = document.getElementById('password').value;
    var username = document.getElementById('username').value;

    if (username && password && username !== null && password !== null && username !== "" && password !== "") {
        var newSettings = {
            username: username,
            password: password,
        };

        save(newSettings);

        showLoginStatus('');
    } else {
        showLoginStatus('Username and password must be provided.');
    }
}

function saveOptions() {
    var refreshInterval = document.getElementById('refreshInterval').value;

    var newSettings = {
        refreshInterval: refreshInterval,
    };

    save(newSettings);
}

function showLoginStatus(msg) {
    var statusElement = document.getElementById('loginStatus');
    statusElement.textContent = msg;
}

function showSaveConfirmation() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function () {
        status.textContent = '';
    }, 1500);
}

function restoreOptions() {
    var settings = getSettings();

    document.getElementById('refreshInterval').value = settings.getRefreshInterval();

    var credential = settings.getCredential();

    if (credential === null || credential === undefined || credential.password === null || credential.password === undefined || credential.password === "") {
        showLoginStatus('Please log in with your Hive credentials.');
    };
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('restore').addEventListener('click', restoreOptions);
document.getElementById('saveLogin').addEventListener('click', saveLogin);
document.getElementById('saveOptions').addEventListener('click', saveOptions);