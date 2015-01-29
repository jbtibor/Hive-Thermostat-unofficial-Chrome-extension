// Copyright (c) 2015 Tibor Jakab-Barthi. All rights reserved.

var Settings = function () {
    var synced = false;
    var syncedSettings = {};

    var getSyncedValue = function (key) {
        throwIfNotSynced();

        return syncedSettings[key];
    };

    var throwIfNotSynced = function () {
        if (!synced) {
            throw new Error("Settings not synced yet.");
        }
    };

    var validateRefreshInterval = function (refreshInterval) {
        var validatedRefreshInterval = parseInt(refreshInterval, 10);
        if (isNaN(validatedRefreshInterval) || validatedRefreshInterval < 5) {
            validatedRefreshInterval = 15;
        }

        return validatedRefreshInterval;
    };

    Settings.prototype.getApiEndpoint = function () {
        return "https://jbt-test.apigee.net/hive/v1/";
    };

    Settings.prototype.getCredential = function () {
        return getSyncedValue("credential");
    }

    Settings.prototype.getRefreshInterval = function () {
        var refreshInterval = getSyncedValue("refreshInterval");

        validatedRefreshInterval = validateRefreshInterval(refreshInterval);

        return validatedRefreshInterval;
    }

    Settings.prototype.getRequestTimeoutSeconds = function () {
        return 5;
    }

    Settings.prototype.save = function (newValues) {
        if (newValues) {
            if (newValues.username && newValues.username !== null && newValues.password && newValues.password !== null) {
                syncedSettings.credential = {
                    username: newValues.username,
                    password: newValues.password,
                };
            }

            if (newValues.refreshInterval && newValues.refreshInterval !== null) {
                var refreshInterval = validateRefreshInterval(newValues.refreshInterval);

                syncedSettings.refreshInterval = refreshInterval;
            }

            chrome.storage.sync.set(syncedSettings);
        }
    };

    var onSyncSuccess = function (items) {
        syncedSettings = {};
        syncedSettings.credential = items.credential;
        syncedSettings.refreshInterval = items.refreshInterval;

        synced = true;
    };

    var onSyncError = function (error) {
        synced = false;
        throw new Error(error);
    };

    var sync = new Promise(function (resolve, reject) {
        chrome.storage.sync.get(null, function (items) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            }
            else {
                resolve(items);
            }
        });
    });

    sync.then(onSyncSuccess, onSyncError);
};